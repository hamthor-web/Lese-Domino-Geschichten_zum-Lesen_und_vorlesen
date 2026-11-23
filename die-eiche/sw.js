'use strict';

const scope = self.registration.scope;
const prefix = 'die-eiche:' + scope + ':';
const cacheName = prefix + 'v1';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(scope) ||
      request.cache === 'no-store' || new URL(request.url).searchParams.has('aktualisiert') ||
      request.headers.has('range') ||
      request.destination === 'video' || request.destination === 'audio') return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, {cache: 'no-cache'});
      if (response.ok && response.status === 200) {
        try {
          const cache = await caches.open(cacheName);
          await cache.put(request, response.clone());
        } catch {
          // A full cache must not prevent loading the online response.
        }
      }
      return response;
    } catch {
      return await caches.match(request, {cacheName}) || Response.error();
    }
  })());
});
