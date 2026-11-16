import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { ENGLISH_ALPHABET } from '../../data/englishAlphabet';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress } from '../../types/learning';
import { playSuccessChime, playTapSound, playTryAgainTone, speakEnglish } from '../../utils/audio';
import { PictureArt } from '../common/PictureArt';
import { RewardBanner } from '../common/RewardBanner';
import { TracingCanvas } from '../common/TracingCanvas';

interface EnglishAlphabetViewProps {
  progress: LearningProgress;
  onMarkLearned: (letter: string) => void;
  onMarkTraced: (letter: string) => void;
  onCheckpointWin: (groupLabel: string) => void;
}

export const EnglishAlphabetView: React.FC<EnglishAlphabetViewProps> = ({
  progress,
  onMarkLearned,
  onMarkTraced,
  onCheckpointWin,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'trace' | 'activity'>('learn');
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'encourage';
    message: string;
    bengali: string;
    points?: number;
  } | null>(null);

  const {
    notice: bnNotice,
    clearNotice: clearBnNotice,
    preload: preloadBn,
    speak: speakBn,
  } = useBengaliSpeech(progress.settings.speechRate);

  const [activityQuestions, setActivityQuestions] = useState<
    { targetIndex: number; options: number[] }[]
  >([]);
  const [activityStep, setActivityStep] = useState(0);
  const [activityScore, setActivityScore] = useState(0);
  const [activityDone, setActivityDone] = useState(false);

  const current = ENGLISH_ALPHABET[currentIndex];
  const isLearned = progress.englishCompleted.includes(current.letter);
  const isTraced = progress.englishTraced.includes(current.letter);

  useEffect(() => {
    const indices = [
      currentIndex,
      (currentIndex + 1) % ENGLISH_ALPHABET.length,
      (currentIndex + 2) % ENGLISH_ALPHABET.length,
      (currentIndex - 1 + ENGLISH_ALPHABET.length) % ENGLISH_ALPHABET.length,
    ];
    preloadBn(
      indices.map((idx) => {
        const item = ENGLISH_ALPHABET[idx];
        return `${item.bengaliWord}। ${item.bengaliSentence}`;
      })
    );
  }, [currentIndex, preloadBn]);

  const handleSpeakEnglish = (text: string) => {
    setAudioNotice(null);
    clearBnNotice();
    const res = speakEnglish(text, progress.settings.speechRate);
    if (!res.spoken) {
      setAudioNotice('English speech audio is not supported in this browser. Use the phonetic guide shown on the card.');
    }
    onMarkLearned(current.letter);
  };

  const handleSpeakBengaliMeaning = () => {
    setAudioNotice(null);
    onMarkLearned(current.letter);
    void speakBn(`${current.bengaliWord}। ${current.bengaliSentence}`);
  };

  const handleSelectLetter = (index: number) => {
    playTapSound(progress.settings.soundEffects);
    setCurrentIndex(index);
    setFeedback(null);
    setAudioNotice(null);
    clearBnNotice();
    onMarkLearned(ENGLISH_ALPHABET[index].letter);
  };

  const startCheckpointActivity = (endIdx = currentIndex) => {
    const startIdx = Math.max(0, endIdx - 4);
    const pool = Array.from({ length: Math.min(5, endIdx - startIdx + 1) }, (_, i) => startIdx + i);
    const qs = pool.slice(0, 3).map((targetIndex) => {
      const distractors = ENGLISH_ALPHABET.map((_, idx) => idx)
        .filter((idx) => idx !== targetIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      const options = [targetIndex, ...distractors].sort(() => Math.random() - 0.5);
      return { targetIndex, options };
    });
    setActivityQuestions(qs);
    setActivityStep(0);
    setActivityScore(0);
    setActivityDone(false);
    setFeedback(null);
    setMode('activity');
  };

  const handleNext = () => {
    playTapSound(progress.settings.soundEffects);
    const nextIdx = (currentIndex + 1) % ENGLISH_ALPHABET.length;
    setCurrentIndex(nextIdx);
    setFeedback(null);
    setAudioNotice(null);
    clearBnNotice();
    onMarkLearned(ENGLISH_ALPHABET[nextIdx].letter);
  };

  const handlePrev = () => {
    playTapSound(progress.settings.soundEffects);
    const prevIdx = (currentIndex - 1 + ENGLISH_ALPHABET.length) % ENGLISH_ALPHABET.length;
    setCurrentIndex(prevIdx);
    setFeedback(null);
    setAudioNotice(null);
    clearBnNotice();
  };

  const handleAnswerActivity = (chosenIdx: number) => {
    const q = activityQuestions[activityStep];
    if (!q) return;
    if (chosenIdx === q.targetIndex) {
      playSuccessChime(progress.settings.soundEffects);
      const nextScore = activityScore + 1;
      setActivityScore(nextScore);
      setFeedback({
        tone: 'success',
        message: 'Excellent! You matched the letter!',
        bengali: 'চমৎকার! তুমি সঠিক বর্ণ বেছে নিয়েছ!',
        points: 10,
      });
      setTimeout(() => {
        if (activityStep + 1 < activityQuestions.length) {
          setActivityStep((s) => s + 1);
          setFeedback(null);
        } else {
          setActivityDone(true);
          onCheckpointWin(`${ENGLISH_ALPHABET[q.targetIndex].letter} checkpoint`);
        }
      }, 900);
    } else {
      playTryAgainTone(progress.settings.soundEffects);
      setFeedback({
        tone: 'encourage',
        message: 'Nice try! Look closely at the picture and try again.',
        bengali: 'আবার চেষ্টা করো! ছবিটি দেখে আবার চেষ্টা করো।',
      });
    }
  };

  const isCheckpointMilestone = useMemo(
    () => (currentIndex + 1) % 5 === 0 || currentIndex === ENGLISH_ALPHABET.length - 1,
    [currentIndex]
  );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            English Alphabet A–Z
          </h1>
          <p className="font-bengali text-sm text-slate-600 mt-0.5">
            ইংরেজি বর্ণমালা · ছবি, বাংলা অর্থ ও উচ্চারণ ({progress.englishCompleted.length}/26 learned)
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('learn');
              setFeedback(null);
            }}
            className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              mode === 'learn' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Learn Card
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('trace');
              setFeedback(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              mode === 'trace' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Trace</span>
          </button>
          <button
            type="button"
            onClick={() => startCheckpointActivity(currentIndex)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              mode === 'activity' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Activity</span>
          </button>
        </div>
      </div>

      {feedback && (
        <RewardBanner
          tone={feedback.tone}
          message={feedback.message}
          bengaliMessage={feedback.bengali}
          pointsEarned={feedback.points}
        />
      )}

      {mode === 'activity' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {!activityDone && activityQuestions[activityStep] ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Mini Checkpoint Activity
                </h2>
                <span className="text-sm font-semibold text-slate-500 tabular-nums">
                  Question {activityStep + 1} of {activityQuestions.length}
                </span>
              </div>

              {(() => {
                const target = ENGLISH_ALPHABET[activityQuestions[activityStep].targetIndex];
                return (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <PictureArt artKey={target.artKey} label={target.word} size="lg" />
                    <div>
                      <p className="font-display text-2xl font-extrabold text-slate-900">
                        Which letter starts “{target.word}”?
                      </p>
                      <p className="font-bengali text-base text-slate-600 mt-1">
                        “{target.bengaliWord}” কোন বর্ণ দিয়ে শুরু হয়?
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-md pt-2">
                      {activityQuestions[activityStep].options.map((optIdx) => {
                        const opt = ENGLISH_ALPHABET[optIdx];
                        return (
                          <button
                            key={opt.letter}
                            type="button"
                            onClick={() => handleAnswerActivity(optIdx)}
                            className="py-5 min-h-[72px] rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 font-display text-4xl font-extrabold text-sky-800 transition-transform active:scale-95"
                          >
                            {opt.letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <Star className="w-9 h-9 fill-amber-400 text-amber-500" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">
                Well Done! Activity Complete!
              </h2>
              <p className="font-bengali text-base text-slate-600">
                তুমি {activityQuestions.length}টির মধ্যে {activityScore}টি সঠিক উত্তর দিয়েছ!
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCheckpointActivity(currentIndex)}
                  className="px-5 py-3 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('learn');
                    setFeedback(null);
                  }}
                  className="px-5 py-3 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm"
                >
                  Back to Letters
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Flashcard */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                Letter {currentIndex + 1} of 26 · Pronunciation: {current.phonetic}
              </span>
              {isLearned && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Learned
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 py-2">
              <div
                onClick={() => handleSpeakEnglish(current.letter)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSpeakEnglish(current.letter);
                }}
                aria-label={`Tap to hear letter ${current.letter}`}
                className={`w-40 h-40 sm:w-48 sm:h-48 rounded-3xl border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-95 ${current.accentBg} ${current.accentBorder}`}
              >
                <span className={`font-display text-7xl sm:text-8xl font-extrabold leading-none ${current.accentText}`}>
                  {current.letter}
                  <span className="text-5xl sm:text-6xl opacity-80 ml-1">{current.lowercase}</span>
                </span>
                <span className="text-xs font-semibold text-slate-600 mt-2">Tap to hear</span>
              </div>

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <PictureArt artKey={current.artKey} label={current.word} size="md" />
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {current.word}
                    </h2>
                    <p className="font-bengali text-2xl sm:text-3xl font-bold text-sky-700 mt-1">
                      {current.bengaliWord}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bengali pronunciation: {current.bengaliTranslit}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left">
                  <p className="text-sm sm:text-base font-medium text-slate-800">{current.sentence}</p>
                  <p className="font-bengali text-sm text-slate-600 mt-1">{current.bengaliSentence}</p>
                </div>
              </div>
            </div>

            {/* Audio Controls (English SpeechSynthesis + Gemini Bengali bn-IN) */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSpeakEnglish(`${current.letter}`)}
                className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm border-b-4 border-sky-800 active:translate-y-0.5 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Letter</span>
              </button>
              <button
                type="button"
                onClick={() => handleSpeakEnglish(`${current.letter} is for ${current.word}. ${current.sentence}`)}
                className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm border-b-4 border-amber-600 active:translate-y-0.5 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear English</span>
              </button>
              <button
                type="button"
                onClick={handleSpeakBengaliMeaning}
                className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-b-4 border-emerald-800 active:translate-y-0.5 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span className="font-bengali">বাংলা অর্থ শুনো</span>
              </button>
              <button
                type="button"
                onClick={() => handleSpeakEnglish(`${current.word}`)}
                className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>
            </div>

            {audioNotice && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
                {audioNotice}
              </p>
            )}

            {bnNotice && (
              <div
                role="status"
                className={`mt-3 flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border ${
                  bnNotice.kind === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : bnNotice.kind === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-sky-50 border-sky-200 text-sky-800'
                }`}
              >
                {bnNotice.kind === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{bnNotice.text}</span>
              </div>
            )}

            {/* Previous / Next Navigation */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {isCheckpointMilestone && (
                <button
                  type="button"
                  onClick={() => startCheckpointActivity(currentIndex)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Checkpoint Quiz!</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm border-b-4 border-sky-800 active:translate-y-0.5 transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <TracingCanvas
              character={current.letter}
              label={`letter ${current.letter}`}
              alreadyTraced={isTraced}
              onComplete={() => {
                playSuccessChime(progress.settings.soundEffects);
                onMarkTraced(current.letter);
                setFeedback({
                  tone: 'success',
                  message: `Very Good! You traced ${current.letter} neatly!`,
                  bengali: `খুব সুন্দর! তুমি ${current.letter} লিখে ফেলেছ!`,
                  points: 5,
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Full A–Z Letter Selection Grid */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Select Any Letter (A–Z)
          </h3>
          <span className="text-xs text-slate-500 font-semibold tabular-nums">
            {progress.englishCompleted.length} / 26 completed
          </span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2">
          {ENGLISH_ALPHABET.map((item, idx) => {
            const active = idx === currentIndex && mode !== 'activity';
            const done = progress.englishCompleted.includes(item.letter);
            return (
              <button
                key={item.letter}
                type="button"
                onClick={() => {
                  if (mode === 'activity') setMode('learn');
                  handleSelectLetter(idx);
                }}
                className={`relative min-h-[48px] rounded-xl font-display text-xl font-extrabold transition-all border ${
                  active
                    ? 'bg-sky-600 text-white border-sky-700 scale-105 shadow-sm'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-sky-50'
                }`}
              >
                {item.letter}
                {done && !active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 text-[10px] text-emerald-600 font-bold"
                  >
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
