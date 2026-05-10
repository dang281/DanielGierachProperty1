// Single source of truth for /resources/* pages and downloadable PDFs.
// Each resource has structured sections that render to both an Astro page
// and a Puppeteer-generated PDF in /public/downloads/.

// Master & pre-listing
import completeSellingChecklist from './complete-home-selling-checklist.js';
import qldSellingTimeline from './qld-selling-timeline-at-a-glance.js';
import preparingHouseToSell from './preparing-your-house-to-sell.js';
import preListingDocuments from './pre-listing-documents-checklist.js';
import renovationRoiGuide from './renovation-roi-guide-brisbane.js';
import gardenFourWeekends from './garden-and-outdoor-four-weekends.js';
import photographyDayPrep from './photography-day-prep.js';

// Choosing the agent
import twelveAgentQuestions from './12-questions-to-ask-your-real-estate-agent.js';

// Marketing & living through it
import openHomeDayPlaybook from './open-home-day-playbook.js';
import sellingWhileYouLive from './selling-while-you-live-there.js';
import sellingWithKids from './selling-with-kids-in-house.js';
import sellingWithPets from './selling-with-pets-brisbane-guide.js';

// Auction & inspections
import auctionDayPlaybook from './auction-day-playbook.js';
import buildingPestExplainer from './building-pest-report-explainer.js';

// Settlement
import settlementMovingChecklist from './settlement-moving-checklist.js';

// Pricing
import comparableSalesWorksheet from './comparable-sales-worksheet.js';

// Life events
import sellingDeceasedEstate from './selling-deceased-estate-queensland-guide.js';
import sellingAfterSeparation from './selling-after-separation-divorce-guide.js';
import sellingParentsHome from './selling-parents-brisbane-home-guide.js';
import downsizingInnerEast from './downsizing-brisbane-inner-east-guide.js';
import interstateSeller from './interstate-seller-brisbane-guide.js';

// Investors
import sellingInvestmentProperty from './selling-investment-property-queensland.js';

// Brisbane reference
import seasonalSellingCalendar from './brisbane-seasonal-selling-calendar.js';
import heritageOverlayReference from './brisbane-heritage-character-overlay-reference.js';
import floodOverlayReference from './brisbane-flood-overlay-reference.js';

// Buyers
import firstHomeBuyerGuide from './first-home-buyer-brisbane-inner-east-guide.js';
import auctionBiddingBuyers from './auction-bidding-playbook-buyers.js';

export const resources = [
  // Headline / master
  completeSellingChecklist,
  qldSellingTimeline,
  preparingHouseToSell,
  renovationRoiGuide,
  preListingDocuments,
  twelveAgentQuestions,
  photographyDayPrep,
  gardenFourWeekends,

  // Marketing & living through the campaign
  openHomeDayPlaybook,
  sellingWhileYouLive,
  sellingWithKids,
  sellingWithPets,

  // Auction & inspections
  auctionDayPlaybook,
  buildingPestExplainer,

  // Settlement & pricing
  settlementMovingChecklist,
  comparableSalesWorksheet,

  // Life events
  sellingDeceasedEstate,
  sellingAfterSeparation,
  sellingParentsHome,
  downsizingInnerEast,
  interstateSeller,

  // Investors
  sellingInvestmentProperty,

  // Brisbane reference
  seasonalSellingCalendar,
  heritageOverlayReference,
  floodOverlayReference,

  // Buyers
  firstHomeBuyerGuide,
  auctionBiddingBuyers,
];

export const resourceBySlug = Object.fromEntries(
  resources.map((r) => [r.slug, r])
);
