# Performance & Code Health Audit, danielgierach.com

Date: 2026-05-10
Scope: Core Web Vitals contributors visible in the source, image optimisation, render-blocking resources, font loading, JavaScript size and execution, CSS bloat, dependency hygiene, dead code, console errors visible in source, semantic HTML.
Source of truth: `/src` (Astro 6, Tailwind 4) and `/dist` (last build, 743 HTML files, 743 pages, total 64.79MB shipped).

## Summary

The build is fully static, deploys cleanly, and the page weight per HTML file is moderate (median 63 KB, average 89 KB). Astro's per-page CSS scoping is working: 19 page-scoped CSS files at ~200 KB total, and a single 70 KB shared `Layout.css`. Astro is not bundling much JavaScript per page either: 30 JS files at ~228 KB total across the entire site, with most pages shipping zero KB of JS bundle apart from the inline scripts in Layout/Nav.

The real perf problems are elsewhere and they all sit in **HTML payload, render-blocking external scripts, and image-loading hygiene**. Specifically:

1. **Inline styles dominate the HTML.** 144,224 `style="…"` attributes across 743 pages, average 193 per page, peaking at 6,830 on `/dashboard` and 2,404 on `/insights`. Every component in `Nav.astro`, `Footer.astro` and most pages is built with `style="…"` instead of Tailwind utilities or class-based CSS. This bloats HTML, defeats Tailwind's strength (atomic class reuse + caching), and prevents gzip/brotli from doing its best work.
2. **Image loading is the single biggest LCP/CLS risk.** 1,818 `<img>` tags in the build (excluding Pixel/favicon trackers, 369 are real content images). Of those 369: only 18 (4.9%) carry `loading="lazy"`, only 3 (0.8%) have `decoding="async"`, and 339 (91.9%) lack explicit `width`/`height` attributes — a textbook recipe for layout shift (CLS) and over-eager image fetching that crowds the LCP candidate.
3. **Render-blocking Google Maps loaded synchronously on five LP pages.** `/lp/bulimba`, `/lp/camp-hill`, `/lp/hawthorne`, `/lp/murarrie`, and `/lp/seven-hills` ship a `<script src="https://maps.googleapis.com/maps/api/js?…libraries=places&callback=…">` tag with no `defer`, no `async`, and no `loading=async` parameter. The homepage's loader is correctly written (uses `loading=async` and `s.async=true`); the LP pages are not.
4. **Tawk.to placeholder loader runs on every page.** `Layout.astro` lines 577-587 always inject `https://embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID`. That URL fails (404), throws a console error, and burns one network round-trip on every page load. 743 pages × 1 wasted request per visit.
5. **`web-vitals` library is loaded from `unpkg.com` per page.** Layout.astro line 499 imports the attribution build from `https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module` with no preconnect. unpkg has high TTFB for Australian visitors and the script is ~8 KB+ on a third-party origin.
6. **`globalSchema` JSON-LD is replicated on every page (~6.6 KB per page).** Multiplied by 743 pages, the same JSON-LD ships 4.9 MB of duplicate text site-wide. It is a single static object; it could be pre-stringified once at module-load time rather than re-stringified per request, and Brotli will collapse it on the wire — but it is still 6.6 KB of HTML to download on every page.
7. **Unused / dead assets in `/public/preview/`.** 18 files totalling 805 KB (377 KB unused `daniel-avatar.jpg`, 17 draft `meta-ad-*.html` files at 22-26 KB each). Robots.txt blocks `/preview/` from indexing but Vercel still serves them publicly.
8. **Dependency hygiene.** `@astrojs/node` is in `package.json` despite `output: 'static'` — dead dependency. All other deps are on current majors (Astro 6.0.6, Tailwind 4.2.2, sitemap 3.7.2, Puppeteer 24.41.0).
9. **Indexable 1.5 MB `/dashboard` page in the build and sitemap.** This is also flagged in 01-technical-seo.md but is repeated here as a perf finding because shipping 1.5 MB of static HTML for an admin/preview page is a real bandwidth cost.
10. **Font loading is correct in concept (preconnect + media print swap), but two heavy weights are requested per page.** Noto Serif at four weights/styles plus Manrope at four weights = eight font files loaded by the swap script. Most pages use 2-3 of them.

The good news: no React/Vue runtime is shipped. No client-side router. No big JS framework cost. The site is HTML-and-Tailwind first, which is exactly the right model for Vercel static hosting. Fixing items 1, 2, 3 and 4 will produce a measurable improvement in LCP and INP without touching the framework.

## Findings table

