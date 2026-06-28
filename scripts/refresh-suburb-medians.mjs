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

// [slug, medianHousePrice, priceGrowth1yr, medianUnitPrice]
// Pass 1 (2026-06-28): inner east + inner south houses from PropertyValue (CoreLogic)
// Pass 2 (2026-06-28): inner west / CBD adjacent houses from PropertyValue
// Pass 3 (2026-06-28): all 30 unit medians from yourinvestmentpropertymag.com.au
//   (CoreLogic-sourced), plus 3 previously-missing house medians (spring-hill,
//   bowen-hills, brisbane-cbd) which PropertyValue 404'd but YIP carries.
// Kangaroo Point override: PropertyValue's $1.7M/36.36% reflects ~4 house sales
// in a unit-dominated suburb. Using a conservative middle-ground house figure;
// the unit median (the real market driver there) is now refreshed too.
const updates = [
  // Inner east + inner south
  ['bulimba',           2322500, 19.1,   1200000],
  ['hawthorne',         2300000, 9.52,    950000],
  ['balmoral',          2100000, 15.28,   937500],
  ['morningside',       1500000, 16.14,   910000],
  ['cannon-hill',       1700000, 20.2,    820000],
  ['east-brisbane',     1600000, 12.68,   752500],
  ['norman-park',       1800000, 19.02,   840000],
  ['camp-hill',         2000000, 14.14,  1077500],
  ['seven-hills',       1900000, 12.21,  1046000],
  ['murarrie',          1300000, 9.81,   1025000],
  ['coorparoo',         1700000, 18.62,   800000],
  ['tingalpa',          1200000, 7.21,    796000],
  ['carina',            1400000, 13.22,   977000],
  ['carina-heights',    1500000, 16.15,   905000],
  ['carindale',         1800000, 9.43,    930000],
  ['woolloongabba',     1400000, 13.11,   752500],
  ['greenslopes',       1400000, -0.75,   805000],
  ['holland-park-west', 1500000, 16.45,   852500],
  ['highgate-hill',     2000000, 8.04,    944980],
  ['kangaroo-point',    1500000, 10.0,    840000],  // conservative house; see note above
  ['mt-gravatt',        1400000, 25.69,   770000],
  ['mt-gravatt-east',   1400000, 17.11,   851000],

  // Inner west / CBD adjacent
  ['toowong',           1600000, 0.62,    840000],
  ['auchenflower',      1900000, 28.76,   840000],
  ['milton',            1500000, 16.14,   733500],
  ['bardon',            2000000, 10.49,  1175000],
  ['indooroopilly',     1800000, 9.5,     850000],
  ['spring-hill',       1300000, 29.37,   698500],
  ['bowen-hills',        720000, 22.45,   636333],
  ['brisbane-cbd',       727500, 14.39,   726000],
];

// Format an integer with underscore thousands separators (matches file style).
function fmtUnderscored(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

let src = await readFile(file, 'utf8');
let applied = 0;
const missed = [];

for (const [slug, house, growth, unit] of updates) {
  // Find this suburb's block by slug. Each block is bounded by the next slug
  // or end of array; we update the three fields within that block.
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
  if (typeof unit === 'number') {
    block = block.replace(/medianUnitPrice:\s*[\d_]+/, `medianUnitPrice: ${fmtUnderscored(unit)}`);
  }

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
