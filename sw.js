const CACHE_NAME = 'dogmy-v1';
const urlsToCache = [
  'index.html',
  'admin.html',
  'paseador.html',
  'clientes.html',
  'registro.html',
  'agenda.html',
  'lista_clientes.html',
  'style.css',
  'manifest.json',
  'img/logo.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});