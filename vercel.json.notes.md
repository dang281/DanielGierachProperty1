# vercel.json — security header notes

JSON does not support comments and Vercel's `vercel.json` schema rejects unknown keys, so the per-directive notes for the `Content-Security-Policy` header live here instead.

## Content-Security-Policy directive notes (SEC-003)

| Directive | Source | Why it is allowed |
|-----------|--------|-------------------|
| `default-src 'self'` | (own origin) | Tight default, anything not listed below falls back to same-origin only. |
| `script-src 'self'` | (own origin) | All first-party `<script>` files. |
| `script-src 'unsafe-inline'` | inline `<script>` blocks | Required for the inline GA4 init, Meta Pixel init, Formspree submit handlers, and per-page tracking snippets. Remove after refactoring inline scripts to hashed/nonced inline or external files. |
| `script-src https://connect.facebook.net` | Meta Pixel | Loader for `fbevents.js`. |
| `script-src https://www.googletagmanager.com` | Google Tag Manager / GA4 | Loader for `gtag/js?id=G-K1P37GL73K`. |
| `script-src https://www.google-analytics.com` | Google Analytics 4 | Measurement script served from the analytics domain. |
| `script-src https://maps.googleapis.com` | Google Maps JS API | Places Autocomplete on home, walkthrough, property-report, lp/murarrie, lp/seven-hills, tools/commute-cost, tools/local-eats, tools/brisbane-2032. |
| `script-src https://unpkg.com` | Pinned third-party libraries | Reserved for future libs (none currently in use). Safe to remove if unused. |
| `script-src https://formspree.io` | Formspree | Optional client helpers Formspree may inject during async form submit. |
| `style-src 'self' 'unsafe-inline'` | (own origin + inline `style=`) | Layouts use heavy inline `style=` attributes throughout. Remove `'unsafe-inline'` only after refactoring to external CSS or hashed inlines. |
| `img-src 'self' data: blob:` | (own origin + dataURIs + blob URLs) | Inline SVG dataURIs and locally-generated blob URLs (none currently). |
| `img-src https://*.facebook.com` | Meta Pixel noscript | `https://www.facebook.com/tr?id=...&ev=PageView&noscript=1` 1x1 tracking pixel. |
| `img-src https://*.google-analytics.com https://*.googletagmanager.com` | GA4 collect endpoint | GA4 sends pageview beacons via image GETs and POSTs; CSP requires both the GTM and GA hosts. |
| `img-src https://cdn6.ep.dynamics.net` | Ray White CDN | Daniel's headshot, listing photos, agent media. |
| `img-src https://images.unsplash.com` | Unsplash hero imagery | Home and lp/bulimba hero backgrounds. |
| `img-src https://*.realestate.com.au` | realestate.com.au | Any embedded listing images sourced from REA. |
| `connect-src 'self'` | (own origin) | First-party fetches. |
| `connect-src https://*.google-analytics.com` | GA4 measurement protocol | XHR/Beacon posts from `gtag`. |
| `connect-src https://*.facebook.com` | Meta Pixel events | Pixel sends events via `https://www.facebook.com/tr/`. |
| `connect-src https://maps.googleapis.com` | Google Maps JSON | Places API responses, Maps tile metadata. |
| `connect-src https://formspree.io` | Formspree form submit | Used by `walkthrough.astro` and `property-report.astro` async fetch submits. |
| `connect-src https://*.dynamics.net` | Ray White / Dynamics endpoints | Any agent CMS XHR coming from the Ray White stack. |
| `font-src 'self' data:` | (own origin + dataURI fonts) | All webfonts are self-hosted. `data:` covers any inline font fallback. |
| `frame-ancestors 'none'` | clickjacking defence | Equivalent of (and better than) `X-Frame-Options: DENY`. |
| `base-uri 'self'` | base tag injection defence | Prevents an injected `<base href>` from rewriting all relative URLs. |
| `form-action 'self' https://formspree.io` | form POST destinations | All forms POST either same-origin (lp/* `/property-report`) or Formspree. |

## SEC-008 — `X-XSS-Protection` removed
The legacy `X-XSS-Protection: 1; mode=block` header was removed. Modern browsers (Chrome 78+, Edge, Firefox) ignore it; OWASP recommends omitting it and relying on CSP. The new CSP above supersedes it.

## Verification (run after deploy)
```
curl -sI https://danielgierach.com/ | grep -i 'content-security-policy\|x-xss-protection'
```
- `Content-Security-Policy:` line present.
- `X-XSS-Protection:` not present.
- Re-test https://securityheaders.com/?q=danielgierach.com — should now grade A or A+.

## Known frontend behaviours to watch for after rollout
1. Google Maps embed maps (iframe) on tools pages: not currently used; if added later, add `frame-src https://www.google.com` to CSP.
2. YouTube embeds: not currently used; if added, allowlist `https://www.youtube.com` in `frame-src` and `https://*.ytimg.com` in `img-src`.
3. The two LP-form GET submits (`<form action="/property-report" method="get">`) navigate, they do not POST, so `form-action 'self'` covers them.
