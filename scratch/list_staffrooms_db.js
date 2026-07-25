import fs from 'fs';

const dbData = JSON.parse(fs.readFileSync('scratch/ramanujan_second_db.json', 'utf8'));
const staffrooms = dbData.rooms.filter(r => r.type === 'staffroom');

console.log('--- DB STAFFROOMS ---');
staffrooms.forEach(r => {
  console.log(`ID: ${r.id}`);
  console.log(`Name: ${r.name}`);
  console.log(`Coords: x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}`);
  console.log(`Clickable: ${r.clickable}`);
  console.log(`Directions: ${r.directions}`);
  console.log('---');
});
