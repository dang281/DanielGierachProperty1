# Accessibility & Mobile Experience Audit
**Site:** danielgierach.com
**Date:** 2026-05-10
**Standard:** WCAG 2.2 AA (target conformance level)
**Method:** Static code review of `src/**/*.astro` and `src/styles/global.css`. No automated tooling (axe, Lighthouse) was run; no screen reader pass was performed.
**Files reviewed (sample):** `src/layouts/Layout.astro`, `src/layouts/LandingLayout.astro`, `src/layouts/ToolLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/styles/global.css`, `src/pages/index.astro`, `src/pages/get-an-appraisal.astro` (PROTECTED), `src/pages/walkthrough.astro` (PROTECTED), `src/pages/property-worth.astro` (PROTECTED), `src/pages/property-report.astro`, `src/pages/contact.astro`, `src/pages/listings.astro`, `src/pages/insights/index.astro`, `src/pages/insights/auction-strategy.astro`, `src/pages/resources/[slug].astro`, `src/pages/tools/index.astro`, `src/pages/tools/mortgage.astro`, `src/pages/tools/rent-vs-sell.astro`, `src/pages/lp/murarrie.astro`, `src/pages/lp/seven-hills.astro`.

---

## Summary

The site has reasonable bones — `lang="en"` set, viewport meta correct (no `user-scalable=no`), mobile call bar respects `safe-area-inset-bottom`, mobile inputs use 16px to prevent iOS zoom, and most icon-only social links have `aria-label`. There is a mobile-aware sticky CTA pattern.

That said, accessibility hygiene below the headline is poor and several issues are systemic across many pages. The most material gaps:

1. **No global `:focus-visible` styles defined.** 192 occurrences of `outline:none` removing default focus indicators with no replacement. Keyboard users have no visible focus on inputs and many controls.
2. **Mobile menu has no `aria-expanded`, no Escape-to-close, no focus trap, and items remain in the tab order when collapsed** (`max-height:0` does not remove from accessibility tree).
3. **Sales pages and contact form use sibling `<label>` patterns with no `for=`/`id=` association.** Only 31 of 426 `<label>` elements site-wide use `for=`. Screen readers cannot announce field names.
4. **No skip-to-content link.** Every keyboard user must tab through the entire nav (8+ links) on every page.
5. **Several primary inputs have no accessible name at all** — homepage hero address input, all four `/lp/*` LP page address inputs, tools-index search.
6. **Low-alpha cream text fails WCAG AA on charcoal hero sections** — `rgba(240,236,228,0.35)` and `0.45` widely used for body/caption text.
7. **Contact form uses three buttons as a radio group with no `role="radiogroup"`, `aria-pressed`, or fieldset.**
8. **Walkthrough date picker** has 28-31 unlabelled day buttons (text content "12") with no aria-label, no `disabled` attribute (uses class only), and no arrow-key keyboard navigation. Tabbing through every day to reach the time slots is severe friction.

Most fixes are silent (alt text, aria-label, label-for associations, semantic swaps) and safe to apply on PROTECTED sales pages because they do not change visual layout.

---

## Findings Table

### Accessibility

