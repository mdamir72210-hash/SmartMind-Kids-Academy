import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Lock,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress } from '../../types/learning';
import { getBengaliPreloadStats } from '../../utils/audio';

interface ParentSectionViewProps {
  progress: LearningProgress;
  onUpdateSettings: (settings: LearningProgress['settings']) => void;
  onResetProgress: () => void;
}

export const ParentSectionView: React.FC<ParentSectionViewProps> = ({
  progress,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [challenge, setChallenge] = useState(() => {
    const a = Math.floor(Math.random() * 12) + 11;
    const b = Math.floor(Math.random() * 8) + 6;
    return { a, b, answer: a + b };
  });
  const [inputValue, setInputValue] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [audioStats, setAudioStats] = useState(() => getBengaliPreloadStats());

  const {
    notice: ttsNotice,
    preload: preloadBn,
    testVoice,
    clearNotice,
  } = useBengaliSpeech(progress.settings.speechRate);

  useEffect(() => {
    if (!unlocked) return;
    preloadBn(['নমস্কার! স্মার্টমাইন্ড কিডস একাডেমিতে স্বাগতম।']);
    setAudioStats(getBengaliPreloadStats());
  }, [unlocked, preloadBn, ttsNotice]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(inputValue.trim()) === challenge.answer) {
      setUnlocked(true);
      setGateError(null);
    } else {
      setGateError('Incorrect answer. Please solve the parent verification math question.');
      const a = Math.floor(Math.random() * 12) + 11;
      const b = Math.floor(Math.random() * 8) + 6;
      setChallenge({ a, b, answer: a + b });
      setInputValue('');
    }
  };

  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Parent Section Gate
            </h1>
            <p className="text-xs text-slate-500">
              Protected area for parents &amp; guardians
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          To keep child settings safe, please solve this quick math question to view learning
          reports and settings:
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">
              {challenge.a} + {challenge.b} = ?
            </span>
          </div>

          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter answer"
            aria-label="Parent verification answer"
            className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />

          {gateError && <p className="text-xs font-semibold text-rose-600">{gateError}</p>}

          <button
            type="submit"
            className="w-full py-3.5 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm border-b-4 border-sky-800"
          >
            Enter Parent Area
          </button>
        </form>
      </div>
    );
  }

  const gameEntries = Object.entries(progress.gameScores);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-sky-700" />
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Parent Dashboard &amp; Settings
            </h1>
            <p className="text-xs text-slate-500">
              All progress is stored privately on this device. No personal child data is collected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUnlocked(false)}
          className="px-4 py-2 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
        >
          Lock Parent Area
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Total Stars Earned</div>
          <div className="font-display text-3xl font-extrabold text-amber-600 tabular-nums mt-1">
            {progress.stars}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">English Letters Learned</div>
          <div className="font-display text-3xl font-extrabold text-sky-700 tabular-nums mt-1">
            {progress.englishCompleted.length}/26
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Bengali Letters Learned</div>
          <div className="font-display text-3xl font-extrabold text-emerald-700 tabular-nums mt-1">
            {progress.bengaliVowelsCompleted.length + progress.bengaliConsonantsCompleted.length}/50
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Math Problems Solved</div>
          <div className="font-display text-3xl font-extrabold text-violet-700 tabular-nums mt-1">
            {progress.mathSolvedCount}
          </div>
        </div>
      </div>

      {/* Quiz Scores & Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Quiz &amp; Mini-Game Scores</h2>
          {gameEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No mini-games completed yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {gameEntries.map(([id, rec]) => (
                <div key={id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{id.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-slate-500 tabular-nums">Played {rec.plays} times</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="font-bold text-emerald-700">Best: {rec.bestScore}</span>
                    <span className="block text-xs text-slate-500">Last: {rec.lastScore}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Recent Learning Activity Summary
          </h2>
          {progress.activityLog.length === 0 ? (
            <p className="text-sm text-slate-500">No learning sessions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {progress.activityLog.slice(0, 15).map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">{item.summary}</p>
                      <p className="text-xs text-slate-500">{item.module}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 whitespace-nowrap tabular-nums">
                    +{item.pointsEarned} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Parent Settings & Pre-generated Bengali Voice Diagnostics */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Audio, Pre-generated Bengali Voice (bn-IN) &amp; Learning Settings
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-sky-600" />
            <div>
              <p className="font-bold text-sm text-slate-900">
                Pre-generated Bengali Voice (bn-IN)
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                {audioStats.totalStoredClips} pre-generated Bengali clips in storage · {audioStats.ramReadyCount} preloaded in RAM for instant playback
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void testVoice()}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Bengali Voice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof caches !== 'undefined') {
                  void caches.delete('smartmind-bn-audio-v1').then(() => {
                    clearNotice();
                    setAudioStats(getBengaliPreloadStats());
                  });
                } else {
                  clearNotice();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Offline Cache</span>
            </button>
          </div>
        </div>

        {ttsNotice && (
          <div
            role="status"
            className={`flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border font-bengali ${
              ttsNotice.kind === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {ttsNotice.kind === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{ttsNotice.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-slate-600" />
            <div>
              <p className="font-bold text-sm text-slate-900">Playful Sound Effects</p>
              <p className="text-xs text-slate-500">Gentle chimes for correct answers &amp; taps</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...progress.settings,
                soundEffects: !progress.settings.soundEffects,
              })
            }
            className={`px-4 py-2 min-h-[40px] rounded-xl font-bold text-xs transition-colors ${
              progress.settings.soundEffects
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {progress.settings.soundEffects ? 'Enabled' : 'Muted'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100">
          <div>
            <p className="font-bold text-sm text-slate-900">Pronunciation Speed</p>
            <p className="text-xs text-slate-500">Slower speech helps ages 5–7 hear clearly</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['slow', 'normal'] as const).map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onUpdateSettings({ ...progress.settings, speechRate: rate })}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold capitalize ${
                  progress.settings.speechRate === rate
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                {rate}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-slate-900">Reset Device Progress</p>
            <p className="text-xs text-slate-500">Clears all saved stars, points, and lesson marks</p>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