| ID | Finding | Priority | Effort | Protected impact | Evidence |
|----|---------|----------|--------|------------------|----------|
| PERF-001 | 92% of content `<img>` tags have no `width`/`height`, 95% lack `loading="lazy"`, 99% lack `decoding="async"` | P0 | M | N | `dist/index.html` line 67 lazy count, scripted audit of 369 content imgs |
| PERF-002 | Five LP pages (`lp/*`) load Google Maps API synchronously and render-blocking | P0 | S | N | `src/pages/lp/murarrie.astro` line 256, same in bulimba/camp-hill/hawthorne/seven-hills |
| PERF-003 | Tawk.to widget loader injects script with placeholder IDs (`TAWK_PROPERTY_ID/TAWK_WIDGET_ID`); 404s on every page load | P0 | S | N | `src/layouts/Layout.astro` lines 577-587, `dist/index.html` line 181 |
| PERF-004 | `web-vitals@4` loaded from `unpkg.com` per page with no preconnect | P1 | S | N | `src/layouts/Layout.astro` line 499 |
| PERF-005 | No preconnect for `cdn6.ep.dynamics.net` despite hosting most LCP images on listings, suburb and home pages | P1 | S | N | `src/layouts/Layout.astro` lines 273-276 |
| PERF-006 | `/dashboard/index.html` (1,524 KB) and `/social-preview/index.html` (1,408 KB) ship to production | P1 | S | N | `dist/dashboard/index.html`, `dist/social-preview/index.html` |
| PERF-007 | Nav scroll listener is unthrottled and not passive; rewrites styles on every scroll event | P1 | S | N | `src/components/Nav.astro` line 152 |
| PERF-008 | Five `.reveal*` selectors keep `will-change: transform, opacity` permanently, even after the one-shot animation completes | P2 | S | N | `src/styles/global.css` lines 88, 100, 112, 124, 354 |
| PERF-009 | `globalSchema` JSON-LD (~6.6 KB) re-serialized into HTML on every page; ~4.9 MB total duplicate JSON across 743 pages before compression | P2 | S | N | `src/layouts/Layout.astro` line 311, `dist/about/index.html` |
| PERF-010 | Google Fonts request both fonts at four weights each (8 weight files); `Noto Serif italic 1,400` is requested but rarely used; `300` weights for both fonts may be unused | P2 | S | N | `src/layouts/Layout.astro` line 278 |
| CODE-001 | 144,224 inline `style="…"` attributes across the build, average 193 per page; defeats Tailwind atomic-class caching and inflates raw HTML | P1 | L | N | scripted audit of `/dist/**/*.html`; top page `/dashboard` 6,830, `/insights` 2,404 |
| CODE-002 | Hardcoded Google Maps API key (`[REDACTED-GOOGLE-MAPS-KEY]`) in 7 source files; not env-vared | P1 | S | N | `src/pages/index.astro` line 1080, walkthrough, tools/commute-cost, tools/brisbane-2032, tools/local-eats, lp/murarrie, lp/seven-hills |
| CODE-003 | `@astrojs/node` declared in `dependencies` but `astro.config.mjs` uses `output: 'static'` — package is unused | P2 | S | N | `package.json` line 16, `astro.config.mjs` line 8 |
| CODE-004 | `/public/preview/` ships 18 dead-code preview HTML files plus an unused 377 KB `daniel-avatar.jpg` to production (~805 KB total) | P2 | S | N | `public/preview/` |
| CODE-005 | Mobile menu toggle button has no `aria-expanded` or `aria-controls`; unlabelled state for screen readers | P2 | S | N | `src/components/Nav.astro` line 59 |
| CODE-006 | `src/components/SuburbMap.astro` is the only component that imports `src/data/suburb-map.ts` (252 KB GeoJSON-style file); only used on 48 suburb pages but ships in their JS bundle | P2 | M | N | `src/data/suburb-map.ts`, `src/components/SuburbMap.astro` |
| CODE-007 | Layout.astro is 589 lines and mixes head, body, breadcrumbs, email-capture, suburb cross-link, insight cross-link, mobile call bar, three analytics scripts and Tawk into a single component | P3 | M | N | `src/layouts/Layout.astro` |
| CODE-008 | `console.error` left in shipped client code on three pages (homepage Maps init, two financial calculators) | P3 | S | N | `src/pages/index.astro` line 1162, `src/pages/tools/dcf.astro` lines 577 & 654, `src/pages/tools/deposit-savings.astro` line 1109 |
| CODE-009 | Empty hidden file `/public/.!9236!favicon.ico` (zero bytes, macOS quarantine artefact) tracked in source and copied to `/dist` | P3 | S | N | `public/.!9236!favicon.ico`, `dist/.!9236!favicon.ico` |
| CODE-010 | GA4 stub script and onclick=`gtag(...)` handlers used inline; click handler in Layout.astro lines 508-525 attaches a click listener to *every* `<a>` on the page on `DOMContentLoaded` | P3 | S | N | `src/layouts/Layout.astro` lines 508-525 |

---

## Detail per finding

### PERF-001, image loading is missing CLS/LCP guards (P0)

Evidence (scripted audit of 743 built HTML pages, excluding Meta Pixel `<img>` tracking pixels and the `realestate.com.au` favicon in the footer):

- 369 real content `<img>` tags shipped across the build (`cdn6.ep.dynamics.net` Ray White CDN: 354, `images.unsplash.com`: 15).
- Only **18 (4.9%)** carry `loading="lazy"`.
- Only **3 (0.8%)** carry `decoding="async"`.
- **339 (91.9%) lack explicit `width` and `height` attributes**, even though all served images are fixed-aspect-ratio property photos.
- Only 19 carry `fetchpriority` (correct: just the LCP hero per page).
- Only 12 use `srcset`.

