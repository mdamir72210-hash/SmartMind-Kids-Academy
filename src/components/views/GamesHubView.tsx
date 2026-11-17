import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Gamepad2,
  Grid,
  HelpCircle,
  Languages,
  Puzzle,
  RefreshCw,
  Star,
  Type,
  Volume2,
} from 'lucide-react';
import { BENGALI_VOWELS } from '../../data/bengaliAlphabet';
import { ENGLISH_ALPHABET } from '../../data/englishAlphabet';
import { toBengaliDigits } from '../../data/numbersMath';
import { useBengaliSpeech } from '../../hooks/useBengaliSpeech';
import { LearningProgress, MiniGameId } from '../../types/learning';
import {
  playSuccessChime,
  playTapSound,
  playTryAgainTone,
  preloadEnglishTexts,
  speakEnglish,
} from '../../utils/audio';
import { PictureArt, preloadVocabImages } from '../common/PictureArt';
import { RewardBanner } from '../common/RewardBanner';

interface GamesHubViewProps {
  progress: LearningProgress;
  onGameComplete: (gameId: MiniGameId, gameName: string, score: number, maxScore: number) => void;
}

interface GameMeta {
  id: MiniGameId;
  title: string;
  bengaliTitle: string;
  description: string;
  accentBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GAMES: GameMeta[] = [
  {
    id: 'match-letter-picture',
    title: '1. Match Letter & Picture',
    bengaliTitle: 'ছবির সাথে বর্ণ মেলাও',
    description: 'See a letter and pick the matching colorful picture.',
    accentBg: 'bg-sky-50 border-sky-200',
    icon: Grid,
  },
  {
    id: 'choose-alphabet',
    title: '2. Choose Correct Alphabet',
    bengaliTitle: 'সঠিক বর্ণ বেছে নাও',
    description: 'Spot the exact English or বাংলা letter asked.',
    accentBg: 'bg-emerald-50 border-emerald-200',
    icon: Type,
  },
  {
    id: 'word-meaning-match',
    title: '3. English–Bengali Word Match',
    bengaliTitle: 'ইংরেজি ও বাংলা অর্থ মেলাও',
    description: 'Match each English word with its correct Bengali meaning.',
    accentBg: 'bg-amber-50 border-amber-200',
    icon: Languages,
  },
  {
    id: 'listen-select',
    title: '4. Listen & Select Picture',
    bengaliTitle: 'শুনে সঠিক ছবি বাছো',
    description: 'Tap Listen to hear the word and pick the right picture.',
    accentBg: 'bg-rose-50 border-rose-200',
    icon: Volume2,
  },
  {
    id: 'missing-letter',
    title: '5. Complete Missing Letter',
    bengaliTitle: 'শূন্যস্থানে সঠিক বর্ণ বসাও',
    description: 'Fill in the missing letter to spell the word.',
    accentBg: 'bg-violet-50 border-violet-200',
    icon: HelpCircle,
  },
  {
    id: 'count-objects',
    title: '6. Count the Objects',
    bengaliTitle: 'ছবি গুনে সংখ্যা বলো',
    description: 'Count the friendly fruits and stars on the board.',
    accentBg: 'bg-teal-50 border-teal-200',
    icon: Star,
  },
  {
    id: 'quick-quiz',
    title: '7. Choose Correct Answer',
    bengaliTitle: 'মজার কুইজ চ্যালেঞ্জ',
    description: 'Fun mixed questions from English, Bengali & Math.',
    accentBg: 'bg-indigo-50 border-indigo-200',
    icon: Gamepad2,
  },
  {
    id: 'picture-puzzle',
    title: '8. Simple Picture Puzzle',
    bengaliTitle: 'ছবি ও শব্দ মেলানোর খেলা',
    description: 'Flip cards and match each picture with its word pair!',
    accentBg: 'bg-orange-50 border-orange-200',
    icon: Puzzle,
  },
];

const POSITIVE_PRAISES = [
  { en: 'Excellent!', bn: 'অসাধারণ!' },
  { en: 'Very Good!', bn: 'খুব ভালো হয়েছে!' },
  { en: 'Well Done!', bn: 'দারুণ করেছ!' },
];

interface RoundQuestion {
  prompt: string;
  bengaliPrompt: string;
  artKey?: string;
  speakText?: string;
  options: {
    id: string;
    label: string;
    sublabel?: string;
    artKey?: string;
    isCorrect: boolean;
  }[];
}

function buildRounds(gameId: MiniGameId): RoundQuestion[] {
  const shuffledAlpha = [...ENGLISH_ALPHABET].sort(() => Math.random() - 0.5);

  if (gameId === 'match-letter-picture') {
    return shuffledAlpha.slice(0, 5).map((target) => {
      const distractors = ENGLISH_ALPHABET.filter((i) => i.letter !== target.letter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [target, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((item) => ({
          id: item.letter,
          label: item.word,
          sublabel: item.bengaliWord,
          artKey: item.artKey,
          isCorrect: item.letter === target.letter,
        }));
      return {
        prompt: `Which picture starts with "${target.letter}"?`,
        bengaliPrompt: `কোন ছবিটি "${target.letter}" দিয়ে শুরু হয়?`,
        speakText: `Which picture starts with ${target.letter}?`,
        options,
      };
    });
  }

  if (gameId === 'choose-alphabet') {
    return Array.from({ length: 5 }, (_, idx) => {
      if (idx % 2 === 0) {
        const target = shuffledAlpha[idx];
        const distractors = ENGLISH_ALPHABET.filter((i) => i.letter !== target.letter)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        return {
          prompt: `Choose the letter for ${target.word}`,
          bengaliPrompt: `${target.bengaliWord} (${target.word}) এর সঠিক বর্ণ কোনটি?`,
          artKey: target.artKey,
          speakText: `Choose the letter for ${target.word}.`,
          options: [target, ...distractors]
            .sort(() => Math.random() - 0.5)
            .map((i) => ({
              id: i.letter,
              label: i.letter,
              sublabel: i.lowercase,
              isCorrect: i.letter === target.letter,
            })),
        };
      } else {
        const target = BENGALI_VOWELS[idx % BENGALI_VOWELS.length];
        const distractors = BENGALI_VOWELS.filter((v) => v.letter !== target.letter)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        return {
          prompt: `Choose the Bengali letter for "${target.word}" (${target.englishMeaning})`,
          bengaliPrompt: `"${target.word}" কোন বর্ণ দিয়ে শুরু হয়?`,
          artKey: target.artKey,
          speakText: `Choose the Bengali letter for ${target.englishMeaning}.`,
          options: [target, ...distractors]
            .sort(() => Math.random() - 0.5)
            .map((v) => ({
              id: v.letter,
              label: v.letter,
              sublabel: v.phonetic,
              isCorrect: v.letter === target.letter,
            })),
        };
      }
    });
  }

  if (gameId === 'word-meaning-match') {
    return shuffledAlpha.slice(0, 5).map((target) => {
      const distractors = ENGLISH_ALPHABET.filter((i) => i.letter !== target.letter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      return {
        prompt: `What is the Bengali meaning of "${target.word}"?`,
        bengaliPrompt: `"${target.word}" শব্দের বাংলা অর্থ কোনটি?`,
        artKey: target.artKey,
        speakText: `What is the Bengali meaning of ${target.word}?`,
        options: [target, ...distractors]
          .sort(() => Math.random() - 0.5)
          .map((i) => ({
            id: i.letter,
            label: i.bengaliWord,
            sublabel: i.bengaliTranslit,
            isCorrect: i.letter === target.letter,
          })),
      };
    });
  }

  if (gameId === 'listen-select') {
    return shuffledAlpha.slice(0, 5).map((target) => {
      const distractors = ENGLISH_ALPHABET.filter((i) => i.letter !== target.letter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      return {
        prompt: `Tap Listen, then select the picture for "${target.word}"`,
        bengaliPrompt: `শোনো এবং "${target.word}" এর ছবিটি বাছো`,
        speakText: `${target.word}`,
        options: [target, ...distractors]
          .sort(() => Math.random() - 0.5)
          .map((i) => ({
            id: i.letter,
            label: i.word,
            artKey: i.artKey,
            isCorrect: i.letter === target.letter,
          })),
      };
    });
  }

  if (gameId === 'missing-letter') {
    const words = shuffledAlpha.filter((w) => w.word.length >= 3 && !w.word.includes(' ')).slice(0, 5);
    return words.map((target) => {
      const upper = target.word.toUpperCase();
      const missingIdx = Math.min(upper.length - 1, 1);
      const missingChar = upper[missingIdx];
      const masked = upper
        .split('')
        .map((c, i) => (i === missingIdx ? '_' : c))
        .join(' ');
      const alphabetChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => c !== missingChar);
      const distractors = alphabetChars.sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        prompt: `Complete the word: ${masked}`,
        bengaliPrompt: `${target.bengaliWord} — শূন্যস্থানে সঠিক বর্ণ বসাও`,
        artKey: target.artKey,
        speakText: `Complete the word: ${target.word}`,
        options: [missingChar, ...distractors]
          .sort(() => Math.random() - 0.5)
          .map((ch) => ({
            id: ch,
            label: ch,
            isCorrect: ch === missingChar,
          })),
      };
    });
  }

  if (gameId === 'count-objects') {
    const icons = ['🍎', '⭐', '🎈', '🍌', '🌸'];
    return Array.from({ length: 5 }, (_, idx) => {
      const count = Math.floor(Math.random() * 8) + 2;
      const emoji = icons[idx % icons.length];
      const set = new Set<number>([count]);
      while (set.size < 4) {
        const candidate = Math.max(1, count + Math.floor(Math.random() * 5) - 2);
        set.add(candidate);
      }
      return {
        prompt: `Count the objects: ${Array.from({ length: count }).map(() => emoji).join(' ')}`,
        bengaliPrompt: `মোট কয়টি আছে গুনে বের করো`,
        speakText: 'Count the objects',
        options: Array.from(set)
          .sort(() => Math.random() - 0.5)
          .map((n) => ({
            id: String(n),
            label: String(n),
            sublabel: toBengaliDigits(n),
            isCorrect: n === count,
          })),
      };
    });
  }

  // quick-quiz mixed
  return [
    {
      prompt: 'What is 3 + 4?',
      bengaliPrompt: '৩ + ৪ কত হয়?',
      speakText: 'What is 3 plus 4?',
      options: [
        { id: '6', label: '6', sublabel: '৬', isCorrect: false },
        { id: '7', label: '7', sublabel: '৭', isCorrect: true },
        { id: '8', label: '8', sublabel: '৮', isCorrect: false },
        { id: '5', label: '5', sublabel: '৫', isCorrect: false },
      ],
    },
    {
      prompt: 'T is for Tiger. What is "Tiger" in Bengali?',
      bengaliPrompt: 'Tiger শব্দের বাংলা অর্থ কী?',
      artKey: 'tiger',
      speakText: 'T is for Tiger. What is Tiger in Bengali?',
      options: [
        { id: 'সিংহ', label: 'সিংহ', sublabel: 'Singho', isCorrect: false },
        { id: 'বাঘ', label: 'বাঘ', sublabel: 'Bagh', isCorrect: true },
        { id: 'হাতি', label: 'হাতি', sublabel: 'Hati', isCorrect: false },
        { id: 'হরিণ', label: 'হরিণ', sublabel: 'Horin', isCorrect: false },
      ],
    },
    {
      prompt: 'Which Bengali vowel starts the word "আম" (Mango)?',
      bengaliPrompt: '"আম" কোন স্বরবর্ণ দিয়ে শুরু হয়?',
      artKey: 'mango',
      speakText: 'Which Bengali vowel starts the word Mango?',
      options: [
        { id: 'অ', label: 'অ', isCorrect: false },
        { id: 'আ', label: 'আ', isCorrect: true },
        { id: 'ই', label: 'ই', isCorrect: false },
        { id: 'উ', label: 'উ', isCorrect: false },
      ],
    },
    {
      prompt: 'What is 9 - 4?',
      bengaliPrompt: '৯ - ৪ কত হয়?',
      speakText: 'What is 9 minus 4?',
      options: [
        { id: '4', label: '4', sublabel: '৪', isCorrect: false },
        { id: '5', label: '5', sublabel: '৫', isCorrect: true },
        { id: '6', label: '6', sublabel: '৬', isCorrect: false },
        { id: '3', label: '3', sublabel: '৩', isCorrect: false },
      ],
    },
    {
      prompt: 'U is for Umbrella. What is Umbrella in Bengali?',
      bengaliPrompt: 'Umbrella শব্দের বাংলা অর্থ কী?',
      artKey: 'umbrella',
      speakText: 'U is for Umbrella. What is Umbrella in Bengali?',
      options: [
        { id: 'ঘড়ি', label: 'ঘড়ি', isCorrect: false },
        { id: 'ছাতা', label: 'ছাতা', isCorrect: true },
        { id: 'কলম', label: 'কলম', isCorrect: false },
        { id: 'বল', label: 'বল', isCorrect: false },
      ],
    },
  ];
}

interface PuzzleCard {
  uid: string;
  pairId: string;
  kind: 'picture' | 'word';
  label: string;
  sublabel: string;
  artKey: string;
  matched: boolean;
}

function createPuzzleDeck(): PuzzleCard[] {
  const chosen = [...ENGLISH_ALPHABET].sort(() => Math.random() - 0.5).slice(0, 4);
  const cards: PuzzleCard[] = [];
  chosen.forEach((item) => {
    cards.push({
      uid: `${item.letter}-pic`,
      pairId: item.letter,
      kind: 'picture',
      label: item.letter,
      sublabel: item.word,
      artKey: item.artKey,
      matched: false,
    });
    cards.push({
      uid: `${item.letter}-word`,
      pairId: item.letter,
      kind: 'word',
      label: item.word,
      sublabel: item.bengaliWord,
      artKey: item.artKey,
      matched: false,
    });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export const GamesHubView: React.FC<GamesHubViewProps> = ({ progress, onGameComplete }) => {
  const [activeGame, setActiveGame] = useState<MiniGameId | null>(null);
  const [rounds, setRounds] = useState<RoundQuestion[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'encourage';
    message: string;
    bengali: string;
    points?: number;
  } | null>(null);
  const [locked, setLocked] = useState(false);

  // Puzzle state
  const [puzzleCards, setPuzzleCards] = useState<PuzzleCard[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const {
    notice: bnNotice,
    clearNotice: clearBnNotice,
    preload: preloadBn,
    speak: speakBn,
  } = useBengaliSpeech(progress.settings.speechRate);

  useEffect(() => {
    if (rounds.length > 0) {
      preloadBn(rounds.map((r) => r.bengaliPrompt));
      const speakTexts = rounds.map((r) => r.speakText).filter((t): t is string => Boolean(t));
      if (speakTexts.length > 0) {
        void preloadEnglishTexts(speakTexts);
      }
      const keys: string[] = [];
      for (const r of rounds) {
        if (r.artKey) keys.push(r.artKey);
        for (const o of r.options) {
          if (o.artKey) keys.push(o.artKey);
        }
      }
      preloadVocabImages(keys);
    }
  }, [rounds, preloadBn]);

  useEffect(() => {
    if (puzzleCards.length > 0) {
      preloadVocabImages(puzzleCards.map((c) => c.artKey));
    }
  }, [puzzleCards]);

  const startGame = (id: MiniGameId) => {
    playTapSound(progress.settings.soundEffects);
    setActiveGame(id);
    setFeedback(null);
    clearBnNotice();
    setFinished(false);
    setScore(0);
    setRoundIdx(0);
    setLocked(false);

    if (id === 'picture-puzzle') {
      setPuzzleCards(createPuzzleDeck());
      setFlippedUids([]);
      setMoves(0);
    } else {
      setRounds(buildRounds(id));
    }
  };

  const handleSelectOption = (isCorrect: boolean) => {
    if (locked || !activeGame) return;
    if (isCorrect) {
      setLocked(true);
      playSuccessChime(progress.settings.soundEffects);
      const praise = POSITIVE_PRAISES[Math.floor(Math.random() * POSITIVE_PRAISES.length)];
      const nextScore = score + 1;
      setScore(nextScore);
      setFeedback({
        tone: 'success',
        message: praise.en,
        bengali: praise.bn,
        points: 10,
      });

      setTimeout(() => {
        if (roundIdx + 1 < rounds.length) {
          setRoundIdx((r) => r + 1);
          setFeedback(null);
          setLocked(false);
        } else {
          setFinished(true);
          setLocked(false);
          const meta = GAMES.find((g) => g.id === activeGame)!;
          onGameComplete(activeGame, meta.title, nextScore, rounds.length);
        }
      }, 900);
    } else {
      playTryAgainTone(progress.settings.soundEffects);
      setFeedback({
        tone: 'encourage',
        message: 'Good try! Take a look and try another option.',
        bengali: 'আবার চেষ্টা করো!',
      });
    }
  };

  const handleFlipPuzzleCard = (uid: string) => {
    if (locked || flippedUids.includes(uid)) return;
    const card = puzzleCards.find((c) => c.uid === uid);
    if (!card || card.matched) return;

    playTapSound(progress.settings.soundEffects);
    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [firstUid, secondUid] = nextFlipped;
      const first = puzzleCards.find((c) => c.uid === firstUid)!;
      const second = puzzleCards.find((c) => c.uid === secondUid)!;

      if (first.pairId === second.pairId) {
        playSuccessChime(progress.settings.soundEffects);
        const updated = puzzleCards.map((c) =>
          c.pairId === first.pairId ? { ...c, matched: true } : c
        );
        setPuzzleCards(updated);
        setFlippedUids([]);
        setLocked(false);
        setFeedback({
          tone: 'success',
          message: `Excellent! Matched ${first.pairId}!`,
          bengali: 'দারুণ! জোড়া মিলেছে!',
          points: 10,
        });

        if (updated.every((c) => c.matched)) {
          setFinished(true);
          onGameComplete('picture-puzzle', '8. Simple Picture Puzzle', 4, 4);
        }
      } else {
        playTryAgainTone(progress.settings.soundEffects);
        setFeedback({
          tone: 'encourage',
          message: 'Not a match yet! Keep looking.',
          bengali: 'আবার চেষ্টা করো!',
        });
        setTimeout(() => {
          setFlippedUids([]);
          setLocked(false);
        }, 850);
      }
    }
  };

  if (!activeGame) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Play Quiz &amp; Educational Mini-Games
          </h1>
          <p className="font-bengali text-sm text-slate-600 mt-0.5">
            ৮টি মজার শিক্ষামূলক খেলা · প্রতিটি খেলায় তারা ও পয়েন্ট জিতো!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((game) => {
            const Icon = game.icon;
            const record = progress.gameScores[game.id];
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => startGame(game.id)}
                className={`text-left rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${game.accentBg}`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    {game.title}
                  </h2>
                  <p className="font-bengali text-sm font-bold text-slate-700 mt-0.5">
                    {game.bengaliTitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{game.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="tabular-nums">
                    {record ? `Best: ${record.bestScore} · Played ${record.plays}×` : 'New Game'}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white">Play</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const activeMeta = GAMES.find((g) => g.id === activeGame)!;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Games</span>
          </button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              {activeMeta.title}
            </h1>
            <p className="font-bengali text-xs text-slate-600">{activeMeta.bengaliTitle}</p>
          </div>
        </div>

        {activeGame !== 'picture-puzzle' && !finished && (
          <div className="text-sm font-bold text-slate-700 tabular-nums">
            Round {roundIdx + 1}/{rounds.length} · Score {score}
          </div>
        )}
        {activeGame === 'picture-puzzle' && !finished && (
          <div className="text-sm font-bold text-slate-700 tabular-nums">Moves: {moves}</div>
        )}
      </div>

      {feedback && (
        <RewardBanner
          tone={feedback.tone}
          message={feedback.message}
          bengaliMessage={feedback.bengali}
          pointsEarned={feedback.points}
        />
      )}

      {finished ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center">
            <Star className="w-9 h-9 fill-amber-400 text-amber-500" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-900">
            Well Done! Game Complete!
          </h2>
          <p className="font-bengali text-lg text-slate-700">
            {activeGame === 'picture-puzzle'
              ? `তুমি ${moves} চালে সব ছবি মিলিয়েছ!`
              : `তুমি ${rounds.length}টির মধ্যে ${score}টি সঠিক উত্তর দিয়েছ!`}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startGame(activeGame)}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm border-b-4 border-amber-600"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGame(null)}
              className="px-6 py-3 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm border-b-4 border-sky-800"
            >
              Choose Another Game
            </button>
          </div>
        </div>
      ) : activeGame === 'picture-puzzle' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-4 text-center">
            Flip two cards at a time to match each Picture with its Word!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {puzzleCards.map((card) => {
              const isOpen = card.matched || flippedUids.includes(card.uid);
              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleFlipPuzzleCard(card.uid)}
                  className={`min-h-[140px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all ${
                    card.matched
                      ? 'bg-emerald-50 border-emerald-300'
                      : isOpen
                      ? 'bg-white border-sky-400 shadow-sm'
                      : 'bg-sky-600 hover:bg-sky-700 border-sky-800 text-white'
                  }`}
                >
                  {isOpen ? (
                    card.kind === 'picture' ? (
                      <PictureArt artKey={card.artKey} label={card.sublabel} size="sm" />
                    ) : (
                      <div className="text-center">
                        <div className="font-display text-lg font-extrabold text-slate-900">
                          {card.label}
                        </div>
                        <div className="font-bengali text-base font-bold text-sky-700">
                          {card.sublabel}
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="font-display text-3xl font-extrabold">?</span>
                  )}
                  {card.matched && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        rounds[roundIdx] && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
            {rounds[roundIdx].artKey && (
              <div className="flex justify-center">
                <PictureArt
                  artKey={rounds[roundIdx].artKey!}
                  label="Question picture"
                  size="lg"
                />
              </div>
            )}

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {rounds[roundIdx].prompt}
              </h2>
              <p className="font-bengali text-base text-slate-600 mt-1">
                {rounds[roundIdx].bengaliPrompt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {rounds[roundIdx].speakText && (
                <button
                  type="button"
                  onClick={() =>
                    void speakEnglish(rounds[roundIdx].speakText!, progress.settings.speechRate)
                  }
                  aria-label="Play English quiz audio"
                  className={`inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-2xl font-bold text-sm border-b-4 active:translate-y-0.5 transition-all ${
                    activeGame === 'listen-select'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-800'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-600'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>
                    {activeGame === 'listen-select' ? 'Listen to Word' : 'Hear Word & Question'}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void speakBn(rounds[roundIdx].bengaliPrompt)}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm font-bengali border-b-4 border-emerald-800"
              >
                <Volume2 className="w-4 h-4" />
                <span>বাংলায় প্রশ্ন শুনো</span>
              </button>
            </div>

            {bnNotice && (
              <div
                role="status"
                className={`max-w-lg mx-auto flex items-start gap-2 text-xs font-medium rounded-xl px-3.5 py-2.5 border text-left ${
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

            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
              {rounds[roundIdx].options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.isCorrect)}
                  className="p-4 min-h-[92px] rounded-2xl bg-slate-50 hover:bg-sky-50 border-2 border-slate-200 hover:border-sky-400 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  {opt.artKey && (
                    <PictureArt artKey={opt.artKey} label={opt.label} size="sm" />
                  )}
                  <span className="font-display font-bengali text-xl sm:text-2xl font-extrabold text-slate-900">
                    {opt.label}
                  </span>
                  {opt.sublabel && (
                    <span className="font-bengali text-xs font-semibold text-slate-500">
                      {opt.sublabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
