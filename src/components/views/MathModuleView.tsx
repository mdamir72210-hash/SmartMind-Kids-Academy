import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { NUMBERS_1_TO_100, toBengaliDigits } from '../../data/numbersMath';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress } from '../../types/learning';
import { playSuccessChime, playTapSound, playTryAgainTone, speakEnglish } from '../../utils/audio';
import { RewardBanner } from '../common/RewardBanner';

interface MathModuleViewProps {
  progress: LearningProgress;
  onPracticeNumber: (num: number) => void;
  onSolveMath: (summary: string, points: number) => void;
}

type MathTab = 'numbers' | 'visual-lab' | 'practice' | 'matching';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface MathProblem {
  prompt: string;
  visualA?: number;
  visualB?: number;
  op?: '+' | '-' | '×';
  answer: number;
  options: number[];
}

function generateProblem(difficulty: Difficulty): MathProblem {
  let a = 1;
  let b = 1;
  let op: '+' | '-' | '×' = '+';
  let answer = 2;

  if (difficulty === 'beginner') {
    a = Math.floor(Math.random() * 6) + 1;
    b = Math.floor(Math.random() * 5) + 1;
    if (Math.random() > 0.35) {
      op = '+';
      answer = a + b;
    } else {
      op = '-';
      if (a < b) [a, b] = [b, a];
      answer = a - b;
    }
  } else if (difficulty === 'intermediate') {
    const mode = Math.random();
    if (mode < 0.45) {
      a = Math.floor(Math.random() * 25) + 5;
      b = Math.floor(Math.random() * 20) + 3;
      op = '+';
      answer = a + b;
    } else if (mode < 0.85) {
      a = Math.floor(Math.random() * 30) + 12;
      b = Math.floor(Math.random() * 12) + 1;
      op = '-';
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 5) + 2;
      b = Math.floor(Math.random() * 4) + 2;
      op = '×';
      answer = a * b;
    }
  } else {
    const mode = Math.random();
    if (mode < 0.5) {
      a = Math.floor(Math.random() * 8) + 3;
      b = Math.floor(Math.random() * 9) + 2;
      op = '×';
      answer = a * b;
    } else if (mode < 0.75) {
      a = Math.floor(Math.random() * 50) + 25;
      b = Math.floor(Math.random() * 40) + 15;
      op = '+';
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 60) + 35;
      b = Math.floor(Math.random() * 30) + 5;
      op = '-';
      answer = a - b;
    }
  }

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = Math.floor(Math.random() * 7) - 3;
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) {
      distractors.add(candidate);
    }
  }
  const options = [answer, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

  return {
    prompt: `${a} ${op} ${b} = ?`,
    visualA: difficulty === 'beginner' || op === '×' ? a : undefined,
    visualB: difficulty === 'beginner' || op === '×' ? b : undefined,
    op,
    answer,
    options,
  };
}

