# Website audit — danielgierach.com — 2026-05-10

A full-site audit covering technical SEO, on-page SEO, content quality, performance, code health, accessibility, mobile, security, local SEO, trust signals, tools verification, and analytics.

## Documents in order

1. **[00-summary.md](./00-summary.md)** — Layer 1: prioritised action list across all areas
2. **[01-technical-seo.md](./01-technical-seo.md)** — sitemaps, robots, redirects, canonicals, schema (20 findings)
3. **[02-on-page-seo.md](./02-on-page-seo.md)** — titles, meta, headings, internal linking, OG tags (22 findings)
4. **[03-content-quality-insights.md](./03-content-quality-insights.md)** — 571 insights deep-dive, duplicate clusters, AI slop, factual errors, consolidation plan (11 finding groups)
5. **[04-performance-code-health.md](./04-performance-code-health.md)** — Core Web Vitals contributors, image loading, build size, dead code, dependencies (17 findings across PERF + CODE)
6. **[05-accessibility-mobile.md](./05-accessibility-mobile.md)** — WCAG 2.2 AA, focus states, ARIA, touch targets, mobile menu (36 findings across A11Y + MOBI)
7. **[06-security.md](./06-security.md)** — headers, secrets, dashboard exposure, mixed content, third-party scripts (13 findings)
8. **[07-local-seo-trust.md](./07-local-seo-trust.md)** — NAP consistency, agency name, schema, reviews, credentials (findings across LSEO + TRUST)
9. **[08-tools-analytics.md](./08-tools-analytics.md)** — calculator correctness vs current 2026 QLD data, Meta Pixel + GA4 coverage (findings across TOOL + ANLY)
10. **[99-tasks.md](./99-tasks.md)** — Layer 3 ready-to-run Claude Code task blocks for P0 and P1 (in-scope only)

## How to use this audit

- Start with `00-summary.md` for the full prioritised list across all areas.
- Drill into individual area files for evidence and detailed findings.
- When ready to action, use `99-tasks.md` for self-contained task blocks that can be executed by Claude Code in sequence.
- Items marked PROTECTED touch a sales-flow page; only non-visual fixes (titles, schema, accessibility names, internal links that are programmatically inserted) are permitted there.

## Method note

This audit was produced by 8 parallel research agents reading the codebase and live build. Items that could only be verified with browser tools, external accounts, or live testing are listed in each area file under "Verification needed", and consolidated in `00-summary.md`.

No external statistics or sources have been invented. Every figure cited in the audit is either a count from the codebase or from a named institutional source (QRO, ATO, REIQ, BCC, Services Australia, etc.).
