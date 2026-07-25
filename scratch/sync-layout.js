import admin from 'firebase-admin';
import fs from 'fs';
import { fourth } from '../src/data/ramanujan-block/fourth.js';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const layoutsRef = db.collection('layouts');

async function sync() {
  const floorId = 'ramanujan_fourth';
  const docName = 'Ramanujan-Fourth-Floor';
  
  const layoutData = {
    floorId,
    buildingName: fourth.buildingName || '',
    label: fourth.label || '',
    viewWidth: fourth.viewWidth || 3800,
    viewHeight: fourth.viewHeight || 1800,
    mainWidth: fourth.mainWidth || null,
    bulgeWidth: fourth.bulgeWidth || null,
    bulgeHeight: fourth.bulgeHeight || null,
    boundaryVertices: fourth.boundaryVertices || [],
    rooms: fourth.rooms,
    faculty: fourth.faculty || [],
    lastEdited: new Date().toISOString(),
    lastEditedBy: 'system-sync',
    locked: true
  };

  await layoutsRef.doc(docName).set(layoutData);
  console.log(`Successfully synced ${floorId} to Firestore document ${docName}`);
  process.exit(0);
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
