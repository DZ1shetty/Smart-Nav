/**
 * SMART NAV - GLOBAL CONFIGURATION
 * 
 * This file manages asset paths and cloud settings.
 * To point to a different repository, just update the GITHUB_USER and GITHUB_REPO variables.
 */

// --- CONFIGURATION SETTINGS ---
const GITHUB_USER = "DZ1shetty";
const GITHUB_REPO = "Smart_Nav";
const GITHUB_BRANCH = "main";

// SET THIS TO 'true' to use GitHub as a Cloud CDN.
// SET THIS TO 'false' to use your local public/ folder.
export const IS_CLOUD = true;

// --- DYNAMIC BASE URL ---
export const IMG_BASE_URL = IS_CLOUD 
  ? `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/MJ/Major_Project/OLD_LOCAL_DATA/public-backup`
  : ""; // Empty string resolves to local root in Vite (e.g. /apj-block-images)

// --- FIREBASE CLIENT CONFIG (REQUIRED FOR STAGE 4) ---
// These values are now loaded from the .env file for security.
// FALLBACK for Node.js scripts (like repair_firestore.js)
const env = typeof import.meta.env !== 'undefined' ? import.meta.env : process.env;

export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

console.log(`[SmartNav Config] Using ${IS_CLOUD ? 'CLOUD' : 'LOCAL'} image source: ${IMG_BASE_URL || 'Local public/'}`);
