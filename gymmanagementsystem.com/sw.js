// Service Worker for offline caching and faster loading
const CACHE_NAME = 'gms-v1';
const urlsToCache = [
    // Only cache essential files to avoid errors
    // Add more URLs here as needed
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            // Only cache if there are URLs to cache
            if (urlsToCache.length > 0) {
                return cache.addAll(urlsToCache);
            }
        })
        .catch(err => console.error('SW install error:', err))
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
    // Grip of Iron: Prevent recursive sw.js polling / update flood
    if (event.request.url.endsWith('/sw.js')) {
        event.respondWith(
            caches.open('sw-cache').then(cache =>
                cache.match(event.request).then(response => response || fetch(event.request))
            )
        );
        return;
    }

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
        .then(response => {
            // Only cache successful responses
            if (response && response.status === 200) {
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    })
                    .catch(err => console.error('Cache error:', err));
            }

            return response;
        })
        .catch(() => {
            // If fetch fails, try cache
            return caches.match(event.request)
                .then(response => response || new Response('Offline', {
                    status: 503
                }));
        })
    );
});