# SEO Publishing Workflow

How to make Daniel the original author Google trusts when someone else copies the content.

## What runs automatically on every Vercel deploy

1. **Astro build** produces fresh `dist/sitemap-index.xml` with all 950+ pages.
2. **IndexNow ping** (`scripts/indexnow-ping.mjs`, wired to `npm run postbuild`) submits every URL in the sitemap to Bing, Yandex, Naver, and Seznam in a single batched request. Key is `c3adfb72720d62762f3d78b6c26b4a93` and is verified at `https://danielgierach.com/c3adfb72720d62762f3d78b6c26b4a93.txt`.
3. **Self-referencing canonical** + matching `og:url` on every page (already wired in `src/layouts/Layout.astro` and `LandingLayout.astro`).
4. **Article schema** on `/insights/*` pages now emits both `datePublished` and `dateModified`. Falls back `dateModified = datePublished` when no explicit modifiedDate exists.

Result: Bing/Yandex/Naver index new content within hours. If a scraper copies the article a week later, the search engines have already seen Daniel's version first.

## What still needs a manual step

**Google does not accept automated push notifications anymore.** Their ping endpoint was sunset in 2023. The Indexing API is restricted to JobPosting and BroadcastEvent only. So for Google, the one-time setup + per-article manual nudge is:

### One-time setup (do once, ~10 minutes)

1. Open https://search.google.com/search-console
2. Add property `danielgierach.com` if not present.
3. Submit sitemap: Sitemaps → enter `sitemap-index.xml` → Submit.
4. Verify ownership (the DNS or HTML-file method).

### Per high-priority article (~30 seconds)

When a new article publishes that you want Google to index FAST (e.g. a fresh suburb deep-dive, a market report, a piece you suspect competitors might copy):

1. Search Console → URL Inspection (top of left sidebar).
2. Paste the full URL, e.g. `https://danielgierach.com/insights/<slug>`.
3. Click **Request Indexing**.
4. Done. Google usually crawls within minutes to a few hours.

You don't need to do this for every article. Google's regular crawl will find them via the sitemap within a day or two. Use Request Indexing for the ones that matter most for originality claims.

## Why this protects content without hurting SEO

- **Canonical tags** tell every crawler "this URL is the original, even if you found it elsewhere". When a scraper republishes your article without a canonical, Google sees yours as the source.
- **datePublished + dateModified + first-indexed-by-IndexNow** stack together. The earliest-known-publish for a given piece of text wins in Google's duplicate-content evaluation.
- **No `noai` / `noimageai` directives** anywhere. AI crawlers (ChatGPT-Bing, Claude, Perplexity, Google SGE) are explicitly allowed to read everything. They cite the original source they find, which is yours via the IndexNow + canonical signals.
- **robots.txt** allows full site crawl except for ad-landing pages (`/lp/`), the dashboard, and thank-you pages. No content disallowed.

## What this does NOT do

This setup makes you the recognised original author. It does not prevent the act of copying itself. If a competitor lifts your articles wholesale, your remedy is a DMCA takedown to their hosting provider (Vercel, Cloudflare, AWS, etc.) — most respond within 24-48 hours.

## Disabling IndexNow temporarily

If you ever need to skip the ping (e.g. building a preview that shouldn't notify):
```bash
SKIP_INDEXNOW=1 npm run build
```

## Verifying it's working

After a deploy, check the Vercel build log. You should see one of:
- `[indexnow] pinging 956 URL(s)`
- `[indexnow] ok 200` or `[indexnow] ok 202`

If you see `[indexnow] non-ok 4xx`, the key file is probably not deploying. Verify `https://danielgierach.com/c3adfb72720d62762f3d78b6c26b4a93.txt` returns the key string.
