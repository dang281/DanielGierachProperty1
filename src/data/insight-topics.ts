// Topic mapping for insight cross-linking.
// Each topic carries a curated list of well-titled, evergreen articles.
// The selectRelated() helper detects topic from a slug pattern, then returns
// a list of related articles (excluding the current slug), plus suggested
// tools and resources for that topic.
//
// This is the data layer for /src/components/RelatedContent.astro.
//
// Format: topics[topicKey] = { label, articles: [{ slug, title, label }], tools: [...], resources: [...] }
//
// Slugs and titles are real existing pages on the site. If a slug here
// does not match a built page, the link still renders but 404s, so keep
// this curated.

export type RelatedArticle = { slug: string; title: string; label: string };
export type RelatedTool = { slug: string; title: string };
export type RelatedResource = { slug: string; title: string };

export type Topic = {
  label: string;
  articles: RelatedArticle[];
  tools: RelatedTool[];
  resources: RelatedResource[];
};

// Detect topic key from slug. Order matters: more specific patterns first.
export function detectTopic(slug: string): string {
  const s = slug.toLowerCase();
  if (/^selling-in-/.test(s)) return 'suburb';
  if (/auction/.test(s)) return 'auction';
  if (/(building-pest|pest-inspection|pest-report|inspection-report|defect)/.test(s)) return 'inspections';
  if (/(settlement|completion-day|keys-out)/.test(s)) return 'settlement';
  if (/(disclosure|form-6|form-2|seller-disclosure|prescribed-form)/.test(s)) return 'disclosure';
  if (/(body-corporate|strata|unit-seller|apartment-seller|levies|sinking-fund|by-laws)/.test(s)) return 'body-corp';
  if (/(stamp-duty|cgt|capital-gains|tax-|withholding|gst-)/.test(s)) return 'tax';
  if (/(renovation|renovat|kitchen-reno|bathroom-reno|reno-)/.test(s)) return 'renovation';
  if (/(stage|styling|presentation|declutter|photograph|dressed)/.test(s)) return 'presentation';
  if (/(price|appraisal|valuation|reserve|comparable|cma)/.test(s)) return 'pricing';
  if (/(open-home|inspection-day|home-open|saturday-open)/.test(s)) return 'open-homes';
  if (/(marketing|portal|signboard|video-tour|drone|listing-photo)/.test(s)) return 'marketing';
  if (/(contract|cooling-off|conveyanc|solicitor|legal)/.test(s)) return 'legal';
  if (/(commission|agent-fee|fees-|cost-of-selling|net-proceeds)/.test(s)) return 'costs';
  if (/(deceased|estate-sale|probate|separation|divorce|downsiz|interstate-seller|life-event)/.test(s)) return 'life-events';
  if (/(investor|invest-property|tenanted|negative-gearing|yield)/.test(s)) return 'investor';
  if (/(flood|heritage|character|overlay|zone|zoning|bcc)/.test(s)) return 'overlays';
  if (/(market-update|market-report|olympics|interest-rate|inner-east-market)/.test(s)) return 'market';
  if (/(buyer|first-home-buyer|borrowing|deposit-savings)/.test(s)) return 'buyer';
  if (/(timing|when-to-sell|seasonal|spring|winter|summer|autumn)/.test(s)) return 'timing';
  return 'general';
}

