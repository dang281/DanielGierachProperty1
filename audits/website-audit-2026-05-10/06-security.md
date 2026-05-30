# Security Audit, danielgierach.com

**Date:** 2026-05-10
**Scope:** HTTPS configuration, security headers, mixed content, exposed secrets, form handling, third-party script integrity, robots.txt info disclosure, internal pages (`/dashboard`, `/social-preview`).
**Method:** Static review of repo at `/Users/danielgierach/DanielGierachProperty`. No DAST, no live header capture, no Google Cloud / Vercel console access.

---

## 1. Summary

The site is built on Astro and deployed on Vercel. It is a static, marketing-oriented site, no first-party server endpoints, all form submissions are forwarded to Formspree. The platform-level transport security is reasonable (HSTS with `preload`, Vercel TLS), but several issues of varying severity exist around (a) **no Content-Security-Policy**, (b) two **internal pages protected by a hardcoded client-side password** that is checked in browser JavaScript, (c) **a Supabase secret key stored in a project `.env`** (not committed, but on disk and clearly used as a `sb_secret_` prefix key), (d) **mixed-content `http://` links** to two property listings, and (e) **no Subresource Integrity** on third-party scripts (Google Maps, GA4, Meta Pixel, Formspree).

Findings table below. Severity is the impact-likelihood blend appropriate to a single-agent property marketing site, not a production fintech.

| ID      | Severity | Title                                                                                                  |
|---------|----------|--------------------------------------------------------------------------------------------------------|
| SEC-001 | High     | Supabase `sb_secret_` key in `/.env` on local disk                                                     |
| SEC-002 | High     | `/dashboard` and `/social-preview` "password gate" is client-side, password is `dang2026` in clear     |
| SEC-003 | Medium   | No Content-Security-Policy header set in `vercel.json`                                                 |
| SEC-004 | Medium   | Mixed content, `http://raywhitebulimba.com.au/...` links in `index.astro`                              |
| SEC-005 | Medium   | No Subresource Integrity on third-party scripts (Maps, GA4, Meta Pixel, Formspree, Unsplash, Fonts)    |
| SEC-006 | Medium   | Two distinct Meta Pixel IDs fire on the same site (different layouts), tracking integrity concern      |
| SEC-007 | Low      | Form submissions go to Formspree with no captcha or rate limit visible in code                         |
| SEC-008 | Low      | `X-XSS-Protection: 1; mode=block` set, deprecated and recommended off, prefer CSP                      |
| SEC-009 | Low      | `robots.txt` discloses internal path prefixes `/preview/`, `/dashboard/`, `/lp/`, `/thank-you/`        |
| SEC-010 | Info     | HSTS sent with `preload` directive but preload-list submission status not verifiable from code         |
| SEC-011 | Info     | Google Maps API key restriction status not verifiable from repo, requires Google Cloud console check   |
| SEC-012 | Info     | Open-redirect risk in `vercel.json` redirects, low, both targets are internal/explicit                 |
| SEC-013 | Info     | Form `_next` and `_subject` hidden fields trust client values, Formspree-side risk only                |

---

## 2. Findings detail

### SEC-001, High — Supabase secret key on disk in `.env`

**File:** `/Users/danielgierach/DanielGierachProperty/.env`
**Evidence (lines 1-2):**
```
PUBLIC_GOOGLE_MAPS_KEY=[REDACTED-GOOGLE-MAPS-KEY]
SUPABASE_KEY=[REDACTED-SUPABASE-SECRET-KEY]
```

The `sb_secret_` prefix is the Supabase service-role / secret API key format, not the anon/public `sb_publishable_` key. Service-role keys bypass Row Level Security in Supabase.

**Mitigations already in place:**
- `.gitignore` line 17 excludes `.env`. Confirmed via `git log --all --full-history -- .env` returns no commits, so the secret has not been pushed to GitHub.
- A repo-wide grep for `SUPABASE` / `supabase` in `src/**/*.{astro,js,ts,mjs}` returned no matches. The key is **not actually used** by the website code, it is consumed elsewhere (likely the dashboard project per memory notes).

