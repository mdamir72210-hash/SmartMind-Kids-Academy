import {
  getBengaliPreloadStats,
  playPreGeneratedBengaliAudio,
  preloadBengaliTexts,
  PreGeneratedSpeechResult,
  stopPreGeneratedBengaliAudio,
  unlockSharedAudioContext,
} from './bengaliPreloadedPlayer';

export interface SpeechResult {
  spoken: boolean;
  reason?: 'no-speech-api' | 'no-bengali-voice';
}

export type BengaliSpeechResult = PreGeneratedSpeechResult;

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

// ==========================================
// ENGLISH AUDIO (Separate, preserved as-is)
// ==========================================

export function hasSpeechSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function getVoicesSafe(): SpeechSynthesisVoice[] {
  if (!hasSpeechSupport()) return [];
  try {
    return window.speechSynthesis.getVoices() || [];
  } catch {
    return [];
  }
}

export function findEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getVoicesSafe();
  return (
    voices.find((v) => v.lang.toLowerCase() === 'en-us') ||
    voices.find((v) => v.lang.toLowerCase() === 'en-gb') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

export function speakEnglish(text: string, rateMode: 'slow' | 'normal' = 'normal'): SpeechResult {
  if (!hasSpeechSupport()) {
    return { spoken: false, reason: 'no-speech-api' };
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = findEnglishVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = 'en-US';
    }
    utter.rate = rateMode === 'slow' ? 0.78 : 0.94;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
    return { spoken: true };
  } catch {
    return { spoken: false, reason: 'no-speech-api' };
  }
}

// =========================================================================
// BENGALI AUDIO (100% Pre-Generated Static Storage + Instant RAM Preload)
// Zero runtime API requests, zero loading states, works offline once cached.
// =========================================================================

export async function speakBengaliPreGenerated(
  text: string,
  rateMode: 'slow' | 'normal' = 'slow'
): Promise<BengaliSpeechResult> {
  return playPreGeneratedBengaliAudio(text, rateMode);
}

export async function testBengaliPreGeneratedVoice(
  rateMode: 'slow' | 'normal' = 'normal'
): Promise<BengaliSpeechResult> {
  const sampleText = 'নমস্কার! স্মার্টমাইন্ড কিডস একাডেমিতে স্বাগতম।';
  return playPreGeneratedBengaliAudio(sampleText, rateMode);
}

export { getBengaliPreloadStats, preloadBengaliTexts };
