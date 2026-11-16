import {
  BENGALI_AUDIO_MANIFEST,
  BENGALI_AUDIO_TOTAL_CLIPS,
  resolveBengaliAudioUrl,
} from '../data/bengaliAudioManifest';

export interface PreGeneratedSpeechResult {
  spoken: boolean;
  source?: 'preloaded-ram' | 'decoded-ram' | 'static-stream';
  url?: string;
  reason?: 'invalid-text' | 'missing-asset' | 'playback-error';
  errorMessage?: string;
}

const CACHE_BUCKET = 'smartmind-bn-audio-v1';

let sharedAudioCtx: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;

const arrayBufferCache = new Map<string, ArrayBuffer>();
const audioBufferCache = new Map<string, AudioBuffer>();
const inFlightPreloads = new Map<string, Promise<void>>();

export function getBengaliPreloadStats(): {
  totalStoredClips: number;
  ramReadyCount: number;
} {
  return {
    totalStoredClips: BENGALI_AUDIO_TOTAL_CLIPS,
    ramReadyCount: audioBufferCache.size,
  };
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
}

export function stopPreGeneratedBengaliAudio(): void {
  if (activeSource) {
    try {
      activeSource.stop();
    } catch {
      // Ignore if already stopped
    }
    activeSource = null;
  }
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeHtmlAudio = null;
  }
}

async function fetchStaticMp3ArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  if (arrayBufferCache.has(url)) {
    return arrayBufferCache.get(url)!;
  }

  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_BUCKET);
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

export function preloadBengaliUrl(url: string): Promise<void> {
  if (!url || audioBufferCache.has(url)) {
    return Promise.resolve();
  }
  const existing = inFlightPreloads.get(url);
  if (existing) return existing;

  const job = (async () => {
    const buf = await fetchStaticMp3ArrayBuffer(url);
    if (buf) {
      await decodeStaticMp3(url, buf);
    }
  })().finally(() => {
    inFlightPreloads.delete(url);
  });

  inFlightPreloads.set(url, job);
  return job;
}

export async function preloadBengaliTexts(texts: string[], concurrency = 4): Promise<void> {
  const urlSet = new Set<string>();
  for (const t of texts) {
    const url = resolveBengaliAudioUrl(t);
    if (url && !audioBufferCache.has(url)) {
      urlSet.add(url);
    }
  }
  const urls = Array.from(urlSet);
  if (urls.length === 0) return;

  let index = 0;
  async function worker() {
    while (index < urls.length) {
      const nextUrl = urls[index++];
      if (nextUrl) {
        await preloadBengaliUrl(nextUrl);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
}

function playAudioBufferNow(buffer: AudioBuffer, rateMode: 'slow' | 'normal'): boolean {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rateMode === 'slow' ? 0.88 : 1.0;
    source.connect(ctx.destination);
    activeSource = source;
    source.onended = () => {
      if (activeSource === source) {
        activeSource = null;
      }
    };
    source.start(0);
    return true;
  } catch {
    return false;
  }
}

export async function playPreGeneratedBengaliAudio(
  text: string,
  rateMode: 'slow' | 'normal' = 'slow'
): Promise<PreGeneratedSpeechResult> {
  const clean = text.trim();
  if (!clean) {
    return {
      spoken: false,
      reason: 'invalid-text',
      errorMessage: 'পড়ার জন্য কোনো বাংলা লেখা পাওয়া যায়নি।',
    };
  }

  const url = resolveBengaliAudioUrl(clean);
  if (!url) {
    return {
      spoken: false,
      reason: 'missing-asset',
      errorMessage: 'এই বাংলা শব্দটির সংরক্ষিত অডিও পাওয়া যায়নি।',
    };
  }

  unlockSharedAudioContext();
  stopPreGeneratedBengaliAudio();

  // Fast Path 1: Already decoded in RAM -> Zero-latency synchronous start
  const readyBuffer = audioBufferCache.get(url);
  if (readyBuffer && playAudioBufferNow(readyBuffer, rateMode)) {
    return { spoken: true, source: 'preloaded-ram', url };
  }

  // Fast Path 2: Binary ArrayBuffer already fetched -> Instant in-memory decode & play
  const readyArrayBuf = arrayBufferCache.get(url);
  if (readyArrayBuf) {
    const decoded = await decodeStaticMp3(url, readyArrayBuf);
    if (decoded && playAudioBufferNow(decoded, rateMode)) {
      return { spoken: true, source: 'decoded-ram', url };
    }
  }

  // Fast Path 3: Direct HTMLAudioElement playback from static storage + background RAM cache
  try {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.playbackRate = rateMode === 'slow' ? 0.88 : 1.0;
    activeHtmlAudio = audio;
    audio.onended = () => {
      if (activeHtmlAudio === audio) {
        activeHtmlAudio = null;
      }
    };
    await audio.play();
    void preloadBengaliUrl(url);
    return { spoken: true, source: 'static-stream', url };
  } catch {
    return {
      spoken: false,
      reason: 'playback-error',
      errorMessage: 'অডিও চালু করতে ব্রাউজারে আবার ট্যাপ করুন।',
    };
  }
}

export function getAllManifestAudioUrls(): string[] {
  return Array.from(new Set(Object.values(BENGALI_AUDIO_MANIFEST)));
}
