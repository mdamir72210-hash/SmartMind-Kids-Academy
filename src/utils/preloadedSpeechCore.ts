export interface PreGeneratedSpeechResult {
  spoken: boolean;
  source?: 'preloaded-ram' | 'decoded-ram' | 'static-stream';
  url?: string;
  reason?: 'invalid-text' | 'missing-asset' | 'playback-error' | 'superseded';
  errorMessage?: string;
}

let sharedAudioCtx: AudioContext | null = null;
const activeSources = new Set<AudioBufferSourceNode>();
let activeHtmlAudio: HTMLAudioElement | null = null;
let activePlaybackId = 0;
let lastTriggerUrl = '';
let lastTriggerTime = 0;

const arrayBufferCache = new Map<string, ArrayBuffer>();
const audioBufferCache = new Map<string, AudioBuffer>();
const inFlightPreloads = new Map<string, Promise<void>>();

export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      sharedAudioCtx = new Ctx();
    }
  }
  return sharedAudioCtx;
}

export function unlockSharedAudioContext(): void {
  const ctx = getOrCreateAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

function resetActiveAudioHandles(): void {
  for (const source of Array.from(activeSources)) {
    try {
      source.onended = null;
      source.stop();
      source.disconnect();
    } catch {
      // Ignore if already stopped
    }
  }
  activeSources.clear();

  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.onended = null;
      activeHtmlAudio.onerror = null;
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeHtmlAudio = null;
  }
}

export function stopAllPreGeneratedSpeech(): void {
  activePlaybackId++;
  resetActiveAudioHandles();
}

export function isUrlDecodedInRam(url: string): boolean {
  return audioBufferCache.has(url);
}

export function clearRamCacheForPrefix(prefix: string): void {
  for (const key of Array.from(arrayBufferCache.keys())) {
    if (key.startsWith(prefix)) arrayBufferCache.delete(key);
  }
  for (const key of Array.from(audioBufferCache.keys())) {
    if (key.startsWith(prefix)) audioBufferCache.delete(key);
  }
}

export function countRamReadyForPrefix(prefix: string): number {
  let count = 0;
  for (const key of audioBufferCache.keys()) {
    if (key.startsWith(prefix)) count++;
  }
  return count;
}

async function fetchStaticMp3ArrayBuffer(
  url: string,
  cacheBucket: string
): Promise<ArrayBuffer | null> {
  if (arrayBufferCache.has(url)) {
    return arrayBufferCache.get(url)!;
  }

  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(cacheBucket);
      const cachedRes = await cache.match(url);
      if (cachedRes && cachedRes.ok) {
        const buf = await cachedRes.arrayBuffer();
        arrayBufferCache.set(url, buf);
        return buf;
      }
      const networkRes = await fetch(url, { cache: 'force-cache' });
      if (!networkRes.ok) return null;
      await cache.put(url, networkRes.clone());
      const buf = await networkRes.arrayBuffer();
      arrayBufferCache.set(url, buf);
      return buf;
    }
  } catch {
    // Fall back to direct fetch below if CacheStorage is restricted
  }

  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    arrayBufferCache.set(url, buf);
    return buf;
  } catch {
    return null;
  }
}

async function decodeStaticMp3(url: string, arrayBuf: ArrayBuffer): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url)!;
  }
  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;
  try {
    const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
    audioBufferCache.set(url, decoded);
    return decoded;
  } catch {
    return null;
  }
}

export function preloadStaticAudioUrl(url: string, cacheBucket: string): Promise<void> {
  if (!url || audioBufferCache.has(url)) {
    return Promise.resolve();
  }
  const existing = inFlightPreloads.get(url);
  if (existing) return existing;

  const job = (async () => {
    const buf = await fetchStaticMp3ArrayBuffer(url, cacheBucket);
    if (buf) {
      await decodeStaticMp3(url, buf);
    }
  })().finally(() => {
    inFlightPreloads.delete(url);
  });

  inFlightPreloads.set(url, job);
  return job;
}

export async function preloadStaticAudioUrls(
  urls: string[],
  cacheBucket: string,
  concurrency = 4
): Promise<void> {
  const pending = Array.from(new Set(urls.filter((u) => u && !audioBufferCache.has(u))));
  if (pending.length === 0) return;

  let index = 0;
  async function worker() {
    while (index < pending.length) {
      const nextUrl = pending[index++];
      if (nextUrl) {
        await preloadStaticAudioUrl(nextUrl, cacheBucket);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));
}

function playAudioBufferNow(
  buffer: AudioBuffer,
  playbackRate: number,
  reqId: number
): boolean {
  if (reqId !== activePlaybackId) return false;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(ctx.destination);
    activeSources.add(source);
    source.onended = () => {
      activeSources.delete(source);
    };
    source.start(0);
    return true;
  } catch {
    return false;
  }
}

