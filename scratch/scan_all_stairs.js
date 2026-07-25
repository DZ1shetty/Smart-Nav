import fs from 'fs';
import path from 'path';

const baseDir = './src/data';
const blocks = ['cv-raman-block', 'ramanujan-block', 'smv-block', 'atal-block', 'rajraman-block'];
let outputLines = [];

blocks.forEach(block => {
  const blockDir = path.join(baseDir, block);
  if (!fs.existsSync(blockDir)) return;
  const files = fs.readdirSync(blockDir).filter(f => f.endsWith('.js') && f !== 'floors.js');

  files.forEach(file => {
    const filePath = path.join(blockDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
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
            try {
              const idMatch = roomStr.match(/"?id"?:\s*["'`](.*?)["'`]/);
              const nameMatch = roomStr.match(/"?name"?:\s*["'`](.*?)["'`]/);
              const labelMatch = roomStr.match(/"?label"?:\s*["'`](.*?)["'`]/);
              const xMatch = roomStr.match(/"?x"?:\s*(-?\d+)/);
              const yMatch = roomStr.match(/"?y"?:\s*(-?\d+)/);
              const wMatch = roomStr.match(/"?w"?:\s*(\d+)/);
              const hMatch = roomStr.match(/"?h"?:\s*(\d+)/);
              
              const id = idMatch ? idMatch[1] : 'unknown';
              const name = nameMatch ? nameMatch[1] : 'unknown';
              const label = labelMatch ? labelMatch[1] : 'unknown';
              const x = xMatch ? parseInt(xMatch[1]) : 0;
              const y = yMatch ? parseInt(yMatch[1]) : 0;
              const w = wMatch ? parseInt(wMatch[1]) : 0;
              const h = hMatch ? parseInt(hMatch[1]) : 0;
              
              outputLines.push(`${block}/${file} | ID: ${id} | Name: ${name} | Label: ${label} | x: ${x}, y: ${y}, w: ${w}, h: ${h} (Lines ${startLineIdx+1}-${idx+1})`);
            } catch (e) {
              outputLines.push(`Failed parsing room in ${block}/${file}: ${e.message}`);
            }
          }
        }
      }
    });
  });
});

fs.writeFileSync('scratch/all_stairs_scan.txt', outputLines.join('\n'), 'utf8');
console.log('Saved scan results to scratch/all_stairs_scan.txt');
