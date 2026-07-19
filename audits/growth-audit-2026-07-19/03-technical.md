# Technical crawl findings (all 1,029 built pages), 2026-07-19

## PASS (verified healthy)

- **Structured data**: every ld+json block on 7 sampled page types parses clean; licence 4873633 + Wikidata Q140611609 render on 1,021/1,029 pages (8 misses are correctly-noindexed utility pages)
- **Render-blocking**: zero blocking external scripts; GTM deferred
- **Alt text**: 0/26 sampled images missing alt
- **Headings**: 1,028/1,029 pages have exactly one h1; sane hierarchy
- **Canonicals**: 1,028/1,028 use https + trailing slash
- **Broken links**: 0/30 sampled internal hrefs dead
- **Sitemap path hygiene**: no /lp/, /dashboard/, /thank-you leaks
- **Performance**: LCP 2.44s throttled mobile, CLS 0 (see 01-direct-checks.md)

## ISSUES, ranked by impact

### 1. Sitemap submits 375 noindexed pages (CRITICAL)
astro.config.mjs sitemap filter is a static path blocklist; it includes every staged draft article (373) plus meet-your-team and federal-budget-2026 while those pages carry meta noindex. 97% of noindexed content is in the sitemap. This contradiction degrades sitemap trust and crawl allocation, the most likely cause of the thin index coverage seen in round-3 site: checks.
**Fix**: filter must exclude any page whose rendered output is noindex (derive from the draft flag / schedule at build time).

### 2. 292 of 747 insight articles fully orphaned (MAJOR)
The insights hub array lists 405 of 747 slugs; 354 articles missing from the hub, of which 292 have zero internal links site-wide. No PageRank flow, no crawl path.
**Fix**: generate the hub list from the filesystem + schedule (live articles only) instead of a hand-maintained array; add contextual cross-links.

### 3. 29 articles past publish date still noindexed (MAJOR, content silently suppressed)
Stale `const draft = true // STAGED, remove on publish date` never removed after the scheduled date passed (oldest: 2026-05-10 market report). Two contradict the schedule JSON which says draft: false.
**Fix**: remove stale flags for all 29 (list via cross-reference of seo-schedule.json publishDate <= today vs in-file flag); add a build-time warning when a staged file's publish date has passed.

### 4. 303KB inline SVG duplicated on all 162 suburb pages (MAJOR, weight)
Identical byte-for-byte suburb/bay map inlined per page: ~59% of each suburb page's 512-519KB, ~49MB duplicated across the cohort.
**Fix**: extract to one external cacheable asset (img/svg reference).

### 5. Meta descriptions over 165 chars: 16/30 sampled (53%) (MINOR)
Up to 226 chars; SERP truncation. Bulk trim pass across suburbs + insights.

### 6. Money-page canonical contradiction (REVIEW, deliberate trade-off)
/report, /get-an-appraisal, /property-report declare index,follow while canonicalizing to /property-worth (set 2026-07-16 to consolidate ranking signal without breaking live funnels). Google treats canonical as the dominant hint and will drop the three from the index over time, which was the intent. Alternative (adding noindex) risks nofollow-adjacent side effects; 301s would break funnels. Decision: keep, monitor in GSC.

### 7. Small items
- 22/60 tool pages linked only from the /tools index (add contextual links from related articles)
- /terms + /privacy carry noindex (policy choice, acceptable)
- /tools/federal-budget-2026 draft: confirm intentional
- /meet-your-team has zero h1 (noindexed test page, ignore)
