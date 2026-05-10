// Single source of truth for /resources/* pages and downloadable PDFs.
// Each resource has structured sections that render to both an Astro page
// and a Puppeteer-generated PDF in /public/downloads/.

import preparingHouseToSell from './preparing-your-house-to-sell.js';
import auctionDayPlaybook from './auction-day-playbook.js';
import completeSellingChecklist from './complete-home-selling-checklist.js';
import settlementMovingChecklist from './settlement-moving-checklist.js';
import buildingPestExplainer from './building-pest-report-explainer.js';
import comparableSalesWorksheet from './comparable-sales-worksheet.js';

export const resources = [
  preparingHouseToSell,
  auctionDayPlaybook,
  completeSellingChecklist,
  settlementMovingChecklist,
  buildingPestExplainer,
  comparableSalesWorksheet,
];

export const resourceBySlug = Object.fromEntries(
  resources.map((r) => [r.slug, r])
);
