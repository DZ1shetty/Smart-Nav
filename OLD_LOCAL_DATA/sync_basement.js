import admin from 'firebase-admin';
import fs from 'fs';
import { basement } from '../src/data/cv-raman-block/basement.js';

// Verify serviceAccountKey exists
if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing! Place it in the root folder.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const docName = 'Cv-Raman-Basement-Floor';

async function sync() {
  console.log(`🚀 Syncing ${docName} layout to Firestore...`);

  const layoutData = {
    floorId: 'cv_raman_basement',
    label: basement.label || 'Basement Floor',
    buildingName: basement.buildingName || 'CV-RAMAN BLOCK',
    rooms: basement.rooms,
    faculty: basement.faculty,
    boundaryVertices: basement.boundaryVertices || [],
    mapImage: basement.mapImage || null,
    locked: true,
    lastEdited: new Date().toISOString()
  };

  try {
    await db.collection('layouts').doc(docName).set(layoutData);
    console.log(`✅ Success! Firestore document "${docName}" successfully synchronized!`);
  } catch (err) {
    console.error(`❌ Sync failed:`, err);
  }

  process.exit(0);
}

sync();
