import { second } from '../src/data/ramanujan-block/second.js';

console.log('--- STATIC ROOMS ---');
second.rooms.forEach(r => {
  console.log(`ID: ${r.id}`);
  console.log(`Name: ${r.name}`);
  console.log(`Type: ${r.type}`);
  console.log(`Coords: x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}`);
  console.log('---');
});
