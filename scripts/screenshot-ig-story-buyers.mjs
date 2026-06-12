#!/usr/bin/env node
/**
 * screenshot-ig-story-buyers.mjs
 *
 * Generates a 1080x1920 (9:16) Instagram Story PNG promoting the
 * /buyers off-market and pre-market registration page.
 *
 * Usage:
 *   node scripts/screenshot-ig-story-buyers.mjs \
 *     --out "/Users/danielgierach/Documents/IG-Stories/buyers-promo-2026-06-13.png"
 *
 * Optional overrides:
 *   --eyebrow   "OFF-MARKET & PRE-MARKET"
 *   --headline  "Find your next home before it hits the market."
 *   --sub       "Brisbane's inner east. Early access for registered buyers."
 *   --cta       "Register your brief"
 *   --url       "danielgierach.com/buyers"
 *
 * Output is rendered at deviceScaleFactor 2 (2160x3840) for crisp display.
 */

import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const args = process.argv.slice(2);
const get  = (k, d='') => { const i = args.indexOf(`--${k}`); return i !== -1 ? args[i + 1] : d; };

const eyebrow  = get('eyebrow',  'OFF-MARKET & PRE-MARKET ACCESS');
const headline = get('headline', 'Find your next home before it hits the market.');
const sub      = get('sub',      'Early access for registered buyers, before properties hit online.');
const cta      = get('cta',      'Register your brief');
const outArg   = get('out',      `/Users/danielgierach/Documents/IG-Stories/buyers-promo-${new Date().toISOString().slice(0,10)}.png`);

const outPath  = resolve(outArg);
mkdirSync(dirname(outPath), { recursive: true });

// Background property image used on the live /buyers page hero.
// Pulled at higher resolution for a vertical canvas.
const bgImage = 'https://cdn6.ep.dynamics.net/s3/rw-propertyimages/a665-H3373155-164932053__1758673927-230712-AMY19482.jpg';

const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; background: #0a0806; overflow: hidden; }
  body {
    font-family: 'Manrope', system-ui, sans-serif;
    color: #f0ece4;
    -webkit-font-smoothing: antialiased;
  }
  .stage {
    position: relative;
    width: 1080px;
    height: 1920px;
    overflow: hidden;
  }
  .bg {
    position: absolute; inset: 0;
    background-image: url('${bgImage}');
    background-size: cover;
    background-position: center 30%;
    filter: grayscale(15%) brightness(0.32);
  }
  .scrim {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg,
        rgba(10,8,6,0.92) 0%,
        rgba(10,8,6,0.65) 35%,
        rgba(10,8,6,0.78) 65%,
        rgba(10,8,6,0.96) 100%);
  }
  /* Subtle gold ambient glow behind headline */
  .ambient {
    position: absolute;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
    width: 1200px; height: 700px;
    background: radial-gradient(ellipse at center, rgba(196,145,42,0.18) 0%, rgba(196,145,42,0) 70%);
    pointer-events: none;
  }

  .frame {
    position: absolute; inset: 0;
    z-index: 2;
    display: flex; flex-direction: column;
    /* IG safe zones: ~260px top (username/time), ~340px bottom (reply, like, share) */
    padding: 260px 90px 340px;
  }

  .eyebrow {
    font-family: 'Manrope', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.28em;
    color: #f5d07a;
    text-transform: uppercase;
    margin-bottom: 56px;
    display: flex;
    align-items: center;
    gap: 22px;
    white-space: nowrap;
  }
  .eyebrow::before {
    content: '';
    display: block;
    width: 56px; height: 2px;
    background: #c4912a;
    flex-shrink: 0;
  }

  .headline {
    font-family: 'Noto Serif', Georgia, serif;
    font-weight: 400;
    font-size: 81px;
    line-height: 1.06;
    letter-spacing: -0.02em;
    color: #f4f0e7;
    margin-bottom: 48px;
    max-width: 820px;
  }
  .headline em {
    font-style: italic;
    color: #f5d07a;
    font-weight: 400;
  }

  .sub {
    font-family: 'Manrope', sans-serif;
    font-size: 34px;
    font-weight: 400;
    line-height: 1.45;
    color: rgba(240, 236, 228, 0.78);
    max-width: 820px;
  }

  .footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 22px;
    background: #c4912a;
    color: #0a0806;
    font-family: 'Manrope', sans-serif;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 36px 56px;
    border: none;
    margin-bottom: 72px;
  }
  .cta .arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(10, 8, 6, 0.18);
  }

  .brand-rule {
    width: 56px; height: 1px;
    background: rgba(245, 208, 122, 0.5);
    margin-bottom: 26px;
  }
  .brand-name {
    font-family: 'Noto Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: 42px;
    color: #f0ece4;
    margin-bottom: 12px;
    letter-spacing: 0.005em;
  }
  .brand-agency {
    font-family: 'Manrope', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #c4912a;
  }
</style>
</head><body>
<div class="stage">
  <div class="bg"></div>
  <div class="scrim"></div>
  <div class="ambient"></div>

  <div class="frame">
    <div class="eyebrow">${eyebrow}</div>

    <h1 class="headline">${headline}</h1>

    <p class="sub">${sub}</p>

    <div class="footer">
      <div class="cta">
        ${cta.toUpperCase()}
        <span class="arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </div>

      <div class="brand-rule"></div>
      <div class="brand-name">Daniel Gierach</div>
      <div class="brand-agency">Ray White Collective</div>
    </div>
  </div>
</div>
</body></html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log('IG Story rendered:', outPath);
console.log('Dimensions: 2160x3840 (1080x1920 @ 2x)');
