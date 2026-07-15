# Changes made 2026-07-15 (local only, NOT committed, NOT deployed)

All changes are in the working tree at ~/DanielGierachProperty. Review, then say the word to commit and push. `git status` shows: 335 modified, 25 deleted, 1 new (this audit folder).

## The 6 changes, biggest first

### 1. Retired 25 duplicate articles, added 25 redirects (SITE-01)
Near-identical articles competing for the same query were consolidated: one canonical survives per topic, the rest now 301 to it.
- **Deleted:** 25 files in `src/pages/insights/` (run `git status | grep " D "` for the exact list)
- **Redirects:** `vercel.json` redirects array grew 18 → 43
- **Internal links:** every link that pointed at a retired URL now points at its canonical (4 files rewritten)
- Topics consolidated: auction vs private treaty, deceased estate (3→1), tenanted sale (4→1), settlement day (3→1), contract clauses (2→1), divorce sale (3→1), cost of selling (3→1), choosing an agent (4→1), reduce asking price, pre-auction offers, reserve price, building and pest, caveats, disclosure, pricing, unconditional offers, when to sell
- Build went 1054 → 1029 pages, sitemap is clean, zero broken internal links (scanner verified)

### 2. All 162 suburb pages retitled to target the money query (SITE-03)
- Was: `Selling in Bulimba | Daniel Gierach Property`
- Now: `Real Estate Agent Bulimba, Brisbane | Daniel Gierach`
- **Where:** every file in `src/pages/suburbs/`. Title tag only: nothing visual changed on the pages.
- Why: "real estate agent {suburb}" is the highest-intent seller query and nothing targeted it; the old titles also collided with the selling guides.

### 3. All selling guides standardised on one title template (SITE-04)
- 148 guides moved from two weaker templates to: `How to Sell a House in {Suburb}, Brisbane (2026 Guide)`
- **Where:** `src/pages/insights/selling-in-*.astro` (161 of 164 now on the template; the winter article, the suburbs hub, and Coorparoo's "House or Unit" variant are deliberate exceptions)
- Card titles and anchor text across the site were updated to match (insights index, suburb pages).

### 4. Homepage: new "Selling Guides" section (SITE-05) — THE VISUAL CHANGE TO REVIEW
- **Where:** `src/pages/index.astro`, new section directly below the "Selling across Brisbane" suburb grid
- 13 cards linking the core-suburb selling guides. Matches the existing section style (eyebrow, serif heading, hairline grid).
- This was the one page with zero links to any insight article. Check you like the copy and placement.

### 5. Appraisal money pages consolidated by canonical, not redirect (SITE-02)
- `get-an-appraisal`, `property-report`, `report` now declare `/property-worth/` as their canonical. All three pages still work exactly as before (your IG funnel via /report is untouched), but Google now treats /property-worth as the one page to rank.
- **Where:** `src/layouts/Layout.astro` (new `canonicalOverride` prop) + the three page files.
- No redirects were used because /report is a live funnel and /get-an-appraisal has 24 internal links.

### 6. Buying guides de-orphaned (SITE-06)
- The 11 buying-in-* guides had zero internal links site-wide. Each is now linked from its suburb page's "Seller guides" block.
- **Where:** 11 files in `src/pages/suburbs/` (bulimba, hawthorne, balmoral, morningside, norman-park, camp-hill, cannon-hill, coorparoo, east-brisbane, seven-hills, murarrie)

## Not changed (deliberate)
- HYG-01 (missing Article schema): false alarm. Layout.astro already injects Article JSON-LD on every insights page automatically; the scanner only checks for a page-level schema prop.
- Tingalpa + Hemmant buying guides: not created (buyer-intent, low priority for the seller goal). Say the word if wanted.
- Insights index card titles like "Selling in Tennyson 2026": left as-is. As anchor text they actually target the query well.

## How to review
1. Preview is running at http://localhost:4321 (built from these changes)
2. Homepage: scroll to the new "Selling Guides" section below the suburb grid
3. Spot-check a suburb page tab title (e.g. /suburbs/bulimba) and a guide (/insights/selling-in-bulimba)
4. Confirm /report and /get-an-appraisal still behave normally (they will, only an invisible head tag changed)
5. `git diff src/pages/index.astro` for the homepage diff; `git status` for the full file list

## After you approve
Commit + push (I'll do it), then: submit the updated sitemap in Google Search Console to speed up recrawl of the retitled pages and redirects.
