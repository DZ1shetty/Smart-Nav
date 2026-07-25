import fs from 'fs';
import readline from 'readline';

async function scan() {
  const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7e65fc7f-dd5b-4385-a7ce-a90f0a371971\\.system_generated\\logs\\transcript.jsonl';
  if (!fs.existsSync(logPath)) {
    console.log('Log file does not exist.');
    return;
  }
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

scan();
