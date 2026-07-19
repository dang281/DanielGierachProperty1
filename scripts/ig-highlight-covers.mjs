#!/usr/bin/env node
// Instagram highlight covers in the GieMann palette. 1080x1080 PNGs,
// content held inside the central circle IG actually displays. Thin gold
// line icons on warm cream, Fraunces for the lettered tiles.
//
// Usage: node scripts/ig-highlight-covers.mjs
// Output: ~/Documents/IG-Highlights/

import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

const OUT = resolve(homedir(), 'Documents', 'IG-Highlights');
await mkdir(OUT, { recursive: true });

const CREAM = '#e6d9bd';
const GOLD = '#b98229';
const DEEP = '#6b4610';

// Shared frame: cream field + a fine gold ring sitting just inside the
// visible circle. Icon strokes stay thin so they read as engraved, not
// cartoonish.
const frame = (inner) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <rect width="1080" height="1080" fill="${CREAM}"/>
  <circle cx="540" cy="540" r="430" fill="none" stroke="${GOLD}" stroke-width="6" opacity="0.85"/>
  ${inner}
</svg>`;

const stroke = `fill="none" stroke="${GOLD}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"`;

const COVERS = {
  // Minimal house: roofline + walls + door.
  property: frame(`
    <g ${stroke}>
      <path d="M 350 560 L 540 400 L 730 560"/>
      <path d="M 395 545 L 395 700 L 685 700 L 685 545"/>
      <path d="M 505 700 L 505 610 L 575 610 L 575 700"/>
    </g>
  `),
  // Gavel: solid mallet head at 45 degrees, thin handle, sound block.
  auctions: frame(`
    <path d="M 425 475 L 545 355" stroke="${GOLD}" stroke-width="86" stroke-linecap="round" fill="none"/>
    <path d="M 520 450 L 665 595" stroke="${GOLD}" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M 400 700 L 640 700" stroke="${GOLD}" stroke-width="24" stroke-linecap="round" fill="none"/>
  `),
  // Paw print for Ash.
  ash: frame(`
    <g fill="${GOLD}">
      <ellipse cx="540" cy="620" rx="95" ry="80"/>
      <ellipse cx="440" cy="490" rx="42" ry="55" transform="rotate(-18 440 490)"/>
      <ellipse cx="640" cy="490" rx="42" ry="55" transform="rotate(18 640 490)"/>
      <ellipse cx="350" cy="590" rx="38" ry="50" transform="rotate(-38 350 590)"/>
      <ellipse cx="730" cy="590" rx="38" ry="50" transform="rotate(38 730 590)"/>
    </g>
  `),
  // SOLD in serif small caps with hairline rules.
  sold: frame(`
    <path d="M 380 460 L 700 460" stroke="${GOLD}" stroke-width="4"/>
    <text x="540" y="588" text-anchor="middle"
      font-family="'Fraunces',Georgia,serif" font-weight="600" font-size="128"
      letter-spacing="26" fill="${DEEP}">SOLD</text>
    <path d="M 380 640 L 700 640" stroke="${GOLD}" stroke-width="4"/>
  `),
  // D&C monogram for the team highlight, matching the site's D&C mark.
  team: frame(`
    <text x="540" y="612" text-anchor="middle"
      font-family="'Fraunces',Georgia,serif" font-style="italic" font-weight="600"
      font-size="240" fill="${GOLD}">D&amp;C</text>
  `),
};

const browser = await puppeteer.launch();
try {
  for (const [name, svg] of Object.entries(COVERS)) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
    const html = `<!doctype html><html><head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500..700&display=swap" rel="stylesheet">
      <style>html,body{margin:0;padding:0;width:1080px;height:1080px;overflow:hidden}svg{display:block}</style>
      </head><body>${svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: resolve(OUT, `${name}.png`), type: 'png' });
    console.log('wrote', `${name}.png`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Covers in', OUT);
