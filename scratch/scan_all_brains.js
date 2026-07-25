import fs from 'fs';
import path from 'path';
import readline from 'readline';

const brainDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain';

async function scan() {
  if (!fs.existsSync(brainDir)) {
    console.error('Brain directory does not exist!');
    process.exit(1);
  }

  const items = fs.readdirSync(brainDir);
  for (const item of items) {
    const logPath = path.join(brainDir, item, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(logPath)) continue;

    console.log(`🔍 Scanning ${item}...`);
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      if (line.includes('boundaryVertices') && line.includes('svm')) {
        // Find any coordinates like "480" or "400" in boundaryVertices
        if (line.includes('480') || line.includes('400') || line.includes('1279') || line.includes('1566')) {
          console.log(`✨ Match found in ${item} line ${lineCount}!`);
          const index = line.indexOf('boundaryVertices');
          console.log(line.substring(Math.max(0, index - 100), Math.min(line.length, index + 2000)));
        }
      }
    }
  }
}

scan();
