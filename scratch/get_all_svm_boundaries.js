import admin from 'firebase-admin';
import fs from 'fs';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const docs = [
  'Svm-Basement-Floor',
  'Svm-Ground-Floor',
  'Svm-First-Floor',
  'Svm-Second-Floor',
  'Svm-Third-Floor',
  'Svm-Fourth-Floor',
  'Svm-Fifth-Floor'
];

async function getLayouts() {
  for (const docName of docs) {
    try {
      const doc = await db.collection('layouts').doc(docName).get();
      if (!doc.exists) {
        console.log(`❌ ${docName}: No layout found`);
      } else {
        const data = doc.data();
        console.log(`=== ${docName} ===`);
        console.log(`Boundary Vertices (${data.boundaryVertices?.length || 0}):`, JSON.stringify(data.boundaryVertices));
      }
    } catch (err) {
      console.error(`Error fetching ${docName}:`, err);
    }
  }
  process.exit(0);
}

getLayouts();
