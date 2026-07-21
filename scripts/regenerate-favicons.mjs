#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const svgSource = await readFile(resolve(publicDir, 'favicon.svg'), 'utf8');

// The favicon is a circle. `square: true` fills the transparent corners with
// the cream background so installed-app / home-screen icons are a full-bleed
// tile (no transparent corners for the OS mask to render as black). The
// browser-tab favicon + .ico stay a transparent circle so Google's circular
// crop and browser tabs show a clean disc.
const CREAM = '#e6d9bd';
const targets = [
  { file: 'favicon.ico', size: 32, square: false },
  { file: 'apple-touch-icon.png', size: 180, square: true },
  { file: 'icon-192.png', size: 192, square: true },
  { file: 'icon-512.png', size: 512, square: true },
];

const browser = await puppeteer.launch();
try {
  for (const { file, size, square } of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const svg = square
      ? svgSource.replace(/(<svg[^>]*>)/, `$1<rect width="32" height="32" fill="${CREAM}"/>`)
      : svgSource;
    const html = `<!doctype html><html><head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&display=swap" rel="stylesheet">
      <style>html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden;}svg{display:block;width:${size}px;height:${size}px;}</style></head><body>${svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Give Fraunces a beat to hand off from the fallback to the real face.
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: resolve(publicDir, file),
      type: 'png',
      omitBackground: !square,
      clip: { x: 0, y: 0, width: size, height: size },
    });
    console.log(`wrote ${file} (${size}x${size})`);
    await page.close();
  }
} finally {
  await browser.close();
}
