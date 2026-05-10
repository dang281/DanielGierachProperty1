# Suburb deep-dive content

One JSON data file and one narrative markdown file per suburb. The Astro page at `src/pages/suburbs/{slug}.astro` reads both and renders the deep-dive sections.

## Files per suburb

```
content/suburbs/{slug}.json          ← Daniel-authored facts (postcode, transport, schools, pockets)
content/suburbs/{slug}-narrative.md  ← Voice-calibrated prose (transport, schools, pockets, lifestyle, buyer profile, selling approach, comparables)
```

## Rules

1. **No specific median prices, growth percentages, days on market, or recent sale prices.** Relational pricing language is fine ("entry point lower than Cannon Hill"), specific dollar figures are not. Source for prices would have to be PriceFinder; without that licensed data, claims are not 100% accurate.
2. **Bus route numbers and timetables are NOT hardcoded.** Routes change. Always link out to `translink.com.au/plan-your-journey` for current routes.
3. **School catchments are NOT invented.** Schools that exist in the suburb can be named. Catchment boundaries must be looked up via `qgso.qld.gov.au/maps/edmap` and either verified before publishing or left as a link to the lookup tool.
4. **Every claim must be verifiable.** Unverified facts get a `verify: true` flag in JSON or a ⚠️ VERIFY note in narrative.
5. **All writing rules from `CLAUDE.md` apply.** No em-dashes, no clause-separator hyphens, no banned phrases, no AI slop.
6. **Voice calibration from `content/daniel-voice-calibration.md` applies.** Soften definitive claims, anchor to inner east, ranges not single examples.

## Generating new suburbs

```bash
node scripts/gen-suburb-narrative.mjs {slug}
```

The generator reads `content/suburbs/{slug}.json`, calls the Claude API with the voice-calibrated system prompt (cached), runs the output through a lint pass (em-dash, banned phrases, clause separators), and writes `content/suburbs/{slug}-narrative.md`. Daniel reviews before merge.

## Schema

See `content/suburbs/murarrie.json` for the canonical shape. Sections:

- `slug`, `name`, `postcode`, `region`
- `distances`: km to CBD and airport
- `transport.trains`, `transport.buses`, `transport.driving`, `transport.bike_walk`
- `schools.primary_state`, `schools.secondary_state`, `schools.private`
- `lifestyle.parks`, `lifestyle.shops_dining_note`, `lifestyle.river_access`
- `pockets`: named character zones within the suburb
- `buyer_profile`: who's actively looking here
- `comparable_suburbs`: slugs for internal linking
- `_meta`: verify flags, last_authored, authored_by
