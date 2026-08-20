/**
 * SMART NAV - GLOBAL CONFIGURATION
 *
 * This file manages asset paths and cloud settings.
 * To point to a different repository, just update the GITHUB_USER and GITHUB_REPO variables.
 */

// --- CONFIGURATION SETTINGS ---
const GITHUB_USER = 'DZ1shetty'
const GITHUB_REPO = 'Smart-Nav'
const GITHUB_BRANCH = 'main'

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

// SET THIS TO 'true' to use GitHub as a Cloud CDN in production.
// Automatically set to 'false' on localhost so all images load locally without network 404s.
export const IS_CLOUD = !isLocalhost

// --- DYNAMIC BASE URL ---
export const IMG_BASE_URL = IS_CLOUD
  ? `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/public`
  : '' // Empty string resolves to local root in Vite (e.g. /apj-block-images)

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;

  // Replace literal template variable ${IMG_BASE_URL}
  if (url.includes('${IMG_BASE_URL}')) {
    url = url.replaceAll('${IMG_BASE_URL}', IMG_BASE_URL);
  }

  // Auto-correct legacy repository name (Smart_Nav -> Smart-Nav)
  if (url.includes('/Smart_Nav/')) {
    url = url.replaceAll('/Smart_Nav/', '/Smart-Nav/');
  }

  // Clean out legacy nested path references
  if (url.includes('/OLD_LOCAL_DATA/public-backup/')) {
    url = url.replaceAll('/OLD_LOCAL_DATA/public-backup/', '/public/');
  }
  if (url.includes('/public-backup/')) {
    url = url.replaceAll('/public-backup/', '/public/');
  }
  if (url.includes('/MJ/Major_Project/')) {
    url = url.replaceAll('/MJ/Major_Project/', '/');
  } else if (url.includes('MJ/Major_Project/')) {
    url = url.replaceAll('MJ/Major_Project/', '');
  }

  // When running locally (localhost), convert raw.githubusercontent URLs to local relative public paths
  if (!IS_CLOUD && url.includes('raw.githubusercontent.com')) {
    if (url.includes('/public/')) {
      const parts = url.split('/public/');
      if (parts[1]) return '/' + parts[1];
    }
  }

  // Self-heal any legacy hardcoded raw.githubusercontent URLs pointing to public-backup
  if (url.includes('raw.githubusercontent.com') && url.includes('/public-backup')) {
    const parts = url.split('/public-backup');
    if (parts.length > 1) {
      return `${IMG_BASE_URL}${parts[1]}`;
    }
  }

  return url;
}


// --- FIREBASE CLIENT CONFIG (REQUIRED FOR STAGE 4) ---
// These values are now loaded from the .env file for security.
// FALLBACK for Node.js scripts (like repair_firestore.js)
const env =
  typeof import.meta.env !== 'undefined' ? import.meta.env : process.env

export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

/**
 * Formats floor IDs into their corresponding Firestore document names cleanly.
 * e.g., "ground" -> "Ground-Floor", "cv_raman_ground" -> "Cv-Raman-Ground-Floor"
 */
export const getFirestoreDocName = (floorId) => {
  if (!floorId) return ''
  if (floorId.includes('_')) {
    return (
      floorId
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-') + '-Floor'
    )
  }
  return floorId.charAt(0).toUpperCase() + floorId.slice(1) + '-Floor'
}

console.log(
  `[SmartNav Config] Using ${IS_CLOUD ? 'CLOUD' : 'LOCAL'} image source: ${IMG_BASE_URL || 'Local public/'}`
)

