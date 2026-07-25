import fs from 'fs';
import readline from 'readline';

const dirs = [
  '7e65fc7f-dd5b-4385-a7ce-a90f0a371971',
  '63bfc7c9-4ee7-4ae4-ae2f-6f33d867e6f3'
];

function findKey(obj, targetKey, results = []) {
  if (!obj || typeof obj !== 'object') return results;
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      findKey(item, targetKey, results);
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (key === targetKey) {
        results.push(value);
      } else if (typeof value === 'object') {
        findKey(value, targetKey, results);
      } else if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        // Try parsing stringified JSON
        try {
          const parsed = JSON.parse(value);
          findKey(parsed, targetKey, results);
        } catch (e) {
          // ignore
        }
      }
    }
  }
  return results;
}

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
      try {
        const obj = JSON.parse(line);
        const verticesList = findKey(obj, 'boundaryVertices');
        for (const list of verticesList) {
          if (Array.isArray(list) && list.length > 0) {
            // Check if it has a unique length or different coordinates
            console.log(`Line ${lineCount} in ${dir}: Length ${list.length}`);
            console.log(JSON.stringify(list));
          }
        }
      } catch (e) {
        // Line parsing failed
      }
    }
  }
}

scan();
