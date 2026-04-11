/**
 * seed-supabase.mjs
 * Reads content/social/*.md files and inserts them into Supabase.
 * Run: node seed-supabase.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read env from dashboard/.env.local
const envRaw = readFileSync(join(__dirname, 'dashboard/.env.local'), 'utf-8')
const env = Object.fromEntries(
  envRaw.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
)
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in dashboard/.env.local')
  process.exit(1)
}

async function insert(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_items`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase insert failed: ${err}`)
  }
  return res.json()
}

// ── Content rows ──────────────────────────────────────────────────────────────

const rows = [
  // Bulimba - Instagram
  {
    title: 'Bulimba Suburb Spotlight',
    platform: 'instagram',
    content_type: 'Post',
    caption: `Bulimba has one of the most consistent buyer pools in inner east Brisbane. Proximity to the CBD, the Oxford Street strip, and the river keeps demand solid regardless of what the broader market is doing.

For homeowners who've been sitting on a decision, that consistency matters. It means when you're ready, the buyers are there.

Thinking of selling? Let's talk. Link in bio.`,
    objective: 'Appraisal bookings from Bulimba homeowners',
    content_pillar: 'suburb',
    status: 'ready',
    scheduled_date: '2026-04-11',
    notes: 'Pair with an aerial or street-level shot of Bulimba - the Oxford Street strip, the park, or the river foreshore works well.',
    destination_url: 'https://danielgierach.com/suburbs/bulimba',
  },
  // Bulimba - Facebook
  {
    title: 'Bulimba Suburb Spotlight',
    platform: 'facebook',
    content_type: 'Post',
    caption: `If you own in Bulimba, you already know what makes it special - but it's worth understanding what that means in the current market.

The buyer pool here is drawn by three things that don't change: walkable access to Oxford Street, river proximity, and a short commute to the CBD. That combination means Bulimba attracts a loyal, motivated buyer base - people who have done their research and made a deliberate choice.

For sellers, that translates to genuine competition when a well-presented home comes to market.

If you've been wondering what your Bulimba property is worth right now, the suburb page at danielgierach.com/suburbs/bulimba is a good starting point - or book a free appraisal directly and we'll give you a straight answer.`,
    objective: 'Appraisal bookings from Bulimba homeowners',
    content_pillar: 'suburb',
    status: 'ready',
    scheduled_date: '2026-04-11',
    notes: 'No image required but a lifestyle shot of the suburb performs well for reach. CTA links to danielgierach.com/suburbs/bulimba - confirm that page is live before publishing.',
    destination_url: 'https://danielgierach.com/suburbs/bulimba',
  },
  // Morningside - Instagram
  {
    title: 'Morningside Suburb Spotlight',
    platform: 'instagram',
    content_type: 'Post',
    caption: `Morningside is one of Brisbane's most underrated inner suburbs. Buyers love it for the character homes, the flat blocks, and the easy access to Hawthorne and Bulimba without the price tag. Demand is strong and the pool of buyers competing for well-presented homes is deep. Thinking of selling? Let's talk.`,
    objective: 'Appraisal bookings from Morningside homeowners',
    content_pillar: 'suburb',
    status: 'ready',
    scheduled_date: '2026-04-11',
    notes: 'Pair with a lifestyle shot from Morningside, ideally along Wynnum Road or near the Junction area cafes.',
    destination_url: 'https://danielgierach.com/suburbs/morningside',
  },
  // Morningside - Facebook
  {
    title: 'Morningside Suburb Spotlight',
    platform: 'facebook',
    content_type: 'Post',
    caption: `If you own a home in Morningside, it's worth understanding what's happening in your market right now. The suburb sits in a strong position, with easy access to the CBD, the ongoing improvements along the Wynnum Road corridor, and proximity to Hawthorne and Bulimba drawing buyers who can't quite stretch to those price points. Character homes, post-war cottages, and larger family blocks are all seeing solid interest from a wide buyer pool. It's one of those suburbs where a well-prepared campaign genuinely makes a difference to the result. If you're thinking about what your home might be worth, start here: danielgierach.com/suburbs/morningside`,
    objective: 'Appraisal bookings from Morningside homeowners',
    content_pillar: 'suburb',
    status: 'ready',
    scheduled_date: '2026-04-11',
    notes: 'Can be boosted to homeowners in the 4170 and 4171 postcodes. Do not publish until reviewed.',
    destination_url: 'https://danielgierach.com/suburbs/morningside',
  },
  // LinkedIn - Homeowners Considering Selling
  {
    title: 'Homeowners Considering Selling',
    platform: 'linkedin',
    content_type: 'Post',
    caption: `Most of the conversations I have with homeowners before they list go the same way.

They have a number in their head. They want me to confirm it. And sometimes I can, but sometimes I have to tell them something different.

That second conversation is the more important one.

Selling a home in Bulimba, Hawthorne, Norman Park or anywhere in the inner east is a significant decision. Not just financially - the timing, the transition, what comes next. It involves real life, not just real estate.

What I've learned is that the sellers who make the best decisions are the ones who started with honest information, even when that information wasn't exactly what they hoped for. They planned around reality rather than around an optimistic estimate.

My job isn't to tell you your home is worth what you want it to be worth. It's to give you an accurate picture of the current market, what your property can achieve, and what the process actually looks like - so you can decide what's right for your situation.

If you're thinking about selling in the inner east and you want a straight conversation rather than a sales pitch, I'm happy to help.

danielgierach.com`,
    objective: 'Position Daniel as the honest, go-to agent for inner east Brisbane sellers. Drive appraisal enquiries.',
    content_pillar: 'seller',
    status: 'ready',
    scheduled_date: '2026-04-11',
    notes: 'Post from Daniel\'s personal LinkedIn profile, not the Ray White page. Best published Thursday 7-8am. Text-only post - no image required.',
    destination_url: 'https://danielgierach.com',
  },
  // LinkedIn Poll - RBA Rate Hike
  {
    title: 'LinkedIn Poll - RBA Rate Hike Impact on Brisbane Property',
    platform: 'linkedin',
    content_type: 'Poll',
    caption: `The RBA raised the cash rate to 4.10% in March 2026 - a 25 basis point hike that divided the board, with five members voting to increase and four voting to hold. The decision cited inflation picking up in the second half of 2025 and rising fuel costs from the Middle East conflict as key factors.

The next RBA meeting is May 5. Between now and then, Brisbane property keeps moving.

The data paints an interesting picture. Listings are down 25.9% year-on-year according to CoreLogic. Days on market in Brisbane sits at just 17 days. Buyers with approved finance are still competing hard. But mortgage costs at 4.10% are real, and serviceability is front of mind for a lot of would-be buyers.

With another potential decision a few weeks away - what do you think happens to Brisbane house prices over the next six months?`,
    objective: 'Drive engagement and position Daniel as an informed local expert on the rate environment',
    content_pillar: 'authority',
    status: 'ready',
    scheduled_date: '2026-04-13',
    notes: 'Poll options: "Prices keep rising - demand outweighs rate pressure" / "Prices plateau but hold firm" / "Prices soften slightly as buyers pull back" / "Too much uncertainty to call". Post Monday 7-8am. Verify March 2026 RBA decision at rba.gov.au before posting.',
    destination_url: null,
  },
]

// ── Run ───────────────────────────────────────────────────────────────────────

console.log(`\nSeeding ${rows.length} content items into Supabase...`)
try {
  const inserted = await insert(rows)
  console.log(`\n✓ Successfully inserted ${inserted.length} rows\n`)
  for (const row of inserted) {
    console.log(`  • [${row.platform}] ${row.title} — ${row.status} (${row.scheduled_date})`)
  }
  console.log()
} catch (err) {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
}
