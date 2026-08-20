import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

const dataDir = path.join(projectRoot, 'src', 'data');
const publicDir = path.join(projectRoot, 'public');
const driveBackupDir = path.join(projectRoot, 'Google_Drive_Backup');

// Map of physical files in Google_Drive_Backup
const backupPhysicalFiles = {}; // key: building/floor/roomName, val: absolute path

if (fs.existsSync(driveBackupDir)) {
  const blds = fs.readdirSync(driveBackupDir).filter(f => fs.statSync(path.join(driveBackupDir, f)).isDirectory());
  blds.forEach(bld => {
    const bldPath = path.join(driveBackupDir, bld);
    const floors = fs.readdirSync(bldPath).filter(f => fs.statSync(path.join(bldPath, f)).isDirectory());
    floors.forEach(fl => {
      const roomsDir = path.join(bldPath, fl, 'Rooms');
      if (fs.existsSync(roomsDir)) {
        const files = fs.readdirSync(roomsDir);
        files.forEach(file => {
          const roomNameNorm = file.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const bldNorm = bld.toLowerCase().replace(/[^a-z0-9]/g, '');
          const flNorm = fl.toLowerCase().replace(/[^a-z0-9]/g, '');
          const key = `${bldNorm}_${flNorm}_${roomNameNorm}`;
          backupPhysicalFiles[key] = path.join(roomsDir, file);
        });
      }
    });
  });
}

console.log(`Indexed ${Object.keys(backupPhysicalFiles).length} physical room images from Google_Drive_Backup.`);

// Map of physical files in public/
const publicPhysicalFiles = {};
function scanPublic(dir, baseRel = '') {
  const items = fs.readdirSync(dir);
  items.forEach(it => {
    const full = path.join(dir, it);
    const rel = baseRel ? `${baseRel}/${it}` : it;
    if (fs.statSync(full).isDirectory()) {
      scanPublic(full, rel);
    } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(it)) {
      publicPhysicalFiles['/' + rel.replace(/\\/g, '/')] = full;
      const fnNorm = it.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      publicPhysicalFiles[fnNorm] = '/' + rel.replace(/\\/g, '/');
    }
  });
}
scanPublic(publicDir);

console.log(`Indexed ${Object.keys(publicPhysicalFiles).length} image paths/keys in public/.`);

// Scan all rooms in src/data
const blockDirs = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());

const report = [];

for (const block of blockDirs) {
  const blockPath = path.join(dataDir, block);
  const files = fs.readdirSync(blockPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(blockPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const roomBlocks = content.split(/\{\s*id:/g).slice(1);
    for (const rb of roomBlocks) {
      const idMatch = rb.match(/^\s*['"]([^'"]+)['"]/);
      const nameMatch = rb.match(/name:\s*['"]([^'"]+)['"]/);
      const labelMatch = rb.match(/label:\s*['"]([^'"]+)['"]/);
      const imageMatch = rb.match(/image:\s*(`[^`]+`|['"][^'"]+['"])/);
      
      const id = idMatch ? idMatch[1] : 'unknown';
      const name = nameMatch ? nameMatch[1] : (labelMatch ? labelMatch[1] : '');
      const rawImg = imageMatch ? imageMatch[1].replace(/['"`]/g, '') : '';
      
      let status = 'OK';
      let foundPath = null;

      if (!rawImg || rawImg.includes('placehold.co')) {
        status = 'MISSING_OR_PLACEHOLDER';
      } else {
        // Check if rawImg resolves locally
        let cleanRel = rawImg.replace(/^\$\{IMG_BASE_URL\}/, '').replace(/^https?:\/\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/public-backup/, '');
        if (cleanRel.startsWith('http')) {
          status = 'EXTERNAL_URL';
        } else {
          if (!cleanRel.startsWith('/')) cleanRel = '/' + cleanRel;
          if (publicPhysicalFiles[cleanRel]) {
            foundPath = cleanRel;
            status = 'EXISTS_LOCAL';
          } else {
            status = 'BROKEN_LOCAL_PATH';
          }
        }
      }

      // Check matching physical image in backup or public
      const nameNorm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const idNorm = id.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const backupMatches = Object.keys(backupPhysicalFiles).filter(k => k.includes(nameNorm) || (idNorm.length > 3 && k.includes(idNorm)));
      const publicMatches = Object.keys(publicPhysicalFiles).filter(k => k.includes(nameNorm) || (idNorm.length > 3 && k.includes(idNorm)));

      report.push({
        block,
        file,
        id,
        name,
        rawImg,
        status,
        backupMatches,
        publicMatches: publicMatches.slice(0, 3)
      });
    }
  }
}

console.log(`\nExtracted ${report.length} total rooms from src/data.`);

const statusCounts = {};
report.forEach(r => statusCounts[r.status] = (statusCounts[r.status] || 0) + 1);
console.log('\nStatus summary:', statusCounts);

console.log('\n--- SAMPLE BROKEN/MISSING ROOMS AND POTENTIAL MATCHES ---');
report.filter(r => r.status !== 'EXISTS_LOCAL').slice(0, 35).forEach(r => {
  console.log(`[${r.block}/${r.file}] ID: "${r.id}" Name: "${r.name}"`);
  console.log(`   Current Image: "${r.rawImg}" (Status: ${r.status})`);
  if (r.backupMatches.length > 0) {
    console.log(`   💡 Found in Backup:`, r.backupMatches);
  }
  if (r.publicMatches.length > 0) {
    console.log(`   💡 Found in Public:`, r.publicMatches);
  }
  console.log('');
});
