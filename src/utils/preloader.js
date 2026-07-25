import { floorsData } from '../data/floorsData'
import { resolveImageUrl } from '../config'

export const startPreloader = () => {
  // Clear any corrupted localStorage layouts containing old typo URLs
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('smart_nav_layout_')) {
        const val = localStorage.getItem(key);
        if (val && (val.includes('MJ/Major_Project') || val.includes('Major_Project_TA') || val.includes('Major_Project_OA') || val.includes('Major_Project_LD_LOCAL_DATA'))) {
          console.log(`[Preloader] Clearing outdated localStorage cache for key: ${key}`);
          localStorage.removeItem(key);
          i--; // Adjust index after removal
        }
      }
    }
  } catch (e) {
    console.error('[Preloader] Failed to clean localStorage:', e);
  }

  // 1. Localhost Bypass & Unregistration
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.');

  if (isLocalhost) {
    console.log('[Preloader] Running on localhost. Disabling Service Worker & clearing local cache to guarantee instant updates.');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) console.log('[Service Worker] Unregistered active worker on localhost.');
          });
        }
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
    // Still preload images into browser memory cache for local testing, but bypass Service Worker interceptors
    preloadAllImages();
    return;
  }

  // 2. Production Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Service Worker] Registered successfully in production scope:', reg.scope)
          preloadAllImages()
        })
        .catch((err) => {
          console.error('[Service Worker] Registration failed:', err)
          preloadAllImages()
        })
    })
  } else {
    preloadAllImages()
  }
}

const preloadAllImages = async () => {
  console.log('[Preloader] Extracting all image URLs from floorsData...')
  const imageUrls = new Set()

  // Extract from floorsData (resolving loaders asynchronously)
  for (const [floorKey, loader] of Object.entries(floorsData)) {
    try {
      if (typeof loader !== 'function') continue
      const floor = await loader()
      if (!floor) continue

      // 1. Floor plan map image
      if (floor.mapImage) {
        imageUrls.add(resolveImageUrl(floor.mapImage))
      }

      // 2. Room images
      if (Array.isArray(floor.rooms)) {
        floor.rooms.forEach((room) => {
          if (room.image) {
            imageUrls.add(resolveImageUrl(room.image))
          }
          if (Array.isArray(room.images)) {
            room.images.forEach((img) => imageUrls.add(resolveImageUrl(img)))
          }
        })
      }

      // 3. Faculty images
      if (Array.isArray(floor.faculty)) {
        floor.faculty.forEach((fac) => {
          if (fac.image) {
            imageUrls.add(resolveImageUrl(fac.image))
          }
        })
      }
    } catch (err) {
      console.warn(`[Preloader] Failed to resolve floor ${floorKey} during background preloading:`, err)
    }
  }

  const urls = Array.from(imageUrls).filter(Boolean)
  console.log(`[Preloader] Found ${urls.length} unique images to cache.`)

  try {
    const cache = await caches.open('smart-nav-offline-cache-v3')

    // STAGGERED LOADING: Loads one image every 150ms to prevent server network spikes
    let index = 0
    const loadNext = () => {
      if (index >= urls.length) {
        console.log('[Preloader] Staggered background preloading complete!')
        return
      }

      const url = urls[index++]
      caches.match(url).then((matched) => {
        if (!matched) {
          fetch(url, { mode: 'no-cors', cache: 'force-cache' })
            .then((res) => {
              if (res) {
                cache.put(url, res.clone())
              }
            })
            .catch(() => {})
            .finally(() => {
              // Trickle load next image after 150ms
              setTimeout(loadNext, 150)
            })
        } else {
          // If already cached, check next instantly
          loadNext()
        }
      })
    }

    // Start preloading when the browser is idle to ensure maximum startup performance
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setTimeout(loadNext, 1500))
    } else {
      setTimeout(loadNext, 2500)
    }
  } catch (err) {
    console.error('[Preloader] Error opening Cache Storage:', err)
  }
}
