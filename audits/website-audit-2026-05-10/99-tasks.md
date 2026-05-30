# 99 Tasks, Claude Code Ready

How to use this file. Each task block below is self-contained. Pick a batch, run the tasks in order, commit after each batch (or after each task on critical batches), and verify before moving on. Quoted code is exact, taken from the audit findings. Items needing Daniel sign-off (visible copy, account access, environment access) are flagged inline. Items that need verification before action sit in the appendix at the end.

The protected pages (home /, /property-worth, /property-report, /walkthrough, /get-an-appraisal, /contact, /thank-you, all /suburbs/*, all /tools/*, all /lp/*) only accept non-visual changes (titles, schema, internal links inserted via layout, accessibility name attributes, calculator math fixes that do not change layout). Anything that would alter rendered visible content on those pages is excluded here.

## Table of contents

- [Batch 01, Critical security and exposure](#batch-01-critical-security-and-exposure)
- [Batch 02, Sitemap and robots clean-up](#batch-02-sitemap-and-robots-clean-up)
- [Batch 03, Tool layout and titles](#batch-03-tool-layout-and-titles)
- [Batch 04, Tools data correctness](#batch-04-tools-data-correctness)
- [Batch 05, Analytics, Pixel events and Tawk.to removal](#batch-05-analytics-pixel-events-and-tawkto-removal)
- [Batch 06, Performance, image attrs, render-blocking, preconnects](#batch-06-performance-image-attrs-render-blocking-preconnects)
- [Batch 07, Accessibility, focus, mobile menu, contrast, labels](#batch-07-accessibility-focus-mobile-menu-contrast-labels)
- [Batch 08, Local SEO, agency name, social URLs, schema, licence](#batch-08-local-seo-agency-name-social-urls-schema-licence)
- [Batch 09, On-page SEO, titles, internal linking](#batch-09-on-page-seo-titles-internal-linking)
- [Batch 10, Content, factual errors and consolidation](#batch-10-content-factual-errors-and-consolidation)
- [Verification-blocked appendix](#verification-blocked-appendix)

---

## Batch 01, Critical security and exposure

### TASK SEC-001: Rotate Supabase secret key and remove from local .env

- **Source finding:** 06-security.md, SEC-001
- **Files:** `/Users/danielgierach/DanielGierachProperty/.env`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 01

**Requires external account** (Supabase dashboard, Vercel project env)

**Current state** (quoted exactly):
```
PUBLIC_GOOGLE_MAPS_KEY=[REDACTED-GOOGLE-MAPS-KEY]
SUPABASE_KEY=[REDACTED-SUPABASE-SECRET-KEY]
```

**Target state:**
1. Rotate the Supabase secret key in the Supabase dashboard (treat the existing key as exposed because it sits in plaintext on disk).
2. Store the replacement in Vercel project env (encrypted at rest) and 1Password / vault, not in a plaintext `.env` in the working tree.
3. If only public read access is needed by client code, switch to a `sb_publishable_` key and ensure RLS is strictly enforced.
4. Remove `SUPABASE_KEY=...` from `/Users/danielgierach/DanielGierachProperty/.env` once the working dashboard project has the new value from Vercel env.

**Verification:** `grep -r "sb_secret_" /Users/danielgierach/DanielGierachProperty/` returns no matches. `git log --all --full-history -- .env` confirms the file has never been committed (already verified clean per audit). New key works in the dashboard project that consumes it.

**Rollback:** Reinstate the new key in `.env` if the dashboard project breaks. The old key, once rotated, cannot be reused.

---

### TASK SEC-002: Move /dashboard and /social-preview behind real server-side auth

- **Source finding:** 06-security.md, SEC-002 (also covers TSEO-005 and PERF-006)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/dashboard.astro`, `/Users/danielgierach/DanielGierachProperty/src/pages/social-preview.astro`, `/Users/danielgierach/DanielGierachProperty/vercel.json`
- **Protected impact:** None
- **Effort:** M
- **Batch:** 01

**Requires deploy/env access**

**Current state** (quoted exactly):
```
src/pages/dashboard.astro line 1221: const PASS = 'dang2026';
src/pages/social-preview.astro line 266: const PASS = 'dang2026';
```
Pages render a "password gate" overlay; client JS compares `inp.value === PASS` and toggles CSS visibility. SSR has already shipped: last 30 commit messages, internal API base URL `http://127.0.0.1:3100`, company UUID `e01db3e8-fb70-4c7a-b7a7-495c1df05882`, GitHub repo URL `https://github.com/dang281/DanielGierachProperty1/blob/main/...`, full draft social caption text, and "Notes for Daniel" content.

**Target state:**
Pick one of the three options below in priority order:

1. Best, Vercel Password Protection (paid feature on Pro plan), or Vercel Standard Protection via deployment-level auth, gating before SSR runs.
2. Strong, move `/dashboard` and `/social-preview` behind a Vercel Edge Middleware that checks an HTTP-only signed cookie. Reject with 401 before SSR.
3. Minimum, set `output: 'server'` on these two routes only and gate via `Astro.request` headers with a real password compared server-side, returning a 404 / redirect for unauthenticated requests so no body leaks.

Also:
- Add `X-Robots-Tag: noindex` HTTP header for these routes (currently the meta tag is set client-side after render, which crawlers may have already indexed past).
- Until fixed, treat `dang2026` as public knowledge and rotate to a unique passphrase even if the gate moves server-side.

The cleanest one-shot fix: delete the two `.astro` files from `src/pages/` (so they no longer ship as static HTML) and migrate their contents into the separate Next.js dashboard project that already exists.

**Verification:** `curl -s https://danielgierach.com/dashboard` returns 401/404 with no SSR body. `curl -s https://danielgierach.com/social-preview` returns 401/404 with no SSR body. Both URLs contain no draft caption text, no commit hashes, no company UUID.

**Rollback:** `git revert <commit>` restores the prior pages. Vercel auth can be turned off in the dashboard.

---

### TASK SEC-004: Replace mixed-content http:// listing links with https://

- **Source finding:** 06-security.md, SEC-004
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro`
- **Protected impact:** Home page is protected. Internal data array, no visible page change as the rendered text labels are unchanged. The href value is metadata-equivalent on a click target.
- **Effort:** S
- **Batch:** 01

**Current state** (quoted exactly):
```
L52: href: 'http://raywhitebulimba.com.au/L24412788',
L63: href: 'http://raywhitebulimba.com.au/L39017810',
```

**Target state:**
```
L52: href: 'https://raywhitebulimba.com.au/L24412788',
L63: href: 'https://raywhitebulimba.com.au/L39017810',
```

**Verification:** `grep -n "http://raywhitebulimba" /Users/danielgierach/DanielGierachProperty/src/pages/index.astro` returns no matches. View source on `/` after deploy and confirm the two listing links use https.

**Rollback:** `git revert <commit>`.

---

### TASK SEC-008: Remove deprecated X-XSS-Protection header

- **Source finding:** 06-security.md, SEC-008
- **Files:** `/Users/danielgierach/DanielGierachProperty/vercel.json`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 01

**Requires deploy/env access**

**Current state** (quoted exactly):
```
{ "key": "X-XSS-Protection", "value": "1; mode=block" }
```

**Target state:** Remove that key/value pair from `vercel.json` headers. The control plane is CSP (handled separately under verification-blocked items).

**Verification:** After deploy, `curl -sI https://danielgierach.com/` shows no `x-xss-protection` header. https://securityheaders.com no longer flags the deprecated header.

**Rollback:** Restore the line.

---

### TASK CODE-009: Delete macOS quarantine artefact in /public/

- **Source finding:** 04-performance-code-health.md, CODE-009
- **Files:** `/Users/danielgierach/DanielGierachProperty/public/.!9236!favicon.ico`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 01

**Current state** (quoted exactly):
```
public/.!9236!favicon.ico, 0 bytes, dated 23 Mar 18:37
dist/.!9236!favicon.ico, same artefact copied into the build
```

**Target state:** Delete the file. Add `.!*` to `.gitignore`.

```bash
rm "/Users/danielgierach/DanielGierachProperty/public/.!9236!favicon.ico"
```

Append to `.gitignore`:
```
.!*
._*
```

**Verification:** `ls /Users/danielgierach/DanielGierachProperty/public/.!9236!favicon.ico` returns "No such file". After next build, no `.!*` file in `dist/`.

**Rollback:** None needed; the file was empty.

---

### TASK CODE-003: Remove unused @astrojs/node dependency

- **Source finding:** 04-performance-code-health.md, CODE-003
- **Files:** `/Users/danielgierach/DanielGierachProperty/package.json`, `package-lock.json`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 01

**Current state** (quoted exactly):
```
package.json line 16: "@astrojs/node": "^10.0.2"
astro.config.mjs line 8: output: 'static' (no SSR adapter referenced)
grep -r '@astrojs/node' src/ returns nothing
```

**Target state:**
```bash
cd /Users/danielgierach/DanielGierachProperty && npm uninstall @astrojs/node
```

**Verification:** `grep "@astrojs/node" /Users/danielgierach/DanielGierachProperty/package.json` returns nothing. `npm run build` still completes successfully.

**Rollback:** `npm install @astrojs/node@^10.0.2`.

---

### TASK TRUST-008: Remove visible internal note on /reviews

- **Source finding:** 07-local-seo-trust.md, TRUST-008 (and TRUST-004)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/reviews.astro` lines 174-179
- **Protected impact:** /reviews is not in the protected list; safe to modify.
- **Effort:** S
- **Batch:** 01

**Current state:**
A yellow "For Daniel: Add Your Client Testimonials" instructional box at `reviews.astro:174-179` is rendered to the live page. (The exact markup was not reproduced in the audit; locate it by the heading text "For Daniel".)

**Target state:** Delete the lines that render the yellow note. If Daniel wants to keep the slot for future reviews, gate the block behind `{ false && (...) }` or a `draft` flag so it is never visible to public visitors. `[CONFIRM EXACT TEXT WITH DANIEL]` for whether to delete or hide.

**Verification:** `curl -s https://danielgierach.com/reviews | grep -i "For Daniel"` returns nothing. View the page in browser; no yellow internal note appears.

**Rollback:** `git revert <commit>`.

---

## Batch 02, Sitemap and robots clean-up

### TASK TSEO-001: Resolve dual-sitemap conflict

- **Source finding:** 01-technical-seo.md, TSEO-001
- **Files:** `/Users/danielgierach/DanielGierachProperty/public/robots.txt`, `/Users/danielgierach/DanielGierachProperty/src/pages/sitemap.xml.ts`, `/Users/danielgierach/DanielGierachProperty/astro.config.mjs`
- **Protected impact:** None
- **Effort:** M
- **Batch:** 02

**Current state** (quoted exactly):
```
public/robots.txt lines 8-9:
  Sitemap: https://danielgierach.com/sitemap-index.xml
  Sitemap: https://danielgierach.com/sitemap.xml
astro.config.mjs line 10 enables @astrojs/sitemap.
src/pages/sitemap.xml.ts is a custom 300-line route emitting dist/sitemap.xml.
sitemap-0.xml contains 721 URLs; sitemap.xml contains 255 URLs.
```

**Target state:** Adopt Option 1 from the audit (lower risk and lower maintenance):

1. Delete `/Users/danielgierach/DanielGierachProperty/src/pages/sitemap.xml.ts`.
2. Edit `public/robots.txt` to remove the second Sitemap line so only `Sitemap: https://danielgierach.com/sitemap-index.xml` remains.
3. Update the `sitemap()` filter in `astro.config.mjs` per TSEO-003 below.

**Verification:** `curl -I https://danielgierach.com/sitemap.xml` returns 404. `curl https://danielgierach.com/sitemap-index.xml` lists `/sitemap-0.xml` only. `curl https://danielgierach.com/robots.txt` shows one Sitemap line.

**Rollback:** `git revert <commit>` restores both sitemaps.

---

### TASK TSEO-003: Extend Astro sitemap filter to exclude disallowed paths

- **Source finding:** 01-technical-seo.md, TSEO-003
- **Files:** `/Users/danielgierach/DanielGierachProperty/astro.config.mjs`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 02

**Current state** (quoted exactly):
```js
astro.config.mjs lines 11-15 only filter thank-you, privacy, terms, 404.
dist/sitemap-0.xml contains entries for:
  https://danielgierach.com/dashboard/
  https://danielgierach.com/lp/bulimba/, /lp/camp-hill/, /lp/hawthorne/, /lp/murarrie/, /lp/seven-hills/
  https://danielgierach.com/social-preview/
public/robots.txt lines 3-5 disallow /dashboard/, /lp/, /preview/.
```

**Target state** (quoted exactly from the audit recommended fix):
```js
sitemap({
  filter: (page) =>
    !page.includes('/thank-you') &&
    !page.includes('/privacy') &&
    !page.includes('/terms') &&
    !page.includes('/404') &&
    !page.includes('/dashboard') &&
    !page.includes('/social-preview') &&
    !page.includes('/lp/'),
}),
```

**Verification:** After build, `grep -E "(dashboard|lp/|social-preview|thank-you|privacy|terms|404)" /Users/danielgierach/DanielGierachProperty/dist/sitemap-0.xml` returns nothing.

**Rollback:** `git revert <commit>`.

---

### TASK TSEO-002: Set /thank-you and /404 to noindex

- **Source finding:** 01-technical-seo.md, TSEO-002
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/thank-you.astro`, `/Users/danielgierach/DanielGierachProperty/src/pages/404.astro`, `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro`
- **Protected impact:** /thank-you is protected; this is a metadata-only change to the robots meta tag (no rendered visual change).
- **Effort:** S
- **Batch:** 02

**Current state** (quoted exactly):
```
dist/thank-you/index.html: <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"> and <link rel="canonical" href="https://danielgierach.com/thank-you/">
dist/404.html: same robots and <link rel="canonical" href="https://danielgierach.com/404/">
Layout.astro line 269 only sets noindex, nofollow when draft is true.
```

**Target state:** In both `thank-you.astro` and `404.astro`, pass `draft={true}` to `<Layout>`. The existing `draft` prop already wires into the robots meta on line 269.

Example:
```astro
<Layout title="..." description="..." draft={true}>
```

If `draft` is unsuitable semantically, add a dedicated `noindex` prop on `Layout.astro` mirroring the same logic.

**Verification:** After build, `grep "noindex" /Users/danielgierach/DanielGierachProperty/dist/thank-you/index.html` and the equivalent on `dist/404.html` both find the noindex meta tag. Live `curl https://danielgierach.com/thank-you` returns the page with `noindex` in the head.

**Rollback:** Remove the `draft={true}` prop.

---

### TASK TSEO-005: Replace JS-based noindex on dashboard and social-preview

- **Source finding:** 01-technical-seo.md, TSEO-005
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/dashboard.astro`, `/Users/danielgierach/DanielGierachProperty/src/pages/social-preview.astro`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 02

**Note:** Once SEC-002 lands and these pages are removed from the static build, this task is moot. Apply only if the pages remain server-rendered.

**Current state** (quoted exactly):
```
src/pages/dashboard.astro line 3:
<script>document.querySelector('meta[name="robots"]')?.setAttribute('content','noindex,nofollow');</script>
src/pages/social-preview.astro: identical pattern.
Initial HTML on both pages includes <meta name="robots" content="index, follow, ..."> set by Layout.astro line 269.
```

**Target state:** Add a `noindex` prop (or reuse `draft={true}`) to `<Layout>` for both pages and remove the JS override.

```astro
<Layout title="..." description="..." draft={true}>
```

Delete the `<script>document.querySelector(...)</script>` line from both files.

**Verification:** Initial HTML response includes `noindex, nofollow` in the robots meta tag. View source on both pages confirms the JS override is gone.

**Rollback:** Restore the script line.

---

## Batch 03, Tool layout and titles

### TASK TSEO-007: Fix tool page brand suffix in ToolLayout

- **Source finding:** 01-technical-seo.md, TSEO-007 (also OSEO-005)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/ToolLayout.astro` line 14
- **Protected impact:** Layout file affecting protected /tools/* pages. Title tag is metadata, no rendered visual change to the page body. The browser tab text changes; per the audit this is metadata-equivalent. `[CONFIRM EXACT TEXT WITH DANIEL]`
- **Effort:** S
- **Batch:** 03

**Current state** (quoted exactly):
```astro
<Layout title={`${title} | Dan's Website`} description={description}>
```

**Target state** (quoted exactly from the recommended fix):
```astro
<Layout title={`${title} | Daniel Gierach Property`} description={description}>
```

**Verification:** After build, `grep -l "Dan's Website" /Users/danielgierach/DanielGierachProperty/dist/tools/` returns nothing. `grep "<title>" /Users/danielgierach/DanielGierachProperty/dist/tools/mortgage/index.html` shows `Mortgage Calculator | Daniel Gierach Property`.

**Rollback:** Restore the original line.

---

## Batch 04, Tools data correctness

### TASK TOOL-001: Update FHOG copy in stamp-duty.astro

- **Source finding:** 08-tools-analytics.md, TOOL-001
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/stamp-duty.astro`
- **Protected impact:** Tools are protected. Calculator copy that names a statutory date is content; per the protection rule, calculator math fixes are allowed but copy that changes visible text is not. `[CONFIRM EXACT TEXT WITH DANIEL]` before applying.
- **Effort:** S
- **Batch:** 04

**Current state:** Tool mentions $30k FHOG for new homes with "Ask Daniel for details" but performs no eligibility check that the contract date is on or before 30 June 2026. The grant reverts to $15,000 from 1 July 2026.

**Target state:** Update the FHB grant notice to read:
```
Eligible new-home contracts signed by 30 June 2026 receive $30,000. After that the grant reverts to $15,000.
```
Also add a `min(contract date, 30 Jun 2026)` warning if the user implies a settlement date past mid-2026.

**Verification:** Manually re-read the tool page after deploy; the new wording appears beneath the FHOG label. Test cases: contract date 1 May 2026 displays $30k path; contract date 1 August 2026 displays $15k path with notice.

**Rollback:** Revert the wording change.

---

### TASK TOOL-002: Fix First Home Concession description copy in first-home-buyer.astro and add First Home (New Home) Concession

- **Source finding:** 08-tools-analytics.md, TOOL-002
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/first-home-buyer.astro`
- **Protected impact:** Tools protected. Calculation logic fix permitted. Description text edits are visible copy; flag for confirmation. `[CONFIRM EXACT TEXT WITH DANIEL]`
- **Effort:** S
- **Batch:** 04

**Current state** (quoted exactly):
```
Concession block descriptions on lines 322-324 use OUTDATED thresholds:
"Full concession (no duty) for new homes up to $550,000. Partial concession for $550,000-$800,000"
"Full concession (no duty) for homes up to $500,000. Partial concession for $500,000-$700,000"
The CALCULATION uses the current $700k/$800k thresholds, but the EXPLANATORY TEXT shown to users still uses the old $500k/$550k figures.
Step 1 distinguishes "New Home / Off-the-Plan" vs "Established Home" but the calculation uses the unified First Home Concession formula for both.
```

**Target state:**
1. Update both description strings to:
   - "Full concession (no duty) for homes up to $700,000. Partial concession for $700,000 to $800,000."
2. For FHB + new-home + price under no-cap eligibility (since 1 May 2025), set duty to $0 with label "First Home (New Home) Concession (full, no cap)".

**Verification:** Tool now displays $700k/$800k thresholds in the description. Test case: FHB + new-home + $850,000 returns $0 duty under First Home (New Home) Concession.

**Rollback:** Restore prior strings and remove the new-home branch.

---

### TASK TOOL-003: Fix land-tax.astro $10M+ band and absentee surcharge

- **Source finding:** 08-tools-analytics.md, TOOL-003
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/land-tax.astro`
- **Protected impact:** Tools protected. Calculator math fix permitted (no layout change).
- **Effort:** S
- **Batch:** 04

**Current state** (quoted exactly):
```
1. Code stops at "$5,000,000 and over: $62,500 + 1.75c per $1". QRO individual schedule continues to: "$10,000,000 and over: $150,000 + 2.25c per $1".
2. Absentee surcharge applies value * 0.02 (2% on full land value). Correct rule per QRO is 3% on (taxable land value − $350,000):
   Math.max(0, value − 350000) * 0.03
3. Result panel header line 103: "Land Tax Assessment (2025-26)".
```

**Target state:**
1. Add the `$10,000,000 and over: $150,000 + 2.25c per $1` band to the individual schedule. Rename the prior $5M+ band to `$5,000,000 to $9,999,999`.
2. Change absentee surcharge from `value * 0.02` to `Math.max(0, value - 350000) * 0.03`.
3. Keep `(2025-26)` label until FY26-27 rollover.

**Verification:** VERIFY-009 from the audit: enter $12,000,000 with Individual selected. Tool returns `$150,000 + (2,000,000 × 0.0225) = $195,000`. VERIFY-010: enter $1,000,000 with Absentee selected. Tool returns `$4,500 + (1,000,000 - 350,000) × 0.03 = $24,000`.

**Rollback:** Revert the math changes.

---

### TASK TOOL-005: Update borrowing-power.astro APRA assessment-rate copy

- **Source finding:** 08-tools-analytics.md, TOOL-006 (was numbered as TOOL-006 in source, slotting into Batch 04 cluster)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/borrowing-power.astro`
- **Protected impact:** Tools protected. Copy edit on a calculator description; flag for sign-off. `[CONFIRM EXACT TEXT WITH DANIEL]`
- **Effort:** S
- **Batch:** 04

**Current state** (quoted exactly):
```
Default assessment rate 9.20%, described as "current APRA serviceability floor". APRA's floor is 3% above the actual product rate (per APG 223), so 9.20% implies a product rate of ~6.20%.
```

**Target state:** Change the copy from `9.2% reflects the current APRA serviceability floor` to `9.2% reflects a typical lender assessment rate (actual rate + 3% APRA buffer)`.

**Verification:** Tool page displays the new wording.

**Rollback:** Restore prior wording.

---

### TASK TOOL-006: Fix true-cost-to-buy.astro stale FHB and home-concession thresholds

- **Source finding:** 08-tools-analytics.md, TOOL-011 (truncated to TOOL-006 to match batch numbering)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/true-cost-to-buy.astro`
- **Protected impact:** Tools protected. Calculator math fix permitted.
- **Effort:** M
- **Batch:** 04

**Current state** (quoted exactly):
```
1. Lines 538-551 use $500k full / $500-550k partial taper. Current QRO rule (since 9 June 2024) is $700k full / $700-800k partial, with the standard duty saving capped at $17,350 over the taper.
2. Line 518: if (price <= 980000); line 519: 29950 + (price - 980000) * 0.0575. Correct break is $1,000,000 with $30,850 base.
3. No First Home (New Home) Concession path. FHB + new-home / off-the-plan since 1 May 2025 should get a full no-cap concession.
4. Line 640 flags FHBG eligibility only if price <= 900000. Brisbane price cap rose to $1,000,000 from 1 October 2025.
5. LMI rates 0.66% / 1.69% / 3.30% differ from lmi-calculator.astro 0.83% / 1.72% / 2.81% / 3.84%.
6. Mortgage registration $204 vs stamp-duty.astro $212. Current Titles Queensland fee per audit research is $221 from 1 July 2025 (verify).
```

**Target state:**
1. Replace the FHB block with the same logic as `stamp-duty.astro` lines 161-189 ($700k full / $700-800k partial).
2. Change line 518 to `if (price <= 1000000)` and line 519 to `30850 + (price - 1000000) * 0.0575`.
3. Add a separate path for FHB + new-home such that duty = 0.
4. Change `900000` on line 640 to `1000000`. No income test condition (none currently, leave as-is).
5. Adopt the four-band LMI schedule from `lmi-calculator.astro` (0.83% / 1.72% / 2.81% / 3.84%) and reuse.
6. Verify the FY25-26 mortgage registration fee with Titles Queensland (see VERIFY-011 in appendix). Pending verification, set a single shared constant rather than hardcoding $204 or $212. Source the value from one place.

**Verification:** VERIFY-008 from the audit: enter $720,000 with FHB selected, expected duty around $2,828. Other test cases: $850,000 FHB + new-home returns $0; $1,200,000 base case returns `30,850 + (200,000 × 0.0575) = $42,350`. Compare LMI panel against `/tools/lmi-calculator` at the same price/LVR; the two should match.

**Rollback:** `git revert <commit>`.

---

### TASK TOOL-007: Fix negative-gearing.astro tax-comparison label and comment

- **Source finding:** 08-tools-analytics.md, TOOL-010 (renumbered to fit batch ordering)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/negative-gearing.astro`
- **Protected impact:** Tools protected. Label/comment text is content; flag for sign-off if Daniel wants the old label retained. `[CONFIRM EXACT TEXT WITH DANIEL]`
- **Effort:** S
- **Batch:** 04

**Current state** (quoted exactly):
```
Comparison table label on line 206: <p>...Tax Comparison (2024-25)</p>. The brackets used are 2025-26.
Code comment on line 268: "2024-25 Australian tax brackets (Stage 3) + 2% Medicare". Brackets are actually 2025-26.
```

**Target state:**
- Line 206 label: change `(2024-25)` to `(2025-26)`.
- Line 268 comment: change `2024-25` to `2025-26`.

**Verification:** Tool page displays `Tax Comparison (2025-26)`. View source/comment matches.

**Rollback:** Restore prior strings.

---

### TASK TOOL-008: Fix depreciation-estimator.astro hardcoded current year

- **Source finding:** 08-tools-analytics.md, TOOL-013 (renumbered to fit batch)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/depreciation-estimator.astro`
- **Protected impact:** Tools protected. Calculator math fix permitted (replaces a constant with a date-aware lookup).
- **Effort:** S
- **Batch:** 04

**Current state** (quoted exactly):
```
currentYear = 2025 (line 198) is hardcoded.
```

**Target state:**
```js
const currentYear = new Date().getFullYear();
```

**Verification:** Tool produces the correct property age relative to the current year on each visit. Smoke-test: a 1990 build year now shows 36 years of age.

**Rollback:** Restore the constant.

---

## Batch 05, Analytics, Pixel events and Tawk.to removal

### TASK PERF-003: Remove Tawk.to placeholder loader from Layout.astro

- **Source finding:** 04-performance-code-health.md, PERF-003 (also TSEO-011 and ANLY-003)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` lines 576-587
- **Protected impact:** Layout file affecting protected pages, non-visual change (removes a script that was failing).
- **Effort:** S
- **Batch:** 05

**Current state** (quoted exactly):
```
src/layouts/Layout.astro line 581: s1.src = 'https://embed.tawk.to/TAWK_PROPERTY_ID/TAWK_WIDGET_ID';
The leading comment on line 576 says "replace ... with the values from Admin → Channels → Chat Widget".
On every page load the script creates a new <script> element pointing at a URL that doesn't exist, returns 404, throws console error, and pollutes the Tawk_API global.
```

**Target state:** Delete lines 576 to 587 from `Layout.astro` entirely (Tawk.to is not configured and is not in use). If Daniel wants live chat in future, wire real IDs in via env-vars and re-add a clean version then. `[CONFIRM EXACT TEXT WITH DANIEL]` before deletion if there is any chance Tawk.to is intended to ship.

**Verification:** Open DevTools, Network tab, on any page; filter for `tawk` returns 0 entries. View source confirms the script block is gone.

**Rollback:** `git revert <commit>` restores the placeholder loader.

---

### TASK ANLY-001: Consolidate to a single Meta Pixel ID across both layouts

- **Source finding:** 08-tools-analytics.md, ANLY-001 (also SEC-006)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` lines 482-488, `/Users/danielgierach/DanielGierachProperty/src/layouts/LandingLayout.astro` lines 47-53
- **Protected impact:** Layout files affecting protected pages, non-visual.
- **Effort:** S
- **Batch:** 05

**Requires external account** (Meta Business Manager, to confirm canonical pixel)

**Current state** (quoted exactly):
```
Layout.astro line 483: fbq('init', '1493183205636761');
Layout.astro line 488: <img src="https://www.facebook.com/tr?id=1493183205636761&ev=PageView&noscript=1"/>
LandingLayout.astro line 48: fbq('init', '1462440981414974');
LandingLayout.astro line 53: <img src="https://www.facebook.com/tr?id=1462440981414974&ev=PageView&noscript=1"/>
```

**Target state:** Daniel confirms which pixel is the canonical one (likely `1493183205636761`, the main site pixel). Replace both layouts so they fire the same pixel ID. `[CONFIRM EXACT TEXT WITH DANIEL]`.

If consolidating to `1493183205636761`:
```js
// LandingLayout.astro line 48
fbq('init', '1493183205636761');
// LandingLayout.astro line 53
<img src="https://www.facebook.com/tr?id=1493183205636761&ev=PageView&noscript=1" />
```

If a deliberate split is needed (separate Meta business accounts), load both pixel IDs in both layouts, do not split by layout.

**Verification:** Meta Events Manager test events tab shows pixel events for the canonical ID firing on both `/` and `/lp/bulimba`. The unwanted pixel ID stops receiving events.

**Rollback:** Restore prior IDs.

---

### TASK ANLY-002: Add Meta Pixel Lead event to main-site lead forms

- **Source finding:** 08-tools-analytics.md, ANLY-002
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/walkthrough.astro` line 750, `/Users/danielgierach/DanielGierachProperty/src/pages/property-report.astro` line 576, `/Users/danielgierach/DanielGierachProperty/src/pages/contact.astro` line 364, `/Users/danielgierach/DanielGierachProperty/src/pages/get-an-appraisal.astro` line 71, `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro` line 1179
- **Protected impact:** All five files are protected pages. Adding an analytics call inside an existing form-submit handler is non-visual.
- **Effort:** S
- **Batch:** 05

**Current state** (quoted exactly):
```
walkthrough.astro line 750: GA4 appraisal_form_submit fires; no fbq('track','Lead').
property-report.astro line 576: GA4 property_report_submit fires; no fbq('track','Lead').
contact.astro line 364: GA4 contact_form_submit fires; no fbq('track','Lead').
get-an-appraisal.astro line 71: GA4 appraisal_form_submit fires; no fbq('track','Lead').
index.astro line 1179: hero address form fires GA4 hero_address_submit; no fbq('track','Lead').
```

**Target state:** In each of those five handlers, add immediately after the existing `gtag(...)` call and before the `fetch(...)` to Formspree:

```js
if (typeof fbq === 'function') {
  fbq('track', 'Lead', { content_name: '<page-name>', content_category: 'form_submit' });
}
```

Replace `<page-name>` with the appropriate value per page: `walkthrough`, `property-report`, `contact`, `get-an-appraisal`, `homepage-hero-address`.

**Verification:** VERIFY-001 to VERIFY-005 from the audit. Open each page, submit the form, confirm in Meta Events Manager the `Lead` event arrives on the consolidated pixel.

**Rollback:** Remove the added `fbq('track','Lead', ...)` lines.

---

## Batch 06, Performance, image attrs, render-blocking, preconnects

### TASK PERF-002: Convert LP Maps loaders to async pattern

- **Source finding:** 04-performance-code-health.md, PERF-002
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/lp/murarrie.astro` line 256, `/lp/seven-hills.astro` line 270, `/lp/bulimba.astro`, `/lp/camp-hill.astro`, `/lp/hawthorne.astro`
- **Protected impact:** /lp/* pages are protected. Removing a render-blocking script and loading the same Maps API asynchronously does not change visible page output.
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/pages/lp/murarrie.astro line 256: <script is:inline src="https://maps.googleapis.com/maps/api/js?key=[REDACTED-GOOGLE-MAPS-KEY]&libraries=places&callback=initMapsAutocomplete"></script>
Same line 256 / 270 in lp/seven-hills.astro, and equivalent in lp/bulimba.astro, lp/camp-hill.astro, lp/hawthorne.astro.
```

**Target state** (quoted from the audit recommended fix):
```js
window.initMapsAutocomplete = () => { /* existing callback body */ };
const s = document.createElement('script');
s.src   = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=initMapsAutocomplete&loading=async`;
s.async = true;
document.head.appendChild(s);
```

