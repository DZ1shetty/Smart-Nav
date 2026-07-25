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

async function deleteBasement() {
  try {
    await db.collection('layouts').doc('Svm-Basement-Floor').delete();
    console.log('✅ Successfully deleted Svm-Basement-Floor from Firestore layouts collection!');
  } catch (err) {
    console.error('Error deleting document:', err);
  }
  process.exit(0);
}

deleteBasement();