| ID | Severity | Issue | Location | WCAG | Visual Change? |
|----|----------|-------|----------|------|----------------|
| A11Y-001 | High | No global `:focus-visible` style defined; 192 `outline:none` occurrences remove default focus | `src/styles/global.css` and inline across all pages | 2.4.7 Focus Visible | No (additive) |
| A11Y-002 | High | Mobile menu: no `aria-expanded` on toggle; collapsed menu links remain tab-focusable; no Escape-to-close; no focus trap when open | `src/components/Nav.astro` lines 59-86, 155-160 | 4.1.2, 2.1.2, 2.4.3 | No |
| A11Y-003 | High | No skip-to-content link | `src/layouts/Layout.astro` lines 352-374, `src/layouts/LandingLayout.astro` lines 70-71 | 2.4.1 Bypass Blocks | No (visually hidden) |
| A11Y-004 | High | Form labels are visual siblings, not associated. `<label>` lacks `for=`, `<input>` lacks `id=` | `src/pages/walkthrough.astro` 152-186 (PROTECTED), `src/pages/contact.astro` 152-211, `src/pages/get-an-appraisal.astro` 76-87 (PROTECTED, placeholder-only), `src/pages/tools/mortgage.astro` 18-77 and 50+ tool pages | 1.3.1, 4.1.2, 3.3.2 | No |
| A11Y-005 | High | Hero address input has no accessible name (placeholder only) | `src/pages/index.astro` line 200-206 | 4.1.2, 3.3.2 | No |
| A11Y-006 | High | LP page address inputs have no label/aria-label | `src/pages/lp/murarrie.astro` line 222, `src/pages/lp/seven-hills.astro` 227-235, `src/pages/lp/bulimba.astro`, `src/pages/lp/camp-hill.astro`, `src/pages/lp/hawthorne.astro` | 4.1.2, 3.3.2 | No |
| A11Y-007 | High | Tools-index search input has no label/aria-label | `src/pages/tools/index.astro` lines 136-143 | 4.1.2 | No |
| A11Y-008 | Medium | Walkthrough date picker: day buttons have no aria-label (announce just "12"); no `disabled` attr (only CSS); no arrow-key keyboard navigation; no `aria-pressed`/`aria-selected` for selected state | `src/pages/walkthrough.astro` 593-623 (PROTECTED) | 4.1.2, 2.1.1, 1.3.1 | No |
| A11Y-009 | Medium | Contact intent buttons function as radio group with no semantics — no `role="radiogroup"`, no `aria-pressed`, no fieldset wrapping | `src/pages/contact.astro` lines 134-148 | 1.3.1, 4.1.2 | No |
| A11Y-010 | Medium | Nav phone link `#nav-phone` colour `#f5d07a` is never swapped on scroll — when nav transitions to cream `#f7f5f0` background, light-gold-on-cream contrast ≈ 1.4:1 | `src/components/Nav.astro` line 50, scroll handler 131-150 only updates `.nav-link-mono` and `logoName` | 1.4.3 Contrast | Visual (token only) |
| A11Y-011 | Medium | Low-alpha cream text used for body/caption copy on charcoal hero — `rgba(240,236,228,0.35)` ≈ 3.0:1 and `rgba(240,236,228,0.45)` ≈ 4.2:1, both fail AA for normal text | `src/pages/index.astro`, `src/pages/walkthrough.astro` 96-122 (PROTECTED), `src/pages/about.astro`, `src/pages/reviews.astro`, `src/pages/listings.astro`, `src/pages/404.astro`, `src/pages/terms.astro`, `src/pages/privacy.astro` | 1.4.3 Contrast | Visual |
| A11Y-012 | Medium | Generic alt text on hero images ("Brisbane property", "Murarrie property", "Brisbane inner-east property") — present but not informative | `src/pages/listings.astro` 150, `src/pages/lp/murarrie.astro` 207, `src/pages/walkthrough.astro` 38 (PROTECTED), `src/pages/get-an-appraisal.astro` 38 (PROTECTED), `src/pages/tools/index.astro` 96 | 1.1.1 (compliant but weak) | No |
| A11Y-013 | Medium | Active-page indication in Nav uses CSS color/border only; no `aria-current="page"` on matching link (mobile or desktop) | `src/components/Nav.astro` 122-128 | 4.1.2 (best practice) | No |
| A11Y-014 | Medium | No raw `<img>` element uses Astro `<Image>` component — every image is a raw `<img>` with manual `width`/`height` and no `srcset` for many | All `.astro` files; site-wide pattern. Astro's `<Image>` is not imported anywhere | (perf + responsive) | No |
| A11Y-015 | Low | Tooltip wrappers in `tools/true-cost-to-buy.astro` use `tabindex="0"` on `<span>` with no role, no `aria-describedby`, no keyboard dismiss; tooltip only opens on `:focus-within` (CSS) | `src/pages/tools/true-cost-to-buy.astro` 355, 367, 379, 402, 414 | 1.3.1, 4.1.2, 1.4.13 | No |
| A11Y-016 | Low | FAQ details/summary global toggle script uses `icon.textContent = '×'` for close — purely visual, but the close-state span is still keyboard-focusable as part of summary; not a defect, just noting `<span>` icon has no `aria-hidden` | `src/layouts/Layout.astro` 565-573 | 1.3.1 (minor) | No |
| A11Y-017 | Low | Forms have no `aria-live` region for client-side validation feedback; the only `aria-live` site-wide is in `SuburbMap.astro` | All form pages | 4.1.3 Status Messages | No |
| A11Y-018 | Low | Footer realestate.com.au link uses generic favicon `<img>` (alt="realestate.com.au") inside `<a aria-label="realestate.com.au profile">` — duplicate accessible name (favicon also serves as content image) | `src/components/Footer.astro` 33-35 | 4.1.2 (minor) | No |
| A11Y-019 | Low | Decorative SVGs in inline anchors (e.g. arrow icons in CTAs) inconsistently marked `aria-hidden="true"` — most omit it but rely on adjacent text being the accessible name | site-wide | 1.1.1 (minor) | No |
| A11Y-020 | Low | Layout breadcrumb dark-on-dark: `rgba(242,239,233,0.45)` last-crumb on `#1c1917` ≈ ~5:1 (passes); `rgba(196,145,42,0.7)` link gold on `#1c1917` ≈ ~5:1 (passes). Note this passes — flagged for verification only. | `src/layouts/Layout.astro` 354-371 | 1.4.3 (verify) | n/a |
| A11Y-021 | Medium | Walkthrough mobile breakpoint (`<=768px`) hides eyebrow/desc/contact details with `display:none` — fine, but means mobile users get less context. Calendar appears full-width but its time-slot buttons are 3-col grid which may be cramped on 320px | `src/pages/walkthrough.astro` 261-280 (PROTECTED) | 1.4.10 Reflow (verify) | Visual to fix |

