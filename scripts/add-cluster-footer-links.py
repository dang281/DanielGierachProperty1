#!/usr/bin/env python3
"""Add cluster footer links to all live insights articles."""

import os
import re
import sys

INSIGHTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'pages', 'insights')

CLUSTERS = [
    {
        'hub_slug': 'selling-in-brisbane-suburbs',
        'label': 'Suburb Selling Guides',
        'articles': [
            'selling-in-annerley', 'selling-in-ascot', 'selling-in-auchenflower',
            'selling-in-balmoral', 'selling-in-bardon', 'selling-in-belmont',
            'selling-in-bowen-hills', 'selling-in-brisbane-cbd', 'selling-in-bulimba',
            'selling-in-camp-hill', 'selling-in-cannon-hill', 'selling-in-carina',
            'selling-in-carina-heights', 'selling-in-carindale', 'selling-in-coorparoo',
            'selling-in-dutton-park', 'selling-in-east-brisbane', 'selling-in-fortitude-valley',
            'selling-in-greenslopes', 'selling-in-hamilton', 'selling-in-hawthorne',
            'selling-in-hemmant', 'selling-in-highgate-hill', 'selling-in-holland-park',
            'selling-in-holland-park-west', 'selling-in-indooroopilly', 'selling-in-kangaroo-point',
            'selling-in-milton', 'selling-in-morningside', 'selling-in-mount-gravatt',
            'selling-in-mount-gravatt-east', 'selling-in-murarrie', 'selling-in-new-farm',
            'selling-in-norman-park', 'selling-in-paddington', 'selling-in-red-hill',
            'selling-in-seven-hills', 'selling-in-spring-hill', 'selling-in-stones-corner',
            'selling-in-tarragindi', 'selling-in-teneriffe', 'selling-in-tingalpa',
            'selling-in-toowong', 'selling-in-upper-mount-gravatt', 'selling-in-west-end',
            'selling-in-woolloongabba',
            # Addendum
            'selling-in-newstead',
        ],
    },
    {
        'hub_slug': 'preparing-your-home-for-sale',
        'label': 'Preparing to Sell',
        'articles': [
            'how-to-prepare-your-home-for-sale-brisbane', 'prepare-home-for-sale',
            'building-pest-report', 'building-pest-report-seller-guide-brisbane',
            'termite-chemical-barriers-annual-pest-contracts-selling-brisbane',
            'pool-safety-certificate-selling-brisbane-qld',
            'smoke-alarm-compliance-selling-queensland', 'retaining-walls-brisbane-selling',
            'smart-home-features-selling-brisbane-buyers-value-vs-noise',
            'storage-built-in-wardrobes-walk-in-robes-brisbane-property-value',
            # Addendum
            'open-home-tips-for-sellers-brisbane', 'property-styling-staging-brisbane',
        ],
    },
    {
        'hub_slug': 'property-pricing-and-valuation',
        'label': 'Pricing and Valuation',
        'articles': [
            'how-much-is-my-home-worth-brisbane', 'how-to-price-your-property',
            'how-to-price-your-property-for-sale-brisbane', 'property-appraisal-brisbane',
            'best-time-to-sell-brisbane', 'how-long-does-it-take-to-sell-a-home-in-brisbane',
            'when-to-sell',
            # Addendum
            'property-appraisal-vs-valuation-brisbane', 'downsizing-property-brisbane',
        ],
    },
    {
        'hub_slug': 'marketing-and-selling-methods',
        'label': 'Marketing and Auctions',
        'articles': [
            'how-does-real-estate-marketing-work-brisbane', 'marketing-campaign-when-selling',
            'auction-strategy', 'selling-by-auction-brisbane',
            'property-passed-in-at-auction-brisbane', 'how-to-handle-offers-when-selling',
            'how-to-choose-a-real-estate-agent', 'how-to-choose-a-real-estate-agent-brisbane',
            'buyers-agent',
            # Addendum
            'auction-vs-private-treaty-eoi-brisbane', 'how-to-change-real-estate-agents-brisbane',
            'off-market-property-sales-brisbane', 'private-sale-vs-real-estate-agent-brisbane',
            'free-property-tools-brisbane-sellers',
        ],
    },
    {
        'hub_slug': 'contracts-and-settlement',
        'label': 'Contracts and Settlement',
        'articles': [
            'understanding-the-contract', 'fixtures-fittings-inclusions-property-sale-qld',
            'seller-disclosure-obligations-queensland', 'unconditional-offer',
            'subject-to-finance-clause-queensland-sellers',
            'pre-settlement-inspection-seller-guide-qld', 'what-happens-at-settlement',
            'what-happens-on-settlement-day-queensland', 'solicitor-vs-conveyancer-qld',
            'easements-property-brisbane-qld',
            # Addendum
            'cooling-off-period-property-sale-queensland',
        ],
    },
    {
        'hub_slug': 'costs-taxes-and-finance',
        'label': 'Costs, Taxes and Finance',
        'articles': [
            'cost-of-selling-house-brisbane', 'capital-gains-tax-selling-home-brisbane',
            'stamp-duty-queensland', 'selling-house-with-mortgage-brisbane',
            'mortgage-broker', 'first-home-buyer-help-history-and-current-options',
        ],
    },
    {
        'hub_slug': 'investment-property-selling',
        'label': 'Investment Properties',
        'articles': [
            'selling-rental-property-brisbane', 'selling-tenanted-investment-property-queensland-guide',
            'selling-tenanted-property-queensland', 'buying-with-tenant',
            'airbnb-vs-longterm', 'land-tax-queensland-investment-property',
            # Addendum
            'selling-deceased-estate-queensland',
        ],
    },
    {
        'hub_slug': 'brisbane-property-types',
        'label': 'Property Types',
        'articles': [
            'types-of-residential-property-australia', 'brisbane-house-styles',
            'brisbane-house-styles-architectural-periods', 'queenslander-vs-postwar',
            'prewar-homes-brisbane', 'house-anatomy-eaves-soffits-slabs-fascia',
            'building-materials-brisbane-homes', 'cladding-facade-types-brisbane',
            'slab-design-types-brisbane', 'body-corporate',
            'selling-unit-townhouse-body-corporate-queensland',
            'types-of-build-project-custom-modular-prefab',
            'build-process-with-architect-step-by-step',
            'building-professionals-architect-designer-draftsperson-engineer',
            'engage-right-builder',
        ],
    },
    {
        'hub_slug': 'brisbane-inner-east-market',
        'label': 'Brisbane Inner East',
        'articles': [
            'brisbane-inner-east-value', 'crossriver-rail-property-values-brisbane-inner-east',
            'development-potential-property-brisbane-inner-east', 'flood-mapping',
            'heritage-overlays-brisbane', 'queensland-brisbane-zoning-explained',
            'school-catchments-property-brisbane-inner-east',
            'upgrading-property-brisbane-inner-east',
        ],
    },
]

