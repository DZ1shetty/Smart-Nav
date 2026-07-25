import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7e65fc7f-dd5b-4385-a7ce-a90f0a371971\\.system_generated\\logs\\transcript.jsonl';

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
  let matches = [];
  for await (const line of rl) {
    lineCount++;
    if (line.includes('boundaryVertices')) {
      matches.push({ lineNum: lineCount, length: line.length, snippet: line.substring(0, 300) });
    }
  }
  console.log(`Total lines: ${lineCount}`);
  console.log(`Matches: ${matches.length}`);
  for (const m of matches) {
    console.log(`Line ${m.lineNum} (len ${m.length}): ${m.snippet}...`);
  }
  process.exit(0);
}

searchLog();