### Mobile

| ID | Severity | Issue | Location | Visual Change? |
|----|----------|-------|----------|----------------|
| MOBI-001 | Info | Viewport meta correct in both layouts: `width=device-width, initial-scale=1.0`. No `user-scalable=no` or `maximum-scale` restrictions present | `src/layouts/Layout.astro` 265, `src/layouts/LandingLayout.astro` 20 | n/a (passes) |
| MOBI-002 | Info | Mobile inputs forced to 16px in `@media (max-width: 640px)` to prevent iOS zoom | `src/styles/global.css` 606-619 | n/a (passes) |
| MOBI-003 | Info | Mobile call bar uses `env(safe-area-inset-bottom)` and `min-height:54px` for buttons | `src/styles/global.css` 511-571 | n/a (passes) |
| MOBI-004 | High | Mobile menu does not lock body scroll when open. On phones with the address bar collapsing, the menu and underlying page can both scroll, causing a jittery experience | `src/components/Nav.astro` 154-160 | No |
| MOBI-005 | Medium | Mobile menu max-height set to `600px`. On smaller phones (e.g. 568px iPhone SE landscape, or with many nav items) the menu items can be clipped | `src/components/Nav.astro` 157 | No (raise to `100vh - 76px` or use `max-height:none` with display toggle) |
| MOBI-006 | Medium | Hero address input + button (`/`, `/lp/*`) is an inline flex with `border-right:none` joining the input to the button. On <360px viewports the button text "What's Your Property Worth?" can wrap or push the input below — no `flex-wrap` rule | `src/pages/index.astro` 198-213, `src/pages/lp/*.astro` | Verify visually |
| MOBI-007 | Medium | Tool radio-card targets in `tools/mortgage.astro` ("10yr/20yr/25yr/30yr", "Weekly/Fortnightly/Monthly") use `padding:0.75rem 0.5rem` ≈ 35-40px tall on small phones — under the 44×44 minimum touch target (WCAG 2.5.8 Target Size minimum) | `src/pages/tools/mortgage.astro` 44-67 (and other tool pages with similar pill-grid pattern) | Visual (minor) |
| MOBI-008 | Medium | Filter pills (`.fpill`) in `insights/index.astro` and `tools/index.astro` are `padding:0.5rem 1.25rem` with `font-size:0.65rem` → ~28-32px tall, well under 44px minimum | `src/styles/global.css` 183-199, `src/pages/insights/index.astro`, `src/pages/tools/index.astro` | Visual (raise vertical padding to 0.7rem+) |
| MOBI-009 | Medium | Insights/Tools search inputs are 320px / 200px width (set inline) — these don't shrink on small viewports, can overflow | `src/pages/insights/index.astro` 302, `src/pages/tools/index.astro` 140 | Visual (use `max-width:100%`) |
| MOBI-010 | Medium | LandingLayout (`/lp/*` pages) has no responsive font scaling guard for small viewports beyond what the page provides; LP heroes use `padding: 7rem 1.5rem` which is fine, but no `min-height: 100dvh` fallback for older iOS Safari (which doesn't support `dvh`). Falls back to `100vh` only if `100dvh` is rejected | `src/pages/lp/*.astro` (e.g. `murarrie.astro:28`) | No (add 100vh fallback line) |
| MOBI-011 | Low | Footer area-grid is 2-col with `font-size:0.75rem` ≈ 12.75px on mobile. Many suburb links truncate via `text-overflow:ellipsis` (line 127 of Footer). Tap target is the link text ~16-18px tall — under 44px | `src/components/Footer.astro` 87-129 | Visual |
| MOBI-012 | Low | `mobile-call-bar` adds `padding-bottom: calc(4rem + env(safe-area-inset-bottom))` to body site-wide. Pages that pass `hideMobileCta={true}` (walkthrough, get-an-appraisal, property-worth) still get body padding because the rule is `body { padding-bottom: ... }` unconditionally — extra empty space at bottom of those pages on mobile | `src/styles/global.css` 594-597 | Verify |
| MOBI-013 | Low | Calendar in `walkthrough.astro` has no horizontal scroll guard; on 320px viewport, 7-column day grid with 3px gaps may render days at ~36px wide — borderline tap target | `src/pages/walkthrough.astro` 351-355 (PROTECTED) | Visual |
| MOBI-014 | Info | LP page top-bar phone link `.lp-bar-phone` uses `font-size: 0.68rem` ≈ 11.5px — readable but small | `src/pages/lp/murarrie.astro` 25 | Cosmetic |
| MOBI-015 | Low | `<select>` elements (`.obs-select`) force `color-scheme: light` to defeat iOS dark mode of native picker. Good fix, but verify on Android Chrome | `src/styles/global.css` 442-473 | n/a |

---

## Detailed findings

### A11Y-001 — No global focus-visible; aggressive `outline:none`

`src/styles/global.css` line 160 defines `.form-field:focus { ...box-shadow: 0 0 0 3px rgba(196,145,42,0.1); outline: none; }` — provides a gold ring focus ONLY for elements with class `.form-field`. Many form inputs use `.obs-input` (line 423) which sets `outline:none` (line 432) and only restores via box-shadow on `.obs-input:focus` (line 437-440). Many inline-styled inputs have just `outline:none` with NO replacement.

There is no `*:focus-visible` rule anywhere, no `:focus-visible` keyword anywhere in the repo. Across the codebase there are 192 separate occurrences of `outline:none` — most of them in inline `style=` attributes attached to inputs, buttons, and links. The global hero address input on `src/pages/index.astro:205`, the tools index search at `src/pages/tools/index.astro:140`, the insights search at `src/pages/insights/index.astro:302`, the LP form input at `src/pages/lp/murarrie.astro:60`, the dashboard gate input, and many others kill the outline and only show focus via `onfocus="this.style.boxShadow=..."` inline JS handlers — these break for keyboard-only users running with JS that fails.

**Fix:** Add to `global.css`:
```
*:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }
```
This restores keyboard focus universally without affecting mouse hover. The rule uses `:focus-visible` so it only shows on keyboard navigation.

### A11Y-002 — Mobile menu accessibility

`src/components/Nav.astro:59`:
```
<button id="mobile-toggle" ... aria-label="Menu">
```

Missing: `aria-expanded="false"`, `aria-controls="mobile-menu"`. Toggle script (line 155-160) sets `mobileMenu.style.maxHeight` but never updates `aria-expanded` on the button. Screen reader users cannot tell whether the menu is open.

When `max-height:0` and `overflow:hidden` are applied, the inner `<a>` elements remain in the DOM and are still keyboard-focusable (overflow:hidden clips visually but does not remove focusability). On desktop ≥1024px the menu has `display:none` enforced via JS (`mobileToggle.style.display = 'none'` line 108), but the menu container itself never gets `display:none` or `inert`. So pressing Tab on desktop still tabs through invisible mobile menu links.

There is no Escape-key handler to close the menu, no focus trap when open, and no return-focus to the toggle button when closed.

**Fix:** Add `aria-expanded`, set `inert` on `#mobile-menu` while closed (or `hidden` attribute), add Escape handler, and trap focus while open.

### A11Y-003 — No skip link

Both layouts emit `<Nav />` followed by `<main>`. Keyboard users must tab through every nav item (logo, 6 nav links, contact link, phone CTA, mobile toggle when collapsed = 10+ tab stops) on every page before reaching content.

**Fix:** Add to top of `<body>` in `Layout.astro` and `LandingLayout.astro`:
```
<a href="#main-content" class="skip-link">Skip to main content</a>
```
Plus CSS to make it visually hidden until focused. Add `id="main-content"` to `<main>` in `Layout.astro:372`.

### A11Y-004 — Sibling label pattern

Pattern in `src/pages/walkthrough.astro:152-186`, `src/pages/contact.astro:135-211`, and ~50 tool pages:
```
<div>
  <label style="...">First Name <span>*</span></label>
  <input type="text" name="first_name" .../>
</div>
```

There is no `for=` on the label and no `id=` on the input. Screen readers see "edit text required" with no field name. Sighted keyboard users see the label visually but assistive tech does not associate it.

`src/pages/property-report.astro` correctly uses `for=`/`id=` (lines 553, 557, 562, 566, 570). That page is the model.

`src/pages/get-an-appraisal.astro` (PROTECTED) uses **placeholder-only** for all six fields (lines 76-87). Placeholders are not accessible names. Screen readers ignore them once focus is in the field. This is a critical issue on a primary lead-capture form.

**Fix on PROTECTED pages:** add `id="..."` to inputs and `for="..."` to existing labels (or add new visually-hidden labels for placeholder-only inputs). No visual change.

`src/pages/tools/mortgage.astro:18` — labels are heading-style, not associated with their slider. Same pattern across rent-vs-sell, net-proceeds-deep-dive, and ~50 other tool pages. 31 of 426 site-wide labels (~7%) use `for=`.

### A11Y-005 — Hero address input

`src/pages/index.astro:200-206`:
```
<input id="hero-address-input" type="text" placeholder="Enter your property address…" autocomplete="off" .../>
```
No `<label>`, no `aria-label`, no `aria-labelledby`. Placeholder is the only signal.

**Fix:** Add `aria-label="Enter your property address"`. No visual change.

### A11Y-006 — LP page address inputs

Across `src/pages/lp/{murarrie, seven-hills, bulimba, camp-hill, hawthorne}.astro` the LP hero form's address input (e.g. `lp/murarrie.astro:222`) has only `placeholder="Enter your property address…"`. Same fix as A11Y-005.

### A11Y-007 — Tools index search

`src/pages/tools/index.astro:136-143` — `<input id="tool-search" type="search" placeholder="Search tools..." />`. No label. Note: `src/pages/insights/index.astro:295-305` correctly uses a visually-hidden label and `aria-label="Search articles"` — that's the correct pattern. Apply it to tools-index.

### A11Y-008 — Walkthrough date picker (PROTECTED)

`src/pages/walkthrough.astro:593-623` builds 28-31 day buttons each rendering only `String(d)` as text. Sample announcement to a screen reader user: "Button. 12. Button. 13. Button. 14." — no month, no day-of-week, no disabled state announced.

Disabled days use `btn.classList.add('cal-day--disabled')` (line 607) which sets `pointer-events:none` via CSS but does NOT set the `disabled` attribute or `aria-disabled="true"`. Keyboard users can tab to disabled days and try to activate them; screen readers announce them as enabled.

Selected day uses `btn.classList.add('cal-day--selected')` (line 611) — no `aria-pressed` or `aria-selected`. Screen readers cannot announce which day is currently chosen.

No arrow-key navigation. Tab order: prev button → 31 day buttons → next button → 3 time-slot buttons. Tabbing through 35+ stops to pick a date and time is poor.

**Fix (no visual change):** for each day button, set `btn.setAttribute('aria-label', date.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'}))`, set `btn.disabled = isPast || isFuture || isSunday`, set `btn.setAttribute('aria-pressed', String(isSelected))`. Optional roving tabindex + arrow-key navigation is a larger change but high-value.

### A11Y-009 — Contact intent radio group

`src/pages/contact.astro:134-148`:
```
<label>I'm looking to…</label>
<div id="intent-group">
  <button type="button" class="intent-btn" data-value="sell">Sell</button>
  <button type="button" class="intent-btn" data-value="buy">Buy / Rent</button>
  <button type="button" class="intent-btn" data-value="understand the market">...</button>
</div>
<input type="hidden" name="intent" id="intent-value" />
```

This is a single-choice picker rendered as three buttons. There is no `role="radiogroup"`, the parent label is unassociated, and no `aria-pressed` state is set when one is chosen. Screen reader users hear three independent buttons with no group context.

**Fix:** add `role="radiogroup" aria-labelledby="intent-label"`, give the `<label>` an `id="intent-label"`, give each button `role="radio" aria-checked="false"` and update on selection. Or simpler: replace with three `<input type="radio">` inside a `<fieldset>`.

### A11Y-010 — Nav phone link contrast on light state

`src/components/Nav.astro:50` — `id="nav-phone"`, hardcoded `color:#f5d07a` (light gold). The scroll handler at lines 131-150 swaps text colours by walking `navLinkEls` (defined line 99), which selects `.nav-link-mono` only — does not include `#nav-phone`. So when the user scrolls and the nav transitions to `glass-nav` (cream `#f7f5f0` background), the gold-on-cream contrast is approximately:
- `#f5d07a` luminance ~0.65, `#f7f5f0` luminance ~0.93, ratio ≈ **1.4:1**.
- Required: 4.5:1 (normal text) or 3:1 (large text). 1.05rem regular weight ≈ 17.85px, **not** large per WCAG (large = 18pt/24px or 14pt bold).

This is a clear failure in the most prominent CTA on every page.

**PROTECTED-equivalent fix:** Update Nav.astro to swap `#nav-phone` color when `glass-nav` is active. Replacement gold should be `#b07e22` (var `--color-gold-dim`) or `#9a6e1d` for AA. Visual change to a single CTA — frame as accessibility necessity. Alternatively keep gold but darken to `#8a6a1f` to hit 4.5:1.

### A11Y-011 — Low-alpha cream text contrast

Estimated contrast against `#0a0806` (charcoal hero background):
- `rgba(240,236,228,0.35)` → effective `rgb(90,88,84)` → ratio ~3.0:1 — **fails AA normal**, passes AA large
- `rgba(240,236,228,0.45)` → effective `rgb(113,111,106)` → ratio ~4.2:1 — **borderline / fails AA normal**
- `rgba(240,236,228,0.55)` → ~6:1 — passes
- `rgba(240,236,228,0.6)` → ~7:1 — passes

Used at 0.35/0.45 in: `src/pages/about.astro:219,224,228`, `src/pages/reviews.astro:311,316,320`, `src/pages/walkthrough.astro:99,108,122` (PROTECTED), `src/pages/listings.astro:126`, `src/pages/404.astro:39`, `src/pages/terms.astro:114`, `src/pages/privacy.astro:110`. Verification needed with a contrast tool (axe DevTools) — listing them flagged for review.

### A11Y-012 — Generic alt text

Examples:
- `src/pages/walkthrough.astro:38` (PROTECTED) — `alt="Brisbane inner-east property"` for hero image.
- `src/pages/listings.astro:150` — `alt="Brisbane property"`.
- `src/pages/lp/murarrie.astro:207` — `alt="Murarrie property"`.

These pass WCAG (image has alt text), but the alt is decorative-ish. Counter-example: `src/pages/index.astro:167` correctly uses `alt="64 Valaria Avenue Seven Hills, listed by Daniel Gierach, Ray White Bulimba"`. Either commit to descriptive alts everywhere, or mark the hero images as decorative with `alt=""` and `role="presentation"` since the headline already supplies context.

### A11Y-014 — No Astro `<Image>` component

Across the entire repo, every image is a raw `<img>`. No file imports `astro:assets`. Astro's `<Image>` component would auto-generate `width`/`height`, format the `srcset`, and lazy-load. This is a perf/SEO issue more than a11y, but worth flagging in this audit's "mobile experience" lens because mobile users on cellular connections suffer most.

### A11Y-015 — Tooltip pattern

`src/pages/tools/true-cost-to-buy.astro:355` — `<span class="tooltip-wrap" tabindex="0">…<span class="tooltip-text">…</span></span>`. The CSS rule (line 171) shows the tooltip on `:focus-within`. Issues: `<span>` with `tabindex="0"` has no role or accessible-name beyond its inner text; tooltip content has no `id` and no `aria-describedby` on the trigger; no Escape-to-dismiss; tooltip overlays surrounding content with no spacing safety check (1.4.13 Hover/Focus content).

### MOBI-004 — Mobile menu doesn't lock body scroll

When mobile menu opens, `document.body` is still scrollable. iOS users can scroll the underlying page through the open menu — confusing and degrades perceived quality.

**Fix:** in toggle handler add `document.body.style.overflow = menuOpen ? 'hidden' : ''`.

### MOBI-007/008 — Touch targets under 44px

WCAG 2.2 added 2.5.8 Target Size (Minimum) at AA — controls must be at least 24×24 CSS px. AAA is 44×44. Many native HTML buttons render at the 24×24 floor, but app-styled controls should aim for 44×44 for thumb usability:

- Tool radio cards (`mortgage.astro:48,63`): `padding:0.75rem 0.5rem` text ≈ 0.8rem-0.75rem → ~36-40px tall.
- Filter pills (`.fpill` in `global.css:183`): `padding:0.5rem 1.25rem` font 0.65rem → ~28-32px tall.

Increase vertical padding to `0.85rem` minimum on these.

### MOBI-012 — `hideMobileCta` body padding

`global.css:594-597` adds `body { padding-bottom: calc(4rem + env(safe-area-inset-bottom)) }` site-wide inside the `@media (max-width: 1024px)` block. Pages that pass `hideMobileCta={true}` (walkthrough, get-an-appraisal, property-worth) hide the bar via `.mobile-call-bar.hidden-by-page { display: none !important; }` (line 514) but the body padding is unconditional — extra empty whitespace at bottom of those pages on mobile.

**Fix:** wrap the body padding in `body:not(.no-mobile-cta)` and have `hideMobileCta` set that body class. No visual change to pages that show the bar.

---

## Verification needed (cannot determine from code review)

| Item | What needs running |
|------|-------------------|
| Real contrast ratios | axe DevTools / Lighthouse on each hero, on the nav scroll-state, and on rgba(240,236,228,0.35-0.45) instances |
| Mobile menu keyboard behaviour on real devices | NVDA + Chrome, VoiceOver iOS, TalkBack Android |
| iOS dvh unit fallback | Test `/lp/*` pages on iOS Safari 14 / older devices |
| 320px viewport reflow | Tested at 320px / 375px / 414px (1.4.10 Reflow) |
| Tap-target measurements | Real-device tap testing on iPhone SE and 6/7/8 sizes |
| Calendar reflow on mobile | Test `walkthrough.astro` calendar at 320px and confirm day-cell tap target |
| Screen reader full pass | NVDA + JAWS on all sales pages; VoiceOver iOS on LP pages and homepage |
| Focus order | Tab through every page after fixes to confirm logical order |
| Form error announcement | Submit forms with invalid input; confirm errors are announced (currently no `aria-live` / `aria-invalid` on forms — assume nothing is announced) |
| Reduced-motion preference | Confirm `prefers-reduced-motion` respected — no global rule exists; reveal animations and `pw-bg` keyframe (`property-worth.astro:38`) play unconditionally |

---

## Quick wins (one-line fixes, no visual change, safe on PROTECTED pages)

1. Add `*:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }` to `global.css` base layer.
2. Add `aria-expanded` state to mobile toggle in `Nav.astro`; add `inert` to `#mobile-menu` while closed.
3. Add skip link to `Layout.astro` and `LandingLayout.astro`.
4. Add `aria-label` to the homepage hero address input, all `/lp/*` address inputs, and `tools/index.astro` search input.
5. Add `id`/`for=` associations on `walkthrough.astro`, `contact.astro`, and the ~50 tool pages with sibling labels.
6. Add `aria-label` (date string) and `disabled` attribute to `walkthrough.astro` calendar day buttons.
7. Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }` to `global.css`.
8. Add `body.no-mobile-cta { padding-bottom: 0 !important; }` plus a body-class toggle in `Layout.astro` keyed off `hideMobileCta`.

## Visual-change fixes (require Daniel sign-off, even on protected pages)

1. **A11Y-010** — darken `#nav-phone` colour on `glass-nav` state to hit 4.5:1 (suggest `#8a6a1f`).
2. **A11Y-011** — raise low-alpha cream from 0.35-0.45 to 0.55+ wherever used as body text.
3. **MOBI-007/008** — raise vertical padding on tool radio cards and filter pills to ~0.85rem.
4. **MOBI-005** — replace mobile menu `max-height:600px` with a proper open/close pattern that fits any viewport.

---

## What was checked vs. what was not

**Checked from code:** focus styles, viewport meta, lang attribute, HTML5 semantic structure (`<main>`, `<nav>`, `<footer>`), heading patterns (h1 per page, h2/h3 nesting at top of each page), form labels and `for=` associations, `<img>` alt attributes, `aria-label` on icon-only links, `role="button"` (none — good), `tabindex` usage, click handlers on non-buttons (none beyond `gtag()` on links/buttons — fine), inline `outline:none`, mobile menu pattern, mobile touch-target padding, breakpoint definitions, color values and rough contrast, `<details>`/`<summary>` use (native, fine), `aria-current` (only on breadcrumb), `aria-live` (only on suburb map), skip link (none).

**Not checked / requires runtime tooling:** real contrast ratios with overlapping/transparent backgrounds, screen reader announcements, keyboard navigation order on each rendered page, iOS Safari dvh behaviour, axe-violation count, Lighthouse a11y score, real touch-target hit areas at runtime (CSS box-model + content), any client-side validation behaviour and aria-live announcements, focus order after Astro hydration, the rendered HTML of dynamically generated calendar buttons.