function getTrimmedBounds(buffer: AudioBuffer): { offset: number; duration: number } {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const threshold = 0.004;
  let startSample = 0;
  let endSample = data.length - 1;

  while (startSample < data.length && Math.abs(data[startSample]) < threshold) {
    startSample++;
  }
  while (endSample > startSample && Math.abs(data[endSample]) < threshold) {
    endSample--;
  }

  const padSamples = Math.floor(sampleRate * 0.015);
  startSample = Math.max(0, startSample - padSamples);
  endSample = Math.min(data.length - 1, endSample + padSamples);

  const offset = startSample / sampleRate;
  const duration = Math.max(0.05, (endSample - startSample) / sampleRate);
  return { offset, duration };
}

export async function playPreGeneratedStaticUrl(
  url: string,
  cacheBucket: string,
  rateMode: 'slow' | 'normal',
  playbackErrorMessage: string
): Promise<PreGeneratedSpeechResult> {
  const now = Date.now();
  if (url === lastTriggerUrl && now - lastTriggerTime < 120) {
    return { spoken: true, source: 'preloaded-ram', url };
  }
  lastTriggerUrl = url;
  lastTriggerTime = now;

  const playbackRate = rateMode === 'slow' ? 0.88 : 1.0;

  unlockSharedAudioContext();
  const reqId = ++activePlaybackId;
  resetActiveAudioHandles();

  // Fast Path 1: Already decoded in RAM -> Zero-latency synchronous start
  const readyBuffer = audioBufferCache.get(url);
  if (readyBuffer && playAudioBufferNow(readyBuffer, playbackRate, reqId)) {
    return { spoken: true, source: 'preloaded-ram', url };
  }

  // Fast Path 2: Binary ArrayBuffer already fetched -> Instant in-memory decode & play
  const readyArrayBuf = arrayBufferCache.get(url);
  if (readyArrayBuf) {
    const decoded = await decodeStaticMp3(url, readyArrayBuf);
    if (reqId !== activePlaybackId) {
      return { spoken: false, reason: 'superseded' };
    }
    if (decoded && playAudioBufferNow(decoded, playbackRate, reqId)) {
      return { spoken: true, source: 'decoded-ram', url };
    }
  }

  // Fast Path 3: Direct HTMLAudioElement playback from static storage + background RAM cache
  try {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.playbackRate = playbackRate;
    activeHtmlAudio = audio;
    audio.onended = () => {
      if (activeHtmlAudio === audio) {
        activeHtmlAudio = null;
      }
    };
    await audio.play();
    if (reqId !== activePlaybackId) {
      audio.pause();
      audio.currentTime = 0;
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      return { spoken: false, reason: 'superseded' };
    }
    void preloadStaticAudioUrl(url, cacheBucket);
    return { spoken: true, source: 'static-stream', url };
  } catch {
    return {
      spoken: false,
      reason: 'playback-error',
      errorMessage: playbackErrorMessage,
    };
  }
}

export async function playPreGeneratedStaticSequence(
  urls: string[],
  cacheBucket: string,
  rateMode: 'slow' | 'normal',
  playbackErrorMessage: string
): Promise<PreGeneratedSpeechResult> {
  if (urls.length === 0) {
    return {
      spoken: false,
      reason: 'invalid-text',
      errorMessage: playbackErrorMessage,
    };
  }
  if (urls.length === 1) {
    return playPreGeneratedStaticUrl(urls[0], cacheBucket, rateMode, playbackErrorMessage);
  }

  const playbackRate = rateMode === 'slow' ? 0.88 : 1.0;

  unlockSharedAudioContext();
  const reqId = ++activePlaybackId;
  resetActiveAudioHandles();

  await preloadStaticAudioUrls(urls, cacheBucket, 4);
  if (reqId !== activePlaybackId) {
    return { spoken: false, reason: 'superseded' };
  }

  const ctx = getOrCreateAudioContext();
  const buffers = urls.map((u) => audioBufferCache.get(u)).filter((b): b is AudioBuffer => Boolean(b));

  if (ctx && buffers.length === urls.length) {
    try {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      let cursor = ctx.currentTime + 0.02;
      for (const buf of buffers) {
        const { offset, duration } = getTrimmedBounds(buf);
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.playbackRate.value = playbackRate;
        source.connect(ctx.destination);
        activeSources.add(source);
        source.onended = () => {
          activeSources.delete(source);
        };
        source.start(cursor, offset, duration);
        cursor += duration / playbackRate + 0.04;
      }
      return { spoken: true, source: 'preloaded-ram', url: urls[0] };
    } catch {
      // Fall through to HTMLAudio sequential playback below
    }
  }

  // Sequential HTMLAudioElement fallback
  try {
    for (const url of urls) {
      if (reqId !== activePlaybackId) {
        return { spoken: false, reason: 'superseded' };
      }
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.playbackRate = playbackRate;
        activeHtmlAudio = audio;
        audio.onended = () => {
          if (activeHtmlAudio === audio) activeHtmlAudio = null;
          resolve();
        };
        audio.onerror = () => {
          if (activeHtmlAudio === audio) activeHtmlAudio = null;
          reject(new Error('HTMLAudio playback error'));
        };
        audio.play().catch(reject);
      });
    }
    return { spoken: true, source: 'static-stream', url: urls[0] };
  } catch {
    return {
      spoken: false,
      reason: 'playback-error',
      errorMessage: playbackErrorMessage,
    };
  }
}
