#!/usr/bin/env node
/**
 * One-shot: add `border-radius:8px;` to every inline button style that
 * doesn't already have one. Idempotent: re-running is safe.
 *
 * A "button style" is identified inside a single `style="..."` attribute when:
 *   - it has a `padding:` value, AND
 *   - it has EITHER `background:#b98229` / `background:#b98229` / `background:var(--color-gold)`
 *     OR `border:1px solid #b98229` / `border:1.5px solid` with a colour reference,
 *     OR it appears on a `data-cta=` or `href="/walkthrough"` `href="/buyers"` anchor link
 *   - AND it does NOT already contain `border-radius`
 *
 * Conservative on purpose: we don't touch styles without a padding+colour signature.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', 'src');

const dirs = [
  'pages/suburbs',
  'pages/tools',
  'pages/insights',
  'pages/lp',
  'pages',
  'components',
  'layouts',
];

const styleAttr = /style="([^"]*)"/g;

const buttonHints = [
  /background:\s*#b98229/i,
  /background:\s*#b98229/i,
  /background:\s*var\(--color-gold\)/i,
  /background:\s*var\(--gold[^)]*\)/i,
  /background:\s*#6b4610/i,
  /border:\s*1(\.5)?px\s+solid\s+(#b98229|#6b4610|var\(--color-gold\))/i,
];

function styleNeedsRadius(style) {
  if (/border-radius/i.test(style)) return false;
  if (!/padding:/i.test(style)) return false;
  // Must look like a button colour-wise.
  return buttonHints.some(rx => rx.test(style));
}

function addRadius(style) {
  // Insert before the last semicolon-terminated declaration to keep ordering tidy.
  const trimmed = style.trim();
  if (trimmed.endsWith(';')) return style + 'border-radius:8px;';
  return style + ';border-radius:8px;';
}

let filesChanged = 0;
let buttonsFixed = 0;
const changed = [];

for (const dir of dirs) {
  const base = resolve(root, dir);
  const stream = glob('**/*.astro', { cwd: base });
  for await (const rel of stream) {
    const file = resolve(base, rel);
    const original = await readFile(file, 'utf8');
    let perFile = 0;
    const next = original.replace(styleAttr, (match, style) => {
      if (!styleNeedsRadius(style)) return match;
      perFile += 1;
      buttonsFixed += 1;
      return `style="${addRadius(style)}"`;
    });
    if (perFile > 0) {
      await writeFile(file, next);
      filesChanged += 1;
      changed.push(`${perFile.toString().padStart(2)} ${file.replace(root, 'src')}`);
    }
  }
}

console.log(`\n${buttonsFixed} button styles rounded across ${filesChanged} files.\n`);
for (const line of changed) console.log(line);
