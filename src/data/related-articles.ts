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

  // Selling-in suburb articles (46 entries) - only confirmed-live articles used as targets
  "selling-in-annerley": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-ascot": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  ],
  "selling-in-auchenflower": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
  ],
  "selling-in-balmoral": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-bardon": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-belmont": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-bowen-hills": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-brisbane-cbd": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "selling-in-bulimba": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-camp-hill": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-cannon-hill": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-carina": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-carina-heights": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-carindale": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-coorparoo": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  ],
  "selling-in-dutton-park": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-east-brisbane": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-fortitude-valley": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-greenslopes": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-hamilton": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-hawthorne": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-hemmant": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-highgate-hill": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
  ],
  "selling-in-holland-park": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-holland-park-west": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-indooroopilly": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  ],
  "selling-in-kangaroo-point": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-milton": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "selling-in-morningside": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-mount-gravatt": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-mount-gravatt-east": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-murarrie": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-new-farm": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-newstead": [
    { title: "What to Expect When Selling in Teneriffe", slug: "selling-in-teneriffe", label: "Selling" },
    { title: "What to Expect When Selling in New Farm", slug: "selling-in-new-farm", label: "Selling" },
    { title: "What Is Body Corporate and What Does It Actually Cost?", slug: "body-corporate", label: "Body Corporate" },
  ],
  "selling-in-norman-park": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-paddington": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  ],
  "selling-in-red-hill": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
  ],
  "selling-in-seven-hills": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-spring-hill": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-stones-corner": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-tarragindi": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
  ],
  "selling-in-teneriffe": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-tingalpa": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-toowong": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
  ],
  "selling-in-upper-mount-gravatt": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How Long Does It Take to Sell a Home in Brisbane?", slug: "how-long-does-it-take-to-sell-a-home-in-brisbane", label: "Timeline" },
  ],
  "selling-in-west-end": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "selling-in-woolloongabba": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],

  // Other articles (43 entries)
  "airbnb-vs-longterm": [
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
    { title: "Selling a Tenanted Property in Queensland", slug: "selling-tenanted-property-queensland", label: "Tenancies" },
  ],
  "brisbane-house-styles": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "brisbane-house-styles-architectural-periods": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "brisbane-inner-east-value": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Brisbane Inner East Market Update: Q2 2026", slug: "brisbane-inner-east-market-update-q2-2026", label: "Market" },
  ],
  "build-process-with-architect-step-by-step": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "building-materials-brisbane-homes": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
  ],
  "building-pest-report-seller-guide-brisbane": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
  ],
  "building-professionals-architect-designer-draftsperson-engineer": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "buyers-agent": [
    { title: "How to Choose a Real Estate Agent in Brisbane", slug: "how-to-choose-a-real-estate-agent-brisbane", label: "Agents" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
  ],
  "buying-with-tenant": [
    { title: "Selling a Tenanted Property in Queensland", slug: "selling-tenanted-property-queensland", label: "Tenancies" },
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "capital-gains-tax-selling-home-brisbane": [
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "Negative Gearing and Selling Your Investment Property", slug: "negative-gearing-selling-investment-property-brisbane", label: "Tax Strategy" },
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
  ],
  "cladding-facade-types-brisbane": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "crossriver-rail-property-values-brisbane-inner-east": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Brisbane Inner East Market Update: Q2 2026", slug: "brisbane-inner-east-market-update-q2-2026", label: "Market" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "development-potential-property-brisbane-inner-east": [
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "Brisbane Inner East Market Update: Q2 2026", slug: "brisbane-inner-east-market-update-q2-2026", label: "Market" },
  ],
  "easements-property-brisbane-qld": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
  ],
  "engage-right-builder": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "first-home-buyer-help-history-and-current-options": [
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "fixtures-fittings-inclusions-property-sale-qld": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
  ],
  "flood-mapping": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "heritage-overlays-brisbane": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "house-anatomy-eaves-soffits-slabs-fascia": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "mortgage-broker": [
    { title: "Stamp Duty in Queensland: What Buyers Need to Know", slug: "stamp-duty-queensland", label: "Costs" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Does a Real Estate Agent Actually Do for You?", slug: "what-does-a-real-estate-agent-do", label: "Agents" },
  ],
  "pool-safety-certificate-selling-brisbane-qld": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "pre-settlement-inspection-seller-guide-qld": [
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "prewar-homes-brisbane": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
  ],
  "property-passed-in-at-auction-brisbane": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
    { title: "How to Handle Offers When Selling Your Home", slug: "how-to-handle-offers-when-selling", label: "Negotiation" },
  ],
  "queensland-brisbane-zoning-explained": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "queenslander-vs-postwar": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "retaining-walls-brisbane-selling": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
  ],
  "school-catchments-property-brisbane-inner-east": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Brisbane Inner East Market Update: Q2 2026", slug: "brisbane-inner-east-market-update-q2-2026", label: "Market" },
  ],
  "selling-by-auction-brisbane": [
    { title: "Auction Strategy: How to Get the Best Result at Auction", slug: "auction-strategy", label: "Auction" },
    { title: "Auction vs Private Treaty vs EOI in Brisbane", slug: "auction-vs-private-treaty-eoi-brisbane", label: "Method of Sale" },
    { title: "How to Handle Offers When Selling Your Home", slug: "how-to-handle-offers-when-selling", label: "Negotiation" },
  ],
  "selling-house-with-mortgage-brisbane": [
    { title: "Cost of Selling a House in Brisbane", slug: "cost-of-selling-house-brisbane", label: "Costs" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
  ],
  "selling-tenanted-investment-property-queensland-guide": [
    { title: "Selling a Rental Property in Brisbane", slug: "selling-rental-property-brisbane", label: "Investors" },
    { title: "Selling a Tenanted Property in Queensland", slug: "selling-tenanted-property-queensland", label: "Tenancies" },
    { title: "Land Tax in Queensland: What Property Investors Need to Know", slug: "land-tax-queensland-investment-property", label: "Land Tax" },
  ],
  "slab-design-types-brisbane": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "smart-home-features-selling-brisbane-buyers-value-vs-noise": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "Open Home Tips for Sellers", slug: "open-home-tips-for-sellers-brisbane", label: "Open Homes" },
  ],
  "smoke-alarm-compliance-selling-queensland": [
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "storage-built-in-wardrobes-walk-in-robes-brisbane-property-value": [
    { title: "Property Styling and Staging When Selling in Brisbane", slug: "property-styling-staging-brisbane", label: "Presentation" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
  ],
  "subject-to-finance-clause-queensland-sellers": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
  ],
  "termite-chemical-barriers-annual-pest-contracts-selling-brisbane": [
    { title: "Building and Pest Reports When Selling", slug: "building-pest-report", label: "Due Diligence" },
    { title: "Seller Disclosure Obligations in Queensland", slug: "seller-disclosure-obligations-queensland", label: "Legal" },
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
  ],
  "types-of-build-project-custom-modular-prefab": [
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
    { title: "How to Prepare Your Home for Sale in Brisbane", slug: "how-to-prepare-your-home-for-sale-brisbane", label: "Preparation" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "types-of-residential-property-australia": [
    { title: "Selling a Unit or Townhouse in a Body Corporate in Queensland", slug: "selling-unit-townhouse-body-corporate-queensland", label: "Body Corporate" },
    { title: "Body Corporate Fees and What They Cover", slug: "body-corporate", label: "Body Corporate" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
  ],
  "unconditional-offer": [
    { title: "Understanding the Contract of Sale in Queensland", slug: "understanding-the-contract", label: "Contracts" },
    { title: "Cooling Off Period When Selling Property in Queensland", slug: "cooling-off-period-property-sale-queensland", label: "Contracts" },
    { title: "What Happens on Settlement Day When Selling in Queensland", slug: "what-happens-on-settlement-day-queensland", label: "Settlement" },
  ],
  "upgrading-property-brisbane-inner-east": [
    { title: "When Is the Right Time to Sell?", slug: "when-to-sell", label: "Timing" },
    { title: "How to Price Your Property for Sale in Brisbane", slug: "how-to-price-your-property-for-sale-brisbane", label: "Pricing" },
    { title: "Should I Renovate Before Selling My Home in Brisbane?", slug: "should-i-renovate-before-selling-brisbane", label: "Renovation" },
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
