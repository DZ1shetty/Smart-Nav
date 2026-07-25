import fs from 'fs';
import path from 'path';

const baseDir = './src/data';
const block = 'cv-raman-block';

const blockDir = path.join(baseDir, block);
const files = fs.readdirSync(blockDir).filter(f => f.endsWith('.js') && f !== 'floors.js');

files.forEach(file => {
  const filePath = path.join(blockDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n========================================`);
  console.log(`FILE: ${block}/${file}`);
  console.log(`========================================`);
  
  let inRoom = false;
  let roomLines = [];
  let startLineIdx = -1;
  
  lines.forEach((line, idx) => {
    if (line.includes('{') && line.trim().startsWith('{')) {
      inRoom = true;
      roomLines = [line];
      startLineIdx = idx;
    } else if (inRoom) {
      roomLines.push(line);
      if (line.includes('}') && (line.trim().endsWith('}') || line.trim() === '},' || line.trim() === '}')) {
        inRoom = false;
        const roomStr = roomLines.join('\n');
        if (roomStr.toLowerCase().includes('stairs') || roomStr.toLowerCase().includes('stair')) {
          console.log(`Lines ${startLineIdx + 1}-${idx + 1}:`);
          console.log(roomStr);
        }
      }
    }
  });
});
