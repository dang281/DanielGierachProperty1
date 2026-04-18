#!/usr/bin/env node
/**
 * screenshot-linkedin.mjs
 *
 * Generates a 1080×1080 PNG for a LinkedIn post using Puppeteer.
 *
 * Usage — market/authority post (Tuesday):
 *   node scripts/screenshot-linkedin.mjs \
 *     --type market \
 *     --label "MARKET UPDATE" \
 *     --headline "What January tells sellers in Brisbane's inner east" \
 *     --body "In Brisbane property, January buyers have had two weeks to think it through. They come back motivated — and face almost no competition from other listings." \
 *     --date "2027-01-05" \
 *     --out content/social/images/2027-01-05-linkedin-market.png
 *
 * Usage — article feature post (Thursday):
 *   node scripts/screenshot-linkedin.mjs \
 *     --type article \
 *     --headline "How to Handle a Building and Pest Report as a Seller in Brisbane" \
 *     --excerpt "Most sellers are surprised by what comes up. Here is how to handle it without losing the deal." \
 *     --slug "building-pest-report-seller-guide-brisbane" \
 *     --date "2027-01-07" \
 *     --out content/social/images/2027-01-07-linkedin-article.png
 *
 * Arguments:
 *   --type      market | article
 *   --label     Eyebrow label for market posts (e.g. "MARKET UPDATE", "SELLER INSIGHT")
 *   --headline  Main headline text
 *   --body      Body excerpt for market posts (≤ 220 chars recommended)
 *   --excerpt   Pull quote for article posts (≤ 180 chars recommended)
 *   --slug      Insights article slug for article posts (no leading slash)
 *   --date      ISO date YYYY-MM-DD
 *   --out       Output path (relative to cwd or absolute)
 */

import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get  = (key) => { const i = args.indexOf(`--${key}`); return i !== -1 ? args[i + 1] : ''; };

const type     = get('type')     || 'market';
const label    = get('label')    || 'MARKET UPDATE';
const headline = get('headline') || '';
const body     = get('body')     || '';
const excerpt  = get('excerpt')  || '';
const slug     = get('slug')     || '';
const date     = get('date')     || '';
const outRaw   = get('out')      || `content/social/images/${date || 'post'}-linkedin-${type}.png`;
const outPath  = resolve(process.cwd(), outRaw);

if (!headline) { console.error('Error: --headline is required'); process.exit(1); }

mkdirSync(dirname(outPath), { recursive: true });

// ── Brand tokens ──────────────────────────────────────────────────────────────
const CHARCOAL  = '#0a0806';
const CREAM     = '#f0ece4';
const CREAM_DIM = 'rgba(240,236,228,0.62)';
const GOLD      = '#c4912a';
const AVATAR    = 'https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg';
const FONT_URL  = 'https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&family=Manrope:wght@300;400;600;700;800&display=swap';

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Market/Authority template ─────────────────────────────────────────────────
function buildMarketHtml() {
  const truncBody = body.length > 230 ? body.slice(0, 227) + '…' : body;
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL}" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1080px;overflow:hidden;background:${CHARCOAL};}
  body{
    font-family:'Manrope',sans-serif;
    display:flex;flex-direction:column;
  }

  /* Gold top rule */
  .top-rule{
    height:5px;flex-shrink:0;
    background:linear-gradient(90deg,${GOLD} 0%,rgba(196,145,42,0.2) 100%);
  }

  /* Main content area */
  .main{
    flex:1;
    padding:72px 88px 60px;
    display:flex;flex-direction:column;
    justify-content:space-between;
    min-height:0;
  }

  /* Upper block: eyebrow + headline */
  .upper{display:flex;flex-direction:column;gap:44px;}

  .eyebrow{
    display:flex;align-items:center;gap:14px;
    font-family:'Manrope',sans-serif;
    font-size:12px;font-weight:800;
    letter-spacing:0.24em;text-transform:uppercase;
    color:${GOLD};
  }
  .eyebrow-line{width:32px;height:1.5px;background:${GOLD};flex-shrink:0;}

  .headline{
    font-family:'Noto Serif',serif;
    font-size:60px;font-weight:400;line-height:1.1;
    color:${CREAM};
    letter-spacing:-0.015em;
    max-width:880px;
  }

  /* Lower block: divider + body */
  .lower{display:flex;flex-direction:column;gap:32px;}

  .divider{width:56px;height:2px;background:${GOLD};}

  .body{
    font-family:'Manrope',sans-serif;
    font-size:19px;font-weight:400;line-height:1.8;
    color:${CREAM_DIM};
    max-width:840px;
  }

  /* Footer */
  .footer{
    flex-shrink:0;
    border-top:1px solid rgba(196,145,42,0.18);
    padding:28px 88px;
    display:flex;align-items:center;justify-content:space-between;
  }
  .footer-left{display:flex;align-items:center;gap:18px;}
  .avatar{
    width:50px;height:50px;border-radius:50%;flex-shrink:0;
    background:url('${AVATAR}') center 15%/cover;
    border:1.5px solid rgba(196,145,42,0.45);
  }
  .name{
    font-family:'Manrope',sans-serif;
    font-size:14px;font-weight:700;
    color:${CREAM};letter-spacing:0.01em;line-height:1.3;
  }
  .title{
    font-family:'Manrope',sans-serif;
    font-size:11.5px;font-weight:400;
    color:${CREAM_DIM};margin-top:3px;letter-spacing:0.02em;
  }
  .url{
    font-family:'Manrope',sans-serif;
    font-size:12px;font-weight:800;
    letter-spacing:0.14em;text-transform:uppercase;
    color:${GOLD};
  }
