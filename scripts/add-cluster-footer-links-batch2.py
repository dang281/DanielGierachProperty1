#!/usr/bin/env python3
"""Add cluster footer links to the 59 remaining live insights articles (batch 2)."""

import os
import re

INSIGHTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'pages', 'insights')

# (slug, hub_slug, label)
REMAINING = [
    # Suburb Selling Guides — 18 new suburbs (have old Part of: format, need replacement)
    ("selling-in-albion",           "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-ashgrove",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-chelmer",          "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-clayfield",        "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-corinda",          "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-graceville",       "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-kedron",           "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-kelvin-grove",     "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-lutwyche",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-moorooka",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-nundah",           "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-sherwood",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-st-lucia",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-stafford",         "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-wavell-heights",   "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-windsor",          "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-wooloowin",        "selling-in-brisbane-suburbs", "Suburb Selling Guides"),
    ("selling-in-yeronga",          "selling-in-brisbane-suburbs", "Suburb Selling Guides"),

    # Pricing and Valuation — 4 articles
    ("ai-valuation-tools-vs-agent-appraisal-brisbane-2026",  "property-pricing-and-valuation", "Pricing and Valuation"),
    ("when-to-reduce-asking-price-brisbane-property",        "property-pricing-and-valuation", "Pricing and Valuation"),
    ("selling-house-after-renovation-brisbane-pricing-strategy", "property-pricing-and-valuation", "Pricing and Valuation"),
    ("walkthrough-vs-appraisal-brisbane",                    "property-pricing-and-valuation", "Pricing and Valuation"),

    # Preparing to Sell — 8 articles
    ("inspection-day-presentation-checklist-brisbane-sellers", "preparing-your-home-for-sale", "Preparing to Sell"),
    ("pre-listing-styling-staging-brisbane-cost-return",       "preparing-your-home-for-sale", "Preparing to Sell"),
    ("real-estate-photography-quality-difference-price-brisbane", "preparing-your-home-for-sale", "Preparing to Sell"),
    ("selling-house-with-pool-brisbane-buyer-perspective",     "preparing-your-home-for-sale", "Preparing to Sell"),
    ("free-property-walkthrough-brisbane-faq",                 "preparing-your-home-for-sale", "Preparing to Sell"),
    ("what-daniel-looks-for-property-walkthrough",             "preparing-your-home-for-sale", "Preparing to Sell"),
    ("what-to-expect-property-walkthrough-brisbane",           "preparing-your-home-for-sale", "Preparing to Sell"),
    ("when-to-book-property-walkthrough-before-selling",       "preparing-your-home-for-sale", "Preparing to Sell"),

    # Marketing and Auctions — 6 articles
    ("how-many-open-homes-before-property-sells-brisbane",   "marketing-and-selling-methods", "Marketing and Auctions"),
    ("negotiating-price-after-offer-strategy-brisbane-sellers", "marketing-and-selling-methods", "Marketing and Auctions"),
    ("off-market-versus-public-listing-decision-brisbane",   "marketing-and-selling-methods", "Marketing and Auctions"),
    ("open-home-vs-private-inspection-brisbane-strategy",    "marketing-and-selling-methods", "Marketing and Auctions"),
    ("vendor-paid-digital-marketing-facebook-google-ads-brisbane", "marketing-and-selling-methods", "Marketing and Auctions"),
    ("buyers-budget-conversation-agent-brisbane-pre-offer",  "marketing-and-selling-methods", "Marketing and Auctions"),

    # Contracts and Settlement — 9 articles
    ("brisbane-property-buying-process-overseas-australian-citizen", "contracts-and-settlement", "Contracts and Settlement"),
    ("bushfire-risk-disclosure-selling-brisbane-property",           "contracts-and-settlement", "Contracts and Settlement"),
    ("conveyancing-cooling-off-period-exceptions-queensland-2026",   "contracts-and-settlement", "Contracts and Settlement"),
    ("inheriting-property-with-siblings-queensland-options",         "contracts-and-settlement", "Contracts and Settlement"),
    ("selling-during-divorce-separation-queensland-process",         "contracts-and-settlement", "Contracts and Settlement"),
    ("selling-property-during-separation-divorce-queensland",        "contracts-and-settlement", "Contracts and Settlement"),
    ("settlement-statement-review-pre-settlement-seller-checklist",  "contracts-and-settlement", "Contracts and Settlement"),
    ("signing-form-6-agency-agreement-queensland-checklist",         "contracts-and-settlement", "Contracts and Settlement"),
    ("water-damage-mould-disclosure-inspection-findings-brisbane",   "contracts-and-settlement", "Contracts and Settlement"),

    # Costs, Taxes and Finance — 3 articles
    ("cgt-main-residence-exemption-verification-queensland-sellers", "costs-taxes-and-finance", "Costs, Taxes and Finance"),
    ("mortgage-broker-vs-bank-direct-brisbane-property-buyers",      "costs-taxes-and-finance", "Costs, Taxes and Finance"),
    ("preparing-financial-position-before-listing-brisbane-seller",  "costs-taxes-and-finance", "Costs, Taxes and Finance"),

    # Investment Properties — 2 articles
    ("negative-gearing-selling-investment-property-brisbane",            "investment-property-selling", "Investment Properties"),
    ("selling-investment-property-loss-carry-forward-cgt-brisbane",      "investment-property-selling", "Investment Properties"),

    # Property Types — 1 article
    ("body-corporate-financial-health-check-buying-selling-unit", "brisbane-property-types", "Property Types"),

    # Brisbane Inner East — 8 articles
    ("2032-olympics-2026-update-inner-east-property",                  "brisbane-inner-east-market", "Brisbane Inner East"),
    ("2032-olympics-impact-inner-east-brisbane-property-values",       "brisbane-inner-east-market", "Brisbane Inner East"),
    ("agent-recommendations-trades-trusted-suppliers-brisbane-inner-east", "brisbane-inner-east-market", "Brisbane Inner East"),
    ("buyers-agents-when-to-engage-brisbane-inner-east",               "brisbane-inner-east-market", "Brisbane Inner East"),
    ("downsizing-brisbane-inner-east-strategy-process",                "brisbane-inner-east-market", "Brisbane Inner East"),
    ("easement-removal-covenant-discharge-brisbane-inner-east-selling","brisbane-inner-east-market", "Brisbane Inner East"),
    ("off-market-pre-market-properties-brisbane-inner-east",           "brisbane-inner-east-market", "Brisbane Inner East"),
    ("selling-vs-renting-out-decision-brisbane-inner-east",            "brisbane-inner-east-market", "Brisbane Inner East"),
]

OLD_PART_OF_PATTERN = re.compile(
    r'<p style="font-size:0\.8rem;color:var\(--color-text-secondary\);">Part of: <a href="[^"]*" style="color:#f5d07a;">[^<]*</a></p>'
)


def make_new_link(hub_slug, label):
    return (
        f'<p style="margin-top:2rem;font-size:0.95rem;">'
        f'Part of the <a href="/insights/{hub_slug}/">{label} guide series</a>.</p>'
    )


def process(slug, hub_slug, label):
    filepath = os.path.join(INSIGHTS_DIR, f'{slug}.astro')
    if not os.path.exists(filepath):
        return 'missing'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'const draft = true' in content:
        return 'draft'

    new_link = make_new_link(hub_slug, label)

    # Check already done with correct new format AND correct hub
    if 'Part of the' in content and hub_slug in content:
        return 'already_done'

    if OLD_PART_OF_PATTERN.search(content):
        new_content = OLD_PART_OF_PATTERN.sub(new_link, content)
        action = 'replaced_old_format'
    elif '<AuthorBio />' in content:
        new_content = content.replace('<AuthorBio />', f'{new_link}\n<AuthorBio />', 1)
        action = 'inserted_before_authorbio'
    else:
        new_content = content.replace('</Layout>', f'{new_link}\n</Layout>', 1)
        action = 'inserted_before_layout'

    if new_content == content:
        return 'no_change'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return action


def main():
    by_cluster = {}
    totals = {'updated': 0, 'draft': 0, 'missing': 0, 'already_done': 0, 'no_change': 0}

    for slug, hub_slug, label in REMAINING:
        outcome = process(slug, hub_slug, label)
        if label not in by_cluster:
            by_cluster[label] = {'updated': 0, 'draft': 0, 'missing': [], 'already_done': 0}
        if outcome in ('replaced_old_format', 'inserted_before_authorbio', 'inserted_before_layout'):
            by_cluster[label]['updated'] += 1
            totals['updated'] += 1
            print(f"  OK  {outcome}: {slug}")
        elif outcome == 'draft':
            by_cluster[label]['draft'] += 1
            totals['draft'] += 1
            print(f" SKIP draft: {slug}")
        elif outcome == 'missing':
            by_cluster[label]['missing'].append(slug)
            totals['missing'] += 1
            print(f" MISS missing: {slug}")
        elif outcome == 'already_done':
            by_cluster[label]['already_done'] += 1
            totals['already_done'] += 1
            print(f"  -- already_done: {slug}")
        else:
            totals['no_change'] += 1
            print(f"  ?? no_change: {slug}")

    print("\n=== Summary by cluster ===")
    for label, r in by_cluster.items():
        print(f"  {label}: {r['updated']} updated", end='')
        if r['draft']:    print(f", {r['draft']} draft", end='')
        if r['missing']:  print(f", {len(r['missing'])} MISSING {r['missing']}", end='')
        if r['already_done']: print(f", {r['already_done']} already done", end='')
        print()

    print(f"\nTotal updated: {totals['updated']}")
    print(f"Total draft (skipped): {totals['draft']}")
    print(f"Total missing: {totals['missing']}")
    print(f"Total already done: {totals['already_done']}")


if __name__ == '__main__':
    main()
