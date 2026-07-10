#!/usr/bin/env node
// One-shot rasterizer for the D&C monogram (meet-the-team-dash page).
// Loads Fraunces italic from Google Fonts inside a puppeteer page so the
// PNG shows the real italic serif regardless of the machine's system
// fonts. Mirrors the shape of regenerate-favicons.mjs (used for DG).

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const svgSource = await readFile(resolve(publicDir, 'favicon-dc.svg'), 'utf8');

const targets = [
  { file: 'apple-touch-icon-dc.png', size: 180 },
];

const browser = await puppeteer.launch();
try {
  for (const { file, size } of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const html = `<!doctype html><html><head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500..700&display=swap" rel="stylesheet">
      <style>
        html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden;}
        svg{display:block;width:${size}px;height:${size}px;}
      </style>
    </head><body>${svgSource}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Give Fraunces a beat to hand off from the fallback to the real face.
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({
      path: resolve(publicDir, file),
      type: 'png',
      omitBackground: true,
      clip: { x: 0, y: 0, width: size, height: size },
    });
    console.log(`wrote ${file} (${size}x${size})`);
    await page.close();
  }
} finally {
  await browser.close();
}