**Risk:** Local-disk-only exposure today. Risks materialise if: the key is ever pasted into a committed file, the laptop is shared/lost, or the key is mirrored into Vercel's project env without restriction. If it is the service-role key, anyone with it has full read/write to all Supabase tables ignoring RLS.

**Recommendation:**
1. Rotate the key in the Supabase dashboard (treat it as exposed because it now sits in plaintext in a working directory).
2. After rotating, store the replacement in Vercel project env (encrypted at rest) and 1Password / a vault, not a plaintext `.env` checked into the working tree.
3. If only a public read role is ever needed by client code, switch to a `sb_publishable_` key with RLS strictly enforced.

---

### SEC-002, High — Internal pages "protected" by client-side password `dang2026`

**Files:**
- `/Users/danielgierach/DanielGierachProperty/src/pages/dashboard.astro` line 1221: `const PASS = 'dang2026';`
- `/Users/danielgierach/DanielGierachProperty/src/pages/social-preview.astro` line 266: `const PASS = 'dang2026';`

Both pages render a "password gate" overlay (lines 195-202 of dashboard, 75-83 of social-preview), then in client JS compare `inp.value === PASS` and toggle CSS visibility. `sessionStorage.setItem('dash_auth','1')` / `'social_auth','1'` is the only "auth" state. The full page HTML, including all data the page builds at SSR (full git log, all suburb/insight slug lists, all draft caption text, hashtags, internal notes for Daniel), is sent to any visitor before the gate even runs.

**Server-side data exposed pre-gate, in dashboard.astro:**
- Last 30 commit messages, hashes, dates (lines 14-41) — repo activity, internal task patterns
- Full list of `suburbPages` and `insightPages` from filesystem read (lines 46-52)
- Last 7 days of git commits with subjects (lines 156-187)
- The internal API base URL `http://127.0.0.1:3100` and a company UUID `e01db3e8-fb70-4c7a-b7a7-495c1df05882` (lines 634-635), the dashboard fetches `localhost:3100/api/companies/.../issues` etc. so this only works on Daniel's machine, but the UUID is leaked in the production HTML
- A GitHub blob URL pointing at `https://github.com/dang281/DanielGierachProperty1/blob/main/...` (line 601, 251), revealing the GitHub user and repo name

**Server-side data exposed pre-gate, in social-preview.astro:**
- Full caption body, hashtags, "Notes for Daniel" content of every draft markdown file in `content/social/` (lines 25-57), including drafts not yet published

**Risk:** "Anyone with curl" risk. `curl https://danielgierach.com/dashboard | less` likely reveals the entire SSR-rendered DOM, including unpublished social draft copy and internal notes. The password input is decorative.

**Verification needed (DAST):**
```
curl -s https://danielgierach.com/dashboard | grep -i "PASS\|sessionStorage\|content/social"
curl -s https://danielgierach.com/social-preview | grep -A 2 "Notes for Daniel"
```
If the page returns 200 with full HTML, the gate is bypassed.

**Recommendations (in order of effort):**
1. **Best:** Use Vercel Password Protection (paid feature on Pro plan), or Vercel "Standard Protection" via deployment-level auth, which gates *before* rendering.
2. **Strong:** Move `/dashboard` and `/social-preview` behind a Vercel Edge Middleware that checks an HTTP-only signed cookie. Reject with 401 before SSR runs.
3. **Minimum:** Set `output: 'server'` on these two routes only and gate via `Astro.request` headers with a real password compared server-side, plus return a 404 / redirect for unauthenticated requests so no body leaks.
4. Add `X-Robots-Tag: noindex` HTTP header (currently the page sets the meta tag client-side after render, line 192 of dashboard, line 72 of social-preview, which crawlers may have already indexed).
5. Until fixed, treat `dang2026` as public knowledge and rotate to a unique passphrase even if the gate moves server-side.

---

### SEC-003, Medium — No Content-Security-Policy header

**File:** `/Users/danielgierach/DanielGierachProperty/vercel.json`

`vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, but **no `Content-Security-Policy`**. CSP is the single highest-leverage modern header and is the defence-in-depth control against XSS, clickjacking via embedded iframes, and unintended third-party script injection.

The site loads scripts from these external origins (third-party scripts inventory, found in `src/layouts/Layout.astro` and `src/layouts/LandingLayout.astro`):

| Origin                              | Used for                  | File:Line                                    |
|-------------------------------------|---------------------------|----------------------------------------------|
| `https://www.googletagmanager.com`  | GA4 (`G-K1P37GL73K`)      | Layout.astro:492, LandingLayout.astro:74     |
| `https://connect.facebook.net`      | Meta Pixel                | Layout.astro:482, LandingLayout.astro:47     |
| `https://www.facebook.com`          | Meta Pixel noscript       | Layout.astro:488, LandingLayout.astro:53     |
| `https://maps.googleapis.com`       | Places Autocomplete       | walkthrough.astro:737, property-report.astro:700, lp/murarrie.astro:256, lp/seven-hills.astro:270, tools/commute-cost.astro:480, tools/local-eats.astro:4, tools/brisbane-2032.astro:3, index.astro:1080 |
| `https://fonts.googleapis.com`      | Webfonts CSS              | Layout.astro:278, LandingLayout.astro:29     |
| `https://formspree.io`              | Form submission           | get-an-appraisal.astro:70, contact.astro:129, walkthrough.astro:751, property-report.astro:411,743 |
| `https://images.unsplash.com`       | Hero / lp imagery         | index.astro:288, lp/bulimba.astro:250        |
| `https://cdn6.ep.dynamics.net`      | Ray White headshots/photos| Layout.astro:78,174, social-preview.astro:6, dashboard.astro:57, index.astro:45,56,67 |
| `https://raywhitebulimba.com.au`    | External listing links    | Layout.astro:181,204, index.astro:41,52,63   |

A reasonable starter CSP for this site (verify in `Content-Security-Policy-Report-Only` first):

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://maps.googleapis.com https://maps.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://cdn6.ep.dynamics.net https://www.facebook.com https://www.google-analytics.com https://maps.gstatic.com https://maps.googleapis.com;
  connect-src 'self' https://formspree.io https://www.google-analytics.com https://maps.googleapis.com https://*.facebook.com https://*.facebook.net;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self' https://formspree.io;
  upgrade-insecure-requests
```

Note: `'unsafe-inline'` for scripts is needed because the layouts contain large inline `<script>` blocks (GA4 init, Meta Pixel init, custom telemetry). To remove `'unsafe-inline'` later, refactor those into hashed inline scripts or external files, then add hashes/nonces to the directive.

**Verification needed (DAST):** Run https://observatory.mozilla.org/analyze/danielgierach.com or https://securityheaders.com — the current grade without CSP will be capped at B at best.

---

### SEC-004, Medium — Mixed content, `http://raywhitebulimba.com.au/...`

**File:** `/Users/danielgierach/DanielGierachProperty/src/pages/index.astro`
**Lines:**
- L52: `href: 'http://raywhitebulimba.com.au/L24412788',`
- L63: `href: 'http://raywhitebulimba.com.au/L39017810',`

These are outbound `<a href>` links so most browsers will silently upgrade them under HSTS / `upgrade-insecure-requests`, and the destination domain does serve HTTPS. Still:
1. Without `upgrade-insecure-requests` in CSP (SEC-003), and on browsers that strictly enforce mixed-content for navigation, the user experiences a redirect chain `http → https`.
2. Looks unprofessional in HTML view-source. Site authors clearly intended HTTPS elsewhere (lines 41, 174, 181, 204 of `Layout.astro` use `https://raywhitebulimba.com.au` already).

**Fix:** Edit `index.astro` lines 52 and 63 to `https://raywhitebulimba.com.au/...`.

---

### SEC-005, Medium — No Subresource Integrity (SRI) on third-party scripts

**Search result:** `grep -rln "integrity=\|crossorigin=" --include="*.astro" /Users/danielgierach/DanielGierachProperty/src/` returns nothing.

External scripts loaded without SRI:
- GA4 loader, `https://www.googletagmanager.com/gtag/js?id=G-K1P37GL73K` (Layout.astro:492, LandingLayout.astro:74)
- Google Maps JS, multiple files listed above
- Meta Pixel loader, `https://connect.facebook.net/en_US/fbevents.js` (Layout.astro:482, LandingLayout.astro:47), injected via the standard fbq snippet

