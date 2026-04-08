import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/pages/suburbs');

// Each entry: [slug, oldPricePhrase, newPricePhrase, oldDaysPhrase, newDaysPhrase]
// null = no change needed for that field
const updates = [
  ['balmoral',          '$1.85 million',              '$1.9 million',                         '28 to 45 days', '20 to 35 days'],
  ['belmont',           '$910,000',                   '$1.45 million to $1.5 million',         '30 to 45 days', '20 to 35 days'],
  ['brisbane-cbd',      '$680,000',                   '$750,000 to $800,000',                  '30 to 50 days', '25 to 45 days'],
  ['bulimba',           '$2 million',                 '$1.9 million',                          '28 to 45 days', '20 to 35 days'],
  ['camp-hill',         '$1.5 million',               '$1.75 million to $1.8 million',         '28 to 45 days', '20 to 35 days'],
  ['cannon-hill',       '$1.2 million',               '$1.5 million to $1.55 million',         '30 to 45 days', '20 to 35 days'],
  ['carina',            '$1 million',                 '$1.3 million',                          '30 to 45 days', '20 to 35 days'],
  ['carina-heights',    '$1.1 million',               '$1.45 million to $1.5 million',         '30 to 45 days', '20 to 35 days'],
  ['carindale',         '$1 million',                 '$1.55 million',                         '30 to 45 days', '20 to 35 days'],
  ['coorparoo',         '$1.35 million',              '$1.7 million to $1.75 million',         '28 to 42 days', '20 to 35 days'],
  ['east-brisbane',     '$1.4 million',               '$1.5 million to $1.55 million',         '28 to 42 days', '20 to 35 days'],
  ['fortitude-valley',  '$900,000',                   '$750,000 to $800,000',                  '30 to 50 days', '25 to 45 days'],
  ['greenslopes',       '$1.1 million',               '$1.35 million to $1.45 million',        '28 to 42 days', '20 to 35 days'],
  ['hawthorne',         '$1.9 million',               '$2.1 million to $2.2 million',          '28 to 42 days', '20 to 35 days'],
  ['hemmant',           '$820,000',                   '$1 million to $1.1 million',            '35 to 50 days', '25 to 40 days'],
  ['holland-park',      '$1.05 million',              '$1.4 million to $1.45 million',         '28 to 45 days', '20 to 35 days'],
  ['holland-park-west', '$1 million',                 '$1.4 million to $1.45 million',         '30 to 45 days', '20 to 35 days'],
  ['kangaroo-point',    null,                         null,                                    '28 to 42 days', '20 to 35 days'],
  ['morningside',       null,                         null,                                    '28 to 42 days', '20 to 35 days'],
  ['mount-gravatt',     '$1.1 million',               '$1.3 million',                          null,            null],
  ['mount-gravatt-east','$950,000 to $1 million',     '$1.1 million to $1.2 million',          null,            null],
  ['new-farm',          '$2 million',                 '$2.7 million to $2.8 million',          '30 to 50 days', '20 to 35 days'],
  ['norman-park',       '$1.4 million',               '$1.6 million to $1.7 million',          null,            null],
  ['tarragindi',        '$1.1 million',               '$1.1 million to $1.2 million',          '25 to 40 days', '20 to 35 days'],
  ['teneriffe',         '$2.5 million',               '$3.5 million to $4 million',            '28 to 45 days', '20 to 35 days'],
  ['tingalpa',          '$800,000 to $870,000',       '$1.2 million',                          '25 to 40 days', '20 to 35 days'],
  ['upper-mount-gravatt','$1 million to $1.1 million','$1.45 million to $1.5 million',         null,            null],
  ['woolloongabba',     '$1.3 million',               '$1.4 million',                          null,            null],
];

// Also fix mount-gravatt-east's separate mentions that appear as two items
const extraFixes = {
  'mount-gravatt-east': [
    ['$950,000 to \\$1 million', '$1.1 million to $1.2 million'],
  ],
  'tingalpa': [
    // In case "$800,000" and "$870,000" appear separately
    ['\\$800,000 to \\$870,000', '$1.2 million'],
    ['\\$800,000', '$1.2 million'],
    ['\\$870,000', '$1.2 million'],
  ],
};

let totalUpdated = 0;

for (const [slug, oldPrice, newPrice, oldDays, newDays] of updates) {
  const filePath = path.join(dir, `${slug}.astro`);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING: ${slug}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (oldPrice && newPrice) {
    if (content.includes(oldPrice)) {
      content = content.replace(oldPrice, newPrice);
      changed = true;
    } else {
      console.log(`  WARN: price "${oldPrice}" not found in ${slug}`);
    }
  }

  if (oldDays && newDays) {
    if (content.includes(oldDays)) {
      content = content.replace(oldDays, newDays);
      changed = true;
    } else {
      console.log(`  WARN: days "${oldDays}" not found in ${slug}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`UPDATED: ${slug}`);
    totalUpdated++;
  } else if (!oldPrice && !oldDays) {
    console.log(`SKIP (no changes needed): ${slug}`);
  } else {
    console.log(`NO CHANGE: ${slug}`);
  }
}

console.log(`\nDone. Updated: ${totalUpdated} files`);
