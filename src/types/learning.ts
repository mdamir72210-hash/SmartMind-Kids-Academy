export type AppSection =
  | 'home'
  | 'english'
  | 'bengali'
  | 'math'
  | 'pictures'
  | 'games'
  | 'progress'
  | 'parent';

export interface EnglishLetterItem {
  letter: string;
  lowercase: string;
  phonetic: string;
  word: string;
  bengaliWord: string;
  bengaliTranslit: string;
  sentence: string;
  bengaliSentence: string;
  artKey: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export interface BengaliLetterItem {
  letter: string;
  group: 'vowel' | 'consonant';
  phonetic: string;
  word: string;
  englishMeaning: string;
  wordPhonetic: string;
  sentence: string;
  artKey: string;
}

export interface NumberEntry {
  value: number;
  bengaliDigits: string;
  englishName: string;
  bengaliName: string;
  phonetic: string;
}

export type PictureCategoryId =
  | 'animals'
  | 'birds'
  | 'fruits'
  | 'vegetables'
  | 'colors'
  | 'vehicles'
  | 'body'
  | 'objects';

export interface PictureItem {
  id: string;
  category: PictureCategoryId;
  english: string;
  bengali: string;
  phonetic: string;
  artKey: string;
  colorHex?: string;
}

export type MiniGameId =
  | 'match-letter-picture'
  | 'choose-alphabet'
  | 'word-meaning-match'
  | 'listen-select'
  | 'missing-letter'
  | 'count-objects'
  | 'quick-quiz'
  | 'picture-puzzle';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  module: 'English A-Z' | 'Bengali Alphabet' | 'Numbers & Math' | 'Picture Learning' | 'Mini-Game';
  summary: string;
  starsEarned: number;
  pointsEarned: number;
}

export interface GameScoreRecord {
  plays: number;
  bestScore: number;
  lastScore: number;
}

export interface LearningProgress {
  points: number;
  stars: number;
  englishCompleted: string[];
  englishTraced: string[];
  bengaliVowelsCompleted: string[];
  bengaliConsonantsCompleted: string[];
  bengaliTraced: string[];
  numbersPracticed: number[];
  mathSolvedCount: number;
  picturesViewed: string[];
  gameScores: Record<string, GameScoreRecord>;
  activityLog: ActivityEntry[];
  settings: {
    soundEffects: boolean;
    speechRate: 'slow' | 'normal';
  };
}