The first `<img>` on most pages — the LCP candidate — is correctly hinted with `fetchpriority="high"` and the homepage uses a `<link rel="preload" as="image" imagesrcset=...>` directive. So LCP for the hero is in good shape on the home and suburb pages.

Below the fold, the picture is bad. As an example from `dist/index.html`, the listings grid renders six 1200×800 property images stacked vertically, only the first uses `loading="eager"`, the rest use `loading="lazy"` (correct). But the listings page itself, the suburb pages, and the insights index all have many images with no `loading` attribute (so they default to `eager`) and no `width`/`height` (so they cause CLS as the browser allocates zero space until the response header arrives).

What is wrong: Without `width`/`height`, the browser cannot reserve space, and any image that loads after first paint will push content down the page. CLS is the result. Without `loading="lazy"`, all below-fold images race the LCP, slowing both. Without `decoding="async"`, image decode work runs on the main thread.

Why it matters: On a property site, images *are* the content. Inner-east buyers browsing on a 4G phone are the audience. CLS over 0.1 fails Core Web Vitals; LCP over 2.5 s also fails. Both are realistic risks here.

Recommended fix:
1. Add `loading="lazy" decoding="async"` to every `<img>` that is below the fold. Easiest mechanism: a small Astro component `<Img>` that defaults to lazy + async and accepts a `priority` prop to opt out for the hero.
2. Add `width` and `height` to every `<img>`. The Ray White CDN does not return Content-Dimension headers, but every property is a known landscape ratio (3:2 or 16:9). Set `width="1200" height="800"` for landscape and `width="900" height="1200"` for portrait avatars.
3. Run Lighthouse with the audit to confirm the CLS contribution drops.

Verification needed: Lighthouse / PageSpeed Insights for CLS and LCP per template (homepage, suburb, insights article, listings, tools).

---

### PERF-002, render-blocking Google Maps on LP pages (P0)

Evidence:
- `src/pages/lp/murarrie.astro` line 256: `<script is:inline src="https://maps.googleapis.com/maps/api/js?key=[REDACTED-GOOGLE-MAPS-KEY]&libraries=places&callback=initMapsAutocomplete"></script>`
- Same line 256 / 270 in `lp/seven-hills.astro`, and equivalent in `lp/bulimba.astro`, `lp/camp-hill.astro`, `lp/hawthorne.astro`.
- The built page `dist/lp/murarrie/index.html` confirms the tag is shipped with no `defer`, no `async`, and no `loading=async` URL parameter.

Compare with the homepage: `src/pages/index.astro` line 1167 builds the script tag in JS with `s.async = true` and `loading=async` in the URL — that is correct. The LP pages should do the same.

What is wrong: A render-blocking script in `<body>` on a paid-traffic landing page. Maps API JS is ~50-100 KB (compressed), parsed and executed before the rest of the page renders. The Place Autocomplete widget is not above the fold on any of these LPs — it is in a form somewhere down the page.

Why it matters: LP traffic is paid. Any LCP/INP regression directly hurts CPA. A 200-400 ms slowdown on LP hero render is measurable and worth fixing.

Recommended fix:
- Replace the inline `<script src="…">` with the same dynamic-load pattern used on the homepage:
  ```js
  window.initMapsAutocomplete = () => { /* … */ };
  const s = document.createElement('script');
  s.src   = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=initMapsAutocomplete&loading=async`;
  s.async = true;
  document.head.appendChild(s);
  ```
- Or even better, lazy-init: only load Maps when the user focuses the address input field.

Verification needed: WebPageTest or Lighthouse run on `/lp/murarrie` before/after, comparing TTI and INP.

---

### PERF-003, Tawk.to widget loads with placeholder IDs (P0)

Evidence:
- `src/layouts/Layout.astro` line 581: `s1.src = 'https://embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID';`
- Confirmed in built HTML, e.g. `dist/index.html` line 181.
- The leading comment on line 576 says "replace … with the values from Admin → Channels → Chat Widget", so this was clearly a placeholder that never got filled in.

What is wrong: On every page load, the script creates a new `<script>` element pointing at a URL that doesn't exist. The browser will perform a DNS lookup for `embed.tawk.to`, open a TLS connection, fetch the URL, receive a 404, and log an error to the console. Worse, the placeholder `Tawk_API` global is initialised, polluting the page's JS environment.

Also already noted as TSEO-011 in 01-technical-seo.md.

Why it matters: Wasted RTT on every page (typically 100-300 ms in AU). Visible console error to anyone opening DevTools. If the widget is not actually used, leaving the loader code in is a perf bug, not a feature.

Recommended fix:
- If Tawk is being used, replace the placeholder IDs with the real values.
- If Tawk is not being used (likely, since this has been there long enough to be in the audit), delete lines 576-587 from Layout.astro entirely.

Verification needed: Open DevTools → Network on any page, filter for `tawk`, confirm the 404. After removal, confirm 0 entries.

---

### PERF-004, web-vitals loaded from unpkg per page (P1)

Evidence:
- `src/layouts/Layout.astro` line 499: `import {onCLS,onINP,onLCP,onFCP,onTTFB} from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';`
- No `<link rel="preconnect" href="https://unpkg.com">` exists.