export const MathModuleView: React.FC<MathModuleViewProps> = ({
  progress,
  onPracticeNumber,
  onSolveMath,
}) => {
  const [tab, setTab] = useState<MathTab>('numbers');
  const [selectedNumber, setSelectedNumber] = useState(NUMBERS_1_TO_100[0]);
  const [rangeStart, setRangeStart] = useState(1);

  const [labOp, setLabOp] = useState<'+' | '-' | '×'>('+');
  const [labA, setLabA] = useState(2);
  const [labB, setLabB] = useState(3);

  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [problem, setProblem] = useState<MathProblem>(() => generateProblem('beginner'));
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

  const [matchTarget, setMatchTarget] = useState(() => Math.floor(Math.random() * 20) + 1);
  const matchOptions = useMemo(() => {
    const set = new Set<number>([matchTarget]);
    while (set.size < 4) {
      set.add(Math.floor(Math.random() * 20) + 1);
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }, [matchTarget]);

  const visibleNumbers = useMemo(
    () => NUMBERS_1_TO_100.slice(rangeStart - 1, rangeStart + 19),
    [rangeStart]
  );

  const labResult =
    labOp === '+' ? labA + labB : labOp === '-' ? Math.max(0, labA - labB) : labA * labB;

  useEffect(() => {
    const opWord = labOp === '+' ? 'যোগ' : labOp === '-' ? 'বিয়োগ' : 'গুণ';
    const aWord = NUMBERS_1_TO_100[labA - 1]?.bengaliName || String(labA);
    const bWord = NUMBERS_1_TO_100[labB - 1]?.bengaliName || String(labB);
    const resWord =
      labResult === 0 ? 'শূন্য' : NUMBERS_1_TO_100[labResult - 1]?.bengaliName || String(labResult);

    const nearbyNums = [selectedNumber.value, selectedNumber.value + 1, selectedNumber.value - 1]
      .filter((n) => n >= 1 && n <= 100)
      .map((n) => NUMBERS_1_TO_100[n - 1].bengaliName);

    preloadBn([
      ...nearbyNums,
      NUMBERS_1_TO_100[matchTarget - 1].bengaliName,
      `${aWord} ${opWord} ${bWord} সমান ${resWord}।`,
    ]);
  }, [labA, labB, labOp, labResult, matchTarget, preloadBn, selectedNumber.value]);

  const handleSelectNum = (entry: (typeof NUMBERS_1_TO_100)[number]) => {
    playTapSound(progress.settings.soundEffects);
    setSelectedNumber(entry);
    clearBnNotice();
    onPracticeNumber(entry.value);
    speakEnglish(`${entry.value}. ${entry.englishName}`, progress.settings.speechRate);
  };

  const handleSpeakBengaliNumber = () => {
    onPracticeNumber(selectedNumber.value);
    void speakBn(`${selectedNumber.bengaliName}`);
  };

  const handleSpeakBengaliLab = () => {
    const opWord = labOp === '+' ? 'যোগ' : labOp === '-' ? 'বিয়োগ' : 'গুণ';
    const aWord = NUMBERS_1_TO_100[labA - 1]?.bengaliName || String(labA);
    const bWord = NUMBERS_1_TO_100[labB - 1]?.bengaliName || String(labB);
    const resWord = labResult === 0 ? 'শূন্য' : NUMBERS_1_TO_100[labResult - 1]?.bengaliName || String(labResult);
    void speakBn(`${aWord} ${opWord} ${bWord} সমান ${resWord}।`);
  };

  const handlePracticeAnswer = (chosen: number) => {
    if (chosen === problem.answer) {
      playSuccessChime(progress.settings.soundEffects);
      const pts = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20;
      setFeedback({
        tone: 'success',
        message: `Excellent! ${problem.prompt.replace('?', String(problem.answer))}`,
        bengali: `দারুণ! সঠিক উত্তর ${toBengaliDigits(problem.answer)}!`,
        points: pts,
      });
      onSolveMath(`${difficulty} math (${problem.prompt.replace('?', String(problem.answer))})`, pts);
      setTimeout(() => {
        setProblem(generateProblem(difficulty));
        setFeedback(null);
      }, 1000);
    } else {
      playTryAgainTone(progress.settings.soundEffects);
      setFeedback({
        tone: 'encourage',
        message: 'Almost there! Count carefully and try again.',
        bengali: 'আবার চেষ্টা করো! গুনে দেখে আরেকবার উত্তর দাও।',
      });
    }
  };

  const handleMatchPick = (val: number) => {
    if (val === matchTarget) {
      playSuccessChime(progress.settings.soundEffects);
      setFeedback({
        tone: 'success',
        message: `Very Good! ${val} (${toBengaliDigits(val)}) matched!`,
        bengali: `খুব সুন্দর! ${NUMBERS_1_TO_100[val - 1].bengaliName} মিলেছে!`,
        points: 10,
      });
      onSolveMath(`Matched number ${val}`, 10);
      setTimeout(() => {
        setMatchTarget(Math.floor(Math.random() * 20) + 1);
        setFeedback(null);
      }, 900);
    } else {
      playTryAgainTone(progress.settings.soundEffects);
      setFeedback({
        tone: 'encourage',
        message: 'Try again! Look at the English and Bengali number name.',
        bengali: 'আবার চেষ্টা করো!',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Numbers &amp; Mathematics
          </h1>
          <p className="font-bengali text-sm text-slate-600 mt-0.5">
            সংখ্যা ১–১০০ ও গণিত অনুশীলন ({progress.mathSolvedCount} problems solved)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'numbers' as const, label: 'Numbers 1–100' },
            { id: 'visual-lab' as const, label: 'Visual Math Lab' },
            { id: 'practice' as const, label: 'Math Practice' },
            { id: 'matching' as const, label: 'Number Match' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setFeedback(null);
                clearBnNotice();
              }}
              className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
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

      {bnNotice && (
        <div
          role="status"
          className={`flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border ${
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

      {/* Tab 1: Numbers 1-100 */}
      {tab === 'numbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">Hear Number Audio</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speakEnglish(
                      `${selectedNumber.value}. ${selectedNumber.englishName}`,
                      progress.settings.speechRate
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={handleSpeakBengaliNumber}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-bengali"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>বাংলা</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <span className="text-xs font-semibold text-amber-700">English</span>
                <div className="font-display text-6xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {selectedNumber.value}
                </div>
                <div className="font-display text-lg font-bold text-amber-800 mt-1">
                  {selectedNumber.englishName}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <span className="font-bengali text-xs font-semibold text-emerald-700">বাংলা</span>
                <div className="font-bengali text-6xl font-bold text-emerald-900 mt-1">
                  {selectedNumber.bengaliDigits}
                </div>
                <div className="font-bengali text-lg font-bold text-emerald-800 mt-1">
                  {selectedNumber.bengaliName}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Visual Count ({selectedNumber.value <= 20 ? `${selectedNumber.value} objects` : 'Tens & Ones'}):
              </p>
              {selectedNumber.value <= 20 ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: selectedNumber.value }).map((_, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 rounded-full bg-amber-400 border border-amber-600 inline-flex items-center justify-center text-xs font-bold text-slate-900 tabular-nums"
                    >
                      {idx + 1}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 tabular-nums">
                    {Math.floor(selectedNumber.value / 10)} Tens + {selectedNumber.value % 10} Ones
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Explore Numbers 1–100 (১–১০০)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {[1, 21, 41, 61, 81].map((start) => (
                  <button
                    key={start}
                    type="button"
                    onClick={() => setRangeStart(start)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold tabular-nums transition-colors ${
                      rangeStart === start
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {start}–{start + 19}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {visibleNumbers.map((entry) => {
                const isSelected = selectedNumber.value === entry.value;
                return (
                  <button
                    key={entry.value}
                    type="button"
                    onClick={() => handleSelectNum(entry)}
                    className={`p-3 min-h-[68px] rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 scale-[1.03] shadow-sm'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="font-display text-xl font-extrabold tabular-nums leading-none">
                      {entry.value}
                    </div>
                    <div
                      className={`font-bengali text-sm font-bold mt-1 ${
                        isSelected ? 'text-amber-100' : 'text-emerald-700'
                      }`}
                    >
                      {entry.bengaliDigits}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Visual Counting & Operations Lab */}
      {tab === 'visual-lab' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Visual Math Explorer · <span className="font-bengali">ছবি দিয়ে যোগ, বিয়োগ ও গুণ</span>
              </h2>
              <p className="text-sm text-slate-600">
                Change the numbers and operation to see how math works with colorful objects!
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {([
                { op: '+' as const, label: 'Addition (+)' },
                { op: '-' as const, label: 'Subtraction (-)' },
                { op: '×' as const, label: 'Multiply (×)' },
              ]).map((item) => (
                <button
                  key={item.op}
                  type="button"
                  onClick={() => {
                    setLabOp(item.op);
                    if (item.op === '-' && labA < labB) {
                      setLabA(5);
                      setLabB(2);
                    }
                  }}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap ${
                    labOp === item.op ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                  <span>First Number</span>
                  <span className="tabular-nums text-sky-700">
                    {labA} ({toBengaliDigits(labA)})
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={labOp === '×' ? 5 : 9}
                  value={labA}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setLabA(next);
                    if (labOp === '-' && next < labB) setLabB(next);
                  }}
                  className="w-full accent-sky-600 h-2"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                  <span>Second Number</span>
                  <span className="tabular-nums text-amber-700">
                    {labB} ({toBengaliDigits(labB)})
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={labOp === '-' ? labA : labOp === '×' ? 5 : 9}
                  value={labB}
                  onChange={(e) => setLabB(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2"
                />
              </div>

              <div className="pt-2 text-center bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="font-display text-4xl font-extrabold text-slate-900 tabular-nums">
                  {labA} {labOp} {labB} = <span className="text-emerald-600">{labResult}</span>
                </div>
                <div className="font-bengali text-xl font-bold text-slate-600">
                  {toBengaliDigits(labA)} {labOp} {toBengaliDigits(labB)} = {toBengaliDigits(labResult)}
                </div>
                <button
                  type="button"
                  onClick={handleSpeakBengaliLab}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-bengali"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>বাংলায় শুনো</span>
                </button>
              </div>
            </div>

            <div className="bg-[#FFFDF7] border border-amber-200 rounded-2xl p-5 space-y-4">
              {labOp === '+' && (
                <>
                  <div>
                    <p className="text-xs font-bold text-sky-700 mb-2">Group 1 ({labA} apples)</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: labA }).map((_, i) => (
                        <span key={i} className="text-2xl" aria-hidden="true">🍎</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 mb-2">Group 2 (+ {labB} oranges)</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: labB }).map((_, i) => (
                        <span key={i} className="text-2xl" aria-hidden="true">🍊</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {labOp === '-' && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Start with {labA}, take away {labB} → {labResult} left!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: labA }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl transition-opacity ${
                          i >= labResult ? 'opacity-25 grayscale' : ''
                        }`}
                        aria-hidden="true"
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {labOp === '×' && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    {labA} groups of {labB} = {labResult} stars!
                  </p>
                  <div className="space-y-2">
                    {Array.from({ length: labA }).map((_, row) => (
                      <div key={row} className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5">
                        {Array.from({ length: labB }).map((_, col) => (
                          <span key={col} className="text-xl" aria-hidden="true">🌟</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Difficulty-Organized Math Practice */}
      {tab === 'practice' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-amber-600" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                Choose Difficulty Level
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setDifficulty(level);
                    setProblem(generateProblem(level));
                    setFeedback(null);
                  }}
                  className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-bold capitalize transition-colors ${
                    difficulty === level
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 text-center space-y-5">
            {problem.visualA !== undefined && problem.visualB !== undefined && problem.op === '+' && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-2xl">
                <div className="flex gap-1 bg-white px-3 py-2 rounded-xl border border-amber-200">
                  {Array.from({ length: problem.visualA }).map((_, i) => (
                    <span key={i} aria-hidden="true">🍎</span>
                  ))}
                </div>
                <span className="font-display font-bold text-slate-700">+</span>
                <div className="flex gap-1 bg-white px-3 py-2 rounded-xl border border-amber-200">
                  {Array.from({ length: problem.visualB }).map((_, i) => (
                    <span key={i} aria-hidden="true">🍎</span>
                  ))}
                </div>
              </div>
            )}

            <div className="font-display text-5xl sm:text-6xl font-extrabold text-slate-900 tabular-nums">
              {problem.prompt}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {problem.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handlePracticeAnswer(opt)}
                  className="py-4 min-h-[64px] rounded-2xl bg-white hover:bg-sky-50 border-2 border-slate-200 hover:border-sky-400 font-display text-3xl font-extrabold text-slate-900 tabular-nums transition-transform active:scale-95"
                >
                  {opt}
                  <span className="block font-bengali text-xs font-semibold text-slate-500">
                    {toBengaliDigits(opt)}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setProblem(generateProblem(difficulty));
                setFeedback(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Question</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Easy Number Matching Game */}
      {tab === 'matching' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <Sparkles className="w-4 h-4" />
            <span>Match the Number Name</span>
          </div>

          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Find: {NUMBERS_1_TO_100[matchTarget - 1].englishName}
            </h2>
            <p className="font-bengali text-2xl font-bold text-emerald-700 mt-1">
              {NUMBERS_1_TO_100[matchTarget - 1].bengaliName}
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() =>
                  void speakBn(NUMBERS_1_TO_100[matchTarget - 1].bengaliName)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-bengali"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>বাংলায় শুনো</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
            {matchOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleMatchPick(opt)}
                className="py-6 min-h-[84px] rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 font-display text-4xl font-extrabold text-emerald-900 tabular-nums transition-transform active:scale-95"
              >
                {opt}
                <span className="block font-bengali text-base font-bold text-emerald-700 mt-1">
                  {toBengaliDigits(opt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
