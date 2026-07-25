import fs from 'fs';
import { second as staticSecond } from '../src/data/ramanujan-block/second.js';

const dbData = JSON.parse(fs.readFileSync('scratch/ramanujan_second_db.json', 'utf8'));
const staticRooms = staticSecond.rooms;

console.log(`DB rooms count: ${dbData.rooms.length}`);
console.log(`Static rooms count: ${staticRooms.length}`);

console.log('\n--- Rooms in DB but not in static ---');
let dbOnlyCount = 0;
for (const dbRoom of dbData.rooms) {
  const staticRoom = staticRooms.find(r => r.id === dbRoom.id);
  if (!staticRoom) {
    console.log(`❌ Room in DB: ${dbRoom.id} (${dbRoom.name}) - coords: (${dbRoom.x}, ${dbRoom.y})`);
    dbOnlyCount++;
  }
}
console.log(`Total DB-only rooms: ${dbOnlyCount}`);

console.log('\n--- Rooms in static but not in DB ---');
let staticOnlyCount = 0;
for (const staticRoom of staticRooms) {
  const dbRoom = dbData.rooms.find(r => r.id === staticRoom.id);
  if (!dbRoom) {
    console.log(`❌ Room in Static: ${staticRoom.id} (${staticRoom.name}) - coords: (${staticRoom.x}, ${staticRoom.y})`);
    staticOnlyCount++;
  }
}
console.log(`Total Static-only rooms: ${staticOnlyCount}`);