Replace the inline `<script src="...">` tag with the dynamic-load pattern used on the homepage (`src/pages/index.astro` line 1167). Use `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY` for `MAPS_KEY` (see CODE-002 task in this batch).

**Verification:** WebPageTest or Lighthouse on `/lp/murarrie` before/after. Lighthouse "Eliminate render-blocking resources" no longer flags Maps API on the LP pages. Network tab shows Maps script loads after document parse.

**Rollback:** Restore the inline `<script src=...>` tag.

---

### TASK CODE-002: Move Google Maps API key to env-var

- **Source finding:** 04-performance-code-health.md, CODE-002 (also SEC-011)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro` line 1080, `walkthrough.astro` line 737, `tools/commute-cost.astro` line 480, `tools/brisbane-2032.astro` line 3, `tools/local-eats.astro` line 4, `lp/murarrie.astro` line 256, `lp/seven-hills.astro` line 270, `.env`
- **Protected impact:** Pages are protected. Replacing a hardcoded API key with `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY` is non-visual; the rendered URL changes only in the key value (which is identical post-substitution).
- **Effort:** S
- **Batch:** 06

**Requires external account** (Google Cloud Console for HTTP referrer restrictions verification)

**Current state** (quoted exactly):
```
7 hardcoded occurrences of [REDACTED-GOOGLE-MAPS-KEY]:
src/pages/index.astro line 1080
src/pages/walkthrough.astro line 737
src/pages/tools/commute-cost.astro line 480
src/pages/tools/brisbane-2032.astro line 3
src/pages/tools/local-eats.astro line 4
src/pages/lp/murarrie.astro line 256
src/pages/lp/seven-hills.astro line 270
.env line 1: PUBLIC_GOOGLE_MAPS_KEY=[REDACTED-GOOGLE-MAPS-KEY]
property-report.astro line 700 already uses import.meta.env.PUBLIC_GOOGLE_MAPS_KEY (the model)
```

**Target state:** Replace each hardcoded literal with `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY`. Add a top-of-file or top-of-script constant where the key is interpolated multiple times:

```js
const MAPS_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY;
```

Then change `key=[REDACTED-GOOGLE-MAPS-KEY]` to `key=${MAPS_KEY}` (template literal) in each location.

Verify in Google Cloud Console that HTTP referrer restrictions are set on the key:
- `https://danielgierach.com/*`
- `https://www.danielgierach.com/*`
- `https://*.vercel.app/*` (only if preview deploys are used)
- `http://localhost:*/*` (for local dev only)

