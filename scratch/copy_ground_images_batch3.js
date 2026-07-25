import fs from 'fs';
import path from 'path';

const publicDir = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Map files:
// Batch 2:
// 1. media__1780506981551.png -> PG Lecture Hall 02
// 2. media__1780506988450.png -> Staff Room 01
// 3. media__1780506997627.png -> Department Library
// 4. media__1780507025942.png -> SMV 01
// 5. media__1780507037476.png -> Surveying Laboratory
// Batch 3:
// 6. media__1780507063194.png -> Environmental Engineering Lab
// 7. media__1780507068381.png -> Geotechnical Engineering Lab
// 8. media__1780507073887.png -> Fire Exit

const filesToCopy = [
  { srcName: 'media__1780506981551.png', destName: 'pg_lecture_hall_02_door.png' },
  { srcName: 'media__1780506988450.png', destName: 'staff_room_01_door.png' },
  { srcName: 'media__1780506997627.png', destName: 'department_library_door.png' },
  { srcName: 'media__1780507025942.png', destName: 'smv01_door.png' },
  { srcName: 'media__1780507037476.png', destName: 'surveying_lab_door.png' },
  { srcName: 'media__1780507063194.png', destName: 'environmental_lab_door.png' },
  { srcName: 'media__1780507068381.png', destName: 'geotechnical_lab_door.png' },
  { srcName: 'media__1780507073887.png', destName: 'fire_exit_door.png' }
];

const srcDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3';

filesToCopy.forEach(item => {
  const srcPath = path.join(srcDir, item.srcName);
  const destPath = path.join(publicDir, item.destName);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${item.srcName} -> public/${item.destName}`);
  } else {
    console.error(`❌ Source file missing: ${srcPath}`);
  }
});

process.exit(0);
