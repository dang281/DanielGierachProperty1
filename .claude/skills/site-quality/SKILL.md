---
name: site-quality
description: Audit danielgierach.com for copy regressions, voice violations, broken internal links, missing SEO meta, and CLAUDE.md rule breaches. Returns a prioritized fix list. Use weekly or before deploys.
argument-hint: "[full|quick|fix]"
---

# Site Quality Audit

A weekly audit that keeps the website at a consistent quality bar by detecting:

1. CLAUDE.md voice violations (em-dashes, banned phrases, AI slop)
2. Broken internal links (dead `/insights/*`, `/suburbs/*`, `/tools/*` references)
3. Missing or weak SEO meta (no description, missing schema)
4. Articles without AuthorBio
5. Images without alt text
6. Hardcoded `http://` links (should be `https://`)
7. Stale dates referencing prior years in seasonal content

## When to Use

- **Weekly**: every Monday before scheduling content for the week
- **Before any deploy that touches multiple insights articles**
- **After bulk content imports or AI-generated drafts**
- **When a regression is suspected** ("the site feels off this week")

## Modes

### Quick (`/site-quality quick`)
Runs the four scanner scripts and prints a single prioritised list. Read-only. Takes under 30 seconds.

### Full (`/site-quality full`)
Quick mode plus:
- Internal link integrity check across every `<a href>` in `src/pages/**`
- Missing alt text on `<img>` tags
- Pages with no `<Layout title>` or no `description` prop
- Schema presence check on insights articles

### Fix (`/site-quality fix`)
Runs Full, then proposes specific edits for each finding. Does NOT auto-apply. Asks Daniel before changing anything because copy quality is judgement-driven.

## How to Run

```bash
cd /Users/danielgierach/DanielGierachProperty

# Voice violations (em-dashes, AI slop, banned phrases)
bash .claude/skills/site-quality/scripts/voice-scan.sh

# Internal link integrity
bash .claude/skills/site-quality/scripts/links-scan.sh

# SEO meta hygiene
bash .claude/skills/site-quality/scripts/seo-scan.sh

# Article structure (AuthorBio, schema, hero)
bash .claude/skills/site-quality/scripts/structure-scan.sh
```

## Output Format

Each scanner outputs lines in the form:

```
SEVERITY  PATH:LINE  RULE  EXAMPLE
```

Severities:
- `BLOCK` — must fix before deploy (em-dash, broken link, missing title)
- `WARN`  — should fix this week (banned phrase, weak meta description)
- `INFO`  — track, fix when convenient (style nit, optimisation)

The skill aggregates these and presents them as a single fix list grouped by severity, with a one-click "fix this batch" prompt for each group.

## Hard Rules This Skill Enforces

These come directly from `/Users/danielgierach/DanielGierachProperty/CLAUDE.md`:

- **No em-dashes (`—`) anywhere.** Hard block.
- **No clause-separator hyphens (` - ` with spaces).** Hard block.
- **No AI slop opener phrases.** Hard block in published copy: "I have been thinking", "Let's be honest", "Here's the thing", "Navigating", "I wanted to share", "In today's market".
- **No hype/filler words.** Hard block: "exciting", "thrilled", "game-changer", "hidden gem", "seamless", "robust", "holistic", "bespoke", "curated", "elevate", "leverage" (as verb), "transformative".
- **No "Whether you are..." sentence starters.**
- **Footer must say "Ray White Collective"**, never "Ray White Bulimba".
- **Every insights article must include `<AuthorBio />` and `Layout` schema prop.**
- **Every page must have a `title` and `description` on `<Layout>`.**

## Skipping Files

The scanners skip:
- Anything in `dist/`, `node_modules/`, `.astro/`, `.vercel/`
- Files in `content/social/` with `**Status:** Published` or a past `**Publish date:**` (per CLAUDE.md "PUBLISHED POSTS — NEVER MODIFY" rule)
- The dashboard subapp at `dashboard/`

## Adding New Rules

To add a new banned phrase or pattern, edit:

```
.claude/skills/site-quality/scripts/voice-scan.sh
```

The patterns live near the top of the file, one per line in the `BANNED_PATTERNS` array.

## Why This Skill Exists

The site has 600+ pages and grows weekly. Manual quality checks do not scale. This skill is the safety net that catches regressions before they ship to production. It is intentionally conservative: it flags issues for human judgement rather than auto-applying changes, because copy quality is the part of the site that most directly reflects Daniel's voice.
