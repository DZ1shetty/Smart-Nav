const fs = require('fs');
const path = 'src/components/ui/BuildingMonolithPreview.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const part1 = lines.slice(0, 316); 
const callouts = lines.slice(316, 405); 
const part2 = lines.slice(405, 509);
const part3 = lines.slice(509); // ends

// Modify part1 grid wrappers
for (let i = 0; i < part1.length; i++) {
  if (part1[i].includes('className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start my-1"')) {
    part1[i] = '      <div className="flex flex-col gap-8 md:gap-12 mt-4 md:mt-8 mb-4 w-full mx-auto max-w-7xl">\n        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">';
  }
  if (part1[i].includes('className="lg:col-span-6 flex flex-col gap-3.5"')) {
    part1[i] = '          <div className="lg:col-span-6 flex flex-col gap-5">';
  }
}

// Modify callouts wrapper class
for (let i = 0; i < callouts.length; i++) {
  if (callouts[i].includes('className="grid grid-cols-1 md:grid-cols-3 gap-2.5"')) {
    callouts[i] = '          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">';
  }
}

// Reassemble
const result = [
  ...part1,
  ...part2,
  '        </div>', // close lg:grid-cols-12
  '        {/* BOTTOM ROW: 3 CALLOUTS (Full Width Symmetry) */}',
  '        <div className="w-full mt-2 md:mt-4">',
  ...callouts,
  '        </div>', // close bottom row wrapper
  ...part3
].join('\n');

fs.writeFileSync(path, result);
