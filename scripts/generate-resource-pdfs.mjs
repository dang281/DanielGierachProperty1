#!/usr/bin/env node
// Generate branded PDFs for every resource in src/data/resources/ into public/downloads/.
// Run: node scripts/generate-resource-pdfs.mjs [slug?]
// If slug is provided, only that resource is generated.

import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { resources, resourceBySlug } from '../src/data/resources/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/downloads');

mkdirSync(OUT_DIR, { recursive: true });

const CHARCOAL  = '#0a0806';
const CREAM     = '#f0ece4';
const CREAM_DIM = 'rgba(240,236,228,0.7)';
const GOLD      = '#c4912a';
const GOLD_SOFT = '#f5d07a';
const OFF_BLACK = '#1c1917';
const STONE     = '#78716c';
const PAPER     = '#fefdf9';

// ── HTML template ────────────────────────────────────────────────────────────
function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderTable(table) {
  if (!table) return '';
  const headerRow = `<tr>${table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const bodyRows = Array.from({ length: table.rows }, () =>
    `<tr>${table.headers.map(() => '<td>&nbsp;</td>').join('')}</tr>`
  ).join('');
  return `<table class="worksheet"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
}

function renderHTML(r) {
  const sectionsHTML = r.sections.map((s, i) => {
    const items = (s.items || []).map(li => `<li>${escapeHtml(li)}</li>`).join('');
    const table = renderTable(s.table);
    return `
      <section class="block">
        <h2 class="block__heading">${escapeHtml(s.heading)}</h2>
        ${s.body ? `<p class="block__body">${escapeHtml(s.body)}</p>` : ''}
        ${items ? `<ul class="block__list">${items}</ul>` : ''}
        ${table}
      </section>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(r.title)} — Daniel Gierach</title>
<style>
  @page {
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
  }
  @page:first { margin: 0; }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: ${PAPER};
    color: ${OFF_BLACK};
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  h1, h2, h3 {
    font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
    font-weight: 400;
    color: ${OFF_BLACK};
    margin: 0;
    line-height: 1.18;
  }

  /* COVER PAGE */
  .cover {
    page-break-after: always;
    background: ${CHARCOAL};
    color: ${CREAM};
    padding: 28mm 22mm 22mm 22mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .cover__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cover__brand {
    font-size: 9pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${GOLD_SOFT};
    font-weight: 700;
  }
  .cover__category {
    font-size: 8pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${CREAM_DIM};
    font-weight: 700;
  }
  .cover__center {
    margin-top: 70mm;
  }
  .cover__eyebrow {
    font-size: 9pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${GOLD_SOFT};
    font-weight: 700;
    margin-bottom: 10mm;
  }
  .cover__title {
    font-size: 42pt;
    color: ${CREAM};
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 8mm;
    max-width: 16cm;
  }
  .cover__subtitle {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-style: italic;
    font-size: 14pt;
    color: ${CREAM_DIM};
    line-height: 1.4;
    max-width: 14cm;
  }
  .cover__rule {
    width: 60mm;
    height: 2px;
    background: ${GOLD};
    margin: 8mm 0;
  }
  .cover__bottom {
    border-top: 1px solid rgba(240,236,228,0.18);
    padding-top: 6mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .cover__sig {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 16pt;
    color: ${CREAM};
  }
  .cover__sig-sub {
    font-size: 8pt;
    color: ${CREAM_DIM};
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-top: 2mm;
  }
  .cover__site {
    font-size: 9pt;
    color: ${GOLD_SOFT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
  }

  /* CONTENT PAGES */
  .content {
    padding: 0;
  }

  .intro {
    border-left: 3px solid ${GOLD};
    padding: 4mm 6mm;
    background: rgba(196,145,42,0.05);
    margin-bottom: 10mm;
  }
  .intro p {
    margin: 0;
    font-size: 10.5pt;
    line-height: 1.7;
    color: ${OFF_BLACK};
  }

  .block {
    margin-bottom: 9mm;
    page-break-inside: avoid;
  }
  .block__heading {
    font-size: 17pt;
    color: ${OFF_BLACK};
    margin-bottom: 3mm;
    padding-bottom: 2mm;
    border-bottom: 1px solid rgba(28,25,23,0.12);
  }
  .block__body {
    color: ${STONE};
    margin: 2mm 0 4mm 0;
    line-height: 1.7;
  }
  .block__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .block__list li {
    position: relative;
    padding: 2.5mm 0 2.5mm 8mm;
    border-bottom: 1px dotted rgba(28,25,23,0.12);
    line-height: 1.55;
    page-break-inside: avoid;
  }
  .block__list li:last-child { border-bottom: none; }
  .block__list li:before {
    content: '';
    position: absolute;
    left: 0;
    top: 4mm;
    width: 3.5mm;
    height: 3.5mm;
    border: 1.2px solid ${GOLD};
    border-radius: 1px;
  }

  /* WORKSHEET TABLE */
  table.worksheet {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5mm;
    font-size: 8pt;
    page-break-inside: avoid;
  }
  table.worksheet th {
    background: ${CHARCOAL};
    color: ${CREAM};
    padding: 3mm 2mm;
    text-align: left;
    font-weight: 600;
    font-size: 7.5pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  table.worksheet td {
    border: 1px solid rgba(28,25,23,0.18);
    padding: 6mm 2mm;
    vertical-align: top;
  }

  /* CLOSING NOTE */
  .footer-note {
    margin-top: 12mm;
    padding: 6mm;
    background: ${CHARCOAL};
    color: ${CREAM};
    page-break-inside: avoid;
  }
  .footer-note p {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-style: italic;
    font-size: 12pt;
    line-height: 1.5;
  }

  /* SIGN-OFF */
  .signoff {
    margin-top: 8mm;
    padding-top: 5mm;
    border-top: 2px solid ${GOLD};
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    page-break-inside: avoid;
  }
  .signoff__name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 14pt;
    color: ${OFF_BLACK};
  }
  .signoff__title {
    font-size: 8pt;
    color: ${STONE};
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 1.5mm;
  }
  .signoff__contact {
    font-size: 9pt;
    color: ${OFF_BLACK};
    text-align: right;
    line-height: 1.6;
  }
  .signoff__contact strong { color: ${GOLD}; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<section class="cover">
  <div class="cover__top">
    <div class="cover__brand">Daniel Gierach</div>
    <div class="cover__category">${escapeHtml(r.category || 'Resource')}</div>
  </div>

  <div class="cover__center">
    <div class="cover__eyebrow">Field Resource</div>
    <h1 class="cover__title">${escapeHtml(r.title)}</h1>
    <div class="cover__rule"></div>
    <p class="cover__subtitle">${escapeHtml(r.subtitle)}</p>
  </div>

  <div class="cover__bottom">
    <div>
      <div class="cover__sig">Daniel Gierach</div>
      <div class="cover__sig-sub">Ray White Collective</div>
    </div>
    <div class="cover__site">danielgierach.com</div>
  </div>
</section>

<!-- CONTENT -->
<div class="content">
  <div class="intro"><p>${escapeHtml(r.intro)}</p></div>

  ${sectionsHTML}

  ${r.footerNote ? `<div class="footer-note"><p>${escapeHtml(r.footerNote)}</p></div>` : ''}

  <div class="signoff">
    <div>
      <div class="signoff__name">Daniel Gierach</div>
      <div class="signoff__title">Ray White Collective</div>
    </div>
    <div class="signoff__contact">
      <strong>0412 523 821</strong><br/>
      daniel.gierach@raywhite.com<br/>
      danielgierach.com
    </div>
  </div>
</div>

</body>
</html>`;
}

// ── Render a single resource to PDF ──────────────────────────────────────────
async function renderOne(browser, r) {
  const html = renderHTML(r);
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });

  const outPath = resolve(OUT_DIR, `${r.slug}.pdf`);
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div style="font-family:'Inter',sans-serif;font-size:8pt;color:#78716c;width:100%;
                  padding:0 18mm;display:flex;justify-content:space-between;align-items:center;
                  letter-spacing:0.1em;text-transform:uppercase;">
        <span>${escapeHtml(r.title)}</span>
        <span style="color:#c4912a;">danielgierach.com</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '14mm', bottom: '14mm', left: '0', right: '0' },
  });

  await page.close();
  console.log(`  ✓ ${r.slug}.pdf`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const onlySlug = process.argv[2];
const targets = onlySlug
  ? (resourceBySlug[onlySlug] ? [resourceBySlug[onlySlug]] : [])
  : resources;

if (onlySlug && targets.length === 0) {
  console.error(`Unknown slug: ${onlySlug}`);
  console.error(`Available: ${resources.map(r => r.slug).join(', ')}`);
  process.exit(1);
}

console.log(`Generating ${targets.length} PDF(s) into ${OUT_DIR}\n`);

const browser = await puppeteer.launch({ headless: 'new' });
try {
  for (const r of targets) {
    await renderOne(browser, r);
  }
} finally {
  await browser.close();
}

console.log(`\nDone. ${targets.length} PDF(s) ready.`);
