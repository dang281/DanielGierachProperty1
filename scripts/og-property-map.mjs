/**
 * og-property-map.mjs
 *
 * Generates the Open Graph / Twitter share image for /tools/property-map.
 * Renders a Leaflet map of Brisbane inner east with an overlay brand card,
 * then screenshots at 1200x630 (deviceScaleFactor 2 -> 2400x1260 native).
 *
 * Usage: node scripts/og-property-map.mjs
 * Output: public/img/og-property-map.png
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../public/img/og-property-map.png');

const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body { margin: 0; padding: 0; width: 1200px; height: 630px; overflow: hidden;
    font-family: 'Manrope', system-ui, sans-serif; background: #0a0806; }
  #map { width: 1200px; height: 630px; }
  .leaflet-control-attribution { font-size: 9px !important; background: rgba(255,255,255,0.7) !important; }

  .card {
    position: absolute; left: 48px; bottom: 48px; z-index: 500;
    background: rgba(10,8,6,0.96);
    border-left: 4px solid #c4912a;
    padding: 28px 36px 30px 32px;
    max-width: 620px;
    color: #f0ece4;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  }
  .eyebrow {
    font-size: 12px; font-weight: 800; letter-spacing: 0.18em;
    text-transform: uppercase; color: #c4912a; margin: 0 0 14px;
  }
  h1 {
    font-family: 'Noto Serif', Georgia, serif;
    font-weight: 400; font-size: 44px; line-height: 1.08;
    margin: 0 0 14px; letter-spacing: -0.01em; color: #f0ece4;
  }
  .desc {
    font-size: 16px; line-height: 1.5; color: rgba(240,236,228,0.78); margin: 0 0 18px;
  }
  .foot {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid rgba(196,145,42,0.25);
    padding-top: 12px;
    font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(240,236,228,0.7); font-weight: 700;
  }
  .foot .url { color: #c4912a; }

  .corner {
    position: absolute; top: 36px; right: 40px; z-index: 500;
    background: rgba(10,8,6,0.85);
    color: #f0ece4;
    padding: 10px 16px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    border-bottom: 2px solid #c4912a;
  }
</style>
</head><body>
<div id="map"></div>
<div class="corner">danielgierach.com</div>
<div class="card">
  <p class="eyebrow">Buyer + Seller Tool</p>
  <h1>Brisbane Property Map</h1>
  <p class="desc">Zoning, stormwater, water and sewer on one map. Look up any inner east address.</p>
  <div class="foot"><span>Daniel Gierach &middot; Ray White Collective</span><span class="url">danielgierach.com</span></div>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', {
    zoomControl: false, attributionControl: true,
    fadeAnimation: false, zoomAnimation: false,
  }).setView([-27.467, 153.065], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  }).addTo(map);
  // Mark tiles loaded
  let loaded = 0, total = 0;
  map.eachLayer(l => {
    if (l.on) {
      l.on('tileloadstart', () => { total++; });
      l.on('tileload', () => { loaded++; if (loaded >= total && total > 0) window.__tilesDone = true; });
    }
  });
</script>
</body></html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
// Give tiles time to fully paint at 2x.
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log('Wrote', outPath);