Limit API restrictions to Maps JavaScript API + Places API. Set a daily quota cap.

**Verification:** `grep -r "AIzaSy" /Users/danielgierach/DanielGierachProperty/src/` returns no results. Maps still works on `/`, `/walkthrough`, `/lp/*`, `/tools/commute-cost`, `/tools/brisbane-2032`, `/tools/local-eats`. GCP console shows HTTP referrer restrictions and API restrictions configured.

**Rollback:** `git revert <commit>` restores hardcoded keys.

---

### TASK PERF-005: Add preconnect for cdn6.ep.dynamics.net (and upgrade Unsplash)

- **Source finding:** 04-performance-code-health.md, PERF-005
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` lines 273-276
- **Protected impact:** Layout file affecting protected pages, non-visual.
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/layouts/Layout.astro lines 273-276 declare preconnect for fonts.googleapis, fonts.gstatic, googletagmanager, and dns-prefetch for images.unsplash.
No preconnect for cdn6.ep.dynamics.net, even though it serves the LCP hero on the home, listings, suburb, and tool pages.
```

**Target state:** Add to the head section of `Layout.astro`:
```html
<link rel="preconnect" href="https://cdn6.ep.dynamics.net" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
```

(The Unsplash hint moves from `dns-prefetch` to `preconnect`.)

