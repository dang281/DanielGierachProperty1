'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const BOARD_TABLES: Record<string, string> = {
  pipeline:   'monday_pipeline_items',
  contacts:   'monday_contacts',
  leads:      'monday_leads',
  properties: 'monday_properties',
  referrals:  'monday_referrals',
}

const SLUG_TO_BOARD_ID: Record<string, string> = {
  pipeline:   '2076186563',
  contacts:   '2060096425',
  leads:      '2060874428',
  properties: '2067629054',
  referrals:  '2061163472',
}

type RawCell = { type: string; text: string | null; value: string | null }

export async function updateBoardCell(params: {
  slug: string
  itemId: string
  columnId: string
  columnType: string
  text: string | null
}) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)

  const supabase = await createClient()

  const { data: existing, error: fetchErr } = await supabase
    .from(table)
    .select('raw')
    .eq('monday_item_id', params.itemId)
    .single()

  if (fetchErr) throw new Error(`Could not load row: ${fetchErr.message}`)

  const raw = (existing?.raw ?? {}) as Record<string, RawCell>
  const next: Record<string, RawCell> = {
    ...raw,
    [params.columnId]: {
      type: params.columnType,
      text: params.text,
      value: raw[params.columnId]?.value ?? null,
    },
  }

  const patch: Record<string, unknown> = { raw: next }
  if (params.columnId === 'name' && params.text !== null) {
    patch.name = params.text
  }

  const { error: updErr } = await supabase
    .from(table)
    .update(patch)
    .eq('monday_item_id', params.itemId)

  if (updErr) throw new Error(`Could not save: ${updErr.message}`)

  // Auto-sync Buy To Sell items into the Buyers board.
  if (params.slug === 'pipeline' && params.columnId === 'color_mm0dpras') {
    try { await syncBuyToSellToBuyers() } catch (e) { console.error('BTS sync failed', e) }
  }

  return { ok: true as const }
}

export async function addBoardItem(params: {
  slug: string
  groupTitle: string
  name: string
}) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)
  const supabase = await createClient()

  const { data: sibling } = await supabase
    .from(table)
    .select('monday_group_id')
    .eq('monday_group_title', params.groupTitle)
    .limit(1)
    .maybeSingle()

  const monday_item_id = `local-${crypto.randomUUID()}`
  const nowIso = new Date().toISOString()

  const { error } = await supabase.from(table).insert({
    monday_item_id,
    name: params.name,
    monday_group_id:    sibling?.monday_group_id ?? null,
    monday_group_title: params.groupTitle,
    raw: {},
    created_at_monday: nowIso,
    updated_at_monday: nowIso,
  })
  if (error) throw new Error(`Could not add item: ${error.message}`)

  return { ok: true as const, monday_item_id }
}

export async function moveItemToGroup(params: { slug: string; itemId: string; groupTitle: string }) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)
  const supabase = await createClient()

  const { data: sibling } = await supabase
    .from(table)
    .select('monday_group_id')
    .eq('monday_group_title', params.groupTitle)
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from(table)
    .update({
      monday_group_title: params.groupTitle,
      monday_group_id:    sibling?.monday_group_id ?? null,
    })
    .eq('monday_item_id', params.itemId)
  if (error) throw new Error(`Could not move: ${error.message}`)
  return { ok: true as const }
}

export async function bulkDeleteItems(params: { slug: string; itemIds: string[] }) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)
  if (params.itemIds.length === 0) return { ok: true as const }
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().in('monday_item_id', params.itemIds)
  if (error) throw new Error(`Could not bulk delete: ${error.message}`)
  return { ok: true as const }
}

export async function bulkMoveItems(params: { slug: string; itemIds: string[]; groupTitle: string }) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)
  if (params.itemIds.length === 0) return { ok: true as const }
  const supabase = await createClient()
  const { data: sibling } = await supabase
    .from(table)
    .select('monday_group_id')
    .eq('monday_group_title', params.groupTitle)
    .limit(1)
    .maybeSingle()
  const { error } = await supabase
    .from(table)
    .update({ monday_group_title: params.groupTitle, monday_group_id: sibling?.monday_group_id ?? null })
    .in('monday_item_id', params.itemIds)
  if (error) throw new Error(`Could not bulk move: ${error.message}`)
  return { ok: true as const }
}

export async function getLinkedItem(itemId: string) {
  const supabase = await createClient()
  for (const [slug, table] of Object.entries(BOARD_TABLES)) {
    const { data: row } = await supabase
      .from(table)
      .select('monday_item_id, name, monday_group_title, raw, updated_at_monday')
      .eq('monday_item_id', itemId)
      .maybeSingle()
    if (row) {
      const { data: cols } = await supabase
        .from('monday_board_columns')
        .select('column_id, title, column_type, position, settings')
        .eq('board_id', SLUG_TO_BOARD_ID[slug])
        .order('position', { ascending: true })
      return { slug, item: row, columns: cols ?? [] }
    }
  }
  return null
}

