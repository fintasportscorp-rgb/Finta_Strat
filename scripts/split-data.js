#!/usr/bin/env node
/**
 * Splits the monolithic formation-battles.json into per-opponent-formation files.
 *
 * Input shape:  data[yourFormation][yourTier][oppFormation][oppTier] = Battle
 * Output shape: opponent/{oppFormation}.json
 *               → data[yourFormation][yourTier][oppTier] = Battle
 *
 * Also writes opponent/index.json listing all available opponent formations.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../public/data/formation-battles.json');
const OUT_DIR = path.join(__dirname, '../public/data/opponent');

console.log('Reading source file…');
const raw = fs.readFileSync(SRC, 'utf8');
console.log(`Parsing ${(raw.length / 1e6).toFixed(1)} MB…`);
const data = JSON.parse(raw);

fs.mkdirSync(OUT_DIR, { recursive: true });

// Collect all opponent formations
const oppSet = new Set();
for (const byTier of Object.values(data)) {
  for (const byOpp of Object.values(byTier)) {
    if (!byOpp) continue;
    for (const opp of Object.keys(byOpp)) oppSet.add(opp);
  }
}
const opponents = [...oppSet].sort();
console.log(`Found ${opponents.length} opponent formations.`);

// Write index
fs.writeFileSync(
  path.join(OUT_DIR, 'index.json'),
  JSON.stringify({ formations: opponents }),
);
console.log('Wrote index.json');

// Write one file per opponent
for (const opp of opponents) {
  // shape: { [yourFormation]: { [yourTier]: { [oppTier]: Battle } } }
  const slice = {};
  for (const [yourFormation, byTier] of Object.entries(data)) {
    const tierSlice = {};
    for (const [yourTier, byOpp] of Object.entries(byTier)) {
      if (!byOpp || !byOpp[opp]) continue;
      tierSlice[yourTier] = byOpp[opp]; // { [oppTier]: Battle }
    }
    if (Object.keys(tierSlice).length > 0) {
      slice[yourFormation] = tierSlice;
    }
  }
  const filename = opp.replace(/\//g, '_') + '.json';
  fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(slice));
  process.stdout.write('.');
}
console.log(`\nDone — ${opponents.length} files written to public/data/opponent/`);
