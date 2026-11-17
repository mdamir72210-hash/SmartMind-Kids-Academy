/* Dev fallback Service Worker for SmartMind Kids Academy (replaced in dist/ at build time with full precache list) */
const CACHE_NAME = 'smartmind-offline-dev-v1';
const PRECACHE_URLS = ['./', './index.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
          const fallback = (await cache.match('./index.html')) || (await cache.match('./'));
          if (fallback) return fallback;
        }
        return Response.error();
      }
    })
  );
});
