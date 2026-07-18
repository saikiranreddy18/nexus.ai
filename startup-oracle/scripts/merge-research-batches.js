// Merge all research batch files into cases.json, deduping by company name
import fs from 'fs';
import path from 'path';

const batchDir = './data/research-batches';
const files = fs.readdirSync(batchDir).filter(f => f.endsWith('.json'));

const seen = new Map();
let totalRaw = 0;

for (const file of files) {
  const filePath = path.join(batchDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  let cases;
  try {
    cases = JSON.parse(content);
  } catch (e) {
    console.error(`Failed to parse ${file}: ${e.message}`);
    continue;
  }
  totalRaw += cases.length;
  for (const c of cases) {
    const key = c.name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, c);
    }
  }
}

const merged = Array.from(seen.values());

// Sort: failures first, then successes, alphabetically within each
merged.sort((a, b) => {
  if (a.outcome !== b.outcome) return a.outcome === 'failed' ? -1 : 1;
  return a.name.localeCompare(b.name);
});

fs.writeFileSync('./data/cases.json', JSON.stringify(merged, null, 2));

const outcomes = merged.reduce((acc, c) => {
  acc[c.outcome] = (acc[c.outcome] || 0) + 1;
  return acc;
}, {});

console.log(`Raw entries across ${files.length} batches: ${totalRaw}`);
console.log(`After dedup: ${merged.length} unique companies`);
console.log(`Outcomes:`, outcomes);
console.log(`Written to data/cases.json`);
