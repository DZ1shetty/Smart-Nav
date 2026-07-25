import admin from 'firebase-admin';
import fs from 'fs';
import { ground } from '../src/data/cv-raman-block/ground.js';

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
const docName = 'Cv-Raman-Ground-Floor';

async function sync() {
  console.log(`🚀 Syncing ${docName} layout to Firestore with outline safety...`);

  let boundaryVertices = ground.boundaryVertices || [];

  try {
    const existingDoc = await db.collection('layouts').doc(docName).get();
    if (existingDoc.exists) {
      const data = existingDoc.data();
      if (data.boundaryVertices && data.boundaryVertices.length > 0) {
        console.log(`ℹ️ Preserving existing Firestore outline (${data.boundaryVertices.length} vertices) as requested.`);
        boundaryVertices = data.boundaryVertices;
      }
    }
  } catch (err) {
    console.warn(`⚠️ Warning: Could not fetch existing outline from Firestore:`, err.message);
  }

  const layoutData = {
    floorId: 'cv_raman_ground',
    label: ground.label || 'Ground Floor',
    buildingName: ground.buildingName || 'CV-RAMAN BLOCK',
    rooms: ground.rooms,
    faculty: ground.faculty,
    boundaryVertices: boundaryVertices,
    mapImage: ground.mapImage || null,
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
