const CACHE_NAME = 'smart-nav-offline-cache-v4';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/chatbot-icon.png',
  '/website-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker v4] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker v4] Failed to pre-cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker v4] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-While-Revalidate Strategy for Assets (JS, CSS, Images, Fonts)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Skip Firestore/Firebase authentication or database API requests
  if (url.pathname.includes('/api/layout') || url.href.includes('firestore.googleapis.com')) {
    return;
  }

  // 1. INSTANT OFFLINE MODE: If navigator is offline, serve from CacheStorage directly
  if (navigator.onLine === false) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
        return new Response('Offline and not cached.', { status: 503 });
      })
    );
    return;
  }

  // 2. STALE-WHILE-REVALIDATE for Static Assets (JS, CSS, Images, Fonts)
  const isAsset =
    /\.(png|jpg|jpeg|gif|webp|svg|woff2|woff|ttf|css|js)/i.test(url.pathname) ||
    url.href.includes('raw.githubusercontent.com') ||
    url.href.includes('fonts.gstatic.com') ||
    url.href.includes('fonts.googleapis.com');

  if (isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Fire background fetch to revalidate & update cache
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          // Return cached response instantly (0ms latency) if available, otherwise wait for network fetch
          return cachedResponse || fetchPromise;
        });
      })
    );
  } else {
    // For standard requests (HTML / Navigation), fetch network with offline fallback
    event.respondWith(
      fetch(event.request).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
    );
  }
});
