# JSON-LD Schema Audit, June 2026

Author: CEO agent (Daniel out of band)
Date: 2026-06-30
Task: DANA-696 (Daniel created 2026-06-28)
Method: read 13 suburb pages plus 9 insights articles plus 4 hub pages; cross-checked
`src/layouts/Layout.astro`, `src/data/site-schema.js`, and the per-page inline blocks.

## Headline finding

**The rebrand to Ray White The Collective on 2026-06-29 is not reflected anywhere in
the structured data.** Every LocalBusiness / RealEstateAgent entity across the site
still names the solo brand. This is the highest-impact fix on the list and the only
one that materially affects how Google describes the business in rich results.

A second, older issue surfaced during the scan: every suburb page emits a duplicate
LocalBusiness with the same `@id` as the global one but a different `addressLocality`.
That is a 162-page NAP conflict and is more severe than any drift Daniel was
expecting from the original task scope.

## Bucket counts

| Surface | Sampled | Has LD-JSON | Notes |
|---|---|---|---|
| Suburb pages (`/suburbs/*`) | 13 of 163 | 13 | All inline; pattern uniform |
| Insights articles (`/insights/*`) | 9 of 772 | 9 (via Layout) | Layout injects `Article` automatically |
| Hub pages (`/suburbs/index`, `/insights/index`, `/tools/index`, `/resources/index`) | 4 of 4 | 4 | `CollectionPage` present everywhere |

Note: the earlier raw counts of "418 insights without LD-JSON" and "0 Article schemas"
in the static grep were wrong. The Layout component injects WebPage + Article +
BreadcrumbList + the global `#business` LocalBusiness on every page; see
`src/layouts/Layout.astro` lines 164, 182, 188, 211. So all 772 insights articles do
get Article markup at render time. Per-file grep only catches the inline blocks.

## Fix list, ordered by impact

