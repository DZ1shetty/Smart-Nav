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

    console.log(`🔍 Scanning ${dir}...`);
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      if (line.includes('boundaryVertices')) {
        // Find the index of 'boundaryVertices'
        let idx = 0;
        while ((idx = line.indexOf('boundaryVertices', idx)) !== -1) {
          // Look for the next '[' after it
          const startIdx = line.indexOf('[', idx);
          if (startIdx !== -1 && startIdx - idx < 100) {
            // Find the matching ']'
            let depth = 1;
            let endIdx = startIdx + 1;
            while (depth > 0 && endIdx < line.length) {
              if (line[endIdx] === '[') depth++;
              else if (line[endIdx] === ']') depth--;
              endIdx++;
            }
            if (depth === 0) {
              const arrayStr = line.substring(startIdx, endIdx);
              // Clean up escaped characters if any
              const cleanStr = arrayStr.replace(/\\"/g, '"').replace(/\\n/g, '\n');
              try {
                // Try parsing or clean it up
                console.log(`\nFound array in ${dir} line ${lineCount} (length ${cleanStr.length}):`);
                console.log(cleanStr.substring(0, 1000));
              } catch (e) {}
            }
          }
          idx += 'boundaryVertices'.length;
        }
      }
    }
  }
}

scan();
