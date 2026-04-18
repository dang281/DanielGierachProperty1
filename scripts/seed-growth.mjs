/**
 * Seed script — Growth Command Centre opportunities
 * Run from repo root: node scripts/seed-growth.mjs
 *
 * Uses raw fetch against the Supabase REST API (service role key).
 * The dashboard .env carries SUPABASE_KEY; we inline the values here
 * so the script runs without dotenv.
 *
 * Real table schema:
 *   priority: integer 1=high, 2=medium, 3=low
 *   status:   'open' | 'in_progress' | 'done' | 'dismissed'
 *   category: 'lead-gen' | 'website' | 'content' | 'positioning' | 'seo'
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? 'https://hmwulvvwsksuyqozuxvw.supabase.co'

// Reads from root .env SUPABASE_KEY or dashboard/.env.local SUPABASE_SERVICE_KEY
const SERVICE_KEY = process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_KEY env var is not set.')
  console.error('Run: SUPABASE_KEY=<your-service-key> node scripts/seed-growth.mjs')
  process.exit(1)
}
const TODAY        = new Date().toISOString().slice(0, 10)

const opportunities = [
  {
    title: 'LinkedIn Authority Series',
    category: 'content',
    priority: 1,           // high
    status: 'open',        // testing → open
    why_it_matters:
      "Weekly authority posts keep Daniel visible to homeowners before they're ready to sell. Most sellers decide their agent before they start searching — this is the moment to own.",
    expected_impact:
      "Increases appraisal requests from Inner East homeowners who've seen the content and already trust Daniel's knowledge",
    next_action:
      'Confirm schedule for next 4 weeks and ensure visual is generated for each post before it goes out',
    week_generated: TODAY,
  },
  {
    title: 'Suburb Spotlight Content',
    category: 'content',
    priority: 1,           // high
    status: 'open',
    why_it_matters:
      'Suburb-specific content attracts homeowners and buyers in Carina, Cannon Hill, Camp Hill, Bulimba, Hawthorne — people searching for local market insights become warm leads',
    expected_impact:
      "Drives direct enquiries from homeowners who feel Daniel knows their specific suburb, not just the Inner East generally",
    next_action:
      'Publish at least one spotlight per suburb per quarter and link to landing pages',
    week_generated: TODAY,
  },
  {
    title: 'Field Guide SEO Series',
    category: 'seo',
    priority: 2,           // medium
    status: 'open',
    why_it_matters:
      "Educational guides rank on Google for queries like 'selling your home Brisbane' or 'auction vs private treaty Queensland' — bringing in buyers and sellers at the research stage",
    expected_impact:
      'Organic search traffic that converts to enquiries over 6–12 months as guides accumulate authority',
    next_action:
      'Publish 2 field guides per month, ensure each has internal links to the contact page and suburb landing pages',
    week_generated: TODAY,
  },
  {
    title: 'Brisbane Olympics Property Angle',
    category: 'positioning',
    priority: 2,           // medium
    status: 'open',
    why_it_matters:
      '2032 Olympics is a once-in-a-generation story for Brisbane property. Early movers who own the narrative will be the go-to agents when sellers start acting on it in 2026–2028',
    expected_impact:
      'Positions Daniel as the Inner East authority on Olympic-driven property trends — a specific, defensible niche',
    next_action:
      'Create a dedicated Olympic property insights page on danielgierach.com and link to it from every Olympics-related post',
    week_generated: TODAY,
  },
  {
    title: 'Murarrie & Seven Hills Seller Landing Pages',
    category: 'lead-gen',
    priority: 1,           // high
    status: 'open',
    why_it_matters:
      'Facebook ads driving to suburb-specific landing pages capture seller intent at the moment of consideration — far higher conversion than generic brand ads',
    expected_impact:
      'Direct appraisal bookings from Murarrie and Seven Hills homeowners actively thinking about selling',
    next_action:
      'Review landing page conversion rate — if below 3%, test a new headline and social proof element',
    week_generated: TODAY,
  },
]

async function seed() {
  console.log(`Seeding ${opportunities.length} opportunities into Supabase…`)

  const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(opportunities),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Error ${res.status}:`, text)
    process.exit(1)
  }

  const inserted = await res.json()
  const priorityLabel = { 1: 'HIGH', 2: 'MEDIUM', 3: 'LOW' }
  console.log(`Inserted ${Array.isArray(inserted) ? inserted.length : '?'} rows.`)
  for (const row of inserted ?? []) {
    console.log(`  [${priorityLabel[row.priority] ?? row.priority}] ${row.title} (${row.status})`)
  }
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
