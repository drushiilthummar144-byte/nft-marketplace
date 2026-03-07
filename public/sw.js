const CACHE_NAME = 'novastock-cache-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/styles/main.css',
    '/styles/glass.css',
    '/styles/admin.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
