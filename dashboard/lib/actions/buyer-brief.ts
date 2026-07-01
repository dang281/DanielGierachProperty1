'use server'

import { createClient } from '@/lib/supabase/server'

export type BuyerBriefRow = {
  id: string
  monday_lead_id: string | null
  name: string
  phone: string | null
  email: string | null
  suburbs: string[]
  property_types: string[]
  beds_min: number
  beds_max: number | null
  baths_min: number
  baths_max: number | null
  car_min: number
  car_max: number | null
  block_min: number | null
  block_max: number | null
  price_min: number | null
  price_max: number | null
  extras: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export async function getBuyerBrief(monday_lead_id: string): Promise<BuyerBriefRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyer_briefs')
    .select('*')
    .eq('monday_lead_id', monday_lead_id)
    .maybeSingle()
  if (error) throw new Error(`Could not load brief: ${error.message}`)
  return (data ?? null) as BuyerBriefRow | null
}

export type SaveBriefInput = {
  monday_lead_id: string
  name: string
  phone?: string | null
  email?: string | null
  suburbs?: string[]
  property_types?: string[]
  beds_min?: number
  beds_max?: number | null
  baths_min?: number
  baths_max?: number | null
  car_min?: number
  car_max?: number | null
  block_min?: number | null
  block_max?: number | null
  price_min?: number | null
  price_max?: number | null
  extras?: string | null
  notes?: string | null
}

export async function upsertBuyerBrief(input: SaveBriefInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const existing = await getBuyerBrief(input.monday_lead_id)

  const row = {
    monday_lead_id: input.monday_lead_id,
    name:           input.name,
    phone:          input.phone           ?? null,
    email:          input.email           ?? null,
    suburbs:        input.suburbs         ?? [],
    property_types: input.property_types  ?? [],
    beds_min:       input.beds_min        ?? 0,
    beds_max:       input.beds_max        ?? null,
    baths_min:      input.baths_min       ?? 0,
    baths_max:      input.baths_max       ?? null,
    car_min:        input.car_min         ?? 0,
    car_max:        input.car_max         ?? null,
    block_min:      input.block_min       ?? null,
    block_max:      input.block_max       ?? null,
    price_min:      input.price_min       ?? null,
    price_max:      input.price_max       ?? null,
    extras:         input.extras          ?? null,
    notes:          input.notes           ?? null,
    status:         'active',
    user_id:        user?.id              ?? null,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('buyer_briefs')
      .update(row)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(`Update failed: ${error.message}`)
    return data as BuyerBriefRow
  } else {
    const { data, error } = await supabase
      .from('buyer_briefs')
      .insert(row)
      .select('*')
      .single()
    if (error) throw new Error(`Insert failed: ${error.message}`)
    return data as BuyerBriefRow
  }
}

// Find Pipeline/Properties rows matching a buyer brief. Used both inside the
// brief editor (instant "show me matches") and later in a nightly job that
// auto-notifies the agent when a new property hits a brief's window.
export async function findMatchesForBrief(monday_lead_id: string) {
  const brief = await getBuyerBrief(monday_lead_id)
  if (!brief) return []
  const supabase = await createClient()

  // Pull a sensible set of candidate sources: active deals (Properties board)
  // + the Pipeline board (sellers). Filter in JS — the data set is ~1k rows.
  const [{ data: properties }, { data: pipeline }] = await Promise.all([
    supabase.from('monday_properties').select('monday_item_id, name, monday_group_title, raw'),
    supabase.from('monday_pipeline_items').select('monday_item_id, name, monday_group_title, raw'),
  ])

  type Candidate = {
    slug: 'properties' | 'pipeline'
    monday_item_id: string
    name: string | null
    stage: string | null
    address: string | null
    suburb: string | null
    beds: number | null
    baths: number | null
    car: number | null
    block: number | null
    price: number | null
    raw: Record<string, { text?: string | null } | undefined>
  }

  function extractSuburb(addr: string | null): string | null {
    if (!addr) return null
    const parts = addr.split(',').map(s => s.trim())
    if (parts.length >= 2) return parts[1].replace(/\s+\d+.*$/, '').trim()
    return null
  }

  const candidates: Candidate[] = []
  for (const r of (properties ?? []) as Array<{ monday_item_id: string; name: string | null; monday_group_title: string | null; raw: Record<string, { text?: string | null } | undefined> }>) {
    const raw = r.raw
    const addr = raw?.property_address?.text ?? null
    candidates.push({
      slug: 'properties',
      monday_item_id: r.monday_item_id,
      name: r.name,
      stage: r.monday_group_title,
      address: addr,
      suburb: extractSuburb(addr),
      beds: parseInt(raw?.property_bedrooms?.text ?? '', 10) || null,
      baths: parseInt(raw?.property_bathrooms?.text ?? '', 10) || null,
      car: parseInt(raw?.dropdown_mktzmwbz?.text ?? '', 10) || null,
      block: parseInt(raw?.property_sqft?.text ?? '', 10) || null,
      price: parseFloat(raw?.property_price?.text ?? '') || null,
      raw,
    })
  }
  for (const r of (pipeline ?? []) as Array<{ monday_item_id: string; name: string | null; monday_group_title: string | null; raw: Record<string, { text?: string | null } | undefined> }>) {
    const raw = r.raw
    const addr = raw?.property_address?.text ?? r.name
    candidates.push({
      slug: 'pipeline',
      monday_item_id: r.monday_item_id,
      name: r.name,
      stage: r.monday_group_title,
      address: addr,
      suburb: extractSuburb(addr),
      beds: null, baths: null, car: null, block: null, price: null,
      raw,
    })
  }

  const wantedSuburbs = (brief.suburbs ?? []).map((s: string) => s.toLowerCase())
  const matches = candidates.filter(c => {
    if (wantedSuburbs.length > 0 && c.suburb) {
      if (!wantedSuburbs.some(s => c.suburb!.toLowerCase().includes(s))) return false
    }
    if (brief.beds_min  && c.beds  !== null && c.beds  < brief.beds_min)  return false
    if (brief.beds_max  && c.beds  !== null && c.beds  > brief.beds_max)  return false
    if (brief.baths_min && c.baths !== null && c.baths < brief.baths_min) return false
    if (brief.baths_max && c.baths !== null && c.baths > brief.baths_max) return false
    if (brief.car_min   && c.car   !== null && c.car   < brief.car_min)   return false
    if (brief.car_max   && c.car   !== null && c.car   > brief.car_max)   return false
    if (brief.block_min && c.block !== null && c.block < brief.block_min) return false
    if (brief.block_max && c.block !== null && c.block > brief.block_max) return false
    if (brief.price_min && c.price !== null && c.price < brief.price_min) return false
    if (brief.price_max && c.price !== null && c.price > brief.price_max) return false
    return true
  })

  return matches.slice(0, 50).map(m => ({
    slug: m.slug,
    monday_item_id: m.monday_item_id,
    name: m.name,
    stage: m.stage,
    suburb: m.suburb,
    beds: m.beds,
    baths: m.baths,
    block: m.block,
    price: m.price,
  }))
}