**Verification:** Network waterfall on `/`, `/listings`, `/suburbs/seven-hills` shows the cdn6 connection established before the first image request rather than during it.

**Rollback:** Remove the added link tags.

---

### TASK PERF-007: Throttle Nav scroll listener and add passive flag

- **Source finding:** 04-performance-code-health.md, PERF-007
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro` lines 131-152
- **Protected impact:** Layout component affecting protected pages. Non-visual change to script behaviour.
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/components/Nav.astro line 152: window.addEventListener('scroll', updateNav);
updateNav (lines 131-150) reads window.scrollY, mutates header.classList, sets header.style.boxShadow, mutates logoName.style.color, iterates navLinkEls and bars.
No { passive: true }, no requestAnimationFrame debounce, no early-return when state hasn't changed.
```

**Target state** (quoted exactly from the audit recommended fix):
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

**Verification:** Chrome DevTools, Performance tab, scroll the home page. Long-tasks during scroll drop relative to before. INP attribution improves.

**Rollback:** Restore the original handler.

---

### TASK PERF-001: Add lazy/async/dimensions to below-fold imgs

- **Source finding:** 04-performance-code-health.md, PERF-001 (also A11Y-014 perf angle)
- **Files:** Site-wide. Worst offenders: `/Users/danielgierach/DanielGierachProperty/src/pages/listings.astro`, suburb pages under `/src/pages/suburbs/*.astro`, `/Users/danielgierach/DanielGierachProperty/src/pages/insights/index.astro`, and any `<img>` tag inside `src/components/`.
- **Protected impact:** Suburb, tool, listings, lp pages are protected. Adding `loading="lazy" decoding="async"` and `width`/`height` attributes does not change visible content. The change is non-visual.
- **Effort:** L
- **Batch:** 06

**Current state** (quoted exactly):
```
369 real content <img> tags shipped across the build (cdn6.ep.dynamics.net Ray White CDN: 354, images.unsplash.com: 15).
Only 18 (4.9%) carry loading="lazy".
Only 3 (0.8%) carry decoding="async".
339 (91.9%) lack explicit width and height attributes.
```

**Target state:**
1. For every `<img>` that is below the fold, add `loading="lazy" decoding="async"`.
2. For every `<img>`, add `width` and `height` attributes that match the served aspect ratio. Most Ray White CDN images are landscape 3:2 (use `width="1200" height="800"`); portrait avatars use `width="900" height="1200"`.
3. Easiest mechanism: a small Astro component `<Img>` defaulting to lazy + async, accepting a `priority` prop to opt out for the LCP hero. Migrate the worst-offender pages first (`/listings`, all `/suburbs/*`, `/insights/index.astro`).

**Verification:** Lighthouse CLS contribution drops on suburb/listings pages. Lighthouse "Image elements have explicit width and height" passes. Below-fold images defer their network fetch until close to viewport.

**Rollback:** `git revert <commit>` restores the prior state.

---

### TASK PERF-008: Remove permanent will-change from .reveal* CSS rules

- **Source finding:** 04-performance-code-health.md, PERF-008
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/styles/global.css` lines 88, 100, 112, 124, 354
- **Protected impact:** Global stylesheet affecting all pages. Non-visual change to GPU-layer behaviour.
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/styles/global.css lines 88, 100, 112, 124, 354 set .reveal, .reveal-left, .reveal-right, .reveal-scale, .card-reveal all declare will-change: transform, opacity.
The IntersectionObserver runs each animation exactly once and unobserves the element, but the CSS keeps will-change active forever.
```

**Target state:** Remove `will-change: transform, opacity;` from the five rules. If a hint is needed during the brief animation window, add a class via JS just before the transition starts and remove it on `transitionend`.

**Verification:** Chrome DevTools, Rendering tab, Layer borders on a long suburb page; the count of composited layers drops materially.

**Rollback:** Restore the `will-change` declarations.

---

### TASK PERF-009: Hoist globalSchema JSON.stringify to module scope

- **Source finding:** 04-performance-code-health.md, PERF-009
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` line 311
- **Protected impact:** Layout file affecting protected pages, non-visual (build-time CPU only).
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/layouts/Layout.astro line 311: <script type="application/ld+json" set:html={JSON.stringify(globalSchema)} />
6,663 bytes inside the global JSON-LD <script> tag, recomputed once per page render at build time.
```

**Target state:** Hoist to module scope at the top of `Layout.astro` frontmatter:

```js
const GLOBAL_LD = JSON.stringify(globalSchema);
```

Then use:
```astro
<script type="application/ld+json" set:html={GLOBAL_LD} />
```

**Verification:** `npm run build` completes successfully. Built HTML still contains the same JSON-LD bytes (no behaviour change). Build-time CPU per page render drops marginally.

**Rollback:** Restore the inline `JSON.stringify(globalSchema)`.

---

### TASK CODE-008: Replace console.error with GA4 events or remove

- **Source finding:** 04-performance-code-health.md, CODE-008
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro` line 1162, `/Users/danielgierach/DanielGierachProperty/src/pages/tools/dcf.astro` lines 577 and 654, `/Users/danielgierach/DanielGierachProperty/src/pages/tools/deposit-savings.astro` line 1109
- **Protected impact:** All four are protected pages. Replacing a console error with a gtag event is non-visual.
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
src/pages/index.astro line 1162: } catch(e) { console.error('Places init error', e); }
src/pages/tools/dcf.astro lines 577 & 654: console.error(e);
src/pages/tools/deposit-savings.astro line 1109: console.error(err);
```

**Target state:** Replace each `console.error(...)` with a GA4 event so errors surface in telemetry:

```js
gtag('event', 'js_error', { event_category: 'js_error', event_label: e.message });
```

Or remove the line entirely if the catch block already handles the error gracefully.

**Verification:** `grep -rn "console.error" /Users/danielgierach/DanielGierachProperty/src/pages/` returns nothing in the four files. GA4 DebugView captures `js_error` events when the catch path runs.

**Rollback:** Restore the `console.error` calls.

---

### TASK CODE-004: Clean /public/preview/ dead drafts

- **Source finding:** 04-performance-code-health.md, CODE-004 (also TSEO-020)
- **Files:** `/Users/danielgierach/DanielGierachProperty/public/preview/`
- **Protected impact:** None
- **Effort:** S
- **Batch:** 06

**Current state** (quoted exactly):
```
public/preview/ contains 18 files totalling 805 KB.
daniel-avatar.jpg (377 KB) is the largest single asset in /public and is not referenced from any .astro file.
17 meta-ad-*.html files (22-26 KB each) are draft Meta ad creatives used by Puppeteer recording scripts, not page content.
```

**Target state:**
1. Move the source HTML drafts out of `/public/preview/` into a sibling folder `/ad-drafts/` (or `/scripts/preview/`) that Astro does not copy. Update Puppeteer recording scripts to point at the new path.
2. Delete `/public/preview/daniel-avatar.jpg` if no Puppeteer script references it. Verify with `grep -r "daniel-avatar.jpg" /Users/danielgierach/DanielGierachProperty/scripts/` first.

**Verification:** `ls /Users/danielgierach/DanielGierachProperty/public/preview/` is empty (or the directory removed). After build, `dist/preview/` is empty. Puppeteer recording scripts still work (test by running one).

**Rollback:** Restore the files from git.

---

## Batch 07, Accessibility, focus, mobile menu, contrast, labels

### TASK A11Y-001: Add global :focus-visible style

- **Source finding:** 05-accessibility-mobile.md, A11Y-001
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/styles/global.css`
- **Protected impact:** Global stylesheet affecting all pages. Adds a focus indicator that only shows on keyboard navigation, no visible change for mouse users.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
192 separate occurrences of outline:none across the codebase.
No *:focus-visible rule anywhere; no :focus-visible keyword anywhere in the repo.
.form-field:focus and .obs-input:focus restore via box-shadow, but most inline outline:none has no replacement.
```

**Target state** (quoted exactly from the audit fix):
```css
*:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }
```

Add this rule to `global.css` (top of the file or in a base layer).

**Verification:** Tab through the homepage with the keyboard; every focusable element shows a 2px gold outline with a 2px offset. Mouse hover does not show the outline.

**Rollback:** Remove the rule.

---

### TASK A11Y-002 + CODE-005: Mobile menu accessibility

- **Source finding:** 05-accessibility-mobile.md, A11Y-002, plus 04-performance-code-health.md CODE-005
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro` lines 59, 86, 155-160
- **Protected impact:** Layout component affecting all pages. Non-visual changes to ARIA attributes and JS behaviour.
- **Effort:** S
- **Batch:** 07

**Current state** (quoted exactly):
```
src/components/Nav.astro line 59: <button id="mobile-toggle" ... aria-label="Menu">
Missing aria-expanded="false", aria-controls="mobile-menu".
Toggle script (line 155-160) sets mobileMenu.style.maxHeight but never updates aria-expanded.
When max-height:0 / overflow:hidden applied, inner <a> elements remain in DOM and still keyboard-focusable.
No Escape-key handler. No focus trap. No return-focus to the toggle button when closed.
```

**Target state:**
1. Add to the toggle button:
```astro
<button id="mobile-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu" ...>
```
2. In the toggle handler, sync `aria-expanded`:
```js
mobileToggle.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileToggle.setAttribute('aria-expanded', String(menuOpen));
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  // ... existing
});
```
3. Add `inert` to `#mobile-menu` while closed (or `hidden` attribute), and remove on open.
4. Add an Escape handler that closes the menu and returns focus to the toggle.

