#!/usr/bin/env node
/**
 * screenshot-linkedin.mjs
 *
 * Generates PNG images for LinkedIn posts using Puppeteer.
 *
 * Usage — market/authority post (Tuesday):
 *   node scripts/screenshot-linkedin.mjs \
 *     --type market \
 *     --label "MARKET UPDATE" \
 *     --headline "What January tells sellers in Brisbane's inner east" \
 *     --body "In Brisbane property, January buyers have had two weeks to think it through." \
 *     --date "2027-01-05" \
 *     --out content/social/images/2027-01-05-linkedin-market.png
 *
 * Usage — article LinkedIn post (Thursday):
 *   node scripts/screenshot-linkedin.mjs \
 *     --type article \
 *     --headline "How to Handle a Building and Pest Report as a Seller in Brisbane" \
 *     --excerpt "Most sellers are surprised by what comes up. Here is how to handle it without losing the deal." \
 *     --slug "building-pest-report-seller-guide-brisbane" \
 *     --date "2027-01-07" \
 *     --out content/social/images/2027-01-07-linkedin-article.png
 *
 * Usage — article cover image (Field Guide series, 1200×627):
 *   node scripts/screenshot-linkedin.mjs \
 *     --type article-cover \
 *     --issue "01" \
 *     --headline "Auction vs Private Treaty vs EOI" \
 *     --tagline "How to choose the right method for your sale." \
 *     --readtime "5 MIN READ" \
 *     --date "2026-04-23" \
 *     --out content/social/images/2026-04-23-article-cover.png
 *
 * Usage — authority/market numbered-list post (Tuesday 07:30), 1080×1350:
 *   node scripts/screenshot-linkedin.mjs \
 *     --type authority \
 *     --label "BUYER'S CHECKLIST" \
 *     --headline "Five things to do before you walk into an auction." \
 *     --keyword "auction" \
 *     --p1t "Check the flood overlay." \
 *     --p1b "Brisbane City Council publishes flood maps for free. A Q100 zone can add 40% to insurance." \
 *     --p2t "Read the contract, then re-read." \
 *     --p2b "Special conditions are where money quietly disappears." \
 *     --p3t "Get pre-approved, not pre-qualified." \
 *     --p3b "Pre-qualified is a guess. Pre-approved is a commitment." \
 *     --p4t "Inspect twice: alone, then with a builder." \
 *     --p4b "Your first visit is emotional. The second is forensic." \
 *     --p5t "Write your ceiling on paper." \
 *     --p5b "Auction rooms are designed to push past your number. Paper is how you push back." \
 *     --date "2026-04-21" \
 *     --out content/social/images/2026-04-21-linkedin-market.png
 *
 * Arguments:
 *   --type      market | article | article-cover | authority
 *   --label     Eyebrow label (e.g. "MARKET UPDATE", "BUYER'S CHECKLIST")
 *   --headline  Main headline text
 *   --keyword   One word in the headline to render in italic gold (authority type only)
 *   --body      Body excerpt for market posts (≤ 220 chars recommended)
 *   --excerpt   Pull quote for article posts (≤ 180 chars recommended)
 *   --slug      Insights article slug for article posts (no leading slash)
 *   --issue     Issue number for article-cover (e.g. "01", "02")
 *   --tagline   Tagline for article-cover (bottom-right italic text)
 *   --readtime  Read time for article-cover (e.g. "5 MIN READ")
 *   --p1t–p5t  Title for each numbered point (authority type)
 *   --p1b–p5b  Body text for each numbered point (authority type)
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
const keyword  = get('keyword')  || '';
const body     = get('body')     || '';
const excerpt  = get('excerpt')  || '';
const slug     = get('slug')     || '';
const issue    = get('issue')    || '01';
const tagline  = get('tagline')  || '';
const readtime = get('readtime') || '5 MIN READ';
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
const GOLD_WARM = '#f5d07a';   // warmer gold used in the Field Guide series
const AVATAR    = 'https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg';

const FONT_URL_STANDARD = 'https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&family=Manrope:wght@300;400;600;700;800&display=swap';
const FONT_URL_COVER    = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;600&display=swap';

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Market/Authority template — 1080×1080 ────────────────────────────────────
function buildMarketHtml() {
  const truncBody = body.length > 230 ? body.slice(0, 227) + '…' : body;
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL_STANDARD}" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1080px;overflow:hidden;background:${CHARCOAL};}
  body{font-family:'Manrope',sans-serif;display:flex;flex-direction:column;}
  .top-rule{height:5px;flex-shrink:0;background:linear-gradient(90deg,${GOLD} 0%,rgba(196,145,42,0.2) 100%);}
  .main{flex:1;padding:72px 88px 60px;display:flex;flex-direction:column;justify-content:space-between;min-height:0;}
  .upper{display:flex;flex-direction:column;gap:44px;}
  .eyebrow{display:flex;align-items:center;gap:14px;font-family:'Manrope',sans-serif;font-size:12px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:${GOLD};}
  .eyebrow-line{width:32px;height:1.5px;background:${GOLD};flex-shrink:0;}
  .headline{font-family:'Noto Serif',serif;font-size:60px;font-weight:400;line-height:1.1;color:${CREAM};letter-spacing:-0.015em;max-width:880px;}
  .lower{display:flex;flex-direction:column;gap:32px;}
  .divider{width:56px;height:2px;background:${GOLD};}
  .body{font-family:'Manrope',sans-serif;font-size:19px;font-weight:400;line-height:1.8;color:${CREAM_DIM};max-width:840px;}
  .footer{flex-shrink:0;border-top:1px solid rgba(196,145,42,0.18);padding:28px 88px;display:flex;align-items:center;justify-content:space-between;}
  .footer-left{display:flex;align-items:center;gap:18px;}
  .avatar{width:50px;height:50px;border-radius:50%;flex-shrink:0;background:url('${AVATAR}') center 15%/cover;border:1.5px solid rgba(196,145,42,0.45);}
  .name{font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;color:${CREAM};letter-spacing:0.01em;line-height:1.3;}
  .title{font-family:'Manrope',sans-serif;font-size:11.5px;font-weight:400;color:${CREAM_DIM};margin-top:3px;letter-spacing:0.02em;}
  .url{font-family:'Manrope',sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};}
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

// ── Article LinkedIn post template — 1080×1080 ────────────────────────────────
function buildArticleHtml() {
  const truncExcerpt = excerpt.length > 180 ? excerpt.slice(0, 177) + '…' : excerpt;
  const articleUrl   = `danielgierach.com/insights/${slug}`;
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL_STANDARD}" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1080px;overflow:hidden;background:${CHARCOAL};}
  body{font-family:'Manrope',sans-serif;display:flex;flex-direction:column;}
  .wrapper{flex:1;display:flex;min-height:0;}
  .left-bar{width:5px;flex-shrink:0;background:linear-gradient(180deg,${GOLD} 0%,rgba(196,145,42,0.1) 100%);}
  .main{flex:1;padding:72px 88px 60px 84px;display:flex;flex-direction:column;justify-content:space-between;min-height:0;}
  .upper{display:flex;flex-direction:column;gap:48px;}
  .badge{display:inline-flex;align-items:center;gap:10px;background:rgba(196,145,42,0.1);border:1px solid rgba(196,145,42,0.3);padding:8px 18px;align-self:flex-start;}
  .badge-dot{width:5px;height:5px;border-radius:50%;background:${GOLD};flex-shrink:0;}
  .badge-text{font-family:'Manrope',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:${GOLD};}
  .headline{font-family:'Noto Serif',serif;font-size:52px;font-weight:400;line-height:1.14;color:${CREAM};letter-spacing:-0.01em;max-width:880px;}
  .lower{display:flex;flex-direction:column;gap:36px;}
  .excerpt{font-family:'Noto Serif',serif;font-style:italic;font-weight:300;font-size:23px;line-height:1.7;color:${GOLD};max-width:820px;}
  .cta{display:flex;align-items:center;gap:14px;}
  .cta-line{width:28px;height:1.5px;background:${GOLD};flex-shrink:0;}
  .cta-label{font-family:'Manrope',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};}
  .cta-url{font-family:'Manrope',sans-serif;font-size:12px;font-weight:400;color:${CREAM_DIM};margin-top:4px;letter-spacing:0.02em;}
  .footer{flex-shrink:0;border-top:1px solid rgba(196,145,42,0.18);padding:28px 88px;display:flex;align-items:center;justify-content:space-between;}
  .footer-left{display:flex;align-items:center;gap:18px;}
  .avatar{width:50px;height:50px;border-radius:50%;flex-shrink:0;background:url('${AVATAR}') center 15%/cover;border:1.5px solid rgba(196,145,42,0.45);}
  .name{font-family:'Manrope',sans-serif;font-size:14px;font-weight:700;color:${CREAM};letter-spacing:0.01em;line-height:1.3;}
  .title{font-family:'Manrope',sans-serif;font-size:11.5px;font-weight:400;color:${CREAM_DIM};margin-top:3px;letter-spacing:0.02em;}
  .insights-label{font-family:'Manrope',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:rgba(196,145,42,0.45);}
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

// ── Article Cover (Field Guide series) — 1200×627 ─────────────────────────────
// Matches the exact design from the Canva Code template (V1 Article Cover)
function buildArticleCoverHtml() {
  const issueNum  = issue.padStart(2, '0');
  const readMins  = (readtime.match(/(\d+)/) || ['','5'])[1];
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL_COVER}" rel="stylesheet"/>
<style>
  html,body{margin:0;padding:0;background:${CHARCOAL};}
  *{box-sizing:border-box;}
  .cover{
    width:1200px;height:627px;
    background:${CHARCOAL};color:${CREAM};
    padding:72px 96px;
    display:flex;flex-direction:column;
    font-family:'Inter',-apple-system,sans-serif;
    position:relative;
  }
  .top{display:flex;justify-content:space-between;align-items:baseline;}
  .eyebrow{
    font-family:'JetBrains Mono',ui-monospace,monospace;
    font-size:16px;letter-spacing:2px;text-transform:uppercase;
    color:${GOLD_WARM};
    display:flex;align-items:center;gap:0;
  }
  .dot{
    display:inline-block;width:8px;height:8px;border-radius:50%;
    background:${GOLD_WARM};margin-right:10px;vertical-align:middle;flex-shrink:0;
  }
  .meta{
    font-family:'JetBrains Mono',ui-monospace,monospace;
    font-size:16px;letter-spacing:1.5px;
    color:rgba(240,236,228,0.45);
  }
  .body{
    margin-top:auto;
    margin-bottom:auto;
    display:grid;grid-template-columns:auto 1fr;gap:36px;
    align-items:center;
  }
  .numeral{
    font-family:'Fraunces',Georgia,serif;
    font-size:200px;line-height:0.85;
    color:${GOLD_WARM};font-weight:300;letter-spacing:-5px;
  }
  .headline{
    font-family:'Fraunces',Georgia,serif;
    font-size:46px;line-height:1.1;letter-spacing:-0.8px;
    color:${CREAM};font-weight:400;margin:0;
  }
  .rule{margin-top:28px;height:1px;background:rgba(240,236,228,0.18);}
  .foot{margin-top:20px;display:flex;justify-content:space-between;align-items:center;}
  .byline{display:flex;align-items:center;gap:12px;}
  .avatar-dg{
    width:42px;height:42px;border-radius:50%;
    background:${GOLD_WARM};color:${CHARCOAL};
    display:flex;align-items:center;justify-content:center;
    font-family:'Fraunces',serif;font-size:16px;font-weight:500;
    flex-shrink:0;
  }
  .name{font-size:18px;font-weight:600;color:${CREAM};}
  .sub{font-size:15px;color:rgba(240,236,228,0.55);margin-top:3px;}
  .tag{
    font-family:'Fraunces',serif;font-style:italic;
    font-size:24px;color:${CREAM};
  }
</style>
</head><body>
  <div class="cover">
    <div class="top">
      <div class="eyebrow"><span class="dot"></span>FIELD GUIDE · ISSUE ${esc(issueNum)}</div>
      <div class="meta">${esc(readtime)}</div>
    </div>
    <div class="body">
      <div class="numeral">${esc(issueNum)}</div>
      <h1 class="headline">${esc(headline)}</h1>
    </div>
    <div class="rule"></div>
    <div class="foot">
      <div class="byline">
        <div class="avatar-dg">DG</div>
        <div>
          <div class="name">Daniel Gierach</div>
          <div class="sub">Ray White Collective</div>
        </div>
      </div>
      <div class="tag">${esc(tagline)}</div>
    </div>
  </div>
</body></html>`;
}

// ── Authority/Market numbered-list template — 1080×1350 ─────────────────────
// Replicates the N3 "Two-column numbered list" Canva design.
function buildAuthorityHtml() {
  // Collect up to 5 points from --p1t/--p1b ... --p5t/--p5b
  const points = [1,2,3,4,5].map(n => ({
    t: get(`p${n}t`) || '',
    b: get(`p${n}b`) || '',
  })).filter(p => p.t);

  // Optionally italicise one keyword in the headline (gold, Fraunces italic)
  let headlineHtml = esc(headline);
  if (keyword) {
    const escapedKw = esc(keyword);
    headlineHtml = headlineHtml.replace(
      escapedKw,
      `<em style="color:${GOLD_WARM};font-style:italic;">${escapedKw}</em>`
    );
  }

  const pointsHtml = points.map((p, i) => `
    <div class="row">
      <div class="num">${String(i + 1).padStart(2, '0')}</div>
      <div class="row-content">
        <div class="row-title">${esc(p.t)}</div>
        ${p.b ? `<div class="row-body">${esc(p.b)}</div>` : ''}
      </div>
    </div>`).join('');

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONT_URL_COVER}" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:1080px;height:1350px;overflow:hidden;background:${CHARCOAL};}
  body{
    font-family:'Inter',sans-serif;
    display:flex;flex-direction:column;
    padding:72px 80px 56px;
  }
  .eyebrow{
    display:flex;align-items:center;gap:10px;
    font-family:'JetBrains Mono',monospace;
    font-size:12px;letter-spacing:2.5px;text-transform:uppercase;
    color:${GOLD_WARM};
    margin-bottom:32px;flex-shrink:0;
  }
  .eyebrow-dot{
    width:7px;height:7px;border-radius:50%;
    background:${GOLD_WARM};flex-shrink:0;
  }
  h1{
    font-family:'Fraunces',Georgia,serif;
    font-size:54px;font-weight:400;line-height:1.02;letter-spacing:-1.2px;
    color:${CREAM};
    margin-bottom:40px;flex-shrink:0;
  }
  .list{flex:1;display:flex;flex-direction:column;min-height:0;}
  .row{
    display:flex;align-items:stretch;
    border-bottom:1px solid rgba(240,236,228,0.1);
    padding:14px 0;
    flex:1;
  }
  .row:last-child{border-bottom:none;}
  .num{
    width:90px;flex-shrink:0;
    font-family:'Fraunces',Georgia,serif;
    font-size:52px;font-weight:300;line-height:1;
    color:${GOLD_WARM};
    border-right:1px solid rgba(245,208,122,0.25);
    padding-right:22px;
    display:flex;align-items:flex-start;padding-top:2px;
  }
  .row-content{
    flex:1;
    padding-left:24px;
    display:flex;flex-direction:column;gap:5px;
    justify-content:center;
  }
  .row-title{
    font-family:'Fraunces',Georgia,serif;
    font-size:22px;font-weight:400;line-height:1.2;letter-spacing:-0.4px;
    color:${CREAM};
  }
  .row-body{
    font-family:'Inter',sans-serif;
    font-size:13px;font-weight:400;line-height:1.5;
    color:rgba(240,236,228,0.6);
  }
  .footer{
    flex-shrink:0;
    margin-top:28px;
    padding-top:20px;
    border-top:1px solid rgba(245,208,122,0.15);
    display:flex;align-items:center;justify-content:space-between;
  }
  .footer-left{display:flex;align-items:center;gap:14px;}
  .dg-circle{
    width:44px;height:44px;border-radius:50%;
    background:${GOLD_WARM};color:${CHARCOAL};
    display:flex;align-items:center;justify-content:center;
    font-family:'Fraunces',serif;font-size:16px;font-weight:500;
    flex-shrink:0;
  }
  .f-name{
    font-family:'Inter',sans-serif;
    font-size:14px;font-weight:600;color:${CREAM};line-height:1.3;
  }
  .f-sub{
    font-family:'Inter',sans-serif;
    font-size:11px;font-weight:400;color:rgba(240,236,228,0.5);
    margin-top:2px;
  }
  .f-url{
    font-family:'JetBrains Mono',monospace;
    font-size:11px;letter-spacing:1.5px;
    color:rgba(245,208,122,0.6);
  }
</style>
</head><body>
  <div class="eyebrow"><span class="eyebrow-dot"></span>${esc(label)}</div>
  <h1>${headlineHtml}</h1>
  <div class="list">${pointsHtml}</div>
  <div class="footer">
    <div class="footer-left">
      <div class="dg-circle">DG</div>
      <div>
        <div class="f-name">Daniel Gierach</div>
        <div class="f-sub">Licensed Real Estate Agent · Ray White Bulimba</div>
      </div>
    </div>
    <div class="f-url">danielgierach.com</div>
  </div>
</body></html>`;
}

// ── Screenshot ────────────────────────────────────────────────────────────────
let html, vpWidth, vpHeight;
if (type === 'article-cover') {
  html     = buildArticleCoverHtml();
  vpWidth  = 1200;
  vpHeight = 627;
} else if (type === 'article') {
  html     = buildArticleHtml();
  vpWidth  = 1080;
  vpHeight = 1080;
} else if (type === 'authority') {
  html     = buildAuthorityHtml();
  vpWidth  = 1080;
  vpHeight = 1350;
} else {
  html     = buildMarketHtml();
  vpWidth  = 1080;
  vpHeight = 1080;
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: vpWidth, height: vpHeight, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log(`✓ ${outPath}`);
