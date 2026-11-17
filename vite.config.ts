import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function collectRelativeDistAssets(rootDir: string, currentDir = rootDir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(currentDir)) return results;
  for (const entry of fs.readdirSync(currentDir, {withFileTypes: true})) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectRelativeDistAssets(rootDir, fullPath));
    } else if (entry.isFile()) {
      const rel = path.relative(rootDir, fullPath).split(path.sep).join('/');
      if (rel === 'sw.js') continue;
      results.push(`./${rel}`);
    }
  }
  return results;
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ and generates dist/sw.js with all built
      // HTML, JS, CSS, WebP, and MP3 URLs for 100% offline playback.
      {
        name: 'copy-unbundled-src-assets-and-sw',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }

          if (fs.existsSync(distDir)) {
            const precacheUrls = Array.from(
              new Set(['./', './index.html', ...collectRelativeDistAssets(distDir).sort()])
            );
            const buildVersion = `smartmind-offline-${Date.now()}`;
            const swSource = `/* Auto-generated offline Service Worker for SmartMind Kids Academy */
const CACHE_NAME = ${JSON.stringify(buildVersion)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const BATCH_SIZE = 40;
      for (let i = 0; i < PRECACHE_URLS.length; i += BATCH_SIZE) {
        const batch = PRECACHE_URLS.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(async (url) => {
            try {
              const req = new Request(url, { cache: 'reload' });
              const res = await fetch(req);
              if (res && res.ok) {
                await cache.put(req, res);
              }
            } catch {
              // Ignore individual fetch errors during offline install
            }
          })
        );
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('smartmind-offline-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) {
        return cached;
      }
      try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.ok) {
          cache.put(request, networkRes.clone()).catch(() => {});
        }
        return networkRes;
      } catch {
        if (request.mode === 'navigate') {
          const fallback = await cache.match('./index.html') || await cache.match('./');
          if (fallback) return fallback;
        }
        return Response.error();
      }
    })
  );
});
`;
            fs.writeFileSync(path.join(distDir, 'sw.js'), swSource, 'utf8');
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
