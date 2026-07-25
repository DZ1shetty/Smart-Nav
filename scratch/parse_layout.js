import fs from 'fs';

let content = fs.readFileSync('scratch/svm_first_layout.json', 'utf16le');

// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 65279) {
  content = content.slice(1);
}

content = content.trim();

let data;
try {
  data = JSON.parse(content);
} catch (e) {
  console.log('First 50 chars code points:', content.substring(0, 50).split('').map(c => c.charCodeAt(0)));
  console.error('Failed to parse UTF-16LE:', e);
  process.exit(1);
}

console.log('--- BOUNDARY VERTICES ---');
console.log(JSON.stringify(data.boundaryVertices, null, 2));

console.log('--- ROOMS ---');
const roomCoords = data.rooms.map(r => ({
  id: r.id,
  name: r.name,
  x: r.x,
  y: r.y,
  w: r.w || r.width,
  h: r.h || r.height
}));
console.log(JSON.stringify(roomCoords, null, 2));
