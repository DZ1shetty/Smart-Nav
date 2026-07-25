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

async function fetchToFile() {
  try {
    const docRef = db.collection('layouts').doc('Svm-Third-Floor');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      console.log('❌ Document Svm-Third-Floor does not exist in Firestore!');
      process.exit(1);
    }
    const data = docSnap.data();
    fs.writeFileSync('./scratch/svm_third_layout_db.json', JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Successfully wrote layouts/Svm-Third-Floor to scratch/svm_third_layout_db.json');
  } catch (err) {
    console.error('Error fetching document:', err);
    process.exit(1);
  }
  process.exit(0);
}

fetchToFile();
