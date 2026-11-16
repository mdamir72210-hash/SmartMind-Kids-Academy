import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Serve pre-generated Bengali static MP3 clips with immutable caching
  const publicAudioDir = path.join(__dirname, 'public', 'audio');
  const distAudioDir = path.join(__dirname, 'dist', 'audio');
  const audioDir = IS_PROD && fs.existsSync(distAudioDir) ? distAudioDir : publicAudioDir;

  if (fs.existsSync(audioDir)) {
    app.use(
      '/audio',
      express.static(audioDir, {
        maxAge: '365d',
        immutable: true,
      })
    );
  }

  app.get('/api/health', (_req: Request, res: Response) => {
    const bnDir = path.join(audioDir, 'bn');
    let clipCount = 0;
    try {
      if (fs.existsSync(bnDir)) {
        clipCount = fs.readdirSync(bnDir).filter((f) => f.endsWith('.mp3')).length;
      }
    } catch {
      clipCount = 0;
    }
    res.json({
      ok: true,
      mode: 'pre-generated-static-audio',
      bengaliClips: clipCount,
    });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartMind Kids Academy server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
