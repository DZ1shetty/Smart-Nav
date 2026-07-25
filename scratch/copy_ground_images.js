import fs from 'fs';
import path from 'path';

// Target public assets folder
const publicDir = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Uploaded files mapped by matching user request order:
// 1. media__1780506717394.png -> NC 01 door image
// 2. media__1780506726322.png -> RS & GIS Laboratory door image
// 3. media__1780506734183.jpg -> NITTE NMAM Institute Civil Dept board image
// 4. media__1780506740545.png -> Civil Department corridor / Arun Kumar Bhat cabin door image
// 5. media__1780506746649.png -> Staff Room 02 door image

const filesToCopy = [
  { srcName: 'media__1780506717394.png', destName: 'nc01_door.png' },
  { srcName: 'media__1780506726322.png', destName: 'rs_gis_lab_door.png' },
  { srcName: 'media__1780506734183.jpg', destName: 'civil_dept_board.jpg' },
  { srcName: 'media__1780506740545.png', destName: 'civil_dept_corridor.png' },
  { srcName: 'media__1780506746649.png', destName: 'staff_room_02_door.png' }
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
