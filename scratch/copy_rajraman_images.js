import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\4a210b4d-5deb-436b-9e68-b46504f04292';
const dest1 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\public\\rajraman-block-images';
const dest2 = 'd:\\Programming Trash\\Programming Trash\\SNSFSE(Major Project)\\MJ\\Major_Project\\OLD_LOCAL_DATA\\public-backup\\rajraman-block-images';

const mapping = {
  'media__1782304021484.png': 'lab3.png',
  'media__1782304026354.png': 'hod_muralidhara.png',
  'media__1782304036823.png': 'lab2.png',
  'media__1782304075008.png': 'lab1.png',
  'media__1782304088752.png': 'dept_office.png',
  'media__1782304173094.png': 'gd3_prasad.png',
  'media__1782304177927.png': 'gd2_vincent.png',
  'media__1782304184204.png': 'gd3_tanya.png',
  'media__1782304195999.png': 'assoc_rashmi.png',
  'media__1782321629046.png': 'server_battery.png',
  'media__1782321633672.png': 'mca_staff_room.png',
  'media__1782321639006.png': 'lab5.png',
  'media__1782321643928.jpg': 'lab6.jpg',
  'media__1782321648495.png': 'lab4.png',
  'media__1782321698450.png': 'mca_staffroom_roshan.png',
  'media__1782321702905.png': 'mca_staffroom_saritha.png',
  'media__1782321707445.png': 'robotics_club.png',
  'media__1782321711572.png': 'gd1_ankitha.png',
  'media__1782321716013.png': 'gd2_rajashree.png',
  'media__1782321740167.png': 'gd3_ranjith.png',
  'media__1782321751766.png': 'gd3_adarsh.png',
  'media__1782321756764.png': 'assoc_veeresha.png',
  'media__1782323145197.png': 'gd1_premitha.png',
  'media__1782323149572.png': 'gd2_arhath.png',
  'media__1782323166277.png': 'gd3_praveena.png',
  'media__1782323185592.png': 'hod_mca_mamatha.png',
  'media__1782323191180.png': 'mca_office.png',
  'media__1782323233201.png': 'gd3_spoorthi.png',
  'media__1782323246910.png': 'gd3_mangala.png',
  'media__1782323253957.png': 'gd3_pallavi.png',
  'media__1782323266178.png': 'prof_surendra.png',
  'media__1782323278285.png': 'mca_lab3.png',
  'media__1782323290953.png': 'mca_lab2.png',
  'media__1782323316909.png': 'mca_lab4.png',
  'media__1782323324048.png': 'mca_lab1.png',
  'media__1782323328557.png': 'prof_anantha.png',
  'media__1782323333993.png': 'prof_harshitha.png',
  'media__1782323358304.png': 'mca_research_lab1.png',
  'media__1782324051954.png': 'vayurvya_aero_club.png',
  'media__1782324056514.png': 'mca_research_lab2.png'
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
console.log('🎉 Done copying Rajraman images!');
