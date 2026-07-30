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
  body { width: 1200px; height: 630px; background:
    radial-gradient(75% 90% at 50% 0%, #35301F 0%, #1F1D1B 55%, #171512 100%);
    display: flex; align-items: center; justify-content: center; }
  .inner { text-align: center; }
  .eyebrow { font: 600 20px Manrope, sans-serif; letter-spacing: 0.28em; color: #B5831C; text-transform: uppercase; margin-bottom: 34px; }
  h1 { font: 400 104px 'Playfair Display', serif; color: #F6F1E6; letter-spacing: -0.01em; line-height: 1.02; }
  .season { font: italic 400 54px 'Playfair Display', serif; color: #D6A63A; margin-top: 14px; }
  .rule { display: flex; align-items: center; gap: 18px; justify-content: center; margin: 44px auto 0; width: 420px; }
  .rule i { flex: 1; height: 1px; background: linear-gradient(to right, rgba(214,166,58,0), rgba(214,166,58,0.55)); }
  .rule i:last-child { background: linear-gradient(to left, rgba(214,166,58,0), rgba(214,166,58,0.55)); }
  .rule b { width: 7px; height: 7px; background: #D6A63A; transform: rotate(45deg); }
  .byline { font: 600 19px Manrope, sans-serif; letter-spacing: 0.2em; color: rgba(246,241,230,0.55); text-transform: uppercase; margin-top: 40px; }
</style></head><body>
<div class="inner">
  <div class="eyebrow">Every recorded sale · portal and off-market</div>
  <h1>${suburb}</h1>
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
