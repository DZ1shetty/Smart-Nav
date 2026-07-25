import fs from 'fs';
import readline from 'readline';

const dirs = [
  '7e65fc7f-dd5b-4385-a7ce-a90f0a371971',
  '63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3'
];

async function scan() {
  for (const dir of dirs) {
    const logPath = `C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\${dir}\\.system_generated\\logs\\transcript.jsonl`;
    if (!fs.existsSync(logPath)) {
      console.log(`⚠️ Log for ${dir} does not exist.`);
      continue;
    }
    console.log(`🔍 Scanning ${dir}...`);
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      if (line.includes('boundaryVertices') && line.includes('svm')) {
        // Let's print the line count, the text in a range around 'boundaryVertices'
        const index = line.indexOf('boundaryVertices');
        const start = Math.max(0, index - 200);
        const end = Math.min(line.length, index + 2500);
        console.log(`\n--- Match in ${dir} line ${lineCount} ---`);
        console.log(line.substring(start, end));
      }
    }
  }
}

scan();
