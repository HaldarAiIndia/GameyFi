/* GameyFi service worker. Bump VERSION to force clients to drop old caches. */
const VERSION = 'gameyfi-v1';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.json', '/favicon.png', '/icons/icon-192.png', '/icons/icon-512.png'];
// Third-party files the games load. Cached opportunistically after a first online visit.
const CDN = ['https://cdn.tailwindcss.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req, isNav) {
  const cache = await caches.open(VERSION);
  try {
    // 'no-cache' revalidates with the server so JSON edits show up after a deploy.
    const res = await fetch(req, { cache: 'no-cache' });
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: isNav });
    if (hit) return hit;
    if (isNav) return (await cache.match('/offline.html')) || Response.error();
    return Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(networkFirst(req, req.mode === 'navigate'));
  } else if (CDN.some((p) => req.url.startsWith(p))) {
    e.respondWith(staleWhileRevalidate(req));
  }
  // Everything else (e.g. thumbnails from other hosts) goes straight to the network.
});
