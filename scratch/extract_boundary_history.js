import fs from 'fs';
import path from 'path';
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
        // Try to find any array of vertices
        const regex = /"boundaryVertices"\s*:\s*(\[[^\]]+\])/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          try {
            const arr = JSON.parse(match[1]);
            // Check if it's not the default one:
            // Default has 12 items.
            // Let's print any boundaryVertices we find to inspect.
            console.log(`Line ${lineCount}: Found boundaryVertices array of length ${arr.length}`);
            console.log(JSON.stringify(arr));
          } catch (e) {
            // Might be incomplete json snippet
          }
        }
      }
    }
  }
}

scan();
