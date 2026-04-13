// Related articles map: insights slug → 3 contextually relevant articles
// Each entry: { title, slug, label }
export type RelatedArticle = { title: string; slug: string; label: string };

const related: Record<string, RelatedArticle[]> = {
  "when-to-sell": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
  ],
  "how-to-price-your-property-for-sale-brisbane": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Strategy" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "how-to-price-your-property": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Strategy" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "how-to-prepare-your-home-for-sale-brisbane": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
  ],
  "prepare-home-for-sale": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
  ],
  "property-styling-staging-brisbane": [
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
  ],
  "open-home-tips-for-sellers-brisbane": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How Does Real Estate Marketing Work in Brisbane?", slug: "how-does-real-estate-marketing-work-brisbane", label: "Marketing" },
  ],
  "should-i-renovate-before-selling-brisbane": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "auction-vs-private-treaty-eoi-brisbane": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Handle Offers When Selling Your Home", slug: "how-to-handle-offers-when-selling", label: "Negotiation" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "auction-strategy": [
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
    { title: "How to Handle Offers When Selling Your Home", slug: "how-to-handle-offers-when-selling", label: "Negotiation" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
  ],
  "how-to-handle-offers-when-selling": [
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
  ],
  "cooling-off-period-property-sale-queensland": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "understanding-the-contract": [
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "what-happens-on-settlement-day-queensland": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
    { title: "Solicitor vs Conveyancer in QLD: Which Do You Need?", slug: "solicitor-vs-conveyancer-qld", label: "Legal" },
  ],
  "what-happens-at-settlement": [
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Solicitor vs Conveyancer in QLD: Which Do You Need?", slug: "solicitor-vs-conveyancer-qld", label: "Legal" },
  ],
  "seller-disclosure-obligations-queensland": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
  ],
  "solicitor-vs-conveyancer-qld": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "cost-of-selling-house-brisbane": [
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How Does Real Estate Marketing Work in Brisbane?", slug: "how-does-real-estate-marketing-work-brisbane", label: "Marketing" },
  ],
  "stamp-duty-queensland": [
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "Solicitor vs Conveyancer in QLD: Which Do You Need?", slug: "solicitor-vs-conveyancer-qld", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "property-appraisal-brisbane": [
    { title: "Property Appraisal vs Valuation in Brisbane", slug: "property-appraisal-vs-valuation-brisbane", label: "Appraisal" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Choosing an Agent" },
  ],
  "property-appraisal-vs-valuation-brisbane": [
    { title: "What to Expect at a Property Appraisal in Brisbane", slug: "property-appraisal-brisbane", label: "Appraisal" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How Much Is My Home Worth in Brisbane?", slug: "how-much-is-my-home-worth-brisbane", label: "Valuation" },
  ],
  "how-much-is-my-home-worth-brisbane": [
    { title: "Property Appraisal vs Valuation in Brisbane", slug: "property-appraisal-vs-valuation-brisbane", label: "Appraisal" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "What to Expect at a Property Appraisal in Brisbane", slug: "property-appraisal-brisbane", label: "Appraisal" },
  ],
  "how-to-choose-a-real-estate-agent-brisbane": [
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How to Change Real Estate Agents Mid-Campaign in Brisbane", slug: "how-to-change-real-estate-agents-brisbane", label: "Agents" },
    { title: "Private Sale vs Real Estate Agent in Brisbane", slug: "private-sale-vs-real-estate-agent-brisbane", label: "Agents" },
  ],
  "how-to-choose-a-real-estate-agent": [
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How to Change Real Estate Agents Mid-Campaign in Brisbane", slug: "how-to-change-real-estate-agents-brisbane", label: "Agents" },
    { title: "Private Sale vs Real Estate Agent in Brisbane", slug: "private-sale-vs-real-estate-agent-brisbane", label: "Agents" },
  ],
  "what-does-a-real-estate-agent-do": [
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Choosing an Agent" },
    { title: "How to Change Real Estate Agents Mid-Campaign in Brisbane", slug: "how-to-change-real-estate-agents-brisbane", label: "Mid-Campaign" },
    { title: "Private Sale vs Real Estate Agent in Brisbane", slug: "private-sale-vs-real-estate-agent-brisbane", label: "Agents" },
  ],
  "how-to-change-real-estate-agents-brisbane": [
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Choosing an Agent" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Campaigns" },
  ],
  "private-sale-vs-real-estate-agent-brisbane": [
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Off-Market Property Sales in Brisbane", slug: "off-market-property-sales-brisbane", label: "Off-Market" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Choosing an Agent" },
  ],
  "off-market-property-sales-brisbane": [
    { title: "Private Sale vs Real Estate Agent in Brisbane", slug: "private-sale-vs-real-estate-agent-brisbane", label: "Agents" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "how-does-real-estate-marketing-work-brisbane": [
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Strategy" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
  ],
  "marketing-campaign-when-selling": [
    { title: "How Does Real Estate Marketing Work in Brisbane?", slug: "how-does-real-estate-marketing-work-brisbane", label: "Marketing" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
  ],
  "selling-rental-property-brisbane": [
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
    { title: "Negative Gearing and Selling Your Investment Property", slug: "negative-gearing-selling-investment-property-brisbane", label: "Tax Strategy" },
    { title: "Selling a Tenanted Property in Queensland", slug: "selling-tenanted-property-queensland", label: "Tenancies" },
  ],
  "selling-tenanted-property-queensland": [
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
    { title: "Negative Gearing and Selling Your Investment Property", slug: "negative-gearing-selling-investment-property-brisbane", label: "Tax Strategy" },
  ],
  "land-tax-queensland-investment-property": [
    { title: "Negative Gearing and Selling Your Investment Property", slug: "negative-gearing-selling-investment-property-brisbane", label: "Tax Strategy" },
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Selling a Tenanted Property in Queensland", slug: "selling-tenanted-property-queensland", label: "Tenancies" },
  ],
  "negative-gearing-selling-investment-property-brisbane": [
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
  ],
  "selling-deceased-estate-queensland": [
    { title: "How to Sell a Jointly Owned Property in Queensland", slug: "selling-jointly-owned-property-queensland", label: "Co-Ownership" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "selling-jointly-owned-property-queensland": [
    { title: "Selling a Property During Separation or Divorce in Queensland", slug: "selling-property-during-separation-divorce-queensland", label: "Separation" },
    { title: "How to Sell a Deceased Estate Property in Queensland", slug: "selling-deceased-estate-queensland", label: "Deceased Estates" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "selling-property-during-separation-divorce-queensland": [
    { title: "How to Sell a Jointly Owned Property in Queensland", slug: "selling-jointly-owned-property-queensland", label: "Co-Ownership" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "downsizing-property-brisbane": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "best-time-to-sell-brisbane": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Brisbane Inner East Market Update: Q2 2026", slug: "brisbane-inner-east-market-update-q2-2026", label: "Market Update" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "brisbane-inner-east-market-update-q2-2026": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Strategy" },
  ],
  "selling-unit-townhouse-body-corporate-queensland": [
    { title: "Body Corporate Fees and What They Cover", slug: "body-corporate", label: "Body Corporate" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "body-corporate": [
    { title: "Selling a Unit or Townhouse in a Body Corporate in Queensland", slug: "selling-unit-townhouse-body-corporate-queensland", label: "Selling" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
  ],
  "how-long-does-it-take-to-sell-a-home-in-brisbane": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Strategy" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
  ],
  "building-pest-report": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
  ],
};

// Default fallback for pages not in the map
const defaultRelated: RelatedArticle[] = [
  { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
];

export function getRelatedArticles(slug: string): RelatedArticle[] {
  return related[slug] ?? defaultRelated;
}
