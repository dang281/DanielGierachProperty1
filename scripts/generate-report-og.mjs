#!/usr/bin/env node
// Luxury share cards for the quarterly reports: dark ink ground, gold glow,
// Playfair suburb + seasonal title. One 1200x630 PNG per report JSON, used
// as og:image so texted links unfurl with a premium preview.
//   node scripts/generate-report-og.mjs        (all reports)
import puppeteer from 'puppeteer';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/img/reports/og');
mkdirSync(OUT, { recursive: true });

const html = (suburb, season) => `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  /* The report hero itself: cream radial wash, ink Playfair, gold accents
     (Daniel, 30 Jul: match the website scheme, keep the luxury). */
  body { width: 1200px; height: 630px; background:
    radial-gradient(118% 130% at 50% 32%, #D8C69C 0%, #E1D2AF 46%, #E6D9BD 82%);
    display: flex; align-items: center; justify-content: center; }
  .inner { text-align: center; }
  .eyebrow { font: 600 20px Manrope, sans-serif; letter-spacing: 0.28em; color: #B5831C; text-transform: uppercase; margin-bottom: 34px; }
  h1 { font: 400 96px 'Playfair Display', serif; color: #1F1D1B; letter-spacing: -0.01em; line-height: 1.02; }
  h1.long { font-size: 76px; }
  .season { font: italic 400 54px 'Playfair Display', serif; color: #8F6712; margin-top: 14px; }
  .rule { display: flex; align-items: center; gap: 18px; justify-content: center; margin: 44px auto 0; width: 420px; }
  .rule i { flex: 1; height: 1px; background: linear-gradient(to right, rgba(181,131,28,0), rgba(181,131,28,0.5)); }
  .rule i:last-child { background: linear-gradient(to left, rgba(181,131,28,0), rgba(181,131,28,0.5)); }
  .rule b { width: 7px; height: 7px; background: #B5831C; transform: rotate(45deg); }
  .byline { font: 600 19px Manrope, sans-serif; letter-spacing: 0.2em; color: #6B655C; text-transform: uppercase; margin-top: 40px; }
</style></head><body>
<div class="inner">
  <div class="eyebrow">Every recorded sale · portal and off-market</div>
  <h1 class="${suburb.length > 13 ? 'long' : ''}">Your ${suburb}</h1>
  <div class="season">${season}</div>
  <div class="rule"><i></i><b></b><i></i></div>
  <div class="byline">Daniel Gierach · Ray White Bulimba</div>
</div>
</body></html>`;

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
const dir = path.join(ROOT, 'src/data/reports');
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json') || f === 'geocode-cache.json') continue;
  const meta = JSON.parse(readFileSync(path.join(dir, f), 'utf8')).meta;
  if (!meta?.slug) continue;
  await page.setContent(html(meta.suburb, meta.seasonTitle), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(OUT, `${meta.slug}.png`) });
  console.log('og:', meta.slug);
}
await browser.close();