**Verification:** Open the menu on mobile; aria-expanded toggles to "true". Close with Esc; focus returns to the toggle button. Tab through the page on desktop with the menu visible only as a button; mobile-menu links are no longer in the tab order.

**Rollback:** Revert Nav.astro changes.

---

### TASK A11Y-003: Add skip-to-content link to layouts

- **Source finding:** 05-accessibility-mobile.md, A11Y-003
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` (around line 352, before `<main>`), `/Users/danielgierach/DanielGierachProperty/src/layouts/LandingLayout.astro` (around lines 70-71), `/Users/danielgierach/DanielGierachProperty/src/styles/global.css`
- **Protected impact:** Layout files affecting all pages. The skip link is visually hidden by default and only appears on keyboard focus, so no visible change in normal use.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
Both layouts emit <Nav /> followed by <main>.
Keyboard users must tab through every nav item (10+ stops) on every page before reaching content.
```

**Target state:**
1. At the top of `<body>` in both layouts, add:
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
2. Add `id="main-content"` to `<main>` in `Layout.astro` (around line 372) and the equivalent in `LandingLayout.astro`.
3. In `global.css`, add visually-hidden styles for `.skip-link` and a focus state that brings it on-screen:
```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-charcoal);
  color: var(--color-cream);
  padding: 0.75rem 1rem;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
```

**Verification:** Press Tab from a fresh page load; the skip link appears at the top-left and is focused. Press Enter; focus moves to `<main>`.

**Rollback:** Remove the skip link, the id, and the CSS rule.

---

### TASK A11Y-004: Associate sibling labels with inputs (contact, walkthrough, tool pages)

- **Source finding:** 05-accessibility-mobile.md, A11Y-004
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/contact.astro` lines 152-211, `/Users/danielgierach/DanielGierachProperty/src/pages/walkthrough.astro` lines 152-186 (PROTECTED), `/Users/danielgierach/DanielGierachProperty/src/pages/get-an-appraisal.astro` lines 76-87 (PROTECTED), `/Users/danielgierach/DanielGierachProperty/src/pages/tools/mortgage.astro` lines 18-77, plus around 50 other tool pages.
- **Protected impact:** /walkthrough, /get-an-appraisal, all /tools/* are protected. Adding `id` to inputs and `for=` to existing `<label>` elements is metadata-only and non-visual. For the placeholder-only fields on `/get-an-appraisal`, add visually-hidden labels (use `class="sr-only"` or equivalent) so the form is announced correctly without altering layout.
- **Effort:** M
- **Batch:** 07

**Current state** (quoted exactly):
```
Pattern in src/pages/walkthrough.astro:152-186, contact.astro:135-211, ~50 tool pages:
<div>
  <label style="...">First Name <span>*</span></label>
  <input type="text" name="first_name" .../>
</div>
No for= on the label, no id= on the input.

src/pages/property-report.astro correctly uses for=/id= (lines 553, 557, 562, 566, 570). That page is the model.

src/pages/get-an-appraisal.astro uses placeholder-only for all six fields (lines 76-87). Placeholders are not accessible names.
```

**Target state:**
- For each existing `<label>` + `<input>` pair, add a unique `id` to the input and `for="<id>"` to the label.
- For placeholder-only inputs on `/get-an-appraisal`, add a visually-hidden `<label>` element associated via `for=`/`id=`.
- Use the pattern already implemented in `property-report.astro` lines 553-570 as the model.

**Verification:** Browse with a screen reader (VoiceOver or NVDA); each form field is announced by its label name. axe-core or Lighthouse Accessibility audit no longer flags "Form elements must have labels".

**Rollback:** `git revert <commit>`.

---

### TASK A11Y-005: Add accessible name to homepage hero address input

- **Source finding:** 05-accessibility-mobile.md, A11Y-005
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro` line 200-206
- **Protected impact:** Home page protected. Adding an `aria-label` is metadata-only.
- **Effort:** S
- **Batch:** 07

**Current state** (quoted exactly):
```
src/pages/index.astro line 200-206:
<input id="hero-address-input" type="text" placeholder="Enter your property address…" autocomplete="off" .../>
No <label>, no aria-label, no aria-labelledby.
```

**Target state:** Add `aria-label="Enter your property address"` to the input.

```html
<input id="hero-address-input" type="text" aria-label="Enter your property address" placeholder="Enter your property address…" autocomplete="off" .../>
```

**Verification:** Screen reader announces "Enter your property address, edit text" when the input is focused.

**Rollback:** Remove the `aria-label`.

---

### TASK A11Y-006: Add accessible name to LP page address inputs

- **Source finding:** 05-accessibility-mobile.md, A11Y-006
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/lp/murarrie.astro` line 222, `/lp/seven-hills.astro` lines 227-235, `/lp/bulimba.astro`, `/lp/camp-hill.astro`, `/lp/hawthorne.astro`
- **Protected impact:** /lp/* protected. Adding `aria-label` is non-visual.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
LP hero form's address input (e.g. lp/murarrie.astro:222) has only placeholder="Enter your property address…".
```

**Target state:** Add `aria-label="Enter your property address"` to each LP page address input.

**Verification:** Screen reader announces the field name on focus; not just a generic "edit text".

**Rollback:** Remove the aria-label additions.

---

### TASK A11Y-007: Add accessible name to tools-index search input

- **Source finding:** 05-accessibility-mobile.md, A11Y-007
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/tools/index.astro` lines 136-143
- **Protected impact:** /tools/index is part of /tools/* protected. Adding an `aria-label` is non-visual.
- **Effort:** S
- **Batch:** 07

**Current state** (quoted exactly):
```
src/pages/tools/index.astro lines 136-143: <input id="tool-search" type="search" placeholder="Search tools..." />. No label.
src/pages/insights/index.astro lines 295-305 correctly uses a visually-hidden label and aria-label="Search articles" - that's the correct pattern.
```

**Target state:** Apply the same pattern as `/insights/index.astro`. Add `aria-label="Search tools"` (or a visually-hidden `<label for="tool-search">`).

**Verification:** Screen reader announces "Search tools" on focus.

**Rollback:** Remove the aria-label.

---

### TASK A11Y-008: Walkthrough date picker accessibility (no visual change)

- **Source finding:** 05-accessibility-mobile.md, A11Y-008
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/walkthrough.astro` lines 593-623
- **Protected impact:** /walkthrough protected. Adding `aria-label`, `disabled`, `aria-pressed` to dynamically-built buttons is non-visual.
- **Effort:** M
- **Batch:** 07

**Current state** (quoted exactly):
```
src/pages/walkthrough.astro:593-623 builds 28-31 day buttons each rendering only String(d) as text.
Disabled days use btn.classList.add('cal-day--disabled') (line 607); does NOT set the disabled attribute or aria-disabled="true".
Selected day uses btn.classList.add('cal-day--selected') (line 611); no aria-pressed or aria-selected.
No arrow-key navigation.
```

**Target state** (per the audit recommended fix):
```js
btn.setAttribute('aria-label', date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }));
btn.disabled = isPast || isFuture || isSunday;
btn.setAttribute('aria-pressed', String(isSelected));
```

Roving tabindex + arrow-key navigation is a larger optional change.

**Verification:** Screen reader announces "Wednesday, 12 May. Button" instead of "12. Button". Disabled days are announced as disabled and cannot be activated. Selected day announces as pressed.

**Rollback:** Revert the JS changes.

---

### TASK A11Y-010: Darken nav phone link on light state for contrast

- **Source finding:** 05-accessibility-mobile.md, A11Y-010
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro` line 50, scroll handler 131-150
- **Protected impact:** Layout component affecting all pages. This is a colour change to a visible element on a non-protected component (Nav). The audit notes this is a contrast accessibility necessity rather than a stylistic change. `[CONFIRM EXACT TEXT WITH DANIEL]` for the replacement gold token.
- **Effort:** S
- **Batch:** 07

**Current state** (quoted exactly):
```
src/components/Nav.astro:50, id="nav-phone", hardcoded color:#f5d07a (light gold).
The scroll handler at lines 131-150 does not include #nav-phone in its colour swap (selects .nav-link-mono only).
Result: gold-on-cream contrast about 1.4:1 against #f7f5f0 background. Required: 4.5:1 (normal text).
```

**Target state:** Update Nav.astro to swap `#nav-phone` colour when `glass-nav` is active. Replacement gold options:
- `#b07e22` (var `--color-gold-dim`) for AA-borderline.
- `#9a6e1d` for AA pass.
- `#8a6a1f` for AA pass with margin.

Recommended: include `#nav-phone` in the scroll-handler's colour swap loop alongside `.nav-link-mono`, applying the chosen darkened gold when `glass-nav` is active.

**Verification:** axe DevTools or the WebAIM contrast checker on the live nav scrolled state confirms 4.5:1 ratio.

**Rollback:** Restore the `#f5d07a` value.

---

### TASK MOBI-004: Lock body scroll when mobile menu is open

- **Source finding:** 05-accessibility-mobile.md, MOBI-004
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro` lines 154-160 (toggle handler)
- **Protected impact:** Layout component affecting all pages. Non-visual JS behaviour change.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
When mobile menu opens, document.body is still scrollable.
```

**Target state:** In the toggle handler add:
```js
document.body.style.overflow = menuOpen ? 'hidden' : '';
```

(Combine with A11Y-002 task above; same handler.)

**Verification:** Open the mobile menu on iOS; the underlying page does not scroll.

**Rollback:** Remove the line.

---

### TASK MOBI-012: Wrap mobile-CTA body padding behind hideMobileCta class

- **Source finding:** 05-accessibility-mobile.md, MOBI-012
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/styles/global.css` lines 594-597, `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro`
- **Protected impact:** /walkthrough, /get-an-appraisal, /property-worth pages get less empty space at the bottom on mobile, no other visual change. The intended visible area on those pages is unchanged.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
global.css:594-597 adds body { padding-bottom: calc(4rem + env(safe-area-inset-bottom)) } site-wide inside @media (max-width: 1024px).
Pages that pass hideMobileCta={true} (walkthrough, get-an-appraisal, property-worth) hide the bar via .mobile-call-bar.hidden-by-page { display: none !important; } but the body padding is unconditional.
```

**Target state:**
1. Update the CSS rule to:
```css
@media (max-width: 1024px) {
  body:not(.no-mobile-cta) {
    padding-bottom: calc(4rem + env(safe-area-inset-bottom));
  }
}
```
2. In `Layout.astro`, when `hideMobileCta` is true, add `class="no-mobile-cta"` to `<body>`.

**Verification:** On `/walkthrough` mobile, the empty space at the bottom of the page is gone. On `/insights/<any>` the call bar still shows and the body padding is correct.

**Rollback:** Restore the unconditional rule.

---

### TASK Reduced-motion: respect prefers-reduced-motion

