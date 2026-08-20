import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const serviceAccountPath = path.join(projectRoot, 'serviceAccountKey.json');

let db = null;
if (fs.existsSync(serviceAccountPath)) {
  const adminModule = await import('firebase-admin');
  const admin = adminModule.default;
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  db = admin.firestore();
}

async function audit() {
  console.log('=== AUDITING ROOM IMAGES ACROSS ALL BUILDINGS ===\n');

  // 1. Audit Firestore collection 'layouts'
  if (db) {
    console.log('--- FIRESTORE ROOM IMAGES ---');
    const layoutSnap = await db.collection('layouts').get();
    layoutSnap.forEach(doc => {
      const data = doc.data();
      const floorId = doc.id;
      const rooms = data.rooms || [];
      const roomsWithImage = rooms.filter(r => r.image || (r.images && r.images.length > 0));
      const roomsWithoutImage = rooms.filter(r => !r.image && (!r.images || r.images.length === 0));
      
      console.log(`Firestore Layout Doc [${floorId}]: ${rooms.length} total rooms (${roomsWithImage.length} with img, ${roomsWithoutImage.length} without img)`);
      
      // Print sample room images
      roomsWithImage.forEach(r => {
        console.log(`   - Room [${r.id}] (${r.name || r.label}): main="${r.image}" images=${JSON.stringify(r.images || [])}`);
      });
    });
  } else {
    console.log('⚠️ Service account key not found, skipping Firestore audit.');
  }

  // 2. Audit Google_Drive_Backup
  console.log('\n--- GOOGLE DRIVE BACKUP ROOM IMAGES ---');
  const driveBackupDir = path.join(projectRoot, 'Google_Drive_Backup');
  if (fs.existsSync(driveBackupDir)) {
    const bldDirs = fs.readdirSync(driveBackupDir).filter(f => fs.statSync(path.join(driveBackupDir, f)).isDirectory());
    for (const bld of bldDirs) {
      const bldPath = path.join(driveBackupDir, bld);
      const floorDirs = fs.readdirSync(bldPath).filter(f => fs.statSync(path.join(bldPath, f)).isDirectory());
      for (const fl of floorDirs) {
        const metaPath = path.join(bldPath, fl, 'firestore_metadata.json');
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            const rooms = meta.rooms || [];
            const roomsWithImg = rooms.filter(r => r.image || (r.images && r.images.length > 0));
            console.log(`Backup [${bld} -> ${fl}]: ${rooms.length} rooms, ${roomsWithImg.length} with images`);
            roomsWithImg.forEach(r => {
              console.log(`     Room [${r.id}] (${r.name || r.label}): image="${r.image}"`);
            });
          } catch(e) {}
        }
        
        // Also check physical files in Rooms folder inside Backup
        const roomsImgFolder = path.join(bldPath, fl, 'Rooms');
        if (fs.existsSync(roomsImgFolder)) {
          const files = fs.readdirSync(roomsImgFolder);
          if (files.length > 0) {
            console.log(`     📁 Physical images in ${bld}/${fl}/Rooms: ${files.length} files (${files.slice(0, 5).join(', ')}...)`);
          }
        }
      }
    }
  }

  // 3. Audit public/ directory
  console.log('\n--- PUBLIC DIRECTORY IMAGE FOLDERS ---');
  const publicDir = path.join(projectRoot, 'public');
  const pubFiles = fs.readdirSync(publicDir);
  const pubSubdirs = pubFiles.filter(f => fs.statSync(path.join(publicDir, f)).isDirectory() && f.includes('images'));
  console.log('Image subdirectories in public/:', pubSubdirs);
  
  pubSubdirs.forEach(sd => {
    const sdPath = path.join(publicDir, sd);
    function countFiles(dir) {
      let cnt = 0;
      const items = fs.readdirSync(dir);
      items.forEach(it => {
        const p = path.join(dir, it);
        if (fs.statSync(p).isDirectory()) cnt += countFiles(p);
        else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(it)) cnt++;
      });
      return cnt;
    }
    console.log(`  - public/${sd}: ${countFiles(sdPath)} image files`);
  });

  const rootDoorImgs = pubFiles.filter(f => f.endsWith('_door.png') || f.startsWith('nc') || f.startsWith('smv') || f.startsWith('sr') || f.startsWith('ccl') || f.startsWith('adl'));
  console.log(`  - public/ root door images: ${rootDoorImgs.length} files`);
}

audit().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