What is wrong: Two issues. First, unpkg.com is a public CDN with no SLA and high latency to AU (typically 200+ ms). Second, the `attribution` build is the heavy version (~10 KB compressed) — fine if you actually look at the attribution data in GA, but worth checking. Third, no preconnect for the origin, so the first request pays a fresh TLS handshake.

Why it matters: The web-vitals script's job is to *measure* performance. Loading it slowly distorts the metrics it sends to GA and adds load to every page.

Recommended fix:
- Self-host: `npm i web-vitals`, then import from a local path. Astro will bundle and ship it as part of `_astro/`.
- Or, if keeping the CDN, add `<link rel="preconnect" href="https://unpkg.com" crossorigin>` and switch from the `attribution` build to the standard build to halve the size.

Verification needed: Network tab → Confirm `web-vitals` loads from same origin or with preconnect timing.

---

### PERF-005, missing preconnect for the Ray White CDN (P1)

Evidence:
- `src/layouts/Layout.astro` lines 273-276 declares preconnect for fonts.googleapis, fonts.gstatic, googletagmanager, and dns-prefetch for images.unsplash.
- No preconnect for `cdn6.ep.dynamics.net`, even though it serves the LCP hero on the home, listings, suburb, and tool pages, the agent headshot sitewide, and basically every property image.

What is wrong: The browser opens the connection to the CDN only after parsing the first `<img src>` referencing it, which costs a DNS lookup + TLS handshake (often 150-300 ms) before any image bytes flow. Preconnect would do this in parallel with HTML parsing.

Recommended fix:
- Add `<link rel="preconnect" href="https://cdn6.ep.dynamics.net" crossorigin>` to Layout.astro head.
- The `images.unsplash.com` hint should be upgraded from `dns-prefetch` to `preconnect` since the homepage and many insights pages use Unsplash images directly.

---

### PERF-006, indexable, oversized internal pages shipped to production (P1)

Evidence:
- `dist/dashboard/index.html`: 1,524 KB
- `dist/social-preview/index.html`: 1,408 KB
- Both attempt to set `noindex` via JS at runtime, but the initial HTML serves `index, follow` (also flagged as TSEO-005).

What is wrong: 1.5 MB of HTML on a single page is enormous for a static site. These pages embed huge amounts of preview/dashboard content. The dashboard page is intended for Daniel; social-preview is for previewing social cards. Neither has any business being publicly hosted.

Why it matters: Pure bandwidth waste, plus search engines may discover them through internal linking or sitemap (which lists `/dashboard/` — see TSEO-003).

