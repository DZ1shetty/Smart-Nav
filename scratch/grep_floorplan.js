import fs from 'fs'

const content = fs.readFileSync('src/components/FloorPlan.jsx', 'utf8')
const lines = content.split('\n')

lines.forEach((line, index) => {
  if (line.includes('floorId')) {
    console.log(`${index + 1}: ${line.trim()}`)
  }
})
process.exit(0)