OLD_PART_OF_PATTERN = re.compile(
    r'<p style="font-size:0\.8rem;color:var\(--color-text-secondary\);">Part of: <a href="[^"]*" style="color:#f5d07a;">[^<]*</a></p>'
)


def make_new_link(hub_slug, label):
    return (
        f'<p style="margin-top:2rem;font-size:0.95rem;">'
        f'Part of the <a href="/insights/{hub_slug}/">{label} guide series</a>.</p>'
    )


def process_article(slug, hub_slug, label):
    filepath = os.path.join(INSIGHTS_DIR, f'{slug}.astro')
    if not os.path.exists(filepath):
        return 'missing'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip draft articles
    if 'const draft = true' in content:
        return 'draft'

    new_link = make_new_link(hub_slug, label)

    if OLD_PART_OF_PATTERN.search(content):
        new_content = OLD_PART_OF_PATTERN.sub(new_link, content)
        action = 'replaced'
    elif 'Part of the' in content and hub_slug in content:
        # Already has correct new format
        return 'already_done'
    elif '<AuthorBio />' in content:
        new_content = content.replace('<AuthorBio />', f'{new_link}\n<AuthorBio />', 1)
        action = 'inserted_before_authorbio'
    else:
        # Insert before </Layout>
        new_content = content.replace('</Layout>', f'{new_link}\n</Layout>', 1)
        action = 'inserted_before_layout'

    if new_content == content:
        return 'no_change'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return action


def main():
    results = {}
    totals = {'updated': 0, 'draft': 0, 'missing': 0, 'already_done': 0, 'no_change': 0}

    for cluster in CLUSTERS:
        hub_slug = cluster['hub_slug']
        label = cluster['label']
        cluster_results = {'updated': [], 'draft': [], 'missing': [], 'already_done': [], 'no_change': []}

        for slug in cluster['articles']:
            outcome = process_article(slug, hub_slug, label)
            if outcome in ('replaced', 'inserted_before_authorbio', 'inserted_before_layout'):
                cluster_results['updated'].append(slug)
                totals['updated'] += 1
            elif outcome == 'draft':
                cluster_results['draft'].append(slug)
                totals['draft'] += 1
            elif outcome == 'missing':
                cluster_results['missing'].append(slug)
                totals['missing'] += 1
            elif outcome == 'already_done':
                cluster_results['already_done'].append(slug)
                totals['already_done'] += 1
            else:
                cluster_results['no_change'].append(slug)
                totals['no_change'] += 1

        results[label] = cluster_results

    print("\n=== Cluster Footer Link Update Results ===\n")
    for label, r in results.items():
        updated = len(r['updated'])
        draft = len(r['draft'])
        missing = len(r['missing'])
        print(f"**{label}**: {updated} updated", end='')
        if draft:
            print(f", {draft} draft (skipped)", end='')
        if missing:
            print(f", {missing} missing", end='')
        print()
        if r['missing']:
            for s in r['missing']:
                print(f"  MISSING: {s}")

    print(f"\nTotal updated: {totals['updated']}")
    print(f"Total draft (skipped): {totals['draft']}")
    print(f"Total missing: {totals['missing']}")
    print(f"Total already done: {totals['already_done']}")


if __name__ == '__main__':
    main()
