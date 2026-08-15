// Quarterly qualitative market notes for Daniel's priority suburbs.
// Rendered by src/components/MarketPulse.astro on the matching suburb page.
// RULES: no prices, no medians, no growth percentages, no days-on-market
// figures (PriceFinder licensing not in place). Observations only, in
// Daniel's voice. Update each quarter and bump `updated`.

export type MarketPulseEntry = {
  updated: string;      // e.g. "August 2026" — shown on the page
  heading: string;      // a finding, not a label
  points: string[];     // 3 short on-the-ground observations
};

export const MARKET_PULSE: Record<string, MarketPulseEntry> = {
  'seven-hills': {
    updated: 'August 2026',
    heading: 'More buyers waiting than homes to show them.',
    points: [
      'Listing volumes remain unusually low, and renovated character homes are meeting buyers who have been watching the suburb for months.',
      'Families are circling the pockets near Seven Hills State School and the bushland reserve, with catchment questions leading most enquiry calls.',
      'Underbidders from Norman Park and Camp Hill campaigns keep widening their search into Seven Hills, which is deepening the pool at open homes.',
    ],
  },
  'morningside': {
    updated: 'August 2026',
    heading: 'Bulimba spillover is setting the pace.',
    points: [
      'Buyers priced out of Bulimba and Hawthorne are anchoring on Morningside for the same evenings at a different entry point, and character streets are absorbing that demand first.',
      'Unit and townhouse owners near the station are upgrading to houses within the suburb, which keeps both ends of the market moving.',
      'Renovated Queenslanders are the most contested segment, with presentation quality separating strong campaigns from quiet ones.',
    ],
  },
  'cannon-hill': {
    updated: 'August 2026',
    heading: 'School-run and full-block demand is doing the work.',
    points: [
      'Cannon Hill Anglican College keeps drawing family buyers who want the school run measured in minutes, and they compete hardest for move-in-ready homes.',
      'Full post-war blocks on the quiet streets are attracting upgraders from units closer in who want a backyard without leaving the rail line.',
      'Gateway access is coming up in more buyer conversations, particularly from households commuting north to the airport precinct.',
    ],
  },
  'norman-park': {
    updated: 'August 2026',
    heading: 'Demand is running ahead of the homes on offer.',
    points: [
      'The station remains the deciding factor for commuting households choosing Norman Park over its neighbours without rail.',
      'Finance-arranged buyers are acting quickly, which shortens the path from first inspection to offer.',
      'Well-renovated Queenslanders are drawing early offers, and original-condition homes are attracting renovators who missed the last one.',
    ],
  },
  'carina': {
    updated: 'August 2026',
    heading: 'Camp Hill underbidders are landing here next.',
    points: [
      'Most active buyers started their search further west, recalibrated, and arrived in Carina already educated on value, which keeps campaigns moving.',
      'Full original allotments are the most contested stock, with buyers planning pools and extensions competing for the flat blocks.',
      'Catchment questions dominate enquiry, and homes inside the sought-after school boundaries are drawing the deepest inspection numbers.',
    ],
  },
  'carina-heights': {
    updated: 'August 2026',
    heading: 'Outlook homes are carrying the market.',
    points: [
      'Elevated homes with genuine views are drawing premium attention the moment they list, because buyers know how rarely the best streets turn over.',
      'Supply stays tight and the waiting-buyer list is deep, so well-prepared campaigns are meeting their buyers in the first weeks.',
      'Rebuild interest is growing on elevated blocks where an original home understates the site, particularly near the reserve.',
    ],
  },
  'camp-hill': {
    updated: 'August 2026',
    heading: 'Multiple offers remain the normal outcome.',
    points: [
      'Well-presented homes inside the Whites Hill catchment continue to draw several written offers, and offer deadlines are converting hesitant buyers into committed ones.',
      'Character homes with completed renovations are the most contested stock, with buyers paying for work they cannot easily commission themselves.',
      'Ridge streets with city or bay outlooks are attracting early offers ahead of scheduled campaign dates.',
    ],
  },
  'murarrie': {
    updated: 'August 2026',
    heading: 'Value hunters have found the Gateway pocket.',
    points: [
      'First-home buyers and young families are the most active groups, drawn by the entry point relative to Cannon Hill and Morningside next door.',
      'Renovated post-war homes are moving quickly, while original homes are drawing renovators priced out of the suburbs one ring in.',
      'Commuters are weighing the Gateway and rail access together, and homes near the station are seeing the strongest inspection traffic.',
    ],
  },
};
