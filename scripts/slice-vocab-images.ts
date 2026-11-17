import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SRC_IMG_DIR = path.join(ROOT_DIR, 'src', 'assets', 'images');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'images', 'vocab');

const GRID_SPECS: Array<{ file: string; keys: Array<string | null> }> = [
  {
    file: 'vocab_grid_test_1_1794899155001.jpg',
    keys: ['apple', 'ball', 'cat', 'dog', 'elephant', 'fish', 'grapes', 'hen', 'icecream'],
  },
  {
    file: 'vocab_grid_2_1794899183995.jpg',
    keys: ['jug', 'kite', 'lion', 'mango', 'nest', 'orange', 'pen', 'queen', 'rabbit'],
  },
  {
    file: 'vocab_grid_3_1794899184145.jpg',
    keys: ['sun', 'tiger', 'umbrella', 'van', 'watch', 'xylophone', 'yak', 'zebra', 'cow'],
  },
  {
    file: 'vocab_grid_4_1794899185355.jpg',
    keys: ['bird', 'duck', 'eagle', 'owl', 'parrot', 'peacock', 'bear', 'camel', 'deer'],
  },
  {
    file: 'vocab_grid_5_1794899187129.jpg',
    keys: ['frog', 'mouse', 'python', 'banana', 'watermelon', 'lemon', 'tomato', 'potato', 'carrot'],
  },
  {
    file: 'vocab_grid_6_1794899187812.jpg',
    keys: ['eggplant', 'onion', 'leafy', 'car', 'bus', 'boat', 'ship', 'airplane', 'book'],
  },
  {
    file: 'vocab_grid_7_1794899188553.jpg',
    keys: ['eye', 'ear', 'nose', 'hand', 'foot', 'mouth', 'basket', 'egg', 'drum'],
  },
  {
    file: 'vocab_grid_8_1794899188689.jpg',
    keys: ['flower', 'medicine', 'moon', 'plate', 'rainbow', 'rice', 'star', null, null],
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = path.join('/tmp', 'smartmind-vocab-tiles');
  fs.mkdirSync(tmpDir, { recursive: true });

  let totalSliced = 0;

  for (const spec of GRID_SPECS) {
    const srcPath = path.join(SRC_IMG_DIR, spec.file);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source grid: ${srcPath}`);
    }

    const tilePattern = path.join(tmpDir, `${path.basename(spec.file, '.jpg')}_tile_%d.png`);
    await execFileAsync('convert', [srcPath, '-crop', '3x3@', '+repage', tilePattern]);

    for (let i = 0; i < 9; i++) {
      const key = spec.keys[i];
      const tilePath = path.join(tmpDir, `${path.basename(spec.file, '.jpg')}_tile_${i}.png`);
      if (!key) continue;

      const outPath = path.join(OUT_DIR, `${key}.webp`);
      await execFileAsync('convert', [
        tilePath,
        '-shave',
        '10x10',
        '-fuzz',
        '3%',
        '-trim',
        '+repage',
        '-resize',
        '356x356',
        '-background',
        '#FFFFFF',
        '-gravity',
        'center',
        '-extent',
        '400x400',
        '-quality',
        '90',
        outPath,
      ]);

      const stat = fs.statSync(outPath);
      if (stat.size < 1024) {
        throw new Error(`Sliced image too small for ${key}: ${stat.size} bytes`);
      }
      totalSliced++;
    }
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`Successfully sliced and verified ${totalSliced} vocabulary images in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
