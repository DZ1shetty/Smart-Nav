import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\4a210b4d-5deb-436b-9e68-b46504f04292';
const dest1 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public\\ramanujan-block-images';
const dest2 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\OLD_LOCAL_DATA\\public-backup\\ramanujan-block-images';

const mapping = {
  'media__1782287816207.png': 'netravati.png',
  'media__1782287820797.png': 'lh401.png',
  'media__1782287825713.png': 'sr_jayapadmini.png',
  'media__1782287830653.png': 'hod_act_durga.png',
  'media__1782287842241.png': 'lh402_mca_cr.png',
  'media__1782287878218.png': 'sr_deepa.png',
  'media__1782287882932.png': 'csl13.png',
  'media__1782287887179.png': 'isl07.png',
  'media__1782287891475.png': 'coe_design.png',
  'media__1782287902426.png': 'photostat_centre.png',
  'media__1782287911902.png': 'isl06.png',
  'media__1782287916919.png': 'isl05.png',
  'media__1782287921376.png': 'ise_research_lab.png',
  'media__1782287937518.png': 'satoshi_kobayashi.png',
  'media__1782287942292.png': 'radio_station_ninada.png',
  'media__1782287952262.png': 'vtl01.png',
  'media__1782287963852.png': 'dept_vlsi.png',
  'media__1782287968445.png': 'cyber_security_hod.png'
};

// Ensure destinations exist
if (!fs.existsSync(dest1)) {
  fs.mkdirSync(dest1, { recursive: true });
}
if (!fs.existsSync(dest2)) {
  fs.mkdirSync(dest2, { recursive: true });
}

for (const [srcName, destName] of Object.entries(mapping)) {
  const srcPath = path.join(artifactsDir, srcName);
  if (!fs.existsSync(srcPath)) {
    console.error(`❌ Source file missing: ${srcPath}`);
    continue;
  }
  
  // copy to dest1
  const destPath1 = path.join(dest1, destName);
  fs.copyFileSync(srcPath, destPath1);
  console.log(`✅ Copied to ${destPath1}`);
  
  // copy to dest2
  const destPath2 = path.join(dest2, destName);
  fs.copyFileSync(srcPath, destPath2);
  console.log(`✅ Copied to ${destPath2}`);
}
console.log('🎉 Done copying images!');
