import { ActivityEntry, LearningProgress } from '../types/learning';

const STORAGE_KEY = 'smartmind_kids_academy_progress_v1';

export const DEFAULT_PROGRESS: LearningProgress = {
  points: 0,
  stars: 0,
  englishCompleted: [],
  englishTraced: [],
  bengaliVowelsCompleted: [],
  bengaliConsonantsCompleted: [],
  bengaliTraced: [],
  numbersPracticed: [],
  mathSolvedCount: 0,
  picturesViewed: [],
  gameScores: {},
  activityLog: [],
  settings: {
    soundEffects: true,
    speechRate: 'slow',
  },
};

export function loadProgress(): LearningProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...(parsed.settings || {}),
      },
      englishCompleted: Array.isArray(parsed.englishCompleted) ? parsed.englishCompleted : [],
      englishTraced: Array.isArray(parsed.englishTraced) ? parsed.englishTraced : [],
      bengaliVowelsCompleted: Array.isArray(parsed.bengaliVowelsCompleted) ? parsed.bengaliVowelsCompleted : [],
      bengaliConsonantsCompleted: Array.isArray(parsed.bengaliConsonantsCompleted) ? parsed.bengaliConsonantsCompleted : [],
      bengaliTraced: Array.isArray(parsed.bengaliTraced) ? parsed.bengaliTraced : [],
      numbersPracticed: Array.isArray(parsed.numbersPracticed) ? parsed.numbersPracticed : [],
      picturesViewed: Array.isArray(parsed.picturesViewed) ? parsed.picturesViewed : [],
      gameScores: parsed.gameScores && typeof parsed.gameScores === 'object' ? parsed.gameScores : {},
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: LearningProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function resetProgressStorage(): LearningProgress {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return DEFAULT_PROGRESS;
}

export function getLevelInfo(points: number): {
  level: number;
  title: string;
  bengaliTitle: string;
  currentMin: number;
  nextMin: number;
  percent: number;
} {
  const tiers = [
    { level: 1, title: 'Curious Explorer', bengaliTitle: 'নতুন অভিযাত্রী', min: 0 },
    { level: 2, title: 'Bright Learner', bengaliTitle: 'মেধাবী শিক্ষার্থী', min: 100 },
    { level: 3, title: 'Word Builder', bengaliTitle: 'শব্দ কারিগর', min: 250 },
    { level: 4, title: 'Math Star', bengaliTitle: 'গণিত তারকা', min: 450 },
    { level: 5, title: 'Academy Champion', bengaliTitle: 'একাডেমি চ্যাম্পিয়ন', min: 700 },
    { level: 6, title: 'Super Scholar', bengaliTitle: 'সুপার পণ্ডিত', min: 1000 },
  ];

  let current = tiers[0];
  let next = tiers[1];
  for (let i = 0; i < tiers.length; i++) {
    if (points >= tiers[i].min) {
      current = tiers[i];
      next = tiers[i + 1] || { ...tiers[i], min: tiers[i].min + 300 };
    }
  }

  const span = Math.max(1, next.min - current.min);
  const percent = Math.min(100, Math.round(((points - current.min) / span) * 100));

  return {
    level: current.level,
    title: current.title,
    bengaliTitle: current.bengaliTitle,
    currentMin: current.min,
    nextMin: next.min,
    percent,
  };
}

export interface AchievementBadge {
  id: string;
  title: string;
  bengaliTitle: string;
  description: string;
  unlocked: boolean;
  progressText: string;
  colorClass: string;
}

export function computeBadges(p: LearningProgress): AchievementBadge[] {
  const totalGamesPlayed = Object.values(p.gameScores).reduce((acc, g) => acc + g.plays, 0);
  const totalBengali = p.bengaliVowelsCompleted.length + p.bengaliConsonantsCompleted.length;

  return [
    {
      id: 'abc-starter',
      title: 'ABC Explorer',
      bengaliTitle: 'বর্ণমালা বন্ধু',
      description: 'Learn 5 English letters from A–Z',
      unlocked: p.englishCompleted.length >= 5,
      progressText: `${Math.min(p.englishCompleted.length, 5)}/5 letters`,
      colorClass: 'bg-amber-50 border-amber-300 text-amber-800',
    },
    {
      id: 'abc-master',
      title: 'A–Z Master',
      bengaliTitle: 'A–Z পণ্ডিত',
      description: 'Complete all 26 English letters',
      unlocked: p.englishCompleted.length >= 26,
      progressText: `${p.englishCompleted.length}/26 letters`,
      colorClass: 'bg-sky-50 border-sky-300 text-sky-800',
    },
    {
      id: 'tracing-artist',
      title: 'Tracing Artist',
      bengaliTitle: 'হাতের লেখা শিল্পী',
      description: 'Practice tracing 5 letters',
      unlocked: p.englishTraced.length + p.bengaliTraced.length >= 5,
      progressText: `${Math.min(p.englishTraced.length + p.bengaliTraced.length, 5)}/5 traced`,
      colorClass: 'bg-rose-50 border-rose-300 text-rose-800',
    },
    {
      id: 'bengali-friend',
      title: 'বাংলা বন্ধু',
      bengaliTitle: 'বাংলা বর্ণমালা',
      description: 'Learn 11 Bengali vowels (স্বরবর্ণ)',
      unlocked: p.bengaliVowelsCompleted.length >= 11,
      progressText: `${p.bengaliVowelsCompleted.length}/11 vowels`,
      colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    },
    {
      id: 'bengali-scholar',
      title: 'বাংলা চ্যাম্পিয়ন',
      bengaliTitle: 'বাংলা চ্যাম্পিয়ন',
      description: 'Learn 25 Bengali letters',
      unlocked: totalBengali >= 25,
      progressText: `${Math.min(totalBengali, 25)}/25 letters`,
      colorClass: 'bg-teal-50 border-teal-300 text-teal-800',
    },
    {
      id: 'math-wizard',
      title: 'Math Wizard',
      bengaliTitle: 'গণিত জাদুকর',
      description: 'Solve 10 math problems',
      unlocked: p.mathSolvedCount >= 10,
      progressText: `${Math.min(p.mathSolvedCount, 10)}/10 solved`,
      colorClass: 'bg-violet-50 border-violet-300 text-violet-800',
    },
    {
      id: 'picture-explorer',
      title: 'Picture Explorer',
      bengaliTitle: 'ছবির জগত',
      description: 'Explore 15 picture vocabulary cards',
      unlocked: p.picturesViewed.length >= 15,
      progressText: `${Math.min(p.picturesViewed.length, 15)}/15 items`,
      colorClass: 'bg-orange-50 border-orange-300 text-orange-800',
    },
    {
      id: 'quiz-champion',
      title: 'Quiz Champion',
      bengaliTitle: 'কুইজ চ্যাম্পিয়ন',
      description: 'Play 3 educational mini-games',
      unlocked: totalGamesPlayed >= 3,
      progressText: `${Math.min(totalGamesPlayed, 3)}/3 games`,
      colorClass: 'bg-indigo-50 border-indigo-300 text-indigo-800',
    },
  ];
}

export function createActivityEntry(
  module: ActivityEntry['module'],
  summary: string,
  starsEarned: number,
  pointsEarned: number
): ActivityEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    module,
    summary,
    starsEarned,
    pointsEarned,
  };
}
