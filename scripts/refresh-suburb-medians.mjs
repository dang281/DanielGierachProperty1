#!/usr/bin/env node
/**
 * Apply refreshed PropertyValue.com.au (CoreLogic) data to src/data/suburbs.ts.
 * Data fetched 2026-06-28. Updates medianHousePrice and priceGrowth1yr only;
 * unit prices left as-is (PropertyValue gates unit data behind a paywall).
 *
 * Bulimba uses Daniel's directly verified figure ($2,322,500), the agent's
 * PropertyValue read was a rounded $2,300,000.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, '..', 'src', 'data', 'suburbs.ts');

// [slug, medianHousePrice, priceGrowth1yr]
const updates = [
  ['bulimba',           2322500, 19.1],
  ['hawthorne',         2300000, 9.52],
  ['balmoral',          2100000, 15.28],
  ['morningside',       1500000, 16.14],
  ['cannon-hill',       1700000, 20.2],
  ['east-brisbane',     1600000, 12.68],
  ['norman-park',       1800000, 19.02],
  ['camp-hill',         2000000, 14.14],
  ['seven-hills',       1900000, 12.21],
  ['murarrie',          1300000, 9.81],
  ['coorparoo',         1700000, 18.62],
  ['tingalpa',          1200000, 7.21],
  ['carina',            1400000, 13.22],
  ['carina-heights',    1500000, 16.15],
  ['carindale',         1800000, 9.43],
  ['woolloongabba',     1400000, 13.11],
  ['greenslopes',       1400000, -0.75],
  ['holland-park-west', 1500000, 16.45],
  ['highgate-hill',     2000000, 8.04],
  ['kangaroo-point',    1700000, 36.36],
  ['mt-gravatt',        1400000, 25.69],
  ['mt-gravatt-east',   1400000, 17.11],
];

// Format an integer with underscore thousands separators (matches file style).
function fmtUnderscored(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

let src = await readFile(file, 'utf8');
let applied = 0;
const missed = [];

for (const [slug, house, growth] of updates) {
  // Find this suburb's block by slug. Each block is bounded by the next slug
  // or end of array; we update the two fields within that block.
  const slugRx = new RegExp(`(slug:\\s*'${slug}'[\\s\\S]*?})`, 'm');
  const match = src.match(slugRx);
  if (!match) {
    missed.push(`${slug} (slug not found)`);
    continue;
  }
  let block = match[1];
  const before = block;

  block = block.replace(/medianHousePrice:\s*[\d_]+/, `medianHousePrice: ${fmtUnderscored(house)}`);
  block = block.replace(/priceGrowth1yr:\s*-?[\d.]+/, `priceGrowth1yr: ${growth}`);

  if (block === before) {
    missed.push(`${slug} (regex matched slug but fields unchanged)`);
    continue;
  }
  src = src.replace(before, block);
  applied += 1;
}

await writeFile(file, src);
console.log(`Applied ${applied}/${updates.length} suburb updates to ${file.replace(resolve(__dirname, '..'), '.')}`);
if (missed.length) {
  console.log('\nMissed:');
  for (const m of missed) console.log(`  ${m}`);
}
