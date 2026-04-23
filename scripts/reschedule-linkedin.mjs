#!/usr/bin/env node
/**
 * reschedule-linkedin.mjs
 *
 * Restores the original scheduling for all 1000 LinkedIn content items.
 * Posts are sorted by created_at and assigned sequentially to the
 * Tue / Wed / Thu posting slots, one post per slot, starting 21 Apr 2026.
 *
 * Run once:  node scripts/reschedule-linkedin.mjs
 */

import { readFileSync } from 'fs'

const KEY = readFileSync(new URL('../.env', import.meta.url), 'utf-8')
  .match(/^SUPABASE_KEY=(.+)$/m)?.[1]?.trim()

if (!KEY) { console.error('SUPABASE_KEY not found in .env'); process.exit(1) }

const BASE = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

// ── Fetch all LinkedIn items ordered by created_at ────────────────────────────

async function fetchPage(offset) {
  // Exclude posts the calendar has explicitly handled — these are the source of truth.
  // rejected/archived = Daniel removed them; posted = already live; do not touch.
  const r = await fetch(
    `${BASE}/rest/v1/content_items?platform=eq.linkedin&status=not.in.(rejected,archived,posted)&order=created_at.asc&select=id,created_at&limit=500&offset=${offset}`,
    { headers: HEADERS }
  )
  return r.json()
}

const [p1, p2] = await Promise.all([fetchPage(0), fetchPage(500)])
const items = [...p1, ...p2]
console.log(`Fetched ${items.length} LinkedIn items`)

// ── Generate Tue/Wed/Thu slots from 21 Apr 2026 ───────────────────────────────

function nextWeekday(date, targetDow) {
  const d = new Date(date)
  while (d.getUTCDay() !== targetDow) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

function iso(d) { return d.toISOString().split('T')[0] }

// Build the slot sequence: Tue, Wed, Thu, Tue, Wed, Thu … until we have enough
const SLOT_DAYS = [2, 3, 4] // Tue, Wed, Thu (UTC day numbers)
const HARD_STOP = new Date('2030-12-31T00:00:00Z') // Never schedule past this date

const slots = []
{
  const start = new Date('2026-04-21T00:00:00Z') // Known Tuesday
  const d = new Date(start)
  let slotIdx = 0
  while (slots.length < items.length) {
    if (d > HARD_STOP) {
      console.warn(`  WARN  Hard stop reached at 2030-12-31 — ${items.length - slots.length} items have no slot`)
      break
    }
    const targetDow = SLOT_DAYS[slotIdx % 3]
    if (d.getUTCDay() === targetDow) {
      slots.push(iso(d))
      slotIdx++
    }
    d.setUTCDate(d.getUTCDate() + 1)
  }
}

console.log(`Generated ${slots.length} slots`)
console.log(`First slot: ${slots[0]}  Last slot: ${slots[slots.length - 1]}`)

// ── Update in batches of 25 ───────────────────────────────────────────────────

async function patchItem(id, scheduled_date) {
  const r = await fetch(`${BASE}/rest/v1/content_items?id=eq.${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ scheduled_date, status: 'scheduled' }),
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`PATCH ${id} failed: ${txt}`)
  }
}

const BATCH = 25
let done = 0
for (let i = 0; i < items.length; i += BATCH) {
  const chunk = items.slice(i, i + BATCH)
  await Promise.all(chunk.map((item, j) => patchItem(item.id, slots[i + j])))
  done += chunk.length
  process.stdout.write(`\r  Updated ${done}/${items.length}…`)
}

console.log('\nDone ✓')
console.log(`Schedule runs ${slots[0]} → ${slots[slots.length - 1]}`)
