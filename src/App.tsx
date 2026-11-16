import { useEffect, useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import { BengaliAlphabetView } from './components/views/BengaliAlphabetView';
import { EnglishAlphabetView } from './components/views/EnglishAlphabetView';
import { GamesHubView } from './components/views/GamesHubView';
import { HomeView } from './components/views/HomeView';
import { MathModuleView } from './components/views/MathModuleView';
import { ParentSectionView } from './components/views/ParentSectionView';
import { PictureLearningView } from './components/views/PictureLearningView';
import { ProgressView } from './components/views/ProgressView';
import { BENGALI_VOWELS } from './data/bengaliAlphabet';
import { ENGLISH_ALPHABET } from './data/englishAlphabet';
import { NUMBERS_1_TO_100 } from './data/numbersMath';
import { AppSection, LearningProgress, MiniGameId } from './types/learning';
import { preloadBengaliTexts } from './utils/audio';
import {
  createActivityEntry,
  loadProgress,
  resetProgressStorage,
  saveProgress,
} from './utils/storage';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [progress, setProgress] = useState<LearningProgress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const starterClips = [
        'নমস্কার! স্মার্টমাইন্ড কিডস একাডেমিতে স্বাগতম।',
        ...ENGLISH_ALPHABET.slice(0, 6).map((i) => `${i.bengaliWord}। ${i.bengaliSentence}`),
        ...BENGALI_VOWELS.slice(0, 6).flatMap((v) => [`${v.letter}। ${v.word}।`, v.sentence]),
        ...NUMBERS_1_TO_100.slice(0, 10).map((n) => n.bengaliName),
      ];
      void preloadBengaliTexts(starterClips, 3);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const navigate = (section: AppSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkEnglishLearned = (letter: string) => {
    setProgress((prev) => {
      if (prev.englishCompleted.includes(letter)) return prev;
      const entry = createActivityEntry('English A-Z', `Learned letter ${letter}`, 1, 5);
      return {
        ...prev,
        points: prev.points + 5,
        stars: prev.stars + 1,
        englishCompleted: [...prev.englishCompleted, letter],
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleMarkEnglishTraced = (letter: string) => {
    setProgress((prev) => {
      const firstTime = !prev.englishTraced.includes(letter);
      const pts = 5;
      const entry = createActivityEntry('English A-Z', `Traced letter ${letter}`, firstTime ? 1 : 0, pts);
      return {
        ...prev,
        points: prev.points + pts,
        stars: prev.stars + (firstTime ? 1 : 0),
        englishTraced: firstTime ? [...prev.englishTraced, letter] : prev.englishTraced,
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleCheckpointWin = (groupLabel: string) => {
    setProgress((prev) => {
      const entry = createActivityEntry('English A-Z', `Completed ${groupLabel} activity`, 2, 15);
      return {
        ...prev,
        points: prev.points + 15,
        stars: prev.stars + 2,
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleMarkBengaliLearned = (letter: string, group: 'vowel' | 'consonant') => {
    setProgress((prev) => {
      const targetKey = group === 'vowel' ? 'bengaliVowelsCompleted' : 'bengaliConsonantsCompleted';
      if (prev[targetKey].includes(letter)) return prev;
      const entry = createActivityEntry('Bengali Alphabet', `Learned বাংলা বর্ণ ${letter}`, 1, 5);
      return {
        ...prev,
        points: prev.points + 5,
        stars: prev.stars + 1,
        [targetKey]: [...prev[targetKey], letter],
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleMarkBengaliTraced = (letter: string) => {
    setProgress((prev) => {
      const firstTime = !prev.bengaliTraced.includes(letter);
      const entry = createActivityEntry('Bengali Alphabet', `Traced ${letter}`, firstTime ? 1 : 0, 5);
      return {
        ...prev,
        points: prev.points + 5,
        stars: prev.stars + (firstTime ? 1 : 0),
        bengaliTraced: firstTime ? [...prev.bengaliTraced, letter] : prev.bengaliTraced,
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handlePracticeNumber = (num: number) => {
    setProgress((prev) => {
      if (prev.numbersPracticed.includes(num)) return prev;
      return {
        ...prev,
        points: prev.points + 2,
        numbersPracticed: [...prev.numbersPracticed, num],
      };
    });
  };

  const handleSolveMath = (summary: string, pts: number) => {
    setProgress((prev) => {
      const entry = createActivityEntry('Numbers & Math', summary, 1, pts);
      return {
        ...prev,
        points: prev.points + pts,
        stars: prev.stars + 1,
        mathSolvedCount: prev.mathSolvedCount + 1,
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleViewPicture = (id: string) => {
    setProgress((prev) => {
      if (prev.picturesViewed.includes(id)) return prev;
      const entry = createActivityEntry('Picture Learning', `Explored picture card`, 1, 3);
      return {
        ...prev,
        points: prev.points + 3,
        stars: prev.stars + 1,
        picturesViewed: [...prev.picturesViewed, id],
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  const handleGameComplete = (
    gameId: MiniGameId,
    gameName: string,
    score: number,
    maxScore: number
  ) => {
    setProgress((prev) => {
      const existing = prev.gameScores[gameId] || { plays: 0, bestScore: 0, lastScore: 0 };
      const starsWon = Math.max(1, Math.round((score / Math.max(1, maxScore)) * 3));
      const ptsWon = score * 10 + 10;
      const entry = createActivityEntry(
        'Mini-Game',
        `${gameName}: scored ${score}/${maxScore}`,
        starsWon,
        ptsWon
      );
      return {
        ...prev,
        points: prev.points + ptsWon,
        stars: prev.stars + starsWon,
        gameScores: {
          ...prev.gameScores,
          [gameId]: {
            plays: existing.plays + 1,
            bestScore: Math.max(existing.bestScore, score),
            lastScore: score,
          },
        },
        activityLog: [entry, ...prev.activityLog].slice(0, 40),
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4]">
      <TopNav activeSection={activeSection} onNavigate={navigate} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-10">
        {activeSection === 'home' && <HomeView progress={progress} onNavigate={navigate} />}

        {activeSection === 'english' && (
          <EnglishAlphabetView
            progress={progress}
            onMarkLearned={handleMarkEnglishLearned}
            onMarkTraced={handleMarkEnglishTraced}
            onCheckpointWin={handleCheckpointWin}
          />
        )}

        {activeSection === 'bengali' && (
          <BengaliAlphabetView
            progress={progress}
            onMarkLearned={handleMarkBengaliLearned}
            onMarkTraced={handleMarkBengaliTraced}
          />
        )}

        {activeSection === 'math' && (
          <MathModuleView
            progress={progress}
            onPracticeNumber={handlePracticeNumber}
            onSolveMath={handleSolveMath}
          />
        )}

        {activeSection === 'pictures' && (
          <PictureLearningView progress={progress} onViewPicture={handleViewPicture} />
        )}

        {activeSection === 'games' && (
          <GamesHubView progress={progress} onGameComplete={handleGameComplete} />
        )}

        {activeSection === 'progress' && <ProgressView progress={progress} />}

        {activeSection === 'parent' && (
          <ParentSectionView
            progress={progress}
            onUpdateSettings={(settings) => setProgress((prev) => ({ ...prev, settings }))}
            onResetProgress={() => setProgress(resetProgressStorage())}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white py-5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500">
          <span>SmartMind Kids Academy · Bilingual Learning (English &amp; বাংলা)</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('progress')}
              className="hover:text-slate-800 font-semibold"
            >
              My Progress
            </button>
            <button
              type="button"
              onClick={() => navigate('parent')}
              className="hover:text-slate-800 font-semibold"
            >
              Parent Section
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
