#!/usr/bin/env node
/**
 * Find every direct reference to cdn6.ep.dynamics.net in img src= or
 * preloadImage= attributes and rewrite it to go through Vercel's image
 * optimizer (which fetches and caches the image server-side, bypassing
 * the 403s that cdn6 now returns to client browsers).
 *
 * Skips:
 *   - Already-wrapped URLs ('/_vercel/image?...')
 *   - String values inside data arrays (vImg/vImgSrcset receive these and
 *     wrap them at render time)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', 'src');

function wrap(url, width = 1200, quality = 70) {
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}

// Match: src="https://cdn6.ep.dynamics.net/..." (the attribute, with quotes)
// And:   preloadImage="https://cdn6.ep.dynamics.net/..."
const patterns = [
  { rx: /src="(https:\/\/cdn6\.ep\.dynamics\.net\/[^"]+)"/g, attr: 'src' },
  { rx: /preloadImage="(https:\/\/cdn6\.ep\.dynamics\.net\/[^"]+)"/g, attr: 'preloadImage' },
];

let filesChanged = 0;
let imagesFixed = 0;
const changed = [];

const stream = glob('**/*.astro', { cwd: root });
for await (const rel of stream) {
  const file = resolve(root, rel);
  const original = await readFile(file, 'utf8');
  let next = original;
  let perFile = 0;

  for (const { rx, attr } of patterns) {
    next = next.replace(rx, (match, url) => {
      perFile += 1;
      imagesFixed += 1;
      return `${attr}="${wrap(url)}"`;
    });
  }

  if (perFile > 0) {
    await writeFile(file, next);
    filesChanged += 1;
    changed.push(`${perFile.toString().padStart(2)} ${file.replace(root, 'src')}`);
  }
}

console.log(`\n${imagesFixed} cdn6 URLs wrapped via Vercel optimizer across ${filesChanged} files.\n`);
for (const line of changed) console.log(line);