export const topics: Record<string, Topic> = {
  auction: {
    label: 'Auction strategy',
    articles: [
      { slug: 'auction-strategy', title: 'Auction Strategy: How to Buy and Sell at Auction', label: 'Strategy' },
      { slug: 'auction-vs-private-treaty-eoi-brisbane', title: 'Auction vs Private Treaty vs EOI in Brisbane', label: 'Method of Sale' },
      { slug: 'auction-reserve-price-brisbane-sellers', title: 'Setting Your Auction Reserve Price', label: 'Reserves' },
      { slug: 'auction-clearance-rates-brisbane-sellers', title: 'Brisbane Auction Clearance Rates Explained', label: 'Market' },
      { slug: 'auction-bidding-strategy-brisbane-buyers', title: 'Auction Bidding Strategy for Brisbane Buyers', label: 'Buyers' },
      { slug: 'auction-authority-queensland-form-6-difference', title: 'Auction Authority and Form 6 in Queensland', label: 'Legal' },
    ],
    tools: [
      { slug: 'auction-reserve', title: 'Auction Reserve Calculator' },
      { slug: 'auction-bid-tracker', title: 'Auction Bid Tracker' },
    ],
    resources: [
      { slug: 'auction-day-playbook', title: 'Auction Day Playbook' },
      { slug: 'auction-bidding-playbook-buyers', title: 'Auction Bidding Playbook for Buyers' },
    ],
  },
  inspections: {
    label: 'Inspections and reports',
    articles: [
      { slug: 'building-pest-report', title: 'Building and Pest Reports When Selling', label: 'Due Diligence' },
      { slug: 'seller-disclosure-obligations-queensland', title: 'Seller Disclosure Obligations in Queensland', label: 'Legal' },
      { slug: 'asbestos-disclosure-selling-queensland', title: 'Asbestos Disclosure When Selling in Queensland', label: 'Disclosure' },
      { slug: 'pre-listing-pest-inspection-brisbane-sellers', title: 'Pre-Listing Pest Inspections for Brisbane Sellers', label: 'Inspections' },
    ],
    tools: [
      { slug: 'defect-triage', title: 'Defect Triage Tool' },
      { slug: 'presale-checklist', title: 'Pre-Sale Checklist Tool' },
    ],
    resources: [
      { slug: 'building-pest-report-explainer', title: 'Building and Pest Report Explainer' },
      { slug: 'pre-listing-documents-checklist', title: 'Pre-Listing Documents Checklist' },
    ],
  },
  settlement: {
    label: 'Settlement and completion',
    articles: [
      { slug: 'what-happens-on-settlement-day-queensland', title: 'What Happens on Settlement Day in Queensland', label: 'Settlement' },
      { slug: 'understanding-the-contract', title: 'Understanding the Contract of Sale in Queensland', label: 'Contracts' },
      { slug: 'cooling-off-period-property-sale-queensland', title: 'Cooling Off Period in Queensland', label: 'Contracts' },
      { slug: 'solicitor-vs-conveyancer-qld', title: 'Solicitor vs Conveyancer in QLD', label: 'Legal' },
    ],
    tools: [
      { slug: 'settlement-date', title: 'Settlement Date Calculator' },
      { slug: 'whole-of-move', title: 'Whole of Move Cost Tool' },
    ],
    resources: [
      { slug: 'settlement-moving-checklist', title: 'Settlement and Moving Checklist' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
  disclosure: {
    label: 'Disclosure and forms',
    articles: [
      { slug: 'seller-disclosure-obligations-queensland', title: 'Seller Disclosure Obligations in Queensland', label: 'Legal' },
      { slug: 'asbestos-disclosure-selling-queensland', title: 'Asbestos Disclosure When Selling', label: 'Disclosure' },
      { slug: 'auction-authority-queensland-form-6-difference', title: 'Form 6 Authority Explained', label: 'Forms' },
      { slug: 'understanding-the-contract', title: 'Understanding the Contract of Sale', label: 'Contracts' },
    ],
    tools: [
      { slug: 'body-corp-disclosure', title: 'Body Corp Disclosure Tool' },
      { slug: 'presale-checklist', title: 'Pre-Sale Checklist Tool' },
    ],
    resources: [
      { slug: 'pre-listing-documents-checklist', title: 'Pre-Listing Documents Checklist' },
      { slug: 'complete-home-selling-checklist', title: 'Complete Home Selling Checklist' },
    ],
  },
  'body-corp': {
    label: 'Body corporate and apartments',
    articles: [
      { slug: 'body-corporate', title: 'Body Corporate When Selling Your Unit', label: 'Body Corp' },
      { slug: 'body-corporate-records-search-queensland-unit-seller', title: 'Body Corporate Records Search', label: 'Records' },
      { slug: 'body-corporate-levies-sinking-fund-selling-brisbane-unit', title: 'Levies and Sinking Fund Health', label: 'Finances' },
      { slug: 'body-corporate-by-laws-selling-brisbane-unit', title: 'By-Laws That Affect Sale', label: 'Rules' },
      { slug: 'airbnb-short-stay-body-corporate-brisbane-unit-seller', title: 'Short-Stay and Body Corporate', label: 'Short-Stay' },
    ],
    tools: [
      { slug: 'body-corp-disclosure', title: 'Body Corp Disclosure Tool' },
      { slug: 'investment-yield', title: 'Investment Yield Calculator' },
    ],
    resources: [
      { slug: 'pre-listing-documents-checklist', title: 'Pre-Listing Documents Checklist' },
      { slug: 'selling-investment-property-queensland', title: 'Selling Investment Property in Queensland' },
    ],
  },
  tax: {
    label: 'Tax, costs and CGT',
    articles: [
      { slug: 'stamp-duty-queensland', title: 'Stamp Duty in Queensland', label: 'Costs' },
      { slug: 'cost-of-selling-house-brisbane', title: 'Cost of Selling a House in Brisbane', label: 'Costs' },
      { slug: 'ato-clearance-certificate-cgt-withholding-selling-queensland', title: 'ATO Clearance Certificate and CGT Withholding', label: 'Tax' },
      { slug: 'agent-fees-commission-brisbane', title: 'Agent Fees and Commission in Brisbane', label: 'Fees' },
    ],
    tools: [
      { slug: 'capital-gains', title: 'Capital Gains Calculator' },
      { slug: 'selling-costs', title: 'Selling Costs Calculator' },
    ],
    resources: [
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
      { slug: 'selling-investment-property-queensland', title: 'Selling Investment Property in Queensland' },
    ],
  },
  renovation: {
    label: 'Renovation and ROI',
    articles: [
      { slug: 'should-i-renovate-before-selling-brisbane', title: 'Should I Renovate Before Selling?', label: 'Renovation' },
      { slug: 'bathroom-renovations-before-selling-brisbane-cost-return-tiers', title: 'Bathroom Renovations Before Selling', label: 'Bathroom' },
      { slug: 'kitchen-renovation-before-selling-brisbane', title: 'Kitchen Renovation Before Selling', label: 'Kitchen' },
      { slug: 'paint-before-selling-brisbane-roi', title: 'Paint Before Selling: ROI', label: 'Paint' },
    ],
    tools: [
      { slug: 'renovation-roi', title: 'Renovation ROI Calculator' },
      { slug: 'presale-checklist', title: 'Pre-Sale Checklist Tool' },
    ],
    resources: [
      { slug: 'renovation-roi-guide-brisbane', title: 'Renovation ROI Guide for Brisbane' },
      { slug: 'preparing-your-house-to-sell', title: 'Preparing Your House to Sell' },
    ],
  },
  presentation: {
    label: 'Presentation and styling',
    articles: [
      { slug: 'property-styling-staging-brisbane', title: 'Property Styling and Staging', label: 'Styling' },
      { slug: 'how-to-prepare-your-home-for-sale-brisbane', title: 'How to Prepare Your Home for Sale', label: 'Preparation' },
      { slug: 'open-home-tips-for-sellers-brisbane', title: 'Open Home Tips for Sellers', label: 'Open Homes' },
      { slug: 'should-i-renovate-before-selling-brisbane', title: 'Should I Renovate Before Selling?', label: 'Renovation' },
    ],
    tools: [
      { slug: 'open-home-checklist', title: 'Open Home Checklist Tool' },
      { slug: 'presale-checklist', title: 'Pre-Sale Checklist Tool' },
    ],
    resources: [
      { slug: 'preparing-your-house-to-sell', title: 'Preparing Your House to Sell' },
      { slug: 'photography-day-prep', title: 'Photography Day Prep' },
    ],
  },
  pricing: {
    label: 'Pricing and appraisal',
    articles: [
      { slug: 'how-to-price-your-property-for-sale-brisbane', title: 'How to Price Your Property in Brisbane', label: 'Pricing' },
      { slug: 'property-appraisal-brisbane', title: 'What to Expect at a Property Appraisal', label: 'Appraisal' },
      { slug: 'auction-reserve-price-brisbane-sellers', title: 'Setting Your Auction Reserve Price', label: 'Reserves' },
      { slug: 'bank-valuation-lower-than-contract-price-brisbane-seller', title: 'When the Bank Valuation Is Lower', label: 'Valuation' },
    ],
    tools: [
      { slug: 'appraisal-reality-check', title: 'Appraisal Reality Check' },
      { slug: 'valuation', title: 'Valuation Tool' },
    ],
    resources: [
      { slug: 'comparable-sales-worksheet', title: 'Comparable Sales Worksheet' },
      { slug: 'preparing-your-house-to-sell', title: 'Preparing Your House to Sell' },
    ],
  },
  'open-homes': {
    label: 'Open homes and inspections',
    articles: [
      { slug: 'open-home-tips-for-sellers-brisbane', title: 'Open Home Tips for Sellers', label: 'Open Homes' },
      { slug: 'body-language-open-home-brisbane', title: 'Reading Body Language at Open Homes', label: 'Buyers' },
      { slug: 'open-home-cadence-scheduling-strategy-brisbane-sellers', title: 'Open Home Cadence and Scheduling', label: 'Scheduling' },
      { slug: 'how-to-prepare-your-home-for-sale-brisbane', title: 'How to Prepare Your Home for Sale', label: 'Preparation' },
    ],
    tools: [
      { slug: 'open-home-checklist', title: 'Open Home Checklist Tool' },
      { slug: 'presale-checklist', title: 'Pre-Sale Checklist Tool' },
    ],
    resources: [
      { slug: 'open-home-day-playbook', title: 'Open Home Day Playbook' },
      { slug: 'selling-while-you-live-there', title: 'Selling While You Live There' },
    ],
  },
  marketing: {
    label: 'Marketing and campaigns',
    articles: [
      { slug: 'how-does-real-estate-marketing-work-brisbane', title: 'How Real Estate Marketing Works in Brisbane', label: 'Marketing' },
      { slug: 'marketing-budget-allocation-brisbane-property-campaign-photography-portals-signage-digital', title: 'Marketing Budget Allocation', label: 'Budget' },
      { slug: 'auction-vs-private-treaty-eoi-brisbane', title: 'Auction vs Private Treaty vs EOI', label: 'Method of Sale' },
      { slug: 'how-to-handle-offers-when-selling', title: 'How to Handle Offers When Selling', label: 'Negotiation' },
    ],
    tools: [
      { slug: 'campaign-benchmark', title: 'Campaign Benchmark Tool' },
      { slug: 'method-of-sale', title: 'Method of Sale Selector' },
    ],
    resources: [
      { slug: 'photography-day-prep', title: 'Photography Day Prep' },
      { slug: 'open-home-day-playbook', title: 'Open Home Day Playbook' },
    ],
  },
  legal: {
    label: 'Contracts and legal',
    articles: [
      { slug: 'understanding-the-contract', title: 'Understanding the Contract of Sale', label: 'Contracts' },
      { slug: 'cooling-off-period-property-sale-queensland', title: 'Cooling Off Period in Queensland', label: 'Cooling Off' },
      { slug: 'solicitor-vs-conveyancer-qld', title: 'Solicitor vs Conveyancer in QLD', label: 'Legal' },
      { slug: 'seller-disclosure-obligations-queensland', title: 'Seller Disclosure Obligations', label: 'Disclosure' },
    ],
    tools: [
      { slug: 'settlement-date', title: 'Settlement Date Calculator' },
      { slug: 'selling-costs', title: 'Selling Costs Calculator' },
    ],
    resources: [
      { slug: 'pre-listing-documents-checklist', title: 'Pre-Listing Documents Checklist' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
  costs: {
    label: 'Cost of selling',
    articles: [
      { slug: 'cost-of-selling-house-brisbane', title: 'Cost of Selling a House in Brisbane', label: 'Costs' },
      { slug: 'agent-fees-commission-brisbane', title: 'Agent Fees and Commission', label: 'Commission' },
      { slug: 'stamp-duty-queensland', title: 'Stamp Duty in Queensland', label: 'Buyer Costs' },
      { slug: 'agent-commission-structures-tiered-flat-percentage-queensland', title: 'Commission Structures Compared', label: 'Commission' },
    ],
    tools: [
      { slug: 'selling-costs', title: 'Selling Costs Calculator' },
      { slug: 'net-proceeds-deep-dive', title: 'Net Proceeds Deep Dive' },
    ],
    resources: [
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
      { slug: 'complete-home-selling-checklist', title: 'Complete Home Selling Checklist' },
    ],
  },
  'life-events': {
    label: 'Life events and selling',
    articles: [
      { slug: 'selling-after-separation-divorce-queensland', title: 'Selling After Separation or Divorce', label: 'Separation' },
      { slug: 'selling-deceased-estate-queensland', title: 'Selling a Deceased Estate', label: 'Estate' },
      { slug: 'downsizing-brisbane-inner-east', title: 'Downsizing in Brisbane Inner East', label: 'Downsizing' },
      { slug: 'interstate-seller-brisbane', title: 'Selling From Interstate', label: 'Interstate' },
    ],
    tools: [
      { slug: 'whole-of-move', title: 'Whole of Move Cost Tool' },
      { slug: 'selling-costs', title: 'Selling Costs Calculator' },
    ],
    resources: [
      { slug: 'selling-after-separation-divorce-guide', title: 'Selling After Separation Guide' },
      { slug: 'selling-deceased-estate-queensland-guide', title: 'Selling a Deceased Estate Guide' },
    ],
  },
  investor: {
    label: 'Investment property',
    articles: [
      { slug: 'tenanted-vs-vacant-sale-brisbane', title: 'Tenanted vs Vacant Sale', label: 'Tenants' },
      { slug: 'when-to-exit-brisbane-property-investor-decision-to-sell', title: 'When to Exit a Brisbane Investment', label: 'Timing' },
      { slug: 'cgt-timing-investment-property-brisbane', title: 'CGT Timing for Investment Property', label: 'Tax' },
      { slug: 'depreciation-when-selling-investment-property', title: 'Depreciation When Selling', label: 'Depreciation' },
    ],
    tools: [
      { slug: 'investment-yield', title: 'Investment Yield Calculator' },
      { slug: 'capital-gains', title: 'Capital Gains Calculator' },
    ],
    resources: [
      { slug: 'selling-investment-property-queensland', title: 'Selling Investment Property in Queensland' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
  overlays: {
    label: 'Overlays and zoning',
    articles: [
      { slug: 'flood-overlay-brisbane-selling', title: 'Flood Overlay When Selling', label: 'Flood' },
      { slug: 'character-overlay-brisbane-pre-1947', title: 'Character Overlay (Pre-1947)', label: 'Heritage' },
      { slug: 'traditional-building-character-overlay-pre-1947-brisbane-sellers', title: 'Traditional Building Character Overlay', label: 'Heritage' },
      { slug: 'brisbane-house-styles', title: 'Brisbane House Styles', label: 'Architecture' },
    ],
    tools: [
      { slug: 'flood-risk', title: 'Flood Risk Tool' },
      { slug: 'zoning-map', title: 'Zoning Map' },
    ],
    resources: [
      { slug: 'brisbane-flood-overlay-reference', title: 'Brisbane Flood Overlay Reference' },
      { slug: 'brisbane-heritage-character-overlay-reference', title: 'Brisbane Heritage and Character Overlay Reference' },
    ],
  },
  market: {
    label: 'Brisbane inner east market',
    articles: [
      { slug: 'brisbane-inner-east-market', title: 'Brisbane Inner East Market', label: 'Market' },
      { slug: 'brisbane-inner-east-market-update-q2-2026', title: 'Inner East Market Update Q2 2026', label: 'Update' },
      { slug: '2032-olympics-impact-inner-east-brisbane-property-values', title: '2032 Olympics Impact on Property Values', label: 'Olympics' },
      { slug: 'best-time-to-sell-brisbane', title: 'Best Time to Sell in Brisbane', label: 'Timing' },
    ],
    tools: [
      { slug: 'brisbane-2032', title: 'Brisbane 2032 Tool' },
      { slug: 'heatmap', title: 'Suburb Heatmap' },
    ],
    resources: [
      { slug: 'brisbane-seasonal-selling-calendar', title: 'Brisbane Seasonal Selling Calendar' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
  buyer: {
    label: 'For buyers',
    articles: [
      { slug: 'auction-bidding-strategy-brisbane-buyers', title: 'Auction Bidding Strategy for Buyers', label: 'Auction' },
      { slug: 'first-home-buyer-brisbane-inner-east', title: 'First Home Buyer in Brisbane Inner East', label: 'First Home' },
      { slug: 'building-pest-report', title: 'Building and Pest Reports', label: 'Due Diligence' },
      { slug: 'stamp-duty-queensland', title: 'Stamp Duty in Queensland', label: 'Costs' },
    ],
    tools: [
      { slug: 'borrowing-power', title: 'Borrowing Power Calculator' },
      { slug: 'true-cost-to-buy', title: 'True Cost to Buy Tool' },
    ],
    resources: [
      { slug: 'first-home-buyer-brisbane-inner-east-guide', title: 'First Home Buyer Guide' },
      { slug: 'auction-bidding-playbook-buyers', title: 'Auction Bidding Playbook for Buyers' },
    ],
  },
  timing: {
    label: 'Timing your sale',
    articles: [
      { slug: 'when-to-sell', title: 'When Is the Right Time to Sell?', label: 'Timing' },
      { slug: 'best-time-to-sell-house-brisbane-seasonal', title: 'Best Time to Sell: Seasonal', label: 'Seasonal' },
      { slug: 'best-time-to-sell-brisbane', title: 'Best Time to Sell in Brisbane', label: 'Timing' },
      { slug: 'selling-around-easter-anzac-day-brisbane-autumn-public-holiday-campaigns', title: 'Selling Around Easter and ANZAC Day', label: 'Public Holidays' },
    ],
    tools: [
      { slug: 'campaign-benchmark', title: 'Campaign Benchmark Tool' },
      { slug: 'rent-vs-sell', title: 'Rent vs Sell Calculator' },
    ],
    resources: [
      { slug: 'brisbane-seasonal-selling-calendar', title: 'Brisbane Seasonal Selling Calendar' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
  suburb: {
    label: 'Selling in your suburb',
    articles: [
      { slug: 'selling-in-bulimba', title: 'Selling in Bulimba', label: 'Bulimba' },
      { slug: 'selling-in-hawthorne', title: 'Selling in Hawthorne', label: 'Hawthorne' },
      { slug: 'selling-in-balmoral', title: 'Selling in Balmoral', label: 'Balmoral' },
      { slug: 'selling-in-morningside', title: 'Selling in Morningside', label: 'Morningside' },
    ],
    tools: [
      { slug: 'heatmap', title: 'Suburb Heatmap' },
      { slug: 'suburb-match', title: 'Suburb Match Tool' },
    ],
    resources: [
      { slug: 'comparable-sales-worksheet', title: 'Comparable Sales Worksheet' },
      { slug: 'brisbane-seasonal-selling-calendar', title: 'Brisbane Seasonal Selling Calendar' },
    ],
  },
  general: {
    label: 'Selling in Brisbane',
    articles: [
      { slug: 'when-to-sell', title: 'When Is the Right Time to Sell?', label: 'Timing' },
      { slug: 'how-to-price-your-property-for-sale-brisbane', title: 'How to Price Your Property', label: 'Pricing' },
      { slug: 'how-to-prepare-your-home-for-sale-brisbane', title: 'How to Prepare Your Home for Sale', label: 'Preparation' },
      { slug: 'cost-of-selling-house-brisbane', title: 'Cost of Selling a House in Brisbane', label: 'Costs' },
      { slug: 'auction-vs-private-treaty-eoi-brisbane', title: 'Auction vs Private Treaty vs EOI', label: 'Method of Sale' },
    ],
    tools: [
      { slug: 'selling-costs', title: 'Selling Costs Calculator' },
      { slug: 'appraisal-reality-check', title: 'Appraisal Reality Check' },
    ],
    resources: [
      { slug: 'complete-home-selling-checklist', title: 'Complete Home Selling Checklist' },
      { slug: 'qld-selling-timeline-at-a-glance', title: 'QLD Selling Timeline at a Glance' },
    ],
  },
};

// Returns related content for a given slug. Optional explicit topic override.
export function selectRelated(currentSlug: string, explicitTopic?: string) {
  const topicKey = explicitTopic && topics[explicitTopic] ? explicitTopic : detectTopic(currentSlug);
  const t = topics[topicKey] || topics.general;
  const articles = t.articles.filter((a) => a.slug !== currentSlug).slice(0, 4);
  // If filtering removed too many, top up from general
  if (articles.length < 3) {
    for (const a of topics.general.articles) {
      if (articles.length >= 4) break;
      if (a.slug !== currentSlug && !articles.find((x) => x.slug === a.slug)) {
        articles.push(a);
      }
    }
  }
  return {
    topicKey,
    label: t.label,
    articles,
    tools: t.tools.slice(0, 2),
    resources: t.resources.slice(0, 2),
  };
}
