import admin from 'firebase-admin';
import fs from 'fs';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ serviceAccountKey.json is missing!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function read() {
  const doc = await db.collection('layouts').doc('Svm-Fourth-Floor').get();
  if (!doc.exists) {
    console.log('❌ Svm-Fourth-Floor Document not found!');
  } else {
    const data = doc.data();
    console.log('=== Svm-Fourth-Floor ===');
    console.log('Rooms:', data.rooms?.length);
    console.log('Boundary Vertices:', JSON.stringify(data.boundaryVertices));
    // Let's write the whole document to a scratch file so we can view it
    fs.writeFileSync('scratch/db_fourth_layout.json', JSON.stringify(data, null, 2));
    console.log('Wrote layout to scratch/db_fourth_layout.json');
  }
  process.exit(0);
}

read();
