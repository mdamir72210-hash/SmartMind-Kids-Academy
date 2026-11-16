import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  Gamepad2,
  Image as ImageIcon,
  Languages,
  Star,
  Trophy,
} from 'lucide-react';
import { AppSection, LearningProgress } from '../../types/learning';
import { getLevelInfo } from '../../utils/storage';

interface HomeViewProps {
  progress: LearningProgress;
  onNavigate: (section: AppSection) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ progress, onNavigate }) => {
  const levelInfo = getLevelInfo(progress.points);

  const sections: {
    id: AppSection;
    title: string;
    bengaliTitle: string;
    subtitle: string;
    statText: string;
    cardBg: string;
    iconBg: string;
    btnBg: string;
    icon: React.ComponentType<{ className?: string }>;
    bannerImg?: string;
  }[] = [
    {
      id: 'english',
      title: 'Learn English A–Z',
      bengaliTitle: 'ইংরেজি বর্ণমালা A–Z',
      subtitle: 'Letters, pictures, Bengali meanings, tracing & audio',
      statText: `${progress.englishCompleted.length}/26 letters learned`,
      cardBg: 'bg-sky-50 border-sky-200',
      iconBg: 'bg-sky-600 text-white',
      btnBg: 'bg-sky-600 hover:bg-sky-700 border-sky-800',
      icon: BookOpen,
      bannerImg: '/src/assets/images/english_abc_banner_1794803042183.jpg',
    },
    {
      id: 'bengali',
      title: 'বাংলা বর্ণমালা',
      bengaliTitle: 'স্বরবর্ণ ও ব্যঞ্জনবর্ণ',
      subtitle: 'Learn অ–ঔ and ক–ঁ with words, pictures & tracing',
      statText: `${progress.bengaliVowelsCompleted.length + progress.bengaliConsonantsCompleted.length}/50 letters learned`,
      cardBg: 'bg-emerald-50 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800',
      icon: Languages,
      bannerImg: '/src/assets/images/bengali_learning_banner_1794803041873.jpg',
    },
    {
      id: 'math',
      title: 'Numbers & Mathematics',
      bengaliTitle: 'সংখ্যা ও গণিত (১–১০০)',
      subtitle: 'Counting 1–100, addition, subtraction & multiplication',
      statText: `${progress.mathSolvedCount} problems solved`,
      cardBg: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      btnBg: 'bg-amber-500 hover:bg-amber-600 border-amber-700',
      icon: Calculator,
      bannerImg: '/src/assets/images/math_adventure_banner_1794803042120.jpg',
    },
    {
      id: 'pictures',
      title: 'Picture Learning',
      bengaliTitle: 'ছবি দেখে শব্দ শেখা',
      subtitle: 'Animals, birds, fruits, colors, vehicles & daily words',
      statText: `${progress.picturesViewed.length}/50 pictures explored`,
      cardBg: 'bg-rose-50 border-rose-200',
      iconBg: 'bg-rose-500 text-white',
      btnBg: 'bg-rose-500 hover:bg-rose-600 border-rose-700',
      icon: ImageIcon,
    },
    {
      id: 'games',
      title: 'Play Quiz',
      bengaliTitle: 'কুইজ ও মজার খেলা',
      subtitle: '8 interactive educational mini-games & puzzles',
      statText: `${Object.values(progress.gameScores).reduce((a, b) => a + b.plays, 0)} games played`,
      cardBg: 'bg-violet-50 border-violet-200',
      iconBg: 'bg-violet-600 text-white',
      btnBg: 'bg-violet-600 hover:bg-violet-700 border-violet-800',
      icon: Gamepad2,
    },
    {
      id: 'progress',
      title: 'My Progress',
      bengaliTitle: 'আমার অর্জন ও তারা',
      subtitle: 'Stars, levels, badges & daily learning rewards',
      statText: `Level ${levelInfo.level} · ${progress.stars} Stars`,
      cardBg: 'bg-teal-50 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      btnBg: 'bg-teal-600 hover:bg-teal-700 border-teal-800',
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-sm font-semibold text-sky-700">
              English &amp; বাংলা Bilingual Learning · Ages 5–12
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
              SmartMind Kids Academy
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Learn English A–Z, <span className="font-bengali font-semibold text-slate-800">বাংলা বর্ণমালা</span>,
              numbers, math, and colorful pictures through interactive audio lessons and fun games.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('english')}
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-display font-bold text-base border-b-4 border-sky-800 active:translate-y-0.5 transition-all"
              >
                <span>Start English A–Z</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('games')}
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[48px] rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-display font-bold text-base border-b-4 border-amber-600 active:translate-y-0.5 transition-all"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Play Mini-Games</span>
              </button>
            </div>
          </div>

          {/* Mascot & Quick Stats */}
          <div className="lg:col-span-4 flex flex-col items-center bg-[#FFFDF7] border border-amber-200 rounded-2xl p-4">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50">
              <img
                src="/src/assets/images/academy_mascot_owl_1794803041009.jpg"
                alt="Professor Owl mascot reading a storybook"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 text-center">
              <p className="font-display font-bold text-slate-900 text-base">
                Level {levelInfo.level}: {levelInfo.title}
              </p>
              <div className="flex items-center justify-center gap-4 mt-1 text-sm font-semibold text-slate-600 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  {progress.stars} Stars
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Award className="w-4 h-4 text-sky-600" />
                  {progress.points} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Large Interactive Learning Sections */}
      <section aria-labelledby="modules-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 id="modules-heading" className="font-display text-2xl font-bold text-slate-900">
            Choose Your Learning Adventure
          </h2>
          <span className="font-bengali text-sm font-semibold text-slate-600">
            তোমার পছন্দের বিষয় বেছে নাও
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`group text-left rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${item.cardBg}`}
              >
                <div>
                  {item.bannerImg ? (
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 border border-white/80 bg-white">
                      <img
                        src={item.bannerImg}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 tabular-nums">
                        {item.statText}
                      </span>
                    </div>
                  )}

                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="font-bengali text-base font-bold text-slate-700 mt-0.5">
                    {item.bengaliTitle}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 tabular-nums">
                    {item.statText}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-sm border-b-2 transition-colors ${item.btnBg}`}
                  >
                    <span>Open</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
