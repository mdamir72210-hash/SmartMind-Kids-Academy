import {
  ENGLISH_AUDIO_MANIFEST,
  ENGLISH_AUDIO_TOTAL_CLIPS,
  resolveEnglishAudioUrl,
} from '../data/englishAudioManifest';
import {
  countRamReadyForPrefix,
  getOrCreateAudioContext,
  playPreGeneratedStaticSequence,
  playPreGeneratedStaticUrl,
  PreGeneratedSpeechResult,
  preloadStaticAudioUrl,
  preloadStaticAudioUrls,
  stopAllPreGeneratedSpeech,
  unlockSharedAudioContext,
} from './preloadedSpeechCore';

export type { PreGeneratedSpeechResult };
export { getOrCreateAudioContext, unlockSharedAudioContext };

export const ENGLISH_CACHE_BUCKET = 'smartmind-en-audio-v1';

export function getEnglishPreloadStats(): {
  totalStoredClips: number;
  ramReadyCount: number;
} {
  return {
    totalStoredClips: ENGLISH_AUDIO_TOTAL_CLIPS,
    ramReadyCount: countRamReadyForPrefix('./audio/en/'),
  };
}

export function stopPreGeneratedEnglishAudio(): void {
  stopAllPreGeneratedSpeech();
}

export function preloadEnglishUrl(url: string): Promise<void> {
  return preloadStaticAudioUrl(url, ENGLISH_CACHE_BUCKET);
}

export async function preloadEnglishTexts(texts: string[], concurrency = 4): Promise<void> {
  const urls: string[] = [];
  for (const t of texts) {
    const url = resolveEnglishAudioUrl(t);
    if (url) urls.push(url);
  }
  await preloadStaticAudioUrls(urls, ENGLISH_CACHE_BUCKET, concurrency);
}

export async function playPreGeneratedEnglishAudio(
  text: string,
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<PreGeneratedSpeechResult> {
  const clean = text.trim();
  if (!clean) {
    return {
      spoken: false,
      reason: 'invalid-text',
      errorMessage: 'No English text available to pronounce.',
    };
  }

  const url = resolveEnglishAudioUrl(clean);
  if (!url) {
    return {
      spoken: false,
      reason: 'missing-asset',
      errorMessage: 'Pre-generated English audio clip not found for this phrase.',
    };
  }

  return playPreGeneratedStaticUrl(
    url,
    ENGLISH_CACHE_BUCKET,
    rateMode,
    'Tap once more to start English audio playback.'
  );
}

export async function playPreGeneratedEnglishSequence(
  texts: string[],
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<PreGeneratedSpeechResult> {
  const urls: string[] = [];
  for (const t of texts) {
    const url = resolveEnglishAudioUrl(t);
    if (!url) {
      return {
        spoken: false,
        reason: 'missing-asset',
        errorMessage: `Pre-generated English audio clip not found for "${t}".`,
      };
    }
    urls.push(url);
  }

  return playPreGeneratedStaticSequence(
    urls,
    ENGLISH_CACHE_BUCKET,
    rateMode,
    'Tap once more to start English audio playback.'
  );
}

export function getAllEnglishManifestAudioUrls(): string[] {
  return Array.from(new Set(Object.values(ENGLISH_AUDIO_MANIFEST)));
}