**Risk:** If any of those third-party CDNs is compromised or the URL is hijacked at the network edge for a visitor, the injected script runs with full page DOM access (no CSP limiting it, see SEC-003). For Google/Meta tags this is widely accepted, since the CDNs version their files dynamically and SRI hashes break with each update. Standard industry practice is therefore: **rely on CSP `script-src` allowlist** rather than SRI for these specific tags. This finding is therefore lower-risk if SEC-003 is fixed.

**Recommendation:** Add the CSP from SEC-003. SRI is impractical for GA/Meta/Maps because their bundles change. SRI **is** practical for any pinned-version libraries you might add later (e.g. a Chart.js from jsdelivr) — apply it there.

---

### SEC-006, Medium — Two different Meta Pixel IDs across layouts

**Files:**
- `Layout.astro:483` — `fbq('init', '1493183205636761');`
- `Layout.astro:488` — `<img src="https://www.facebook.com/tr?id=1493183205636761&ev=PageView&noscript=1"/>`
- `LandingLayout.astro:48` — `fbq('init', '1462440981414974');`
- `LandingLayout.astro:53` — `<img src="https://www.facebook.com/tr?id=1462440981414974&ev=PageView&noscript=1"/>`

Pixel `1493183205636761` fires on every regular page (Layout.astro). Pixel `1462440981414974` fires on landing pages only (LandingLayout.astro).

This is not strictly a "security" vulnerability but is a privacy / data-handling concern, two distinct Meta business accounts (or two distinct ad accounts) are receiving visitor data depending on which page is loaded. A user clicking from `/lp/murarrie` to `/about` is being attributed across two different pixel buckets.

**Verification needed:** Confirm with Daniel which is the canonical pixel and whether the second was a leftover from a prior agency / Meta account.

**Recommendation:** Pick one. Either consolidate to a single pixel ID across both layouts, or document the split intentionally in the privacy policy (`/privacy`).

---

### SEC-007, Low — Form submissions to Formspree, no captcha / no rate-limit in code

**Forms found:**
- `/walkthrough` — JS fetch to `https://formspree.io/f/xnjgedwp` (walkthrough.astro:751)
- `/property-report` — POST to `https://formspree.io/f/xnjgedwp` (property-report.astro:411,743)
- `/contact` — POST to `https://formspree.io/f/xnjgedwp` (contact.astro:129)
- `/get-an-appraisal` — POST to `https://formspree.io/f/xnjgedwp` (get-an-appraisal.astro:70)
- `/tools/dcf`, `/tools/valuation`, `/suburbs/*` — same Formspree endpoint
- `/lp/bulimba`, `/lp/murarrie`, `/lp/seven-hills` — internal `<form action="/property-report" method="get">` (lp/bulimba.astro:273), redirects user to property-report which then submits to Formspree

All of these point at the **same Formspree form ID** `xnjgedwp`. There is no client-side captcha, no honeypot, no Turnstile. CSRF is not relevant for the Formspree endpoint (Formspree itself accepts cross-origin POSTs by design), but spam/abuse is.

**Risks:**
- A bot can flood `xnjgedwp` with spam, exhausting any monthly submission quota and burying real leads.
- Formspree's free tier has a 50 submissions/month cap, which a single bot run can saturate.

**Verification needed:** Check the Formspree dashboard for spam submissions and current plan limits.

**Recommendations:**
1. Add a hidden honeypot field (the Formspree-recommended `_gotcha` input, hidden via CSS, real users leave blank, bots fill).
2. Enable Formspree's built-in reCAPTCHA / Turnstile setting on form `xnjgedwp` (server-side validation, no code change needed).
3. Consider Cloudflare Turnstile on `/property-report` and `/walkthrough` (the highest-intent forms).

---

### SEC-008, Low — `X-XSS-Protection: 1; mode=block` is deprecated

**File:** `vercel.json:8`
```
{ "key": "X-XSS-Protection", "value": "1; mode=block" }
```

