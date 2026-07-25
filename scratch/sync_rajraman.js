import admin from 'firebase-admin';
import fs from 'fs';
import { ground } from '../src/data/rajraman-block/ground.js';
import { first } from '../src/data/rajraman-block/first.js';
import { second } from '../src/data/rajraman-block/second.js';
import { third } from '../src/data/rajraman-block/third.js';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const layoutsRef = db.collection('layouts');

const floorsToSync = {
  'rajraman_ground': { data: ground, docName: 'Rajraman-Ground-Floor' },
  'rajraman_first': { data: first, docName: 'Rajraman-First-Floor' },
  'rajraman_second': { data: second, docName: 'Rajraman-Second-Floor' },
  'rajraman_third': { data: third, docName: 'Rajraman-Third-Floor' }
};

const docsToDelete = [
  'Rajraman-Basement-Floor',
  'Rajraman-Fourth-Floor',
  'Rajraman-Fifth-Floor'
];

async function run() {
  // 1. Delete outdated/incorrect floors from Firestore
  console.log('--- Cleaning up excluded Rajraman floors ---');
  for (const docName of docsToDelete) {
    try {
      await layoutsRef.doc(docName).delete();
      console.log(`🗑️ Deleted Firestore document ${docName} (if it existed)`);
    } catch (err) {
      console.error(`Failed to delete ${docName}:`, err);
    }
  }

  // 2. Sync active floors
  console.log('--- Syncing active Rajraman floors ---');
  for (const [floorId, info] of Object.entries(floorsToSync)) {
    const layout = info.data;
    const docName = info.docName;

    const layoutData = {
      floorId,
      buildingName: layout.buildingName || '',
      label: layout.label || '',
      viewWidth: layout.viewWidth || 1280,
      viewHeight: layout.viewHeight || 1540,
      mainWidth: layout.mainWidth || null,
      bulgeWidth: layout.bulgeWidth || null,
      bulgeHeight: layout.bulgeHeight || null,
      boundaryVertices: layout.boundaryVertices || [],
      rooms: layout.rooms || [],
      faculty: layout.faculty || [],
      lastEdited: new Date().toISOString(),
      lastEditedBy: 'system-sync-rajraman',
      locked: true
    };

    await layoutsRef.doc(docName).set(layoutData);
    console.log(`✅ Synced ${floorId} to Firestore document ${docName}`);
  }

  console.log('🎉 Rajraman block sync completed!');
  process.exit(0);
}

run().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