export async function listItemUpdates(params: { slug: string; itemId: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monday_item_updates')
    .select('id, body, created_at')
    .eq('board_slug', params.slug)
    .eq('monday_item_id', params.itemId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load updates: ${error.message}`)
  return (data ?? []) as Array<{ id: string; body: string; created_at: string }>
}

export async function addItemUpdate(params: { slug: string; itemId: string; body: string }) {
  if (!params.body.trim()) return { ok: false as const, reason: 'empty' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('monday_item_updates')
    .insert({
      board_slug: params.slug,
      monday_item_id: params.itemId,
      body: params.body.trim(),
      user_id: user?.id ?? null,
    })
    .select('id, body, created_at')
    .single()
  if (error) throw new Error(`Could not post update: ${error.message}`)
  return { ok: true as const, update: data }
}

export async function deleteItemUpdate(params: { slug: string; updateId: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('monday_item_updates').delete().eq('id', params.updateId)
  if (error) throw new Error(`Could not delete update: ${error.message}`)
  return { ok: true as const }
}

// When a Pipeline item's "Buy To Sell?" column = "BUY TO SELL", mirror that
// row into monday_leads under the auto group so it shows on /app/board/leads.
// Idempotent: re-running adds new matches, removes rows whose source no longer
// qualifies. Auto rows are tagged with monday_item_id = `auto-bts-<pipeline_id>`
// so manual Buyers rows are never touched.
const AUTO_BTS_GROUP = 'Auto Buy to Sell'
const AUTO_BTS_PREFIX = 'auto-bts-'

export async function syncBuyToSellToBuyers() {
  const supabase = await createClient()

  const { data: pipeline, error: pErr } = await supabase
    .from('monday_pipeline_items')
    .select('monday_item_id, name, raw')
  if (pErr) throw new Error(`Could not read pipeline: ${pErr.message}`)

  const qualifying = (pipeline ?? []).filter(p => {
    const cell = (p.raw as Record<string, { text?: string } | undefined>)?.color_mm0dpras
    return cell?.text === 'BUY TO SELL'
  })

  const expectedAutoIds = new Set(qualifying.map(p => `${AUTO_BTS_PREFIX}${p.monday_item_id}`))

  const { data: existingAuto } = await supabase
    .from('monday_leads')
    .select('monday_item_id')
    .like('monday_item_id', `${AUTO_BTS_PREFIX}%`)

  const existingIds = new Set((existingAuto ?? []).map(r => r.monday_item_id as string))

  const toInsert = qualifying
    .filter(p => !existingIds.has(`${AUTO_BTS_PREFIX}${p.monday_item_id}`))
    .map(p => {
      const raw = p.raw as Record<string, { type?: string; text?: string | null; value?: string | null } | undefined>
      return {
        monday_item_id:     `${AUTO_BTS_PREFIX}${p.monday_item_id}`,
        name:               p.name,
        monday_group_id:    'auto_buy_to_sell',
        monday_group_title: AUTO_BTS_GROUP,
        raw: {
          source_pipeline_id: { type: 'text', text: p.monday_item_id, value: null },
          contact_phone:      { type: 'phone',     text: raw?.phone_mkvdbvr4?.text ?? null,    value: null },
          contact_email:      { type: 'email',     text: raw?.email_mkwpd6dn?.text ?? null,    value: null },
          property_address:   { type: 'location',  text: raw?.property_address?.text ?? null,  value: null },
          long_text_mkv4gyn8: { type: 'long_text', text: raw?.long_text_mkvwnqqp?.text ?? null, value: null },
          date_mktztctz:      { type: 'date',      text: raw?.date_mkvwk1we?.text ?? null,     value: null },
        },
        created_at_monday: new Date().toISOString(),
        updated_at_monday: new Date().toISOString(),
      }
    })

  if (toInsert.length > 0) {
    const { error } = await supabase.from('monday_leads').upsert(toInsert, { onConflict: 'monday_item_id' })
    if (error) throw new Error(`Insert failed: ${error.message}`)
  }

  const toDelete = Array.from(existingIds).filter(id => !expectedAutoIds.has(id))
  if (toDelete.length > 0) {
    const { error } = await supabase.from('monday_leads').delete().in('monday_item_id', toDelete)
    if (error) throw new Error(`Delete failed: ${error.message}`)
  }

  return { added: toInsert.length, removed: toDelete.length, total: expectedAutoIds.size }
}

export async function deleteBoardItem(params: { slug: string; itemId: string }) {
  const table = BOARD_TABLES[params.slug]
  if (!table) throw new Error(`Unknown board slug: ${params.slug}`)
  const supabase = await createClient()
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('monday_item_id', params.itemId)
  if (error) throw new Error(`Could not delete: ${error.message}`)
  return { ok: true as const }
}
