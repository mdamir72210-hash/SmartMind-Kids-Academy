import { useCallback, useState } from 'react';
import {
  BengaliSpeechResult,
  preloadBengaliTexts,
  speakBengaliPreGenerated,
  testBengaliPreGeneratedVoice,
} from '../utils/audio';

export interface BengaliSpeechNotice {
  kind: 'success' | 'error' | 'info';
  text: string;
}

export function useBengaliSpeech(speechRate: 'slow' | 'normal') {
  const [notice, setNotice] = useState<BengaliSpeechNotice | null>(null);

  const clearNotice = useCallback(() => setNotice(null), []);

  const preload = useCallback((texts: string[]) => {
    void preloadBengaliTexts(texts);
  }, []);

  const speak = useCallback(
    async (text: string): Promise<BengaliSpeechResult> => {
      setNotice(null);
      const res = await speakBengaliPreGenerated(text, speechRate);
      if (!res.spoken) {
        setNotice({
          kind: 'error',
          text: res.errorMessage || 'বাংলা অডিও চালু করা যায়নি।',
        });
      }
      return res;
    },
    [speechRate]
  );

  const testVoice = useCallback(async (): Promise<BengaliSpeechResult> => {
    setNotice(null);
    const res = await testBengaliPreGeneratedVoice(speechRate);
    if (res.spoken) {
      setNotice({
        kind: 'success',
        text: 'সংরক্ষিত বাংলা ভয়েস (bn-IN) তাৎক্ষণিকভাবে চালু হয়েছে।',
      });
    } else {
      setNotice({
        kind: 'error',
        text: res.errorMessage || 'বাংলা ভয়েস পরীক্ষা সফল হয়নি।',
      });
    }
    return res;
  }, [speechRate]);

  return {
    notice,
    clearNotice,
    preload,
    speak,
    testVoice,
  };
}