### 1. Update site-wide `#business` LocalBusiness to the Collective brand
Owner: SEO agent or Daniel.
File: `src/data/site-schema.js` lines 5 to 35.
Current: `"name": "Daniel Gierach"`, description "at Ray White Bulimba".
After rebrand: needs the new business name (verify the exact public name; the homepage
and team pages use "Ray White The Collective" and "Conrad-led Sales & Marketing
Collective" interchangeably). Also revisit:
  - `description`: drop "documented three-phase method" if that is no longer the
    public framing.
  - `email`: confirm Daniel's RW email still routes after the team change.
  - `image`: replace solo headshot with team or office photo if the brand prefers it.
  - `aggregateRating`: 5.0 over 10 reviews. Either move the rating to a `Person`
    entity (it is the agent who is rated, not the team) or grow the count.

Impact: changes the brand name in every Knowledge Panel / sitelink card across the
site (all 1,100+ pages share this graph).

### 2. Remove duplicate LocalBusiness from suburb pages
Owner: SEO agent.
Files: `src/pages/suburbs/*.astro` (162 of 163; `index.astro` is the hub).
Pattern: each suburb page declares its own `LocalBusiness, RealEstateAgent` with
`@id: https://danielgierach.com/#business` but sets `addressLocality` to the suburb
(e.g. Acacia Ridge QLD 4110). Both entities share the same `@id` as the global one
emitted by the Layout, so Google has to pick one. The conflict is a NAP signal flag:
the actual business is at 2A 57-59 Oxford Street, Bulimba 4171, not in each suburb.

Recommended pattern (per page):
  - Keep only the `WebPage` + `BreadcrumbList` + `FAQPage` blocks on the suburb page.
  - Delete the inline `LocalBusiness` block; rely on the Layout's global one.
  - If a per-suburb `areaServed` signal is wanted, add the suburb to the global
    `areaServed` array in `site-schema.js` (already covers ~70 suburbs; index audit
    will show which are missing).

Impact: removes 162 conflicting entities; tightens NAP across the site to a single
authoritative address.

### 3. Add per-suburb `Place` entries to the global `areaServed`
Owner: SEO agent.
File: `src/data/site-schema.js` `areaServed` array.
Today's global graph lists roughly 60 suburbs; the suburb directory has 163 pages.
Drop in the missing 100+ as `{ "@type": "Place", "name": "<Suburb> QLD" }`. Source
the canonical list from `src/pages/suburbs/index.astro` lines 6 to 125.

Impact: confirms service coverage to Google without per-page LocalBusiness duplication.

### 4. Reconcile `aggregateRating` placement
Owner: Daniel decision needed.
File: `src/data/site-schema.js`.
The rating is on the `RealEstateAgent` / `LocalBusiness` entity, but it reads as a
personal rating (10 reviews of Daniel, not the business). After rebrand it is unclear
whose rating it is. Either:
  - (a) move it to the `Person` entity `https://danielgierach.com/#person` and keep
    the business unrated until the Collective accumulates reviews; or
  - (b) keep on business and add a `reviewedBy` / `Review` block per testimonial.
Either decision is fine; doing nothing leaves Google with an ambiguous claim.

### 5. Insights articles: confirm Layout-injected Article schema is firing for all 772
Owner: SEO agent.
File: `src/layouts/Layout.astro` line 188 onwards.
The injection is gated on `_isInsightsArticle` which requires the path's first
segment to equal `insights` and the path to have at least two parts. Spot-checks of
3 random articles confirm the Article block renders. Need a one-pass check that
no insights file uses a non-Layout layout (`LandingLayout.astro` or `ToolLayout.astro`)
and silently drops the Article schema. Mechanical check:
```
grep -l "LandingLayout\|ToolLayout" src/pages/insights/*.astro
```
Spot check this heartbeat returned 0 results; full pass should confirm.

### 6. Schedule-driven `datePublished` is null for articles missing from `dashboard/seo-schedule.json`
Owner: SEO agent.
File: `src/layouts/Layout.astro` line 86 (lookup) and `src/pages/insights/*` files.
The Article block only emits `datePublished` / `dateModified` if the article slug is
in `dashboard/seo-schedule.json`. Insights articles published outside the SEO
pipeline (or back-filled directly) will be missing these dates and render an Article
schema without temporal signals.
Mechanical check: for each insights file, verify the slug exists in
`dashboard/seo-schedule.json`. Flag the gap and decide whether to backfill the
schedule or set a fallback to file mtime.

### 7. Hub pages: insights index uses solo "Daniel Gierach" in the CollectionPage name
Owner: SEO agent.
File: `src/pages/insights/index.astro` line 7.
`"name": "Brisbane Property Insights & Guides | Daniel Gierach"` should update with
the rebrand. Same on `src/pages/suburbs/index.astro` (`"name": "Daniel Gierach, Ray
White Bulimba"` in the graph at line 132).

### 8. Per-suburb `WebPage.name` still says "Real Estate Agent <Suburb> Brisbane"
Owner: SEO agent.
Files: 163 suburb pages, line 17 region.
This claims the entity is a real estate agent in each suburb, not in Bulimba. With
the Collective rebrand and the duplicate-LocalBusiness fix from item 2, this can be
softened to "Selling in <Suburb> | Ray White The Collective" or similar. Decision
for whoever owns the brand voice.

### 9. `sameAs` profile links still point at Daniel-personal accounts
Owner: SEO agent.
Files: `src/data/site-schema.js`, `src/pages/suburbs/*.astro`.
References include `raywhite.com/agents/agent/daniel-gierach-88889915` and
`realestate.com.au/agent/daniel-gierach-3819232`. After the Collective rebrand, the
team probably has a shared profile to add (or the entity is a `Person`, not a
`Business`, and these stay as the Person's `sameAs`).

### 10. Tools and resources hub pages: `author` still solo
Owner: low priority.
Files: `src/pages/tools/index.astro`, `src/pages/resources/index.astro`.
Both reference `Daniel Gierach` as a `Person` author. Decision: keep (Person is the
content author) or update to the team (Organization).

## Cross-cutting bugs

1. **NAP conflict (item 2 above)** is the structural one. 162 suburb pages emit a
   second `#business` entity with a different address than the Layout's global one.

2. **Two distinct LocalBusiness names live on the same `@id`**: per-suburb blocks use
   `Daniel Gierach, Ray White Bulimba`, the global schema uses `Daniel Gierach`. Even
   without the suburb-locality issue, this is a name conflict.

3. **No Organization entity for the Collective.** With a team rebrand, the cleanest
   model is `Organization` (the Collective) `member` `Person` (Daniel, Conrad, etc.).
   Today the schema graph still treats the business as a one-person operation. This
   would need a Daniel decision on brand structure before any code change.

## Validation

I have not run Google's Rich Results Test or the schema.org validator on live pages
(no headless browser available from the heartbeat). The drift findings above are
from reading the source; the validation pass is the next step for whoever picks this
up. Run on five representative URLs:
  - `/` (root)
  - `/suburbs/acacia-ridge` (typical suburb)
  - `/suburbs` (hub)
  - `/insights/real-estate-agent-fees-commissions-brisbane` (typical article)
  - `/meet-the-team-c` (Collective landing, post-rebrand)

## Out of scope, per Daniel's task brief

No page files were edited. This is an audit report only. The fix list is intended
for Daniel to review and approve before any of the 162-page edits run.

## Suggested execution order if Daniel approves the fixes

1. Items 1, 7, 8: brand name updates (small surface, immediate impact).
2. Item 2: delete per-suburb LocalBusiness blocks (162-file mechanical edit).
3. Item 3: backfill global `areaServed` to match the suburb directory.
4. Items 4, 9, 10: decisions; defer.
5. Items 5, 6: insights schema completeness pass; defer.
