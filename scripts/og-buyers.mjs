/**
 * og-buyers.mjs
 *
 * Generates the Open Graph / Twitter share image for /buyers.
 * Property photo backdrop with a charcoal/gold brand card overlay,
 * screenshotted at 1200x630 (deviceScaleFactor 2 -> 2400x1260 native).
 *
 * Usage: node scripts/og-buyers.mjs
 * Output: public/img/og-buyers.png
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../public/img/og-buyers.png');

const bgImage = 'https://cdn6.ep.dynamics.net/s3/rw-propertyimages/a665-H3373155-164932053__1758673927-230712-AMY19482.jpg';

const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400&family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1200px; height: 630px; overflow: hidden;
    font-family: 'Manrope', system-ui, sans-serif;
    background: #0a0806;
    -webkit-font-smoothing: antialiased;
  }
  .stage {
    position: relative;
    width: 1200px;
    height: 630px;
    overflow: hidden;
  }
  .bg {
    position: absolute; inset: 0;
    background-image: url('${bgImage}');
    background-size: cover;
    background-position: center 35%;
    filter: grayscale(15%) brightness(0.4);
  }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(95deg,
      rgba(10,8,6,0.95) 0%,
      rgba(10,8,6,0.75) 45%,
      rgba(10,8,6,0.35) 100%);
  }

  .corner {
    position: absolute; top: 36px; right: 40px; z-index: 500;
    background: rgba(10,8,6,0.85);
    color: #f0ece4;
    padding: 10px 16px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    border-bottom: 2px solid #c4912a;
  }

  .card {
    position: absolute; left: 48px; bottom: 48px; z-index: 500;
    background: rgba(10,8,6,0.94);
    border-left: 4px solid #c4912a;
    padding: 28px 36px 30px 32px;
    max-width: 720px;
    color: #f0ece4;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  }
  .eyebrow {
    font-size: 12px; font-weight: 800; letter-spacing: 0.22em;
    text-transform: uppercase; color: #c4912a; margin: 0 0 14px;
  }
  h1 {
    font-family: 'Noto Serif', Georgia, serif;
    font-weight: 400; font-size: 42px; line-height: 1.08;
    margin: 0 0 14px; letter-spacing: -0.015em; color: #f0ece4;
  }
  .desc {
    font-size: 16px; line-height: 1.55; color: rgba(240,236,228,0.8);
    margin: 0 0 18px; max-width: 60ch;
  }
  .foot {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid rgba(196,145,42,0.25);
    padding-top: 12px;
    font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(240,236,228,0.7); font-weight: 700;
  }
  .foot .url { color: #c4912a; }
</style>
</head><body>
<div class="stage">
  <div class="bg"></div>
  <div class="scrim"></div>
  <div class="corner">danielgierach.com</div>
  <div class="card">
    <p class="eyebrow">Off-Market &amp; Pre-Market Access</p>
    <h1>Find your next home before it hits the market.</h1>
    <p class="desc">Register your brief and get early access to off-market and pre-market properties across Brisbane's inner east, before they go online.</p>
    <div class="foot"><span>Daniel Gierach &middot; Ray White Collective</span><span class="url">danielgierach.com/buyers</span></div>
  </div>
</div>
</body></html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log('Wrote', outPath);
