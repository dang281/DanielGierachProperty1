#!/usr/bin/env node
/**
 * Bulk-injects the <SuburbDeepDive> component into every src/pages/suburbs/*.astro
 * file that does not already contain it.
 *
 * For each suburb page:
 *  1. Adds `import SuburbDeepDive from '../../components/SuburbDeepDive.astro';`
 *     after the existing imports (if not present).
 *  2. Inserts `<SuburbDeepDive slug="..." name="..." />` immediately before the
 *     first <Method ... /> component, or before <SuburbMap /> if no Method.
 *
 * The slug is derived from the filename. The name is derived by reading the
 * Layout title attribute or matching the slug to a sensible Title Case form.
 *
 *   node scripts/inject-suburb-deepdive.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SUBURBS_DIR = path.join(ROOT, 'src/pages/suburbs');

const NAME_OVERRIDES = {
  'brisbane-cbd': 'Brisbane CBD',
};

function slugToName(slug) {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function processFile(file) {
  const slug = path.basename(file, '.astro');
  if (slug === 'index') return { slug, status: 'skipped (index)' };

  const narrativePath = path.join(ROOT, 'content/suburbs', `${slug}-narrative.md`);
  if (!fs.existsSync(narrativePath)) {
    return { slug, status: 'skipped (no narrative)' };
  }

  const filePath = path.join(SUBURBS_DIR, file);
  let src = fs.readFileSync(filePath, 'utf8');

  if (src.includes('SuburbDeepDive')) {
    return { slug, status: 'already injected' };
  }

  const name = slugToName(slug);

  const importLine = "import SuburbDeepDive from '../../components/SuburbDeepDive.astro';";
  const importInsertRe = /(import\s+\w+\s+from\s+'[^']+';\s*\n)+/;
  const importMatch = src.match(importInsertRe);
  if (importMatch) {
    const insertPos = importMatch.index + importMatch[0].length;
    src = src.slice(0, insertPos) + importLine + '\n' + src.slice(insertPos);
  } else {
    return { slug, status: 'failed (no import block found)' };
  }

  const componentBlock = `<!-- DEEP-DIVE: transport, schools, pockets, lifestyle, buyer profile, selling approach, comparables -->\n<SuburbDeepDive slug="${slug}" name="${name}" />\n\n`;

  const methodRe = /(<Method\b)/;
  const suburbMapRe = /(<SuburbMap\b)/;

  if (methodRe.test(src)) {
    src = src.replace(methodRe, componentBlock + '$1');
  } else if (suburbMapRe.test(src)) {
    src = src.replace(suburbMapRe, componentBlock + '$1');
  } else {
    return { slug, status: 'failed (no Method or SuburbMap anchor)' };
  }

  fs.writeFileSync(filePath, src);
  return { slug, status: 'injected' };
}

function main() {
  const files = fs.readdirSync(SUBURBS_DIR).filter((f) => f.endsWith('.astro'));
  const results = files.map(processFile);

  const grouped = {};
  for (const r of results) {
    grouped[r.status] = (grouped[r.status] || 0) + 1;
  }

  console.log('Suburb deep-dive injection summary:');
  for (const [status, count] of Object.entries(grouped)) {
    console.log(`  ${status}: ${count}`);
  }

  const failures = results.filter((r) => r.status.startsWith('failed'));
  if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  ${f.slug}: ${f.status}`);
    process.exit(1);
  }
}

main();
