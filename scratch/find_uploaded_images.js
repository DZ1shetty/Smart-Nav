import fs from 'fs';
import path from 'path';

const appDataDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3';

function scanDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(filePath));
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        results.push({
          path: filePath,
          size: stat.size,
          mtime: stat.mtime
        });
      }
    }
  }
  return results;
}

const images = scanDir(appDataDir);
// Sort by modification time desc
images.sort((a, b) => b.mtime - a.mtime);

console.log(`Found ${images.length} images:`);
for (const img of images.slice(0, 20)) {
  console.log(`- Path: ${img.path}`);
  console.log(`  Mtime: ${img.mtime.toISOString()}`);
  console.log(`  Size: ${img.size} bytes`);
}
process.exit(0);
