import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { BENGALI_CONSONANTS, BENGALI_VOWELS } from '../src/data/bengaliAlphabet';
import { ENGLISH_ALPHABET } from '../src/data/englishAlphabet';
import { NUMBERS_1_TO_100 } from '../src/data/numbersMath';
import { PICTURE_ITEMS } from '../src/data/pictureLearning';

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const OUTPUT_AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio', 'en');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'englishAudioManifest.ts');

export function normalizeEnglishAudioText(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function getEnglishAudioId(normalizedText: string): string {
  return crypto.createHash('sha256').update(`en-IN|${normalizedText}`).digest('hex').slice(0, 16);
}

function toSpokenEnglishForm(text: string): string {
  // Single capital letter sounds clearer in TTS as lowercase or letter-only without weird acronyms
  // Check: single uppercase letters A-Z work cleanly on en-IN TTS; slashes read nicer as ", or "
  return text
    .replace(/\s*\/\s*/g, ', or ')
    .trim();
}

function collectAllEnglishTexts(): string[] {
  const unique = new Set<string>();
  const add = (text: string) => {
    const clean = normalizeEnglishAudioText(text);
    if (clean) unique.add(clean);
  };

  // 1. English Alphabet A-Z: letter, word, and full sentence prompt
  for (const item of ENGLISH_ALPHABET) {
    add(item.letter);
    add(item.word);
    add(`${item.letter} is for ${item.word}. ${item.sentence}`);
  }

  // 2. Bengali Alphabet English Meanings (vowels + consonants)
  for (const item of [...BENGALI_VOWELS, ...BENGALI_CONSONANTS]) {
    add(item.englishMeaning);
  }

  // 3. Numbers 1-100 (preserve existing "1. One" entries + standalone single-utterance "0".."100" clips)
  add('0');
  for (const num of NUMBERS_1_TO_100) {
    add(`${num.value}. ${num.englishName}`);
    add(String(num.value));
  }

  // 3b. Math operator & equation reading segments
  for (const opClip of ['plus', 'minus', 'times', 'equals', 'equals what?', 'Count the objects']) {
    add(opClip);
  }

  // 4. Picture Learning English words (48 items across 8 categories)
  for (const pic of PICTURE_ITEMS) {
    add(pic.english);
  }

  // 5. Quiz & Checkpoint Activity Question Prompts
  for (const item of ENGLISH_ALPHABET) {
    add(`Which letter starts ${item.word}?`);
    add(`Which picture starts with ${item.letter}?`);
    add(`Choose the letter for ${item.word}.`);
    add(`What is the Bengali meaning of ${item.word}?`);
    add(`Complete the word: ${item.word}`);
  }
  for (const vowel of BENGALI_VOWELS) {
    add(`Choose the Bengali letter for ${vowel.englishMeaning}.`);
  }
  for (const q of [
    'What is 3 plus 4?',
    'T is for Tiger. What is Tiger in Bengali?',
    'Which Bengali vowel starts the word Mango?',
    'What is 9 minus 4?',
    'U is for Umbrella. What is Umbrella in Bengali?',
  ]) {
    add(q);
  }

  // 6. Greeting / Voice Check clip
  add('Hello! Welcome to SmartMind Kids Academy.');

  return Array.from(unique);
}

async function synthesizeEnglishMp3(rawText: string): Promise<Buffer> {
  const spoken = toSpokenEnglishForm(rawText);
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=en-IN&q=${encodeURIComponent(spoken)}`;

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 512) {
        throw new Error(`Audio payload too small (${buf.length} bytes)`);
      }
      return buf;
    } catch (err) {
      lastError = err as Error;
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }

  throw lastError || new Error(`Failed to synthesize: ${rawText}`);
}

async function verifyAudioFile(mp3Path: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      mp3Path,
    ]);
    const dur = Number(stdout.trim());
    return Number.isFinite(dur) && dur > 0.05;
  } catch {
    return false;
  }
}

function writeManifest(entries: Array<{ text: string; url: string }>) {
  const sorted = [...entries].sort((a, b) => a.text.localeCompare(b.text));
  const mapRecord: Record<string, string> = {};
  for (const entry of sorted) {
    mapRecord[entry.text] = entry.url;
  }

  const content = `// Auto-generated pre-built Indian English (en-IN) audio manifest.
// All audio clips are stored statically in /public/audio/en/*.mp3 for instant offline-ready playback.

export function normalizeEnglishAudioKey(text: string): string {
  return text.normalize('NFC').trim().replace(/\\s+/g, ' ');
}

export const ENGLISH_AUDIO_MANIFEST: Record<string, string> = ${JSON.stringify(mapRecord, null, 2)};

export const ENGLISH_AUDIO_TOTAL_CLIPS = ${sorted.length};

export function resolveEnglishAudioUrl(text: string): string | null {
  const key = normalizeEnglishAudioKey(text);
  if (!key) return null;
  if (ENGLISH_AUDIO_MANIFEST[key]) return ENGLISH_AUDIO_MANIFEST[key];
  const lower = key.toLowerCase();
  for (const [k, url] of Object.entries(ENGLISH_AUDIO_MANIFEST)) {
    if (k.toLowerCase() === lower) return url;
  }
  return null;
}
`;

  fs.writeFileSync(MANIFEST_PATH, content, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
  const force = args.includes('--force');
  const concurrency = concurrencyArg ? Math.max(1, Number(concurrencyArg.split('=')[1])) : 5;

  fs.mkdirSync(OUTPUT_AUDIO_DIR, { recursive: true });

  const allTexts = collectAllEnglishTexts();
  const manifestEntries: Array<{ text: string; url: string }> = [];
  const pending: Array<{ text: string; id: string; mp3Path: string }> = [];

  for (const text of allTexts) {
    const id = getEnglishAudioId(text);
    const mp3Path = path.join(OUTPUT_AUDIO_DIR, `${id}.mp3`);
    const url = `/audio/en/${id}.mp3`;
    manifestEntries.push({ text, url });

    if (force || !fs.existsSync(mp3Path) || fs.statSync(mp3Path).size < 512) {
      pending.push({ text, id, mp3Path });
    }
  }

  console.log(
    `Total English (en-IN) clips: ${allTexts.length} | Already saved: ${allTexts.length - pending.length} | To generate now: ${pending.length}`
  );

  let cursor = 0;
  let completed = 0;
  let failed = 0;
  const startedAt = Date.now();

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= pending.length) break;
      const item = pending[idx];
      try {
        const mp3Buf = await synthesizeEnglishMp3(item.text);
        fs.writeFileSync(item.mp3Path, mp3Buf);
        const valid = await verifyAudioFile(item.mp3Path);
        if (!valid) {
          fs.unlinkSync(item.mp3Path);
          throw new Error('Invalid MP3 output failed ffprobe check');
        }
        completed++;
        if (completed % 40 === 0 || completed === pending.length) {
          const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
          console.log(`Progress: ${completed}/${pending.length} generated (${elapsedSec}s elapsed)`);
        }
        await new Promise((r) => setTimeout(r, 60));
      } catch (err) {
        failed++;
        console.error(`Failed [${item.id}] "${item.text}":`, (err as Error).message);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(1, pending.length)) }, worker)
  );

  const readyEntries = manifestEntries.filter((entry) => {
    const filename = path.basename(entry.url);
    const full = path.join(OUTPUT_AUDIO_DIR, filename);
    return fs.existsSync(full) && fs.statSync(full).size >= 512;
  });

  writeManifest(readyEntries);
  console.log(
    `Done. Ready English clips on disk: ${readyEntries.length}/${allTexts.length}. Failed in run: ${failed}.`
  );

  if (failed > 0 || readyEntries.length !== allTexts.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
