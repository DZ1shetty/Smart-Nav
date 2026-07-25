import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\b676249b-e688-4a6d-a6c0-273ebb346e4b';
const dest1 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public\\ramanujan-block-images';
const dest2 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\OLD_LOCAL_DATA\\public-backup\\ramanujan-block-images';

const mapping = {
  'media__1782141566689.png': 'dr_add_mrc.png',
  'media__1782141577405.png': 'lh207.png',
  'media__1782141584300.png': 'lh208.png',
  'media__1782141610474.png': 'lh206.png',
  'media__1782141617668.jpg': 'lh205.jpg',
  'media__1782141733024.png': 'ec_sr.png',
  'media__1782141744859.png': 'techno_cultural.png',
  'media__1782141750670.png': 'cad_cam_lab.png',
  'media__1782141755656.png': 'mech_hod.png',
  'media__1782141767865.png': 'mech_office.png',
  'media__1782141795546.png': 'mech_sr_bottom.png',
  'media__1782141806800.jpg': 'research_lab.jpg',
  'media__1782141813791.png': 'lh202.png',
  'media__1782141818944.png': 'mech_dept_lh.png',
  'media__1782141838970.png': 'lh204.png',
  'media__1782141855780.png': 'vlsi_lab.png',
  'media__1782141867028.png': 'lh201.png',
  'media__1782141880381.png': 'dept_library.png',
  'media__1782141891146.png': 'mech_sr_left.png',
  'media__1782141906152.png': 'marakala_pai_rao.png',
  'media__1782141911143.png': 'dr_vs.png',
  'media__1782141915931.png': 'dr_ravindra.png',
  'media__1782141944215.png': 'arm_processor_lab.png',
  'media__1782141951571.jpg': 'phalguni.jpg',
  'media__1782141966897.png': 'dr_nithin.png',
  'media__1782141971424.png': 'dr_vishwanath.png'
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
