#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const svgSource = await readFile(resolve(publicDir, 'favicon.svg'), 'utf8');

const targets = [
  { file: 'favicon.ico', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

const browser = await puppeteer.launch();
try {
  for (const { file, size } of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const html = `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden;}svg{display:block;width:${size}px;height:${size}px;}</style></head><body>${svgSource}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({
      path: resolve(publicDir, file),
      type: 'png',
      omitBackground: false,
      clip: { x: 0, y: 0, width: size, height: size },
    });
    console.log(`wrote ${file} (${size}x${size})`);
    await page.close();
  }
} finally {
  await browser.close();
}