</style>
</head><body>
  <div class="top-rule"></div>
  <div class="main">
    <div class="upper">
      <div class="eyebrow"><span class="eyebrow-line"></span>${esc(label)}</div>
      <div class="headline">${esc(headline)}</div>
    </div>
    <div class="lower">
      <div class="divider"></div>
      <div class="body">${esc(truncBody)}</div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-left">
      <div class="avatar"></div>
      <div>
        <div class="name">Daniel Gierach</div>
        <div class="title">Licensed Real Estate Agent · Ray White Bulimba</div>
      </div>
    </div>
    <div class="url">danielgierach.com</div>
  </div>
</body></html>`;
}

// ── Article Feature template ──────────────────────────────────────────────────
function buildArticleHtml() {
  const truncExcerpt = excerpt.length > 180 ? excerpt.slice(0, 177) + '…' : excerpt;
  const articleUrl   = `danielgierach.com/insights/${slug}`;
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL}" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1080px;overflow:hidden;background:${CHARCOAL};}
  body{
    font-family:'Manrope',sans-serif;
    display:flex;flex-direction:column;
  }

  /* Gold left bar */
  .wrapper{
    flex:1;display:flex;min-height:0;
  }
  .left-bar{
    width:5px;flex-shrink:0;
    background:linear-gradient(180deg,${GOLD} 0%,rgba(196,145,42,0.1) 100%);
  }
  .main{
    flex:1;
    padding:72px 88px 60px 84px;
    display:flex;flex-direction:column;
    justify-content:space-between;
    min-height:0;
  }

  /* Upper */
  .upper{display:flex;flex-direction:column;gap:48px;}

  .badge{
    display:inline-flex;align-items:center;gap:10px;
    background:rgba(196,145,42,0.1);
    border:1px solid rgba(196,145,42,0.3);
    padding:8px 18px;align-self:flex-start;
  }
  .badge-dot{width:5px;height:5px;border-radius:50%;background:${GOLD};flex-shrink:0;}
  .badge-text{
    font-family:'Manrope',sans-serif;
    font-size:11px;font-weight:800;
    letter-spacing:0.24em;text-transform:uppercase;
    color:${GOLD};
  }

  .headline{
    font-family:'Noto Serif',serif;
    font-size:52px;font-weight:400;line-height:1.14;
    color:${CREAM};
    letter-spacing:-0.01em;
    max-width:880px;
  }

  /* Lower */
  .lower{display:flex;flex-direction:column;gap:36px;}

  .excerpt{
    font-family:'Noto Serif',serif;
    font-style:italic;font-weight:300;
    font-size:23px;line-height:1.7;
    color:${GOLD};
    max-width:820px;
  }

  .cta{
    display:flex;align-items:center;gap:14px;
  }
  .cta-line{width:28px;height:1.5px;background:${GOLD};flex-shrink:0;}
  .cta-inner{}
  .cta-label{
    font-family:'Manrope',sans-serif;
    font-size:11px;font-weight:800;
    letter-spacing:0.2em;text-transform:uppercase;
    color:${GOLD};
  }
  .cta-url{
    font-family:'Manrope',sans-serif;
    font-size:12px;font-weight:400;
    color:${CREAM_DIM};
    margin-top:4px;letter-spacing:0.02em;
  }

  /* Footer */
  .footer{
    flex-shrink:0;
    border-top:1px solid rgba(196,145,42,0.18);
    padding:28px 88px;
    display:flex;align-items:center;justify-content:space-between;
  }
  .footer-left{display:flex;align-items:center;gap:18px;}
  .avatar{
    width:50px;height:50px;border-radius:50%;flex-shrink:0;
    background:url('${AVATAR}') center 15%/cover;
    border:1.5px solid rgba(196,145,42,0.45);
  }
  .name{
    font-family:'Manrope',sans-serif;
    font-size:14px;font-weight:700;
    color:${CREAM};letter-spacing:0.01em;line-height:1.3;
  }
  .title{
    font-family:'Manrope',sans-serif;
    font-size:11.5px;font-weight:400;
    color:${CREAM_DIM};margin-top:3px;letter-spacing:0.02em;
  }
  .insights-label{
    font-family:'Manrope',sans-serif;
    font-size:11px;font-weight:800;
    letter-spacing:0.2em;text-transform:uppercase;
    color:rgba(196,145,42,0.45);
  }
</style>
</head><body>
  <div class="wrapper">
    <div class="left-bar"></div>
    <div class="main">
      <div class="upper">
        <div class="badge"><div class="badge-dot"></div><div class="badge-text">From the Insights</div></div>
        <div class="headline">${esc(headline)}</div>
      </div>
      <div class="lower">
        <div class="excerpt">${esc(truncExcerpt)}</div>
        <div class="cta">
          <div class="cta-line"></div>
          <div class="cta-inner">
            <div class="cta-label">Read the full article</div>
            <div class="cta-url">${esc(articleUrl)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-left">
      <div class="avatar"></div>
      <div>
        <div class="name">Daniel Gierach</div>
        <div class="title">Licensed Real Estate Agent · Ray White Bulimba</div>
      </div>
    </div>
    <div class="insights-label">Insights</div>
  </div>
</body></html>`;
}

// ── Screenshot ────────────────────────────────────────────────────────────────
const html = type === 'article' ? buildArticleHtml() : buildMarketHtml();

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log(`✓ ${outPath}`);
