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

async function resetThirdFloor() {
  try {
    await db.collection('layouts').doc('Svm-Third-Floor').delete();
    console.log('✅ Successfully deleted Svm-Third-Floor from layouts collection!');
    await db.collection('directions').doc('Svm-Third-Floor').delete();
    console.log('✅ Successfully deleted Svm-Third-Floor from directions collection!');
  } catch (err) {
    console.error('Error resetting document:', err);
  }
  process.exit(0);
}

resetThirdFloor();