- **Source finding:** 05-accessibility-mobile.md, Quick wins #7
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/styles/global.css`
- **Protected impact:** Global stylesheet. Only changes behaviour for users who have requested reduced motion.
- **Effort:** S
- **Batch:** 07

**Current state:**
```
No global rule exists; reveal animations and pw-bg keyframe play unconditionally.
```

**Target state:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

**Verification:** Set OS-level "Reduce motion" on macOS; reload home page; reveal animations do not trigger.

**Rollback:** Remove the rule.

---

## Batch 08, Local SEO, agency name, social URLs, schema, licence

This batch depends on Daniel confirming canonical agency name, licence number, social URLs, and review counts. Defer execution until those answers exist (see verification appendix). The tasks are sketched here so the work is ready when verified.

### TASK LSEO-001 + TRUST-002: Standardise agency name across the site

- **Source finding:** 07-local-seo-trust.md, LSEO-001, TRUST-002
- **Files:** Site-wide. Heaviest occurrence files: `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro`, `/Users/danielgierach/DanielGierachProperty/src/components/Footer.astro` lines 17 and 155, `/Users/danielgierach/DanielGierachProperty/src/components/Nav.astro` line 36, `/Users/danielgierach/DanielGierachProperty/src/components/Method.astro` line 275, `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro` lines 110, 131, 167, 302, 350, 374, 387, 411, 741, all 47 suburb pages, all 5 LP pages, `/Users/danielgierach/DanielGierachProperty/src/pages/about.astro`, `/contact.astro`, `/reviews.astro`, `/walkthrough.astro`, `/AuthorBio.astro`.
- **Protected impact:** Most occurrence sites are visible copy on protected pages. This change affects rendered text and must wait for Daniel to confirm canonical name. `[CONFIRM EXACT TEXT WITH DANIEL]`
- **Effort:** L
- **Batch:** 08

**Current state** (quoted exactly):
```
Three agency-name variants ship simultaneously:
"Ray White Bulimba", 84 occurrences
"Ray White The Collective", 81 occurrences
"Ray White Collective", 7 occurrences
"Ray White · The Collective" (visual), many
```

**Target state:** Wait for Daniel's answers (see verification appendix). Likely outcome: `Ray White Bulimba` is the licensed entity, `Ray White · The Collective` is the consumer-facing group brand. Apply globally:
- All JSON-LD `worksFor.name` and `LocalBusiness.name` fields use `Ray White Bulimba`.
- Visible logo subtitle in `Nav.astro:36` and `Footer.astro:17` may say `Ray White · The Collective`.
- They never appear interchangeably in the same paragraph.
- Body copy chooses one; usually `Ray White Bulimba` for licensed-agency context, `Ray White Collective` group reference only when describing the broader group.

**Verification:** `grep -rn "Ray White" /Users/danielgierach/DanielGierachProperty/src/` returns the canonical pattern in every match. Schema.org Validator on the homepage confirms a single business entity in `@graph`.

**Rollback:** `git revert <commit>`.

---

### TASK LSEO-003: Fix social profile URL drift between UI and JSON-LD

- **Source finding:** 07-local-seo-trust.md, LSEO-003
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` lines 148-151, 205-208, `/Users/danielgierach/DanielGierachProperty/src/components/Footer.astro` lines 25-26, 33, `/Users/danielgierach/DanielGierachProperty/src/pages/contact.astro` lines 80, 89, `/walkthrough.astro` lines 96, 105, `/about.astro` line 18
- **Protected impact:** Some files are protected pages. Updating href values is metadata-equivalent on link elements; the visible label text does not change.
- **Effort:** S
- **Batch:** 08

**Requires external account** (LinkedIn, Instagram, Facebook to confirm canonical URLs)

**Current state** (quoted exactly):
```
LinkedIn JSON-LD: https://www.linkedin.com/in/daniel-gierach (hyphen)
LinkedIn UI: https://www.linkedin.com/in/danielgierach (no hyphen)
Instagram JSON-LD: https://www.instagram.com/danielgierach
Instagram UI: https://www.instagram.com/dgierach/
RAY White agent JSON-LD: https://raywhitebulimba.com.au/agents/daniel-gierach/177117
RAY White agent UI: https://raywhitebulimba.com.au/agents/daniel-gierach (no ID)
realestate.com.au: NOT in any sameAs array
GBP share-link: NOT in any sameAs at site level
```

**Target state:** Daniel confirms which is the live URL for each profile. Pick one URL per profile and replace everywhere. Add `https://www.realestate.com.au/agent/daniel-gierach-3819232` and the canonical Google Maps Place URL (or `https://share.google/WipmgyJnjC5nkhGwx` until canonical is captured) to the global `sameAs` array.

**Verification:** Visit each URL in the schema and the UI; both should resolve to the live profile (no 404s). Google Rich Results Test on the homepage shows consistent `sameAs` entries.

**Rollback:** `git revert <commit>`.

---

### TASK LSEO-004: Drop thin page-level schemas on about, contact, walkthrough

- **Source finding:** 07-local-seo-trust.md, LSEO-004
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/about.astro` lines 5-20, `/contact.astro` lines 4-15, `/walkthrough.astro` lines 5-17
- **Protected impact:** /walkthrough, /contact protected. Schema-only changes are allowed (no rendered visual change).
- **Effort:** S
- **Batch:** 08

**Current state** (quoted exactly):
```
about.astro:5-20 passes a Person/RealEstateAgent schema with worksFor "Ray White The Collective".
Layout.astro:178-182 (also on the same page) declares worksFor "Ray White Bulimba".
contact.astro:4-15 and walkthrough.astro:5-17 have similar thin overrides.
```

**Target state:** Delete the page-level `personSchema` / `contactSchema` / `schema` props in these three files and rely on the global `@graph`. If a page-level schema is needed (Service, ContactPage), give it a different `@type` and reference the business via `@id`:

```json
"provider": { "@id": "https://danielgierach.com/#business" }
```

**Verification:** Google Rich Results Test on `/about`, `/contact`, `/walkthrough` shows a single RealEstateAgent entity with the canonical agency name.

**Rollback:** Restore the page-level schemas.

---

### TASK TSEO-010 + LSEO-005: Add @id to suburb-page LocalBusiness schemas

- **Source finding:** 01-technical-seo.md, TSEO-010 and 07-local-seo-trust.md, LSEO-005
- **Files:** All 47 suburb page files under `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/`
- **Protected impact:** Suburbs are protected. Schema-only change is allowed (no rendered visual change).
- **Effort:** M
- **Batch:** 08

**Current state** (quoted exactly):
```
src/pages/suburbs/seven-hills.astro lines 13-37 emit a ["LocalBusiness", "RealEstateAgent"] JSON-LD block with name "Daniel Gierach, Ray White The Collective" and addressLocality of the suburb.
src/layouts/Layout.astro lines 71-153 emit a global ["RealEstateAgent", "LocalBusiness"] block with @id "https://danielgierach.com/#business" and addressLocality Bulimba.
Suburb-level block has no @id, so validators see two separate businesses.
```

**Target state:** Either:
1. Drop the per-suburb `LocalBusiness` block entirely; rely on the global graph with `areaServed`.
2. Or keep it and add `"@id": "https://danielgierach.com/#business"` so it merges with the global entity, using suburb-page data only as additional `areaServed` entries.

Per the audit recommendation, Option 2 is the cleaner enrichment path. Add `@id` plus the canonical agency `name` (settled in LSEO-001). Optionally add suburb `geo` per LSEO-006.

**Verification:** Google Rich Results Test on `/suburbs/seven-hills` shows one merged business entity (not two). Schema.org Validator passes.

**Rollback:** `git revert <commit>`.

---

### TASK TRUST-001: Add real estate licence number to footer, about, JSON-LD

- **Source finding:** 07-local-seo-trust.md, TRUST-001
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/components/Footer.astro` (around line 155 near copyright), `/Users/danielgierach/DanielGierachProperty/src/pages/about.astro`, `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` (global JSON-LD)
- **Protected impact:** Footer and about page are not protected. The about page is not in the protected list. Adding a licence number is visible content on Footer (component used across all pages) and visible content on about. `[CONFIRM EXACT TEXT WITH DANIEL]` for the actual number and exact wording.
- **Effort:** S
- **Batch:** 08

**Requires external account** (QLD OFT property licence public register)

**Current state:**
```
No licence number anywhere on the site.
Layout.astro:161: "jobTitle": "Licensed Real Estate Agent" (schema only).
AuthorBio.astro:13: "Daniel Gierach is a REIQ-licensed real estate agent" (insights pages only).
```

**Target state:** Add the licence number visibly. Recommended placements:
- `Footer.astro` near the copyright line: `Licensed Real Estate Agent, QLD Licence No. <NUMBER>`.
- `about.astro` in the credentials block.
- Layout.astro global JSON-LD `RealEstateAgent` block as `identifier` or `hasCredential`:
  ```json
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "Real Estate Agent Licence",
    "recognizedBy": { "@type": "GovernmentOrganization", "name": "Queensland Office of Fair Trading" },
    "identifier": "<NUMBER>"
  }
  ```

**Verification:** View source of any page; licence number appears in the footer. Schema validator picks up the credential.

**Rollback:** `git revert <commit>`.

---

## Batch 09, On-page SEO, titles, internal linking

### TASK OSEO-002: Drop brand suffix from insight article titles