Recommended fix:
- Remove these from the production build entirely. Either move them into `dashboard/` (Next.js) or guard them with an env check that prevents Astro from emitting them in production.
- If they must remain accessible during development, gate them behind `if (import.meta.env.PROD) return Astro.redirect('/')` at the top of each page (won't work for static, but the right pattern is to delete the `.astro` file from `src/pages/` and create a separate dev workflow).

---

### PERF-007, Nav scroll listener is not throttled or passive (P1)

Evidence:
- `src/components/Nav.astro` line 152: `window.addEventListener('scroll', updateNav);`
- `updateNav` (lines 131-150) reads `window.scrollY`, mutates `header.classList`, sets `header.style.boxShadow`, mutates `logoName.style.color`, and iterates `navLinkEls` and `bars` to set per-element `style.color` / `style.background`.
- No `{ passive: true }` flag, no `requestAnimationFrame` debounce, no early-return when state hasn't changed.

What is wrong: Scroll fires up to 60+ times per second. On every fire the function performs DOM reads (scrollY, dataset), DOM writes (classList, multiple style.* assignments, loop over nav link elements), and may force layout recalculation. Without the passive flag, the browser cannot start scrolling until the listener returns, which directly hurts INP.

Recommended fix:
- Pass `{ passive: true }` to the listener.
- Track previous "isLight" state and early-return if unchanged. Most of the work is wasted.
- Wrap DOM writes in `requestAnimationFrame`.

```js
let lastIsLight = null;
function updateNav() {
  const isLight = (window.scrollY > 50) || document.body.dataset.lightNav === 'true';
  if (isLight === lastIsLight) return;
  lastIsLight = isLight;
  // ... existing DOM mutations
}
window.addEventListener('scroll', updateNav, { passive: true });
```

Verification needed: Chrome DevTools → Performance tab → scroll on home page → check "Long tasks" and INP attribution.

---

### PERF-008, `will-change` permanently applied to reveal elements (P2)

Evidence:
- `src/styles/global.css` lines 88, 100, 112, 124, 354 — `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`, `.card-reveal` all declare `will-change: transform, opacity`.
- The IntersectionObserver in Layout.astro (lines 545-562) runs each animation exactly once and unobserves the element, but the CSS rule keeps `will-change` active forever.

What is wrong: `will-change` promotes the element to its own composited layer. On a page with dozens of `.reveal` elements (every section uses it), the browser is told to keep dozens of layers in memory, even though the animations only run once. This wastes GPU memory and can actually hurt scroll performance on low-end Android.

Recommended fix:
- Remove `will-change` from the static CSS rules.
- If a hint is needed during the brief animation window, add a class via JS just before the transition starts, then remove it on `transitionend`.

Verification needed: Chrome DevTools → Rendering tab → Layer borders on a long suburb page; count the layers.

---

### PERF-009, `globalSchema` JSON-LD ships ~6.6 KB on every page (P2)

Evidence:
- `src/layouts/Layout.astro` line 311: `<script type="application/ld+json" set:html={JSON.stringify(globalSchema)} />`
- Inspection of `dist/about/index.html` shows 6,663 bytes inside the global JSON-LD `<script>` tag.
- 743 pages × 6,663 bytes ≈ 4.9 MB of identical JSON across the build (uncompressed). With Brotli on Vercel this collapses to well under 100 KB total transferred, but every page response still costs the tokenizer/parser the full 6.6 KB on the wire pre-compression dictionary boundaries.

What is wrong: The schema is the same on every page (it describes Daniel + Ray White Bulimba, not page-specific entities). Putting it inline on every page is the convention SEO tooling expects, so this is largely fine. But Astro is recomputing `JSON.stringify(globalSchema)` once per page render at build time. Trivially: hoist `const GLOBAL_LD = JSON.stringify(globalSchema)` to module scope.

Why it matters: Build-time CPU is cheap; the bigger issue is pure HTML size — 6.6 KB of inline JSON-LD is measurable in the page weight. Pages without it would be ~10% smaller. Splitting it into a tiny pre-compressed asset isn't really an option (Google reads inline only).

Recommended fix:
- Hoist the stringified schema out of the template render path (build-time only).
- Audit whether the entire `@graph` is needed (Person + RealEstateAgent often duplicate fields; consolidate into one entity where possible).

---

### PERF-010, Google Fonts requests redundant weights (P2)

Evidence:
- `src/layouts/Layout.astro` line 278: `?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,400&family=Manrope:wght@300;400;600;700&display=swap`
- That's Noto Serif at four weight/style combos (300, 400, 700, italic 400) plus Manrope at four weights (300, 400, 600, 700) = up to 8 woff2 files.

What is wrong: A spot check of components shows mainly `font-weight: 400` (regular) and `font-weight: 700` (bold) for both fonts. The 300 weight and the italic 400 of Noto Serif are likely unused.

Recommended fix:
- Audit what weights are actually referenced in CSS (`font-weight: 300|400|600|700|italic`).
- Drop unused weights from the Google Fonts URL. Each removed weight saves ~30 KB of font data.
- Consider self-hosting the fonts via `@font-face` to remove the third-party DNS+TLS hop entirely; for a page that is going to be requested every time, this is usually a net win.

Verification needed: Network tab → filter by `gstatic.com/s/notoserif` → count font files actually loaded vs requested.

---

### CODE-001, inline styles dominate the HTML (P1)

Evidence (scripted count of `style="` across all 743 built HTML files):

- Total: 144,224 inline style attributes
- Average: 193 per page
- Distribution:
  - `/dashboard/index.html`: 6,830
  - `/social-preview/index.html`: 6,345
  - `/insights/index.html`: 2,404
  - `/index.html` (home): 592
  - `/tools/index.html`: 583
  - `/tools/heatmap/index.html`: 466
  - `/resources/index.html`: 370
  - `/insights/selling-in-brisbane-suburbs/index.html`: 365
  - `/suburbs/murarrie/index.html`: 340
  - `/suburbs/seven-hills/index.html`: 338

Sample (from `Footer.astro` lines 12-18):

```astro
<span style="font-family:var(--font-serif);font-size:1.5rem;font-weight:400;font-style:italic;color:var(--color-text-primary);letter-spacing:0.02em;">
```

That same `<span>` style block is repeated in `Nav.astro` line 31, and similar blocks recur in every component. None of these styles use Tailwind utilities (`font-serif`, `text-2xl`, `italic`, `text-primary`).

What is wrong:
1. Inline styles cannot be cached. The same five property bag repeats inside every page's HTML, every byte downloaded again.
2. Inline styles defeat Tailwind. The point of Tailwind 4 is that `class="font-serif text-2xl italic"` ships once in the shared CSS file and the class names are tiny strings repeated in HTML — gzip dedupes them efficiently. Inline `style="font-family:...;font-size:...;..."` is the opposite of that.
3. They make CSS specificity hard to reason about. CSS classes in `global.css` with `!important` overrides (`.fpill.active-all { background: #1c1917 !important; ... }` line 215) hint at the team having hit this exact issue.
4. They cause Lighthouse to flag "Avoid an excessive DOM size" and "Reduce unused CSS" without a path to fix.

Why it matters: Larger HTML = slower TTFB, slower First Paint. The site already ships 64.79 MB of HTML across 743 pages. Cutting average page from 89 KB to 50-60 KB by moving inline styles into reusable Tailwind classes or component CSS would shave ~25 MB off the entire site footprint and make subsequent page navigations feel snappier (since Tailwind's CSS is cached after the first page).

Recommended fix:
- This is a long, mechanical refactor. Start with the worst offenders:
  1. `Nav.astro` and `Footer.astro` — every visitor sees these on every page.
  2. `Layout.astro` lines 354-453 (breadcrumb, email capture, suburb cross-link, insight cross-link sections).
  3. Insights index, suburb pages, listings.
- For each: replace `style="..."` with Tailwind utilities. Where Tailwind doesn't have the utility (clamp(), specific opacity-with-color, etc.), either add a small CSS class to `global.css` or use Tailwind's arbitrary value syntax (`text-[clamp(2rem,4vw,3rem)]`).
- Set up a lint rule (or even a one-shot grep + manual review): no `style="..."` in production components.

Verification needed: Lighthouse "Reduce unused CSS" / "DOM size" audits; before/after comparison of average HTML page size.

---

### CODE-002, hardcoded Google Maps API key (P1)

Evidence (7 hardcoded occurrences of `[REDACTED-GOOGLE-MAPS-KEY]`):

- `src/pages/index.astro` line 1080
- `src/pages/walkthrough.astro` line 737
- `src/pages/tools/commute-cost.astro` line 480
- `src/pages/tools/brisbane-2032.astro` line 3
- `src/pages/tools/local-eats.astro` line 4
- `src/pages/lp/murarrie.astro` line 256
- `src/pages/lp/seven-hills.astro` line 270

What is wrong: Maps API keys are public by design (they get sent to the browser anyway), but hardcoding the literal string in seven different files means rotating it requires editing seven files. It also means an audit cannot tell easily which pages use Maps.

Why it matters: Mostly a maintenance and rotation issue. The key *is* publicly visible — that's expected for client-side Maps — but it should be domain-restricted in the GCP console. Confirm that.

Recommended fix:
- Move the key to `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY` (PUBLIC_ prefix is required for Astro to expose to client). Reference it via `const MAPS_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;` everywhere.
- Verify HTTP referrer restrictions in GCP console: only `*.danielgierach.com/*` and `localhost` should be allowed.

Verification needed: GCP console → Credentials → Application restrictions for the key.

---

### CODE-003, unused `@astrojs/node` dependency (P2)

Evidence:
- `package.json` line 16: `"@astrojs/node": "^10.0.2"`
- `astro.config.mjs` line 8: `output: 'static'` (no SSR adapter referenced).
- `grep -r '@astrojs/node' src/` returns nothing.

Recommended fix: `npm uninstall @astrojs/node`. Saves ~few MB of node_modules, removes a dependency from the security audit surface, makes intent clear.

---

### CODE-004, dead-code preview assets in /public/preview/ (P2)

Evidence:
- `public/preview/` contains 18 files totalling 805 KB.
- `daniel-avatar.jpg` (377 KB) is the largest single asset in `/public` and is not referenced from any `.astro` file (no `<img src="/preview/daniel-avatar.jpg">` anywhere).
- 17 `meta-ad-*.html` files (22-26 KB each) are draft Meta ad creatives used by Puppeteer recording scripts, not page content.
- `robots.txt` blocks `/preview/` from crawling, but the files are still served at `https://danielgierach.com/preview/...`.

What is wrong: These ship to production for no reason. They contribute to the build artefact size on every deploy and consume Vercel bandwidth if anyone (or anything) requests them.

Recommended fix:
- Move the source HTML drafts out of `/public` and into a sibling folder like `/ad-drafts/` that Astro doesn't copy. Update the Puppeteer recording scripts to point at the new path.
- Delete `daniel-avatar.jpg` from `/public/preview/` if it is genuinely unused. The agent headshot used in the live site is served from `cdn6.ep.dynamics.net`.

---

### CODE-005, mobile menu missing `aria-expanded` / `aria-controls` (P2)

Evidence:
- `src/components/Nav.astro` line 59: `<button id="mobile-toggle" … aria-label="Menu">` — has aria-label but nothing reflecting open/closed state.
- The mobile menu div has `id="mobile-menu"` but the toggle button has no `aria-controls="mobile-menu"`.

What is wrong: Screen readers cannot tell the user whether the menu is currently open or closed, and cannot announce the relationship between the toggle and the menu.

Recommended fix:
```astro
<button id="mobile-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu" ...>
```

In the existing JS click handler, sync `aria-expanded`:
```js
mobileToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileToggle.setAttribute('aria-expanded', String(menuOpen));
  // ... existing
});
```

Verification needed: axe-core or Lighthouse Accessibility audit.

---

### CODE-006, large `suburb-map.ts` data file used by every suburb page (P2)

Evidence:
- `src/data/suburb-map.ts`: 252 KB (largest single source file in the project).
- Imported only by `src/components/SuburbMap.astro`.
- `SuburbMap.astro` is imported by 48 suburb pages.

What is wrong: Astro tree-shakes data imports per page, so each suburb page's bundle pulls the entire data file. The built CSS files for suburb pages (`murarrie@_@astro.vjL_MkKW.css`, 12,995 B; `seven-hills@_@astro.gCQ74Fum.css`, 13,062 B) are normal-sized, but the JS for `SuburbMap` likely loads the full 252 KB on every suburb page if not properly code-split.

Verification needed: `dist/_astro/SuburbMap.astro_astro_type_script_index_0_lang._V-QlqPA.js` is only 4 KB, suggesting that Astro is *not* inlining the 252 KB data file into the script (which is good). Confirm via DevTools Network tab on `/suburbs/murarrie` that no 250+ KB JS is requested.

If the data file is indeed pulled in: split it per suburb and lazy-load only the relevant region.

---

### CODE-007, Layout.astro is doing too much (P3)

Evidence: `src/layouts/Layout.astro` is 589 lines and contains:

- HTML head with meta + JSON-LD + font loader (good)
- Body breadcrumbs UI (lines 354-371)
- Body email capture form for insights articles (lines 376-409)
- Suburb-to-insight cross-link block (lines 416-434)
- Insight-to-suburb cross-link block (lines 436-453)
- Mobile sticky call bar (lines 457-471)
- Meta Pixel inline script (lines 473-489)
- GA4 inline (lines 491-496)
- Web Vitals dynamic import (lines 498-505)
- GA4 enhanced tracking listener (lines 507-525)
- Formspree redirect handler (lines 527-543)
- Global scroll-reveal IntersectionObserver (lines 545-574)
- Tawk.to placeholder loader (lines 576-587)

What is wrong: A layout component that mounts on every page should not contain business logic for content blocks (email capture, cross-links). The cross-link blocks in particular only appear on suburb / insight pages, so they cost render time on every other page even when not displayed (the conditionals are server-side, so this is build-time cost only — but it makes the file impossible to navigate).

Recommended fix:
- Extract `<EmailCaptureInsights />`, `<SuburbCrossLink />`, `<InsightCrossLink />`, `<MobileCallBar />` into their own components.
- Move the analytics scripts (Meta Pixel, GA4, web-vitals, click tracking, Formspree handler, scroll reveal) into a single `<Analytics.astro>` partial.
- Layout.astro then becomes ~150 lines: head + slot + footer + Analytics.

This is mostly a maintainability finding, not a perf one.

---

### CODE-008, console.error left in shipped code (P3)

Evidence:
- `src/pages/index.astro` line 1162: `} catch(e) { console.error('Places init error', e); }`
- `src/pages/tools/dcf.astro` lines 577 & 654: `console.error(e);`
- `src/pages/tools/deposit-savings.astro` line 1109: `console.error(err);`

These will only fire on actual error paths, not on every page load, but they ship to production with no telemetry pipe. If users hit them, no one will know.

Recommended fix:
- Forward to GA4: `gtag('event', 'js_error', { event_category: 'js_error', event_label: e.message });`
- Or remove if the catch block already handles the error gracefully and the user does not need to know.

---

### CODE-009, macOS quarantine artefact tracked in /public/ (P3)

Evidence:
- `public/.!9236!favicon.ico` — 0 bytes, dated 23 Mar 18:37.
- `dist/.!9236!favicon.ico` — same artefact copied into the build.

What is wrong: macOS leaves `.!####!filename` artefacts when files are quarantined or downloaded from the internet. This one is empty and shouldn't exist at all.

Recommended fix: `rm "public/.!9236!favicon.ico"`. Add `.!*` or `._*` to `.gitignore`.

---

### CODE-010, Layout.astro click handler attaches to every `<a>` on `DOMContentLoaded` (P3)

Evidence:
- `src/layouts/Layout.astro` lines 508-525.

```js
document.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() { /* check href, fire gtag */ });
});
```

What is wrong: On suburb pages with the footer's 37-suburb list and the insights cross-link grid, this attaches 80+ click listeners. On the homepage with its tools grid + listings + footer + insights, it's 100+. Each listener is a closure that holds the `link` element. Total memory cost is small, but it is wasteful — a single delegated handler on `document` would do the same job with one listener.

Recommended fix:
```js
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('tel:'))    gtag('event', 'phone_click',    { event_category: 'contact', event_label: href.slice(4) });
  if (href.startsWith('mailto:')) gtag('event', 'email_click',    { event_category: 'contact', event_label: href.slice(7) });
  if (href.startsWith('http') && !href.includes('danielgierach.com'))
                                  gtag('event', 'outbound_click', { event_category: 'outbound', event_label: href });
});
```

---

## Build statistics summary

| Metric | Value | Notes |
|---|---|---|
| Total HTML pages | 743 | per `find dist -name '*.html'` |
| Total HTML weight | 64.79 MB | uncompressed |
| Average HTML page | 89.3 KB | |
| Median HTML page | 63.3 KB | |
| Largest HTML page | 1,524 KB | `/dashboard/index.html` (should not ship) |
| 2nd largest | 1,408 KB | `/social-preview/index.html` (should not ship) |
| 3rd largest | 659 KB | `/insights/index.html` (560-line source page) |
| Total astro CSS | 200.9 KB | 19 files, largest is `Layout.css` at 71.8 KB |
| Total astro JS | 228.1 KB | 30 files, largest is `dashboard.astro_…` at 26.9 KB |
| Inline `style="…"` attrs | 144,224 | average 193 per page |
| Total `<script>` tags (in HTML) | 10,064 | average ~13 per page (mostly inline analytics blocks) |
| Sitemap URLs | 725 | `dist/sitemap-0.xml` |
| Source `.astro` pages | 707 | |
| Insights articles (source) | 579 | |
| Suburb pages (source) | 48 | |
| Tool pages (source) | 57 | |

---

## Build performance

Note: I did not run `npm run build` during this audit because (a) a recent build artefact already existed at `/dist` (timestamps from 2026-05-10 20:32) and (b) re-running build was not necessary to evaluate the output. If a fresh timing measurement is needed, run `time npm run build` and capture wall-clock time.

The fact that 707 source pages compile down to 743 dist HTMLs (sitemap + 404 + a few extras) suggests build is using Astro's standard SSG pipeline with no dynamic page generation — should be fast.

---

## Cannot verify without browser tools — flagged explicitly

The findings above are all derived from reading source and build output. The following claims **must** be verified with a browser-based tool before being acted on with confidence:

| Claim | Verification tool | What to look for |
|---|---|---|
| Actual LCP per page | PageSpeed Insights (mobile) / Lighthouse | Should be under 2.5 s on 4G |
| Actual CLS per page | PageSpeed Insights / Lighthouse | Should be under 0.1; PERF-001 predicts higher than that on suburb / listing pages |
| Actual INP | Real-User Monitoring via web-vitals → GA4 (already wired up in Layout.astro line 504) | Should be under 200 ms; PERF-007 predicts main-thread blocking on long suburb pages |
| Network waterfall ordering | Chrome DevTools Network → "Disable cache" → reload | Confirm Tawk 404, confirm cdn6.ep.dynamics.net is connected late, confirm font CSS arrives via media-print swap |
| Render-blocking detection | Lighthouse "Eliminate render-blocking resources" | Should pick up PERF-002 (LP Maps) and PERF-004 (web-vitals) |
| Layout shift visualisation | Chrome DevTools → Rendering → "Layout Shift Regions" | Scroll suburb pages, look for blue flashes around image areas |
| Long task analysis | Chrome DevTools Performance tab → record scroll | Confirm or refute PERF-007 (Nav scroll) |
| DOM tree size | Lighthouse DOM size audit | Pages with 6,000+ inline styles likely have correspondingly large DOM trees |
| GeoJSON-style suburb-map.ts not inlined into JS | DevTools Network on `/suburbs/murarrie` | Confirm no 200+ KB JS payload |

Recommended monitoring setup:
1. **Lighthouse CI** wired to GitHub via the official action; budget per template (home, suburb, insights article, listings, tools, lp).
2. **CrUX Real User Monitoring** from Search Console (free) — gives field LCP/CLS/INP per origin.
3. **Self-hosted web-vitals → GA4** is already running (PERF-004 fix should improve its accuracy).

---

## Priority roadmap

Quick wins (1 day):
1. PERF-003: delete Tawk.to placeholder loader (15 min).
2. PERF-002: change LP Maps loaders to async pattern (45 min for all 5 LPs).
3. PERF-005: add `cdn6.ep.dynamics.net` preconnect (5 min).
4. CODE-003: remove `@astrojs/node` dep (1 min).
5. CODE-009: delete macOS quarantine file, add to gitignore (2 min).
6. CODE-008: replace `console.error` with GA4 events or remove (15 min).
7. CODE-005: add `aria-expanded` to mobile toggle (5 min).
8. PERF-009: hoist `JSON.stringify(globalSchema)` to module scope (5 min).

Medium (1-2 days):
9. PERF-001: add `loading="lazy" decoding="async"` and `width`/`height` to all below-fold imgs.
10. PERF-006: remove `/dashboard` and `/social-preview` from production build.
11. PERF-007: throttle/passive Nav scroll listener.
12. PERF-008: remove permanent `will-change` from `.reveal*` rules.
13. PERF-010: trim Google Fonts request to actually-used weights.
14. CODE-002: env-var the Maps API key.
15. CODE-004: clean `/public/preview/` of dead drafts.
16. PERF-004: self-host web-vitals or preconnect unpkg.

Larger (multi-day):
17. CODE-001: refactor inline styles into Tailwind utilities, starting with Nav, Footer, Layout sections.
18. CODE-007: split Layout.astro into smaller components.
19. CODE-006: confirm and (if needed) split `suburb-map.ts` per suburb for lazy loading.
