import React from 'react';
import { Award, CheckCircle2, Lock, Star, Trophy } from 'lucide-react';
import { BENGALI_CONSONANTS, BENGALI_VOWELS } from '../../data/bengaliAlphabet';
import { PICTURE_ITEMS } from '../../data/pictureLearning';
import { LearningProgress } from '../../types/learning';
import { computeBadges, getLevelInfo } from '../../utils/storage';

interface ProgressViewProps {
  progress: LearningProgress;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ progress }) => {
  const levelInfo = getLevelInfo(progress.points);
  const badges = computeBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const progressRows = [
    {
      title: 'English Alphabet A–Z',
      bengali: 'ইংরেজি বর্ণমালা',
      done: progress.englishCompleted.length,
      total: 26,
      barColor: 'bg-sky-600',
    },
    {
      title: 'Bengali Vowels (স্বরবর্ণ)',
      bengali: 'বাংলা স্বরবর্ণ',
      done: progress.bengaliVowelsCompleted.length,
      total: BENGALI_VOWELS.length,
      barColor: 'bg-emerald-600',
    },
    {
      title: 'Bengali Consonants (ব্যঞ্জনবর্ণ)',
      bengali: 'বাংলা ব্যঞ্জনবর্ণ',
      done: progress.bengaliConsonantsCompleted.length,
      total: BENGALI_CONSONANTS.length,
      barColor: 'bg-teal-600',
    },
    {
      title: 'Picture Vocabulary',
      bengali: 'ছবি দেখে শেখা',
      done: progress.picturesViewed.length,
      total: PICTURE_ITEMS.length,
      barColor: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Level & Stars Hero */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-bold text-teal-700">
              My Learning Rewards · <span className="font-bengali">আমার অর্জন</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Level {levelInfo.level}: {levelInfo.title}
            </h1>
            <p className="font-bengali text-base font-semibold text-slate-600">
              {levelInfo.bengaliTitle} — Keep learning every day to unlock more badges!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-center">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500 mx-auto" />
              <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {progress.stars}
              </div>
              <div className="text-xs font-semibold text-slate-600">Stars</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3 text-center">
              <Award className="w-6 h-6 text-sky-600 mx-auto" />
              <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {progress.points}
              </div>
              <div className="text-xs font-semibold text-slate-600">Points</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center">
              <Trophy className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {unlockedCount}/{badges.length}
              </div>
              <div className="text-xs font-semibold text-slate-600">Badges</div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5 tabular-nums">
            <span>Level {levelInfo.level} Progress</span>
            <span>
              {progress.points} / {levelInfo.nextMin} pts
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Subject Progress Breakdown */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">Lesson Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressRows.map((row) => {
            const pct = Math.min(100, Math.round((row.done / row.total) * 100));
            return (
              <div key={row.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>
                    {row.title}{' '}
                    <span className="font-bengali text-xs font-normal text-slate-600">
                      ({row.bengali})
                    </span>
                  </span>
                  <span className="tabular-nums text-slate-700">
                    {row.done}/{row.total}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${row.barColor} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Achievement Badges ({unlockedCount} Unlocked)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-4 transition-all ${
                badge.unlocked
                  ? badge.colorClass
                  : 'bg-slate-50 border-slate-200 text-slate-500 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {badge.unlocked ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-xs font-bold tabular-nums">{badge.progressText}</span>
              </div>
              <h3 className="font-display text-base font-extrabold">{badge.title}</h3>
              <p className="font-bengali text-xs font-bold">{badge.bengaliTitle}</p>
              <p className="text-xs mt-1.5 opacity-90">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
