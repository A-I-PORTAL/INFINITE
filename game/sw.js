const cacheName = 'audio-cache-v1';
const filesToCache = [
    '/INFINITE/',
    '/INFINITE/index.html',
    '/INFINITE/style.css',
    '/INFINITE/game.js',
    '/INFINITE/assets/music1.mp3',
    '/INFINITE/assets/music2.mp3',
    '/INFINITE/assets/music3.mp3',
    '/INFINITE/assets/music4.mp3',
    '/INFINITE/assets/music5.mp3',
    '/INFINITE/assets/music6.mp3',
    '/INFINITE/assets/music7.mp3',
    '/INFINITE/assets/music8.mp3',
    '/INFINITE/assets/music9.mp3',
    '/INFINITE/assets/music10.mp3',
    // Add more tracks as needed
];

// Install the service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});

// Fetch the assets from the cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
