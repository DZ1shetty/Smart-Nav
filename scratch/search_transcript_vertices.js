import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3\\.system_generated\\logs\\transcript.jsonl';

async function searchLog() {
  if (!fs.existsSync(logPath)) {
    console.error('Log file does not exist at:', logPath);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('boundaryVertices') && line.includes('svm')) {
      console.log(`Line ${lineCount} contains boundaryVertices and svm`);
      // Print first 500 chars to avoid flooding
      console.log(line.substring(0, 800) + '...');
    }
  }
  process.exit(0);
}

searchLog();
