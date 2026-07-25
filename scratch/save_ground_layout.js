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

async function saveLayout() {
  try {
    const doc = await db.collection('layouts').doc('Svm-Ground-Floor').get();
    if (!doc.exists) {
      console.log('No layout found in Firestore.');
    } else {
      fs.writeFileSync('./scratch/ground_layout.json', JSON.stringify(doc.data(), null, 2));
      console.log('✅ Successfully wrote ground_layout.json');
    }
  } catch (err) {
    console.error('Error fetching layout:', err);
  }
  process.exit(0);
}

saveLayout();
