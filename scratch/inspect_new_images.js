import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\4a210b4d-5deb-436b-9e68-b46504f04292';

const files = fs.readdirSync(brainDir)
  .filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')))
  .map(f => {
    const p = path.join(brainDir, f);
    const stat = fs.statSync(p);
    return { name: f, size: stat.size, mtime: stat.mtime };
  });

// Sort by mtime ascending
files.sort((a, b) => a.mtime - b.mtime);

console.log('Images in brain folder (sorted by mtime):');
files.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f.name} - ${f.size} bytes - ${f.mtime.toISOString()}`);
});
