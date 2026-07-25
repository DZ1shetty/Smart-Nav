import fs from 'fs';
import readline from 'readline';

async function scan() {
  const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7e65fc7f-dd5b-4385-a7ce-a90f0a371971\\.system_generated\\logs\\transcript.jsonl';
  if (!fs.existsSync(logPath)) return;

  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.toLowerCase().includes('fourth') || line.toLowerCase().includes('fourth-floor') || line.toLowerCase().includes('svm_fourth')) {
      if (line.includes('boundaryVertices') || line.includes('x":') || line.includes('y":')) {
        console.log(`\n--- Line ${lineCount} ---`);
        console.log(line.substring(0, 1000));
      }
    }
  }
}

scan();
