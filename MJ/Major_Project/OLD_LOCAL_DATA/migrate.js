import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load Service Account
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const DATA_DIR = path.join(__dirname, 'data', 'layouts');

async function migrate() {
  console.log('🚀 Starting Migration to Firestore...');
  
  if (!fs.existsSync(DATA_DIR)) {
    console.log('❌ Local data directory not found. Nothing to migrate.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json') && !file.endsWith('.tmp')) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        
        // Format document name: fifth.json -> Fifth-Floor
        const docBase = file.replace('.json', '');
        const docName = docBase.charAt(0).toUpperCase() + docBase.slice(1) + "-Floor";
        
        console.log(`📤 Uploading ${file} as ${docName}...`);
        await db.collection('layouts').doc(docName).set(data);
      } catch (error) {
        console.error(`Failed to migrate ${file}:`, error.message);
      }
    }
  }
  
  console.log('✅ Migration complete!');
  process.exit(0);
}

migrate();
