import fs from 'fs';
import path from 'path';

const publicDir = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Uploaded files mapped by matching user request order:
// 1. media__1780506981551.png -> PG Lecture Hall 02
// 2. media__1780506988450.png -> Staff Room 01
// 3. media__1780506997627.png -> Department Library
// 4. media__1780507025942.png -> SMV 01
// 5. media__1780507037476.png -> Surveying Laboratory

const filesToCopy = [
  { srcName: 'media__1780506981551.png', destName: 'pg_lecture_hall_02_door.png' },
  { srcName: 'media__1780506988450.png', destName: 'staff_room_01_door.png' },
  { srcName: 'media__1780506997627.png', destName: 'department_library_door.png' },
  { srcName: 'media__1780507025942.png', destName: 'smv01_door.png' },
  { srcName: 'media__1780507037476.png', destName: 'surveying_lab_door.png' }
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
