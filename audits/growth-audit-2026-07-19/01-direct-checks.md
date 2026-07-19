# Growth audit: direct checks, 2026-07-19

## Performance (measured, throttled mobile, live homepage)

| Metric | Result | Verdict |
|---|---|---|
| LCP (largest contentful paint) | 2.44s | Good (threshold 2.5s), measured under fast-3G throttling |
| CLS (layout shift) | 0.00 | Perfect |
| HTML transfer | 33KB compressed | Lean |
| Full load, throttled | 4.1s | Acceptable |

**Conclusion: site speed is not a ranking blocker.** No performance work needed. (PageSpeed API quota was exhausted; measured directly via headless Chrome with mobile emulation + network throttling.)

## Sold-proof gap on /results

The results page references "sold" 17 times but displays **zero sale prices**. Ranking competitor agents lead with concrete sold results (address + price + days on market). The site-wide no-prices rule exists for suburb medians (PriceFinder licensing); Daniel's OWN sold results are public record via the portals and can be shown. Decision for Daniel: publish actual sold prices on /results (address, price, method, days). This is the single strongest trust/proof content type the site lacks.

## Sitemap + recrawl state

- GSC: sitemap-index.xml resubmitted and read successfully 2026-07-19 (child sitemap counts pending, normal lag)
- Google still serving old suburb titles as of this morning; recrawl now triggered

## Distribution note (from records, not measurable today)

GA showed social = 1 session/week back in May. 774 articles exist with effectively zero social amplification. The LinkedIn weekly arc (poll Tue / tool Wed / article Thu) exists as a system; its links point at the site. No new finding, but the imbalance stands: content production is world-class, distribution is near-zero. More content is NOT the answer; circulation of existing content is.
