// Network-only: do not store warehouse data or authentication responses.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => new Response('<!doctype html><html lang="id"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LoaderOPS</title><body><h2>LoaderOPS</h2><p>Koneksi internet diperlukan. Sambungkan internet lalu buka ulang aplikasi.</p></body></html>', {headers:{'Content-Type':'text/html; charset=utf-8'}})));
});
