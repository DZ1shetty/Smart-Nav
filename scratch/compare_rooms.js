import fs from 'fs';
import * as floors from '../src/data/svm-block/floors.js';

const dbData = JSON.parse(fs.readFileSync('scratch/db_fourth_layout.json', 'utf8'));
const staticRooms = floors.fourth.rooms; // createFloorConfig gives fourth.rooms

console.log(`DB rooms count: ${dbData.rooms.length}`);
console.log(`Static rooms count: ${staticRooms.length}`);

for (const dbRoom of dbData.rooms) {
  const staticRoom = staticRooms.find(r => r.id === dbRoom.id || r.id === dbRoom.id.replace('svm-fourth-', 'svm-fourth-'));
  if (!staticRoom) {
    console.log(`❌ Room ${dbRoom.id} not found in static rooms!`);
  } else {
    const diff = [];
    if (dbRoom.x !== staticRoom.x) diff.push(`x: ${staticRoom.x} -> ${dbRoom.x}`);
    if (dbRoom.y !== staticRoom.y) diff.push(`y: ${staticRoom.y} -> ${dbRoom.y}`);
    if (dbRoom.w !== staticRoom.w) diff.push(`w: ${staticRoom.w} -> ${dbRoom.w}`);
    if (dbRoom.h !== staticRoom.h) diff.push(`h: ${staticRoom.h} -> ${dbRoom.h}`);
    if (dbRoom.width !== staticRoom.width) diff.push(`width: ${staticRoom.width} -> ${dbRoom.width}`);
    if (dbRoom.height !== staticRoom.height) diff.push(`height: ${staticRoom.height} -> ${dbRoom.height}`);
    
    if (diff.length > 0) {
      console.log(`⚠️ Room ${dbRoom.id} diff: ${diff.join(', ')}`);
    }
  }
}
