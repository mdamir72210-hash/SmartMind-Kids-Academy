export interface PreGeneratedSpeechResult {
  spoken: boolean;
  source?: 'preloaded-ram' | 'decoded-ram' | 'static-stream';
  url?: string;
  reason?: 'invalid-text' | 'missing-asset' | 'playback-error' | 'superseded';
  errorMessage?: string;
}

let sharedAudioCtx: AudioContext | null = null;
let sharedHtmlAudio: HTMLAudioElement | null = null;
const activeSources = new Set<AudioBufferSourceNode>();
let pendingPlaybackFinish: (() => void) | null = null;
let activePlaybackId = 0;
let lastTriggerUrl = '';
let lastTriggerTime = 0;

const arrayBufferCache = new Map<string, ArrayBuffer>();
const audioBufferCache = new Map<string, AudioBuffer>();
const inFlightPreloads = new Map<string, Promise<void>>();

export function resolvePlaybackUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  const relative = trimmed.startsWith('/') ? `.${trimmed}` : trimmed;
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      return new URL(relative, document.baseURI).href;
    } catch {
      return relative;
    }
  }
  return relative;
}

function getSharedHtmlAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  if (!sharedHtmlAudio) {
    sharedHtmlAudio = new Audio();
    sharedHtmlAudio.preload = 'auto';
  }
  return sharedHtmlAudio;
}

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
  getSharedHtmlAudio();
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

  if (pendingPlaybackFinish) {
    const finish = pendingPlaybackFinish;
    pendingPlaybackFinish = null;
    finish();
  }

  if (sharedHtmlAudio) {
    try {
      sharedHtmlAudio.onended = null;
      sharedHtmlAudio.onerror = null;
      sharedHtmlAudio.pause();
      if (sharedHtmlAudio.readyState > 0) {
        sharedHtmlAudio.currentTime = 0;
      }
    } catch {
      // Ignore reset errors on unloaded element
    }
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

  // In file:// Android WebView APKs, fetch() on file:// URLs is unsupported; skip silently
  const resolvedHref = resolvePlaybackUrl(url);
  if (resolvedHref.startsWith('file:')) {
    return null;
  }

  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(cacheBucket);
      const cachedRes = await cache.match(resolvedHref);
      if (cachedRes && cachedRes.ok) {
        const buf = await cachedRes.arrayBuffer();
        arrayBufferCache.set(url, buf);
        return buf;
      }
      const networkRes = await fetch(resolvedHref, { cache: 'force-cache' });
      if (!networkRes.ok) return null;
      await cache.put(resolvedHref, networkRes.clone());
      const buf = await networkRes.arrayBuffer();
      arrayBufferCache.set(url, buf);
      return buf;
    }
  } catch {
    // Fall back to direct fetch below if CacheStorage is restricted
  }

  try {
    const res = await fetch(resolvedHref, { cache: 'force-cache' });
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

  // Fast Path 1: Already decoded in RAM -> Zero-latency synchronous Web Audio start
  const readyBuffer = audioBufferCache.get(url);
  if (readyBuffer && playAudioBufferNow(readyBuffer, playbackRate, reqId)) {
    return { spoken: true, source: 'preloaded-ram', url };
  }

  // Fast Path 2: Single reusable HTMLAudioElement synchronous unlock-and-play (100% Android WebView safe)
  const audio = getSharedHtmlAudio();
  if (!audio) {
    lastTriggerUrl = '';
    return {
      spoken: false,
      reason: 'playback-error',
      errorMessage: playbackErrorMessage,
    };
  }

  try {
    const resolvedHref = resolvePlaybackUrl(url);
    audio.onended = () => {
      audio.onended = null;
      audio.onerror = null;
    };
    audio.onerror = () => {
      audio.onended = null;
      audio.onerror = null;
    };
    audio.src = resolvedHref;
    audio.defaultPlaybackRate = playbackRate;
    audio.playbackRate = playbackRate;
    await audio.play();
    if (reqId !== activePlaybackId) {
      return { spoken: false, reason: 'superseded' };
    }
    void preloadStaticAudioUrl(url, cacheBucket);
    return { spoken: true, source: 'static-stream', url };
  } catch {
    lastTriggerUrl = '';
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

  // Fast Path 1: All clips already decoded in RAM -> synchronous gapless Web Audio scheduling
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
      // Fall through to single reusable HTMLAudioElement sequential playback below
    }
  }

  // Fast Path 2: Single reusable HTMLAudioElement synchronous start + onended chaining
  // Zero async awaits before audio.play() so Android APK WebView keeps user gesture activation
  const audio = getSharedHtmlAudio();
  if (!audio) {
    return {
      spoken: false,
      reason: 'playback-error',
      errorMessage: playbackErrorMessage,
    };
  }

  void preloadStaticAudioUrls(urls, cacheBucket, 4);

  return new Promise<PreGeneratedSpeechResult>((resolve) => {
    let settled = false;

    const finish = (result: PreGeneratedSpeechResult) => {
      if (settled) return;
      settled = true;
      if (pendingPlaybackFinish === cancelCurrent) {
        pendingPlaybackFinish = null;
      }
      resolve(result);
    };

    const cancelCurrent = () => {
      audio.onended = null;
      audio.onerror = null;
      finish({ spoken: false, reason: 'superseded' });
    };

    pendingPlaybackFinish = cancelCurrent;

    const playAt = (index: number) => {
      if (reqId !== activePlaybackId) {
        finish({ spoken: false, reason: 'superseded' });
        return;
      }
      const targetHref = resolvePlaybackUrl(urls[index]);
      audio.onended = () => {
        audio.onended = null;
        audio.onerror = null;
        if (reqId !== activePlaybackId) {
          finish({ spoken: false, reason: 'superseded' });
          return;
        }
        if (index + 1 < urls.length) {
          playAt(index + 1);
        } else {
          finish({ spoken: true, source: 'static-stream', url: urls[0] });
        }
      };
      audio.onerror = () => {
        audio.onended = null;
        audio.onerror = null;
        finish({
          spoken: false,
          reason: 'playback-error',
          errorMessage: playbackErrorMessage,
        });
      };
      audio.src = targetHref;
      audio.defaultPlaybackRate = playbackRate;
      audio.playbackRate = playbackRate;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          audio.onended = null;
          audio.onerror = null;
          finish({
            spoken: false,
            reason: 'playback-error',
            errorMessage: playbackErrorMessage,
          });
        });
      }
    };

    playAt(0);
  });
}
