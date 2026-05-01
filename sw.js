const CACHE = 'flotafrr-v3';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Ignorar Firebase, extensiones de Chrome y peticiones POST
  if(url.includes('firestore.googleapis.com') ||
     url.includes('firebase') ||
     url.startsWith('chrome-extension') ||
     e.request.method !== 'GET') {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => {
          try { c.put(e.request, clone); } catch(err) {}
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