Modern browsers (Chrome 78+, Edge, Firefox) have removed the legacy XSS auditor; this header is now no-op or in some old browsers can introduce attacks. The OWASP Secure Headers Project current guidance is to set `X-XSS-Protection: 0` or omit, and rely on CSP.

**Recommendation:** Remove the header from `vercel.json`. The control plane is CSP (SEC-003).

---

### SEC-009, Low — `robots.txt` discloses internal path prefixes

**File:** `/Users/danielgierach/DanielGierachProperty/public/robots.txt`
```
User-agent: *
Disallow: /preview/
Disallow: /dashboard/
Disallow: /lp/
Disallow: /thank-you/
```

Standard practice and not a finding by itself, but note `Disallow:` advertises path prefixes to anyone reading `robots.txt`. A targeted attacker now knows to probe `/dashboard` (which exists, see SEC-002), `/preview/` (does not appear to exist as a route in `src/pages/`, intentional), `/lp/...` (real funnel pages), `/thank-you/`.

The `/lp/` pages also use `LandingLayout.astro` which sets `<meta name="robots" content="noindex, nofollow" />` (LandingLayout.astro:21), so they are double-protected. The `/lp/` pages do not contain sensitive data, just marketing copy and a Formspree-bound form, and their secrecy is a marketing decision (don't let landing pages dilute organic SEO), not a security one.

**Recommendation:** No change required. `/dashboard` and `/social-preview` should additionally be removed from the public site or moved behind real auth (SEC-002), at which point removing them from `robots.txt` is fine because they 401 anyway.

---

### SEC-010, Info — HSTS preload status

**File:** `vercel.json:11`
```
{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
```

The header is correctly formed for preload-list inclusion (`max-age` >= 31536000, `includeSubDomains`, `preload`). Submission to https://hstspreload.org cannot be verified from the repo.

**Verification needed:** Visit https://hstspreload.org/?domain=danielgierach.com to check current status. If not preloaded, submit (free, takes 4-8 weeks to land in Chrome's list). Note: once preloaded, removing the domain takes 6-12 months and reverts via Chrome releases — only submit if you are committed to HTTPS for `danielgierach.com` *and all subdomains* indefinitely.

---

### SEC-011, Info — Google Maps API key restriction

**Key:** `[REDACTED-GOOGLE-MAPS-KEY]`
**Locations (8 occurrences):**
- `src/pages/index.astro:1080`
- `src/pages/walkthrough.astro:737`
- `src/pages/lp/murarrie.astro:256`
- `src/pages/lp/seven-hills.astro:270`
- `src/pages/tools/commute-cost.astro:480`
- `src/pages/tools/local-eats.astro:4`
- `src/pages/tools/brisbane-2032.astro:3`
- `.env:1` (`PUBLIC_GOOGLE_MAPS_KEY`)
- `src/pages/property-report.astro:700` (uses `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY` — the only file consuming the env var; the rest hardcode it)

Per `CLAUDE.md` and project convention, this key is intentionally public. The security control is supposed to be **HTTP referrer restriction** in Google Cloud Console, restricting which domains can use the key. This **cannot be verified from the repo** — only from Google Cloud Console.

**Verification needed (manual, in Google Cloud Console → APIs & Services → Credentials):**
1. Click on the API key. Confirm "Application restrictions" is set to **HTTP referrers** with at minimum:
   - `https://danielgierach.com/*`
   - `https://www.danielgierach.com/*`
   - `https://*.vercel.app/*` (only if you preview deploys, otherwise omit)
   - `http://localhost:*/*` (only if you `astro dev` regularly)
2. Confirm "API restrictions" is limited to **only the APIs you use** — Maps JavaScript API, Places API. Disable everything else.
3. Confirm a daily quota is set on the key to cap any abuse damage to a sensible dollar amount.
4. Check Google Cloud billing for the project, set a budget alert at e.g. $20/month so abuse is detected early.

If any of those are not set, the key is effectively a free billing API for anyone who scrapes it.

**Code-side recommendation:** Convert all 8 hardcoded references to use `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY` like `property-report.astro` already does. That way one key rotation (after the Cloud-side restriction audit) is one-line in `.env`, not 8 file edits.

---

### SEC-012, Info — Open-redirect risk in `vercel.json` redirects

**File:** `vercel.json:15-27`

Two redirects:
1. `www.danielgierach.com/:path*` → `https://danielgierach.com/:path*` (canonical host, fine)
2. `/appraisal` → `/walkthrough` (internal path, fine)

Neither takes a user-controlled destination, so there is no open-redirect risk.

The Formspree `_next` hidden input fields *do* take a destination value but it is hardcoded in the HTML (e.g. `walkthrough.astro:146 — value="https://danielgierach.com/thank-you?from=walkthrough"`), and Formspree's own logic checks the host. This is a Formspree-side concern, not a danielgierach.com-side one.

**No action.**

---

### SEC-013, Info — Hidden Formspree fields trust client-supplied values

**Examples:**
- `property-report.astro:412-420` — eight hidden inputs (`_subject`, `report_type`, `address`, `bedrooms`, ...) all `value=""` populated by client JavaScript before submit
- `walkthrough.astro:146-147` — `_next`, `_subject` hardcoded
- `index.astro:1181` — `fd.append('_subject', 'Homepage address enquiry, ' + addr);` — concatenates user-supplied address into the email subject

A malicious user can manipulate the address input or open devtools and overwrite hidden field values before submit. The result is Daniel receives an email with a tampered subject line / fields. This is a **content-only** issue (the email recipient is hardcoded on Formspree's side, the user cannot redirect mail). Worst case, Daniel's inbox shows a misleading subject like `Homepage address enquiry, <script>alert(1)</script>` — Formspree renders these as plain text in their email body, not HTML, so XSS in email clients is unlikely.

**Recommendation:** Strip non-printable characters and limit length client-side on the address field before submission (defence in depth). No urgent action.

---

## 3. Verification needed (couldn't verify from repo alone)

| Item                                                                        | How to verify                                                                       |
|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| Live HTTP response headers as actually served by Vercel                     | `curl -sI https://danielgierach.com/`, or https://securityheaders.com               |
| CSP report mode rollout effects                                             | Set `Content-Security-Policy-Report-Only` first, watch browser console for blocks   |
| HSTS preload list inclusion                                                 | https://hstspreload.org/?domain=danielgierach.com                                   |
| TLS configuration grade                                                     | https://www.ssllabs.com/ssltest/analyze.html?d=danielgierach.com                    |
| Whether `/dashboard` and `/social-preview` actually leak SSR data           | `curl -s https://danielgierach.com/dashboard \| less`, look for content past gate    |
| Google Maps API key restrictions                                            | Google Cloud Console → APIs & Services → Credentials                                |
| Formspree spam volume / plan limit                                          | Formspree dashboard for form `xnjgedwp`                                             |
| Whether Vercel deployment leaks `.env` or `.git`                            | `curl -sI https://danielgierach.com/.env`, `https://danielgierach.com/.git/HEAD` — both should 404 |
| Two Meta Pixel IDs intentional?                                             | Confirm with Daniel which ad account each belongs to                                |
| `npm audit` / `pnpm audit` for dependency CVEs                              | Run `npm audit --omit=dev` (out of scope for static review)                         |

---

## 4. Priority order to fix

1. **Now (high-impact, low-effort):**
   - SEC-001: rotate the Supabase secret key, move out of `.env` on disk
   - SEC-002: gate `/dashboard` and `/social-preview` server-side (Vercel Password Protection or middleware) and rotate `dang2026`
   - SEC-004: change two `http://raywhitebulimba.com.au` URLs to `https://`
2. **This week:**
   - SEC-003: deploy CSP in report-only mode, observe for 1 week, then enforce
   - SEC-011: verify Google Maps key is referrer-restricted in Google Cloud, replace 7 hardcoded references with `import.meta.env.PUBLIC_GOOGLE_MAPS_KEY`
   - SEC-007: add `_gotcha` honeypot + Formspree-side captcha to the four high-intent forms
3. **Cleanup (housekeeping):**
   - SEC-008: drop `X-XSS-Protection` from `vercel.json`
   - SEC-006: reconcile the two Meta Pixel IDs
   - SEC-010: confirm or submit HSTS preload
