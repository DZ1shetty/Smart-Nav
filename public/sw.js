const CACHE_NAME = 'smart-nav-offline-cache-v3';

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
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to pre-cache some assets:', err);
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
            console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper for fetching with a timeout (prevents slow network from hanging asset loading)
const fetchWithTimeout = (request, timeoutMs = 400) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Network request timed out'));
    }, timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

// High-Performance Network-First / Timeout / Offline-Cache Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Skip Firestore/Firebase authentication or database API requests to prevent breaking them
  if (url.pathname.includes('/api/layout') || url.href.includes('firestore.googleapis.com')) {
    return;
  }

  // 1. INSTANT OFFLINE MODE: If navigator is completely offline, bypass network entirely (0ms load time)
  if (navigator.onLine === false) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
        return new Response('Offline and not cached.', { status: 503 });
      })
    );
    return;
  }

  // 2. ONLINE MODE: Use Network-First with a 400ms Timeout Fallback for assets
  const isAsset = 
    /\.(png|jpg|jpeg|gif|webp|svg|woff2|woff|ttf|css|js)/i.test(url.pathname) ||
    url.href.includes('raw.githubusercontent.com') ||
    url.href.includes('fonts.gstatic.com') ||
    url.href.includes('fonts.googleapis.com');

  if (isAsset) {
    event.respondWith(
      fetchWithTimeout(event.request, 400)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed or timed out -> Fallback to Cache Storage instantly
          console.log('[Service Worker] Network failed/timed out, serving from cache:', url.pathname);
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Resource not found in offline cache.', { status: 504 });
          });
        })
    );
  } else {
    // For standard requests (non-assets), fetch normally
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
