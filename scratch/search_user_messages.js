import fs from 'fs';
import readline from 'readline';

const dirs = [
  '7e65fc7f-dd5b-4385-a7ce-a90f0a371971',
  '63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3'
];

async function scan() {
  for (const dir of dirs) {
    const logPath = `C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\${dir}\\.system_generated\\logs\\transcript.jsonl`;
    if (!fs.existsSync(logPath)) continue;

    console.log(`🔍 Scanning ${dir} for user messages...`);
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT') {
          console.log(`\n[Line ${lineCount}] USER message:`);
          console.log(obj.content);
        }
      } catch (e) {}
    }
  }
}

scan();
