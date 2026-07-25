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
    // Let's look for Firestore document sets or updates containing "boundaryVertices"
    if (line.includes('boundaryVertices') && line.includes('docName') && line.includes('set')) {
      console.log(`Line ${lineCount}:`);
      console.log(line.substring(0, 1000) + '...');
    }
    // Also look for when the user says "save the outline" or similar
    if (line.includes('save') && line.includes('outline')) {
      console.log(`Line ${lineCount} (save outline):`);
      console.log(line.substring(0, 500) + '...');
    }
    // Let's print any JSON containing "boundaryVertices" that has more than 4 vertices
    if (line.includes('boundaryVertices') && line.includes('x') && line.split('x').length > 5) {
      console.log(`Line ${lineCount} (many vertices):`);
      console.log(line.substring(0, 1000) + '...');
    }
  }
  process.exit(0);
}

searchLog();
