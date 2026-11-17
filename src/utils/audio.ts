import {
  buildMathEquationBengaliTokens,
  getBengaliPreloadStats,
  playPreGeneratedBengaliAudio,
  playPreGeneratedBengaliSequence,
  preloadBengaliTexts,
  PreGeneratedSpeechResult,
  stopPreGeneratedBengaliAudio,
  unlockSharedAudioContext,
} from './bengaliPreloadedPlayer';
import {
  getEnglishPreloadStats,
  playPreGeneratedEnglishAudio,
  playPreGeneratedEnglishSequence,
  preloadEnglishTexts,
  stopPreGeneratedEnglishAudio,
} from './englishPreloadedPlayer';

export type SpeechResult = PreGeneratedSpeechResult;
export type BengaliSpeechResult = PreGeneratedSpeechResult;
export type EnglishSpeechResult = PreGeneratedSpeechResult;

let sfxCtx: AudioContext | null = null;

function getSfxContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sfxCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      sfxCtx = new Ctx();
    }
  }
  if (sfxCtx && sfxCtx.state === 'suspended') {
    sfxCtx.resume().catch(() => {});
  }
  return sfxCtx;
}

export function unlockAudioForMobile(): void {
  getSfxContext();
  unlockSharedAudioContext();
}

export function stopActiveBengaliAudio(): void {
  stopPreGeneratedBengaliAudio();
}

export function stopActiveEnglishAudio(): void {
  stopPreGeneratedEnglishAudio();
}

export function playTapSound(enabled = true): void {
  if (!enabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Audio playback ignored gracefully
  }
}

export function playSuccessChime(enabled = true): void {
  if (!enabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.11, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch {
    // Ignore if blocked
  }
}

export function playTryAgainTone(enabled = true): void {
  if (!enabled) return;
  const ctx = getSfxContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  } catch {
    // Ignore
  }
}

// =========================================================================
// INDIAN ENGLISH AUDIO (100% Pre-Generated en-IN Static Storage + RAM Preload)
// =========================================================================

export async function speakEnglish(
  text: string,
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<EnglishSpeechResult> {
  return playPreGeneratedEnglishAudio(text, rateMode);
}

export async function speakEnglishSequence(
  texts: string[],
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<EnglishSpeechResult> {
  return playPreGeneratedEnglishSequence(texts, rateMode);
}

export function buildMathEquationAudioTokens(
  a: number,
  op: '+' | '-' | '×',
  b: number,
  result?: number
): string[] {
  const opWord = op === '+' ? 'plus' : op === '-' ? 'minus' : 'times';
  if (result !== undefined) {
    return [String(a), opWord, String(b), 'equals', String(result)];
  }
  return [String(a), opWord, String(b), 'equals what?'];
}

export async function speakMathEquationEnglish(
  a: number,
  op: '+' | '-' | '×',
  b: number,
  rateMode: 'slow' | 'normal' = 'normal',
  result?: number
): Promise<EnglishSpeechResult> {
  return playPreGeneratedEnglishSequence(buildMathEquationAudioTokens(a, op, b, result), rateMode);
}

export async function testEnglishPreGeneratedVoice(
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<EnglishSpeechResult> {
  return playPreGeneratedEnglishAudio('Hello! Welcome to SmartMind Kids Academy.', rateMode);
}

// =========================================================================
// INDIAN BENGALI AUDIO (100% Pre-Generated bn-IN Static Storage + RAM Preload)
// =========================================================================

export async function speakBengaliPreGenerated(
  text: string,
  rateMode: 'slow' | 'normal' = 'slow'
): Promise<BengaliSpeechResult> {
  return playPreGeneratedBengaliAudio(text, rateMode);
}

export async function speakMathEquationBengali(
  a: number,
  op: '+' | '-' | '−' | '×',
  b: number,
  rateMode: 'slow' | 'normal' = 'slow',
  result?: number
): Promise<BengaliSpeechResult> {
  const tokens = buildMathEquationBengaliTokens(a, op, b, result);
  if (!tokens) {
    return {
      spoken: false,
      reason: 'invalid-text',
      errorMessage: 'এই গণিত প্রশ্নটির বাংলা অডিও পাওয়া যায়নি।',
    };
  }
  return playPreGeneratedBengaliSequence(tokens, rateMode);
}

export async function testBengaliPreGeneratedVoice(
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<BengaliSpeechResult> {
  const sampleText = 'নমস্কার! স্মার্টমাইন্ড কিডস একাডেমিতে স্বাগতম।';
  return playPreGeneratedBengaliAudio(sampleText, rateMode);
}

export {
  buildMathEquationBengaliTokens,
  getBengaliPreloadStats,
  getEnglishPreloadStats,
  preloadBengaliTexts,
  preloadEnglishTexts,
};