- **Source finding:** 02-on-page-seo.md, OSEO-002 (also OSEO-018, OSEO-019 ripple effects)
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/layouts/Layout.astro` (title pattern), and 574 files under `/Users/danielgierach/DanielGierachProperty/src/pages/insights/*.astro`
- **Protected impact:** Insight pages are not in the protected list. Titles are metadata; updates are non-visual.
- **Effort:** M
- **Batch:** 09

**Current state** (quoted exactly):
```
Title length distribution across 725 indexable pages:
  >70: 549
Insights only (574 articles): 525 titles exceed 70 chars (91.5%); 556 exceed 60 chars (96.9%).
Brand suffix "| Daniel Gierach Property" is 25 characters.
```

**Target state:**
1. Add a new `InsightLayout.astro` (or extend `Layout.astro`) that takes a `title` prop and does not append a brand suffix for insight articles.
2. Update the per-article `title=` props to be the headline only.
3. Run a one-time audit after the change; flag any remaining title >65 chars for headline rewrite.

Worked example (quoted exactly):
- Before: `Selling a Brisbane Property Mid-Renovation: Incomplete Works, Half-Finished Bathrooms, and the Finish-or-Sell Decision 2028 | Daniel Gierach Property` (149 chars)
- After: `Selling a Brisbane Property Mid-Renovation` (43 chars), with the rest moved to the description.

**Verification:** Built HTML title length distribution: zero insights titles over 65 chars after the headline pass. Spot-check 10 random article titles.

**Rollback:** Restore the brand-suffix template.

---

### TASK OSEO-006 + OSEO-008: Standardise suburb title template

- **Source finding:** 02-on-page-seo.md, OSEO-006 and OSEO-008
- **Files:** All 47 suburb page files under `/Users/danielgierach/DanielGierachProperty/src/pages/suburbs/`
- **Protected impact:** Suburbs protected. The `<title>` is metadata-only and changes are allowed (browser tab text, not body content).
- **Effort:** M
- **Batch:** 09

**Current state** (quoted exactly):
```
28 suburbs use pattern A: Selling in <Suburb> | Real Estate Agent | Daniel Gierach
8 suburbs use pattern B: Real Estate Agent <Suburb> Brisbane | Daniel Gierach
11 suburbs use pattern C: Sell in <Suburb> | Real Estate Agent | Daniel Gierach or other variants
```

**Target state:** Standardise all 47 suburb pages on pattern B:

```
Real Estate Agent <Suburb> Brisbane | Daniel Gierach
```

Also fix `/fortitude-valley.astro` `Real Estate` -> `Real Estate Agent` while editing.

**Verification:** Built HTML title for every `dist/suburbs/<suburb>/index.html` matches the pattern `Real Estate Agent <Suburb> Brisbane | Daniel Gierach`.

**Rollback:** `git revert <commit>`.

---

### TASK OSEO-004: Make /lp/seven-hills and /lp/murarrie titles suburb-specific

- **Source finding:** 02-on-page-seo.md, OSEO-004
- **Files:** `/Users/danielgierach/DanielGierachProperty/src/pages/lp/seven-hills.astro`, `/Users/danielgierach/DanielGierachProperty/src/pages/lp/murarrie.astro`
- **Protected impact:** /lp/* protected. The browser tab `<title>` is metadata; tracking purposes (ad relevance) require it to be unique. `[CONFIRM EXACT TEXT WITH DANIEL]` before applying since the tab text is rendered metadata.
- **Effort:** S
- **Batch:** 09

**Current state** (quoted exactly):
```
2x "What Is Your Home Worth? | Free Property Estimate":
  /Users/danielgierach/DanielGierachProperty/dist/lp/seven-hills/index.html
  /Users/danielgierach/DanielGierachProperty/dist/lp/murarrie/index.html
The /lp/bulimba, /lp/hawthorne, /lp/camp-hill files already use the "What Is Your <Suburb> Home Worth? | Free Report" pattern.
```

**Target state:** Apply the suburb-specific pattern:
- `/lp/seven-hills.astro`: title `What Is Your Seven Hills Home Worth? | Free Report`.
- `/lp/murarrie.astro`: title `What Is Your Murarrie Home Worth? | Free Report`.

Match the exact pattern used by `/lp/bulimba`, `/lp/hawthorne`, `/lp/camp-hill`.

**Verification:** Built HTML for both pages shows the suburb-specific title.

**Rollback:** Restore the prior generic title.

---

### TASK OSEO-009: Vary insight CTA destinations to /walkthrough or /get-an-appraisal

- **Source finding:** 02-on-page-seo.md, OSEO-009
- **Files:** Insight article CTA boxes site-wide. Pattern source: `/Users/danielgierach/DanielGierachProperty/src/pages/insights/when-to-reduce-asking-price-brisbane.astro` line 65 (CTA box pointing to `/contact`).
- **Protected impact:** Insight articles are not in the protected list. CTA href changes are content edits.
- **Effort:** M
- **Batch:** 09

**Current state** (quoted exactly):
```
Articles linking to /walkthrough from body: 33 (5.7%)
Articles linking to /property-worth from body: 0 (0.0%)
Articles linking to /get-an-appraisal from body: 14 (2.4%)
Articles linking to /contact from body: 536 (93.4%)
```

**Target state:** Vary CTA destination by article topic:
- Pricing, valuation, appraisal articles: `/property-worth` or `/get-an-appraisal`.
- Process, timing, strategy articles: `/walkthrough`.
- Generic articles: keep `/contact`.

Easiest mechanism: build a topic -> CTA map (cluster slug to CTA URL) and update the standard insight CTA box to read from it.

**Verification:** After deploy, `grep -lr 'href="/contact"' /Users/danielgierach/DanielGierachProperty/dist/insights/ | wc -l` drops materially. Spot-check 10 articles to confirm the destination matches the topic.

**Rollback:** Restore prior CTA URLs.

---

### TASK OSEO-001 + OSEO-010 + OSEO-011: Insert in-body internal links from insights to insights, suburbs, tools

- **Source finding:** 02-on-page-seo.md, OSEO-001, OSEO-010, OSEO-011
- **Files:** Insight article files under `/Users/danielgierach/DanielGierachProperty/src/pages/insights/*.astro`. Pattern source: `/Users/danielgierach/DanielGierachProperty/src/pages/insights/when-to-reduce-asking-price-brisbane.astro` lines 30-62.
- **Protected impact:** Insights are not in the protected list. This is a content-template change.
- **Effort:** L
- **Batch:** 09

**Current state** (quoted exactly):
```
414 of 574 insight articles (72.1%) contain zero in-body internal links.
525 of 574 (91.5%) link to no suburb page.
445 of 574 (77.5%) link to no tool.
```

**Target state:** Choose one of three approaches:

1. Build a small generation step that for every insight article identifies 3 to 5 contextually relevant other insights, 1 to 2 relevant suburb pages (where the article mentions a suburb name), and 1 to 2 relevant tools (where the article mentions a calculation), and inserts those links into the body prose at natural moments.
2. Lower-effort interim: extend the Layout component to inject an "in-this-guide" block at the top of the article body and a "next steps: try the X tool, read the Y guide" block before the existing CTA box, both populated from a per-article links map.
3. Lowest-effort: add a "Related tools and suburbs" section after the existing footer email-capture block on insights, populated by topic-cluster logic.

Recommended starting point: Option 2 because it lives in the Layout (reusable) and adds in-`<main>` links per OSEO-021.

Build a topic-cluster map keyed by article slug. Suggested seed mappings:
- `selling cost*` -> `/tools/selling-costs`
- `auction reserve*` -> `/tools/auction-reserve`
- `stamp duty*` -> `/tools/stamp-duty`
- `pricing*` / `valuation*` -> `/tools/valuation` and `/tools/appraisal-reality-check`
- Suburb name match -> `/suburbs/<slug>` for the first occurrence in the body.

**Verification:** After build, the same scan shows under 10% of insights articles with zero internal links (down from 72.1%). Suburb pages now have inbound links from at least 50% of insight articles that mention them.

**Rollback:** `git revert <commit>`.

---

## Batch 10, Content, factual errors and consolidation

### TASK CONT-001: Update Foreign Resident CGT Withholding rate from 12.5% to 15%

- **Source finding:** 03-content-quality-insights.md, CONT-001
- **Files:**
  - `/Users/danielgierach/DanielGierachProperty/src/pages/insights/foreign-resident-selling-property-brisbane-cgt-withholding.astro`
  - `/src/pages/insights/capital-gains-tax-selling-home-brisbane.astro`
  - `/src/pages/insights/ato-clearance-certificate-cgt-withholding-selling-queensland.astro`
  - `/src/pages/insights/documents-sellers-need-before-listing-brisbane.astro`
  - `/src/pages/insights/selling-brisbane-property-while-living-overseas-expat-non-resident.astro`
  - `/src/pages/insights/selling-brisbane-property-interstate-overseas-guide.astro`
- **Protected impact:** Insight articles are not in the protected list.
- **Effort:** S (per audit estimate, 2 hours total across 6 files)
- **Batch:** 10

**Current state:**
```
States Foreign Resident CGT Withholding rate is 12.5% on properties above $750,000.
From 1 January 2025 the rate is 15% and the threshold has been removed (applies to all property sales by foreign residents regardless of value).
```

**Target state:** In all 6 files:
- Replace `12.5%` with `15%` in body and FAQ schema strings.
- Replace `$750,000` threshold language with "no threshold, applies to all property sales by foreign residents regardless of value".

**Verification:** `grep -rn "12.5%" /Users/danielgierach/DanielGierachProperty/src/pages/insights/ | grep -i "cgt\|withholding\|foreign"` returns no matches. `grep -rn "750,000" /Users/danielgierach/DanielGierachProperty/src/pages/insights/ | grep -i "foreign\|withholding"` returns no matches.

**Rollback:** `git revert <commit>`.

---

### TASK CONT-002: Delete or rewrite four pre-PLA-2023 disclosure articles

- **Source finding:** 03-content-quality-insights.md, CONT-002
- **Files:**
  - `/Users/danielgierach/DanielGierachProperty/src/pages/insights/property-disclosure-obligations-queensland.astro`
  - `/src/pages/insights/property-disclosure-obligations-queensland-sellers.astro`
  - `/src/pages/insights/seller-disclosure-obligations-queensland.astro`
  - `/src/pages/insights/section-52-disclosure-selling-queensland.astro`
- **Protected impact:** Insight articles are not in the protected list.
- **Effort:** M (audit estimate 4 hours)
- **Batch:** 10

**Current state:**
```
Three disclosure articles describe the regime that omits the Property Law Act 2023 mandatory Form 2 disclosure (commenced 1 August 2025). Frame Queensland as caveat-emptor.
The canonical replacement (complete-seller-disclosure-checklist-queensland.astro) is already up to date.
```

**Target state:**
1. Delete the four files listed above.
2. Add 301 redirects in `vercel.json` from each old slug to `/insights/complete-seller-disclosure-checklist-queensland`:
```json
{ "source": "/insights/property-disclosure-obligations-queensland", "destination": "/insights/complete-seller-disclosure-checklist-queensland", "permanent": true },
{ "source": "/insights/property-disclosure-obligations-queensland-sellers", "destination": "/insights/complete-seller-disclosure-checklist-queensland", "permanent": true },
{ "source": "/insights/seller-disclosure-obligations-queensland", "destination": "/insights/complete-seller-disclosure-checklist-queensland", "permanent": true },
{ "source": "/insights/section-52-disclosure-selling-queensland", "destination": "/insights/complete-seller-disclosure-checklist-queensland", "permanent": true }
```

**Verification:** `curl -I https://danielgierach.com/insights/property-disclosure-obligations-queensland` returns 308 -> the canonical URL. The canonical page returns 200.

**Rollback:** `git revert <commit>` restores the four articles. Remove the four redirects.

---

### TASK CONT-009: Replace em-dash in STAGED comment across draft files

- **Source finding:** 03-content-quality-insights.md, CONT-009
- **Files:** ~133 staged insight article files containing `// STAGED — remove this line on publish date`
- **Protected impact:** Insights not protected. Comment is non-user-visible.
- **Effort:** S (single sed pass)
- **Batch:** 10

**Current state** (quoted exactly):
```
const draft = true; // STAGED — remove this line on publish date
```

**Target state:**
```
const draft = true; // STAGED, remove this line on publish date
```

Run a single bulk replacement across all 133 staged files.

**Verification:** `grep -rln "STAGED —" /Users/danielgierach/DanielGierachProperty/src/pages/insights/` returns nothing.

**Rollback:** `git revert <commit>`.

---

### TASK CONT-003 cluster: Resolve duplicate insight clusters (delete + 301)

- **Source finding:** 03-content-quality-insights.md, CONT-003 and OSEO-003
- **Files:** ~140 duplicate insight files across 49 clusters; redirect rules in `/Users/danielgierach/DanielGierachProperty/vercel.json`. Cluster table in 03-content-quality-insights.md lines 19-75 is the authoritative list of which slug to keep and which to delete per topic.
- **Protected impact:** Insights not protected. Each delete needs a 301 to the canonical kept slug.
- **Effort:** L (audit estimate 2 days for the full cluster sweep)
- **Batch:** 10

**Current state:**
49 confirmed clusters, conservative estimate of 130 to 160 duplicate articles to delete; article count after consolidation around 410 to 440.

**Target state:** Execute the cluster recommendations in 03-content-quality-insights.md lines 19-75 in priority order (highest duplicate-density first):

1. Property styling (8 articles -> 2)
2. Real estate agent commission (6 -> 3)
3. Deceased estate (6 -> 4)
4. Tenanted property (5 -> 1)
5. How to choose agent (5 -> 1)
6. Settlement day (4 -> 2)
7. Auction vs private treaty (5 -> 2)
8. Pre-sale building & pest (6 -> 3)
9. Cooling-off (4 -> 2)
10. Cost of selling (3 -> 1)
11. Form 6 (5 -> 2)
12. The remaining 37 smaller clusters

For each cluster:
1. Identify canonical and duplicates per the table.
2. Delete duplicate `.astro` files.
3. Add 301 redirects in `vercel.json` from the deleted slugs to the canonical kept article.
4. After deleting, run a similarity scan to confirm no Jaccard >= 0.7 pairs remain.

Recommended zero-risk starting points (per OSEO-003):
- Delete `negative-gearing-property-sale-brisbane.astro` (longer-form duplicate exists at `negative-gearing-selling-investment-property-brisbane.astro`).
- Delete or rename `how-to-choose-a-real-estate-agent.astro`, since its title already says "What Does a Real Estate Agent Actually Do for You?" and a separate `what-does-a-real-estate-agent-do.astro` exists with the same title.
- Decide on plural for `auction-vs-private-treaty-brisbane-seller(s)`; redirect the loser.

**Verification:** `find /Users/danielgierach/DanielGierachProperty/src/pages/insights/ -name "*.astro" | wc -l` drops to around 410 to 440. `curl -I https://danielgierach.com/insights/<deleted-slug>` returns 308 to the canonical. Search Console "Indexed, not submitted in sitemap" count drops.

**Rollback:** `git revert <commit>` per cluster.

---

### TASK CONT-004 + CONT-005: Off-focus suburb and audience-mismatched content cleanup

- **Source finding:** 03-content-quality-insights.md, CONT-004 and CONT-005
- **Files:** 27 off-focus `selling-in-*` insight files (NOTE: these are insight articles, NOT the protected `/suburbs/*` pages) and 12 build/buyer/architect files (full lists in 03-content-quality-insights.md off-focus and audience-focus tables).
- **Protected impact:** None of these insight files are protected. Note: this task targets `/insights/selling-in-*` articles, not the `/suburbs/*` pages, which remain protected.
- **Effort:** L (audit estimate 1 day + 4 hours)
- **Batch:** 10

**Current state:** 27 insight articles target out-of-focus suburbs (Fortitude Valley through Carindale per the off-focus table). 12 articles target builders/buyers/architects rather than sellers.

**Target state:** Per the audit recommendation:
1. Delete the 27 off-focus suburb insight articles (or merge into a single "selling in surrounding suburbs" reference page that links back to canonical inner-east guides).
2. Delete the 12 audience-mismatched articles.
3. Add 301 redirects from each deleted slug to the closest-canonical inner-east suburb page or to `/insights/`.

**Verification:** `find /Users/danielgierach/DanielGierachProperty/src/pages/insights/ -name "selling-in-*"` matches only core inner-east suburbs. `find /Users/danielgierach/DanielGierachProperty/src/pages/insights/ -name "build-process-with-architect*" -o -name "engage-right-builder*" -o ...` returns nothing.

**Rollback:** `git revert <commit>`.

---

## Verification-blocked appendix

The following findings need additional information or sign-off before action:

| ID | Why deferred |
|---|---|
| **TSEO-001 alt path (custom sitemap retain)** | Choosing between Option 1 (delete custom sitemap) and Option 2 (delete Astro sitemap) needs Daniel's preference. Default of Batch 02 picks Option 1, the audit's recommended path. |
| **TSEO-006 + TSEO-008 + TSEO-019 (trailing slash unification)** | Need a single decision on `trailingSlash: 'always'` or `'never'`. The audit recommends `'always'` to match the existing canonical, but this changes Astro routing semantics and Vercel redirects across the entire site; deferred for verification. |
| **TSEO-014 (page-level JSON-LD on funnel pages)** | Schema additions to /listings, /walkthrough, /property-worth, /property-report, /get-an-appraisal need Daniel's input on Service vs ItemList vs WebPage. Schema-only changes are technically permitted but design is non-trivial. |
| **TSEO-015 (article datePublished backfill)** | Three approaches (backfill seo-schedule.json, file mtime fallback, frontmatter convention). Pick one. |
| **TSEO-018 (sitelinks searchbox)** | Either implement client-side filtering on /insights?q= or remove the SearchAction. Daniel preference needed. |
| **OSEO-007 (Title Case suburb H1s)** | Sentence-case to Title Case is visible body text on protected suburb pages. Audit explicitly says "do NOT auto-fix without confirmation". |
| **OSEO-012 (resource pages related-content section)** | Adds visible content to protected /resources/* pages. Audit says "confirm with Daniel before adding visible content". |
| **OSEO-013 (suburb pages dynamic related-content)** | Same protection issue, audit says "recommend confirmation before applying". |
| **OSEO-014 (per-page OG cards)** | Multi-day Puppeteer-driven generation; spec needs Daniel's design direction. |
| **OSEO-015 (154 long meta descriptions)** | Manual rewrite of 154 descriptions; defer to bulk pass once content cleanup (Batch 10) lands so deleted articles do not waste effort. |
| **OSEO-016 (11 short tool descriptions)** | Visible-tab metadata change on protected tool pages, plus suggested wording needs Daniel sign-off. |
| **OSEO-017 (H3 substructure across insights)** | Visible-content rewrite of body sections; needs editorial direction. |
| **OSEO-018 (year strategy)** | Decide whether to include current year in titles or remove year entirely. |
| **OSEO-021 (move related blocks into main)** | Layout structural change; audit recommends checking with Daniel; deferred until OSEO-001 is fixed since it may make this redundant. |
| **PERF-004 (self-host web-vitals)** | Choose between npm install + bundle and preconnect + smaller variant. Both are acceptable; pick one. |
| **PERF-006 (oversize dashboard / social-preview)** | Subsumed by SEC-002. Delete from production build there. |
| **PERF-010 (trim Google Fonts)** | Need an audit of which weights are actually used in CSS before pruning. |
| **CODE-001 (inline styles to Tailwind)** | Multi-day mechanical refactor; defer to a planned engineering sprint. |
| **CODE-006 (suburb-map.ts code-split)** | Audit explicitly says verification needed via DevTools Network on /suburbs/murarrie. Confirm whether the 252 KB file is actually inlined before splitting. |
| **CODE-007 (split Layout.astro)** | Maintainability finding. Defer. |
| **CODE-010 (delegated click handler)** | Refactor; safe to do but lower priority than functional fixes. |
| **A11Y-009 (contact intent radio group)** | /contact is protected. Replacing the three buttons with a radio fieldset changes rendered controls. Daniel sign-off needed. |
| **A11Y-011 (low-alpha cream contrast)** | Audit lists protected and non-protected pages; raising opacity is a visible change on /walkthrough (protected). Daniel sign-off needed. |
| **A11Y-012 (generic alt text)** | Editorial decision: descriptive alts vs decorative `alt=""`. Daniel preference needed. |
| **A11Y-014 (Astro Image component migration)** | Multi-day perf migration. |
| **A11Y-015 (tooltip pattern)** | Tools are protected, tooltip refactor changes interaction. Daniel sign-off needed. |
| **A11Y-016 to A11Y-020** | Low priority polish; defer. |
| **MOBI-005, MOBI-007, MOBI-008** | Visible padding/dimension changes; audit lists these under "Visual-change fixes (require Daniel sign-off)". |
| **MOBI-006, MOBI-009, MOBI-010, MOBI-011, MOBI-013, MOBI-014** | Verify visually at 320px before action. |
| **SEC-003 (CSP header)** | Audit recommends rolling out in `Content-Security-Policy-Report-Only` first for a week. Needs deploy access and observation period. **Requires deploy/env access.** |
| **SEC-005 (SRI on third-party scripts)** | Audit notes SRI is impractical for GA/Meta/Maps; rely on CSP. Deferred. |
| **SEC-007 (form spam protection)** | Audit recommends Formspree-side captcha + `_gotcha` honeypot. Needs Formspree dashboard access (**Requires external account**). |
| **SEC-010 (HSTS preload submission)** | Verify status at https://hstspreload.org/?domain=danielgierach.com. **Requires external account/manual submission.** |
| **SEC-011 (Maps API key restrictions)** | Verify HTTP referrer + API restrictions in GCP console. **Requires external account.** |
| **SEC-013 (form field length/sanitisation)** | Defence-in-depth, low priority. |
| **LSEO-001 / LSEO-002 / LSEO-003 / LSEO-008 / TRUST-001 / TRUST-002** | Need Daniel to confirm canonical agency name (REIQ register, GBP, RateMyAgent, realestate.com.au), licence number, REIQ membership, LinkedIn URL, Instagram handle, Facebook page ownership, GBP details. See "Verification needed from Daniel" in 07-local-seo-trust.md. Batch 08 prepared but blocked. |
| **LSEO-006 (geo coords per suburb)** | Need verified ABS or Wikipedia centroid lat/lng for each suburb before adding `geo` blocks. |
| **LSEO-007 (priceRange/hasOfferCatalog)** | Need Daniel's actual price range of recent sales for an honest priceRange string. |
| **LSEO-009 (suburb cross-linking depth)** | Suburb pages protected; richer body cross-links would change visible content. Daniel sign-off needed. |
| **LSEO-010 / LSEO-011 (hub & suburbs index schema)** | Schema additions, low priority; defer to a focused schema pass. |
| **TRUST-003 + TRUST-004** | Need Daniel to confirm real review count and pull 4 to 6 real reviews from RateMyAgent / Google. AggregateRating must match real review count exactly. |
| **TRUST-005** | Personal sales volume, awards, RateMyAgent rankings need Daniel sign-off. |
| **TRUST-007** | Folded into LSEO-003 sameAs additions. |
| **TRUST-009** | Folded into TSEO-010 / LSEO-005 once `@id` linking is in place. |
| **TOOL-004 (LMI rate sourcing)** | Audit says "needs verification" against 2026 Helia/Arch MI rate cards. **Requires external account / manual citation.** |
| **TOOL-012 (whole-of-move.astro deep audit)** | Audit says "did not deep-read"; needs a follow-up read of FHB concession logic. |
| **TOOL-015 (federal-budget-2026.astro Brisbane price cap)** | Brisbane-specific Help to Buy price cap not surfaced in audit sample; needs verification. |
| **VERIFY-011 (mortgage registration fee)** | Current Titles Queensland fee schedule needs a verify call before unifying $204 / $212 / $221 across calculators. **Requires external check.** |
| **CONT-006** | 95 files with body-copy AI slop ("leverage", "robust", etc.). Bulk find-and-replace is mechanical but each replacement needs in-context check. Defer to a focused voice pass after CONT-003 cluster cleanup. |
| **CONT-007 + CONT-008** | Five "Navigating..." openers and seven "Whether you are..." patterns. Defer to the same voice pass. |
| **CONT-010** | Eight thin individual articles below 1,100 words. Need editorial expansion. Defer. |
| **CONT-011** | Calendar reminder for 1 July 2026. Out of scope for an immediate task block. |
| **ANLY-004 (Privacy Policy update)** | Editorial rewrite of section 9 of /privacy. Daniel sign-off needed; not a code-only change. |
| **ANLY-005 (tool CTA tracking)** | Add `data-cta` attributes and tracking. Tools are protected; adding attributes is metadata-equivalent but the change spans 56 files. Daniel sign-off recommended. |
| **ANLY-008 (additional Meta events)** | Adds `Contact`, `ViewContent`, `Search`, `CompleteRegistration`. Defer to a focused tracking pass. |
| **ANLY-009 (consent banner)** | Not legally required in AU per the audit. Defer to forward planning. |
| **ANLY-010 (Meta CAPI)** | Out of scope. |
| **All "Verification needed" items in audit files 01-08** | Live curl, Search Console, GBP check, Lighthouse, axe, Helia rate cards, etc. Listed in each audit's verification table. Run before sign-off on relevant batches. |
