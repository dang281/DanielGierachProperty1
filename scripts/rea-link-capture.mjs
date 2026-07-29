// Capture the real realestate.com.au property-profile URL for every sale in
// a quarterly report, using a real local browser (REA blocks datacenter
// crawlers; a headed browser on Daniel's home IP is just normal browsing).
//
//   node scripts/rea-link-capture.mjs morningside-2026-q3 "Morningside" 4170
//
// For each disclosed-price sale in src/data/reports/<slug>.json it opens
// REA's address-search suggestion API via the page context (same-origin
// fetch from realestate.com.au, so no CORS or bot fingerprint drama),
// takes the top suggestion ONLY when its short address matches ours, and
// records the canonical /property/<slug> URL. Writes back to the JSON as
// `rea` on each sale. Unmatched sales keep rea=null (page falls back to the
// Google search link). Polite pacing: ~1.5s between lookups.
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const [slug, suburb, postcode] = process.argv.slice(2);
if (!slug || !suburb || !postcode) {
  console.error('usage: node scripts/rea-link-capture.mjs <report-slug> <Suburb> <postcode>');
  process.exit(1);
}
const path = `src/data/reports/${slug}.json`;
const report = JSON.parse(fs.readFileSync(path, 'utf8'));

const norm = (s) => s.toLowerCase().replace(/\bunit\s+/g, '').replace(/[^a-z0-9/]/g, '');
const STREET_ABBR = { st: 'street', rd: 'road', ave: 'avenue', av: 'avenue', tce: 'terrace', cres: 'crescent', ct: 'court', pl: 'place', dr: 'drive' };
const expand = (addr) => addr.replace(/\b(st|rd|ave|av|tce|cres|ct|pl|dr)\b/gi, (m) => STREET_ABBR[m.toLowerCase()] ?? m);

const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
const page = await browser.newPage();
await page.goto('https://www.realestate.com.au/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));

let found = 0, missed = 0;
for (const sale of report.sales) {
  if (sale.priceWithheld || !sale.price) continue;
  if (sale.rea) { found++; continue; }
  const short = sale.address.split(',')[0].trim();
  const query = `${short}, ${suburb}, QLD ${postcode}`;
  try {
    const result = await page.evaluate(async (q) => {
      const res = await fetch(
        'https://suggest.realestate.com.au/consumer-suggest/suggestions?max=3&type=address&src=property-profile&query=' + encodeURIComponent(q),
        { credentials: 'omit' }
      );
      if (!res.ok) return { error: res.status };
      const data = await res.json();
      const s = data?._embedded?.suggestions ?? [];
      return {
        suggestions: s.map((x) => ({
          display: x?.display?.text ?? '',
          shortAddress: x?.source?.shortAddress ?? '',
          suburb: x?.source?.suburb ?? '',
          postcode: x?.source?.postcode ?? '',
          url: x?.source?.url ?? null,
        })),
      };
    }, query);
    if (result.error) { console.log(`  ! ${short}: HTTP ${result.error}`); missed++; }
    else {
      // Exact short-address match in the right suburb; the canonical
      // lookup URL comes straight from REA's own address database.
      const hit = (result.suggestions ?? []).find((s) =>
        s.url &&
        norm(expand(s.shortAddress)) === norm(expand(short)) &&
        s.suburb.toLowerCase() === suburb.toLowerCase() &&
        String(s.postcode) === String(postcode)
      );
      if (hit) {
        sale.rea = hit.url;
        found++;
        console.log(`  ✓ ${short} -> ${sale.rea}`);
      } else {
        missed++;
        console.log(`  · ${short}: no confident match (${(result.suggestions ?? []).map((s) => s.display).join(' | ') || 'no suggestions'})`);
      }
    }
  } catch (e) {
    missed++;
    console.log(`  ! ${short}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 800));
}

fs.writeFileSync(path, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\ndone: ${found} linked, ${missed} unmatched (keep Google fallback). JSON updated: ${path}`);
