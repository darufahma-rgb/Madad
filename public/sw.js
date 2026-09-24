/* Talqeeh — service worker PWA.
   - Halaman: network-first (selalu versi terbaru), fallback ke index.html tersimpan saat offline.
   - JS/CSS hasil build (nama ber-hash): cache-first, isinya tidak pernah berubah.
   - Gambar & font: stale-while-revalidate.
   - /api, Supabase, dan domain lain di luar font: tidak disentuh (selalu langsung ke jaringan). */

const VERSION = 'v1';
const SHELL_CACHE = `talqeeh-shell-${VERSION}`;
const ASSET_CACHE = `talqeeh-assets-${VERSION}`;
const SHELL_URLS = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/assets/talqeeh-logo.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const ASSET_LIMIT = 120;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, ASSET_CACHE];
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('talqeeh-') && !keep.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

const isHashedBuildAsset = (url) => /\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css)$/.test(url.pathname);
const isStaticFile = (url) => /\.(png|jpe?g|webp|svg|gif|ico|woff2?|ttf|webmanifest)$/.test(url.pathname);

const trimCache = async (name, limit) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > limit) await Promise.all(keys.slice(0, keys.length - limit).map(k => cache.delete(k)));
};

const networkFirstPage = async (request) => {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put('/', res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match('/');
    return cached || new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Talqeeh — Offline</title>' +
      '<body style="background:#0c0c0c;color:#ededed;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px">' +
      '<div><h1 style="font-size:20px">Kamu sedang offline</h1><p style="color:#9a9a9a">Sambungkan internet lalu buka Talqeeh lagi.</p></div></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, res.clone());
    trimCache(ASSET_CACHE, ASSET_LIMIT);
  }
  return res;
};

const staleWhileRevalidate = async (request, event) => {
  const cached = await caches.match(request);
  const refresh = fetch(request).then(async res => {
    if (res.ok || res.type === 'opaque') {
      const cache = await caches.open(ASSET_CACHE);
      await cache.put(request, res.clone());
      trimCache(ASSET_CACHE, ASSET_LIMIT);
    }
    return res;
  });
  if (cached) { event.waitUntil(refresh.catch(() => {})); return cached; }
  return refresh;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) return;
    if (request.mode === 'navigate') { event.respondWith(networkFirstPage(request)); return; }
    if (isHashedBuildAsset(url)) { event.respondWith(cacheFirst(request)); return; }
    if (isStaticFile(url)) { event.respondWith(staleWhileRevalidate(request, event)); return; }
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) event.respondWith(staleWhileRevalidate(request, event));
});
