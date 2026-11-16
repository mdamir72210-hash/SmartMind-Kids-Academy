import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { BENGALI_CONSONANTS, BENGALI_VOWELS } from '../../data/bengaliAlphabet';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress } from '../../types/learning';
import { playSuccessChime, playTapSound, speakEnglish } from '../../utils/audio';
import { PictureArt } from '../common/PictureArt';
import { RewardBanner } from '../common/RewardBanner';
import { TracingCanvas } from '../common/TracingCanvas';

interface BengaliAlphabetViewProps {
  progress: LearningProgress;
  onMarkLearned: (letter: string, group: 'vowel' | 'consonant') => void;
  onMarkTraced: (letter: string) => void;
}

export const BengaliAlphabetView: React.FC<BengaliAlphabetViewProps> = ({
  progress,
  onMarkLearned,
  onMarkTraced,
}) => {
  const [group, setGroup] = useState<'vowel' | 'consonant'>('vowel');
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; bengali: string; points?: number } | null>(
    null
  );

  const {
    notice,
    clearNotice,
    preload: preloadBn,
    speak: speakBn,
    testVoice,
  } = useBengaliSpeech(progress.settings.speechRate);

  const list = group === 'vowel' ? BENGALI_VOWELS : BENGALI_CONSONANTS;
  const current = list[index] || list[0];
  const learnedList =
    group === 'vowel' ? progress.bengaliVowelsCompleted : progress.bengaliConsonantsCompleted;
  const isLearned = learnedList.includes(current.letter);
  const isTraced = progress.bengaliTraced.includes(current.letter);

  useEffect(() => {
    const offsets = [0, 1, 2, 3, -1];
    const texts: string[] = [];
    for (const offset of offsets) {
      const item = list[(index + offset + list.length) % list.length];
      if (item) {
        texts.push(`${item.letter}। ${item.word}।`, item.sentence);
      }
    }
    preloadBn(texts);
  }, [group, index, list, preloadBn]);

  const handleGroupChange = (nextGroup: 'vowel' | 'consonant') => {
    playTapSound(progress.settings.soundEffects);
    setGroup(nextGroup);
    setIndex(0);
    clearNotice();
    setFeedback(null);
  };

  const handleHearLetterAndWord = () => {
    onMarkLearned(current.letter, group);
    void speakBn(`${current.letter}। ${current.word}।`);
  };

  const handleHearSentence = () => {
    onMarkLearned(current.letter, group);
    void speakBn(current.sentence);
  };

  const handleHearEnglishMeaning = () => {
    speakEnglish(`${current.englishMeaning}`, progress.settings.speechRate);
    onMarkLearned(current.letter, group);
  };

  const handleNext = () => {
    playTapSound(progress.settings.soundEffects);
    const nextIdx = (index + 1) % list.length;
    setIndex(nextIdx);
    clearNotice();
    setFeedback(null);
    onMarkLearned(list[nextIdx].letter, group);
  };

  const handlePrev = () => {
    playTapSound(progress.settings.soundEffects);
    const prevIdx = (index - 1 + list.length) % list.length;
    setIndex(prevIdx);
    clearNotice();
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Group Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-display font-bengali text-2xl sm:text-3xl font-extrabold text-slate-900">
            বাংলা বর্ণমালা (Bengali Alphabet)
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            স্বরবর্ণ ({progress.bengaliVowelsCompleted.length}/{BENGALI_VOWELS.length}) · ব্যঞ্জনবর্ণ (
            {progress.bengaliConsonantsCompleted.length}/{BENGALI_CONSONANTS.length})
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleGroupChange('vowel')}
            className={`font-bengali px-4 py-2 min-h-[44px] rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              group === 'vowel'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            স্বরবর্ণ (অ–ঔ)
          </button>
          <button
            type="button"
            onClick={() => handleGroupChange('consonant')}
            className={`font-bengali px-4 py-2 min-h-[44px] rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              group === 'consonant'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ব্যঞ্জনবর্ণ (ক–ঁ)
          </button>
        </div>
      </div>

      {feedback && (
        <RewardBanner
          tone="success"
          message={feedback.message}
          bengaliMessage={feedback.bengali}
          pointsEarned={feedback.points}
        />
      )}

      {/* Main Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {group === 'vowel' ? 'স্বরবর্ণ' : 'ব্যঞ্জনবর্ণ'} {index + 1} of {list.length} · Sound:{' '}
              {current.phonetic}
            </span>
            {isLearned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Learned
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 py-2">
            {/* Large Bengali Letter Card */}
            <button
              type="button"
              onClick={handleHearLetterAndWord}
              aria-label={`Hear Bengali letter ${current.letter}`}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center cursor-pointer select-none hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
            >
              <span className="font-bengali text-8xl sm:text-9xl font-bold text-emerald-800 leading-none">
                {current.letter}
              </span>
              <span className="text-xs font-semibold text-emerald-700 mt-2">
                Tap to hear ({current.phonetic})
              </span>
            </button>

            {/* Word, Picture & Learning Sentence */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <PictureArt artKey={current.artKey} label={current.englishMeaning} size="md" />
                <div>
                  <h2 className="font-bengali text-3xl sm:text-4xl font-bold text-slate-900">
                    {current.letter} – {current.word}
                  </h2>
                  <p className="font-display text-xl font-bold text-emerald-700 mt-1">
                    {current.englishMeaning}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pronunciation: {current.wordPhonetic}
                  </p>
                </div>
              </div>

              <div className="w-full bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 text-left">
                <p className="font-bengali text-sm sm:text-base font-semibold text-slate-800">
                  {current.sentence}
                </p>
              </div>
            </div>
          </div>

          {/* Pre-generated Bengali (bn-IN) + English Audio Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleHearLetterAndWord}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-b-4 border-emerald-800 active:translate-y-0.5 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span className="font-bengali">বর্ণ ও শব্দ শুনো</span>
            </button>

            <button
              type="button"
              onClick={handleHearSentence}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm border-b-4 border-teal-800 active:translate-y-0.5 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span className="font-bengali">বাক্য শুনো</span>
            </button>

            <button
              type="button"
              onClick={() => void testVoice()}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-sm transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bengali Voice Check</span>
            </button>

            <button
              type="button"
              onClick={handleHearEnglishMeaning}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm border-b-4 border-amber-600 active:translate-y-0.5 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>English ({current.englishMeaning})</span>
            </button>
          </div>

          {notice && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-3 flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border ${
                notice.kind === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : notice.kind === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}
            >
              {notice.kind === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-b-4 border-emerald-800 active:translate-y-0.5 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracing Column */}
        <div className="lg:col-span-5">
          <TracingCanvas
            character={current.letter}
            label={current.letter}
            isBengali
            alreadyTraced={isTraced}
            onComplete={() => {
              playSuccessChime(progress.settings.soundEffects);
              onMarkTraced(current.letter);
              setFeedback({
                message: `Well Done! You practiced writing ${current.letter}!`,
                bengali: `দারুণ! তুমি ${current.letter} খুব সুন্দর লিখেছ!`,
                points: 5,
              });
            }}
          />
        </div>
      </div>

      {/* Bengali Letter Grid */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6">
        <h3 className="font-display font-bengali text-lg font-bold text-slate-900 mb-4">
          {group === 'vowel' ? 'সকল স্বরবর্ণ (অ–ঔ)' : 'সকল ব্যঞ্জনবর্ণ (ক–ঁ)'}
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-11 gap-2">
          {list.map((item, idx) => {
            const active = idx === index;
            const done = learnedList.includes(item.letter);
            return (
              <button
                key={item.letter}
                type="button"
                onClick={() => {
                  playTapSound(progress.settings.soundEffects);
                  setIndex(idx);
                  clearNotice();
                  setFeedback(null);
                  onMarkLearned(item.letter, group);
                }}
                className={`relative min-h-[50px] rounded-xl font-bengali text-2xl font-bold border transition-all ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-700 scale-105 shadow-sm'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                {item.letter}
                {done && !active && (
                  <span aria-hidden="true" className="absolute top-1 right-1 text-[10px] text-emerald-600">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
