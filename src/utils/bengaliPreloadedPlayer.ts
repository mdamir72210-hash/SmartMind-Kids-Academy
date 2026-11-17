import {
  BENGALI_AUDIO_MANIFEST,
  BENGALI_AUDIO_TOTAL_CLIPS,
  resolveBengaliAudioUrl,
} from '../data/bengaliAudioManifest';
import { NUMBERS_1_TO_100 } from '../data/numbersMath';
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

export const BENGALI_CACHE_BUCKET = 'smartmind-bn-audio-v1';

const BENGALI_DIGIT_MAP: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

function normalizeDigitsToAscii(input: string): string {
  return input.replace(/[০-৯]/g, (d) => BENGALI_DIGIT_MAP[d] ?? d);
}

export function bengaliNumberToWord(n: number): string | null {
  if (n === 0) return 'শূন্য';
  if (n >= 1 && n <= NUMBERS_1_TO_100.length) {
    return NUMBERS_1_TO_100[n - 1].bengaliName;
  }
  return null;
}

export function buildMathEquationBengaliTokens(
  a: number,
  op: '+' | '-' | '−' | '×',
  b: number,
  result?: number
): string[] | null {
  const aWord = bengaliNumberToWord(a);
  const bWord = bengaliNumberToWord(b);
  if (!aWord || !bWord) return null;

  const opWord = op === '+' ? 'যোগ' : op === '-' || op === '−' ? 'বিয়োগ' : 'গুণ';

  if (result !== undefined) {
    const resWord = bengaliNumberToWord(result);
    if (!resWord) return null;
    const full = `${aWord} ${opWord} ${bWord} সমান ${resWord}।`;
    if (resolveBengaliAudioUrl(full)) return [full];
    return [aWord, opWord, bWord, 'সমান', resWord];
  }

  const fullQuestion = `${aWord} ${opWord} ${bWord} সমান কত হয়?`;
  if (resolveBengaliAudioUrl(fullQuestion)) return [fullQuestion];
  return [aWord, opWord, bWord, 'সমান কত হয়?'];
}

export function resolveBengaliMathTokens(text: string): string[] | null {
  const ascii = normalizeDigitsToAscii(text.normalize('NFC').trim());

  const questionMatch = ascii.match(
    /^(\d+)\s*([+\-−×*])\s*(\d+)\s*(?:=\s*\?|সমান\s*কত\s*হয়\??|কত\s*হয়\??|=\s*কত\s*\??)?\s*\??$/
  );
  if (questionMatch) {
    const a = Number(questionMatch[1]);
    const rawOp = questionMatch[2];
    const b = Number(questionMatch[3]);
    const op: '+' | '-' | '×' =
      rawOp === '+' ? '+' : rawOp === '-' || rawOp === '−' ? '-' : '×';
    return buildMathEquationBengaliTokens(a, op, b);
  }

  const equationMatch = ascii.match(/^(\d+)\s*([+\-−×*])\s*(\d+)\s*=\s*(\d+)\s*[।.]?\s*$/);
  if (equationMatch) {
    const a = Number(equationMatch[1]);
    const rawOp = equationMatch[2];
    const b = Number(equationMatch[3]);
    const res = Number(equationMatch[4]);
    const op: '+' | '-' | '×' =
      rawOp === '+' ? '+' : rawOp === '-' || rawOp === '−' ? '-' : '×';
    return buildMathEquationBengaliTokens(a, op, b, res);
  }

  return null;
}

export function getBengaliPreloadStats(): {
  totalStoredClips: number;
  ramReadyCount: number;
} {
  return {
    totalStoredClips: BENGALI_AUDIO_TOTAL_CLIPS,
    ramReadyCount: countRamReadyForPrefix('./audio/bn/'),
  };
}

export function stopPreGeneratedBengaliAudio(): void {
  stopAllPreGeneratedSpeech();
}

export function preloadBengaliUrl(url: string): Promise<void> {
  return preloadStaticAudioUrl(url, BENGALI_CACHE_BUCKET);
}

export async function preloadBengaliTexts(texts: string[], concurrency = 4): Promise<void> {
  const urls: string[] = [];
  for (const t of texts) {
    const mathTokens = resolveBengaliMathTokens(t);
    if (mathTokens) {
      for (const tok of mathTokens) {
        const u = resolveBengaliAudioUrl(tok);
        if (u) urls.push(u);
      }
      continue;
    }
    const url = resolveBengaliAudioUrl(t);
    if (url) urls.push(url);
  }
  await preloadStaticAudioUrls(urls, BENGALI_CACHE_BUCKET, concurrency);
}

export async function playPreGeneratedBengaliSequence(
  texts: string[],
  rateMode: 'slow' | 'normal' = 'slow'
): Promise<PreGeneratedSpeechResult> {
  const urls: string[] = [];
  for (const t of texts) {
    const url = resolveBengaliAudioUrl(t);
    if (!url) {
      return {
        spoken: false,
        reason: 'missing-asset',
        errorMessage: 'এই বাংলা শব্দটির সংরক্ষিত অডিও পাওয়া যায়নি।',
      };
    }
    urls.push(url);
  }

  return playPreGeneratedStaticSequence(
    urls,
    BENGALI_CACHE_BUCKET,
    rateMode,
    'অডিও চালু করতে ব্রাউজারে আবার ট্যাপ করুন।'
  );
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

  const mathTokens = resolveBengaliMathTokens(clean);
  if (mathTokens) {
    return playPreGeneratedBengaliSequence(mathTokens, rateMode);
  }

  const url = resolveBengaliAudioUrl(clean);
  if (!url) {
    return {
      spoken: false,
      reason: 'missing-asset',
      errorMessage: 'এই বাংলা শব্দটির সংরক্ষিত অডিও পাওয়া যায়নি।',
    };
  }

  return playPreGeneratedStaticUrl(
    url,
    BENGALI_CACHE_BUCKET,
    rateMode,
    'অডিও চালু করতে ব্রাউজারে আবার ট্যাপ করুন।'
  );
}

export function getAllManifestAudioUrls(): string[] {
  return Array.from(new Set(Object.values(BENGALI_AUDIO_MANIFEST)));
}
