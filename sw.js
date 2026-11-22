const CACHE = 'khunechin-v1';
const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/data.js',
  './js/engine.js',
  './js/art.js',
  './js/store.js',
  './js/ui-core.js',
  './js/screens-a.js',
  './js/screens-b.js',
  './js/screens-c.js',
  './js/screens-d.js',
  './js/app.js',
  './assets/icon.svg',
  './assets/fonts/Vazirmatn-Regular.woff2',
  './assets/fonts/Vazirmatn-Medium.woff2',
  './assets/fonts/Vazirmatn-Bold.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
