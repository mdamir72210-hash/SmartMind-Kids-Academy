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
const OUTPUT_AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio', 'bn');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'bengaliAudioManifest.ts');

export function normalizeBengaliAudioText(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function getAudioId(normalizedText: string): string {
  return crypto.createHash('sha256').update(`bn-IN|${normalizedText}`).digest('hex').slice(0, 16);
}

function toSpokenBengaliForm(text: string): string {
  return text
    .replace('৩ + ৪ কত হয়?', 'তিন যোগ চার কত হয়?')
    .replace('৯ - ৪ কত হয়?', 'নয় বিয়োগ চার কত হয়?')
    .replace(/["""]/g, '')
    .replace(/\s*—\s*/g, ', ')
    .trim();
}

function collectAllBengaliTexts(): string[] {
  const unique = new Set<string>();
  const add = (text: string) => {
    const clean = normalizeBengaliAudioText(text);
    if (clean) unique.add(clean);
  };

  // 1. English A-Z Bengali meaning + example sentence
  for (const item of ENGLISH_ALPHABET) {
    add(`${item.bengaliWord}। ${item.bengaliSentence}`);
  }

  // 2. Bengali Alphabet (11 vowels + 39 consonants)
  for (const item of [...BENGALI_VOWELS, ...BENGALI_CONSONANTS]) {
    add(`${item.letter}। ${item.word}।`);
    add(item.sentence);
  }

  // 3. Numbers 1-100 & Visual Math Lab combinations
  for (const num of NUMBERS_1_TO_100) {
    add(num.bengaliName);
  }
  for (const word of ['শূন্য', 'যোগ', 'বিয়োগ', 'গুণ', 'সমান']) {
    add(word);
  }
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      add(
        `${NUMBERS_1_TO_100[a - 1].bengaliName} যোগ ${NUMBERS_1_TO_100[b - 1].bengaliName} সমান ${NUMBERS_1_TO_100[a + b - 1].bengaliName}।`
      );
    }
  }
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= a; b++) {
      const resWord = a - b === 0 ? 'শূন্য' : NUMBERS_1_TO_100[a - b - 1].bengaliName;
      add(
        `${NUMBERS_1_TO_100[a - 1].bengaliName} বিয়োগ ${NUMBERS_1_TO_100[b - 1].bengaliName} সমান ${resWord}।`
      );
    }
  }
  for (let a = 1; a <= 5; a++) {
    for (let b = 1; b <= 5; b++) {
      add(
        `${NUMBERS_1_TO_100[a - 1].bengaliName} গুণ ${NUMBERS_1_TO_100[b - 1].bengaliName} সমান ${NUMBERS_1_TO_100[a * b - 1].bengaliName}।`
      );
    }
  }

  // 4. Picture Learning items
  for (const pic of PICTURE_ITEMS) {
    add(`${pic.bengali}।`);
  }

  // 5. Mini-Games Bengali Prompts
  for (const target of ENGLISH_ALPHABET) {
    add(`কোন ছবিটি "${target.letter}" দিয়ে শুরু হয়?`);
    add(`${target.bengaliWord} (${target.word}) এর সঠিক বর্ণ কোনটি?`);
    add(`"${target.word}" শব্দের বাংলা অর্থ কোনটি?`);
    add(`শোনো এবং "${target.word}" এর ছবিটি বাছো`);
    add(`${target.bengaliWord} — শূন্যস্থানে সঠিক বর্ণ বসাও`);
  }
  for (const target of BENGALI_VOWELS) {
    add(`"${target.word}" কোন বর্ণ দিয়ে শুরু হয়?`);
  }
  add('মোট কয়টি আছে গুনে বের করো');
  for (const q of [
    '৩ + ৪ কত হয়?',
    'Tiger শব্দের বাংলা অর্থ কী?',
    '"আম" কোন স্বরবর্ণ দিয়ে শুরু হয়?',
    '৯ - ৪ কত হয়?',
    'Umbrella শব্দের বাংলা অর্থ কী?',
  ]) {
    add(q);
  }

  // 6. Voice Check greeting
  add('নমস্কার! স্মার্টমাইন্ড কিডস একাডেমিতে স্বাগতম।');

  return Array.from(unique);
}

async function synthesizeBengaliMp3(rawText: string): Promise<Buffer> {
  const spoken = toSpokenBengaliForm(rawText);
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=bn-IN&q=${encodeURIComponent(spoken)}`;

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

  const content = `// Auto-generated pre-built Bengali audio manifest.
// All audio clips are stored statically in /public/audio/bn/*.mp3 for instant playback.

export function normalizeBengaliAudioKey(text: string): string {
  return text.normalize('NFC').trim().replace(/\\s+/g, ' ');
}

export const BENGALI_AUDIO_MANIFEST: Record<string, string> = ${JSON.stringify(mapRecord, null, 2)};

export const BENGALI_AUDIO_TOTAL_CLIPS = ${sorted.length};

export function resolveBengaliAudioUrl(text: string): string | null {
  const key = normalizeBengaliAudioKey(text);
  if (!key) return null;
  if (BENGALI_AUDIO_MANIFEST[key]) return BENGALI_AUDIO_MANIFEST[key];
  const withDari = key.endsWith('।') || key.endsWith('?') ? key : \`\${key}।\`;
  if (BENGALI_AUDIO_MANIFEST[withDari]) return BENGALI_AUDIO_MANIFEST[withDari];
  const withoutDari = key.endsWith('।') ? key.slice(0, -1) : key;
  return BENGALI_AUDIO_MANIFEST[withoutDari] || null;
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

  const allTexts = collectAllBengaliTexts();
  const manifestEntries: Array<{ text: string; url: string }> = [];
  const pending: Array<{ text: string; id: string; mp3Path: string }> = [];

  for (const text of allTexts) {
    const id = getAudioId(text);
    const mp3Path = path.join(OUTPUT_AUDIO_DIR, `${id}.mp3`);
    const url = `/audio/bn/${id}.mp3`;
    manifestEntries.push({ text, url });

    if (force || !fs.existsSync(mp3Path) || fs.statSync(mp3Path).size < 512) {
      pending.push({ text, id, mp3Path });
    }
  }

  console.log(
    `Total Bengali clips: ${allTexts.length} | Already saved: ${allTexts.length - pending.length} | To generate now: ${pending.length}`
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
        const mp3Buf = await synthesizeBengaliMp3(item.text);
        fs.writeFileSync(item.mp3Path, mp3Buf);
        const valid = await verifyAudioFile(item.mp3Path);
        if (!valid) {
          fs.unlinkSync(item.mp3Path);
          throw new Error('Invalid MP3 output failed ffprobe check');
        }
        completed++;
        if (completed % 50 === 0 || completed === pending.length) {
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
    `Done. Ready clips on disk: ${readyEntries.length}/${allTexts.length}. Failed in run: ${failed}.`
  );

  if (failed > 0 || readyEntries.length !== allTexts.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
