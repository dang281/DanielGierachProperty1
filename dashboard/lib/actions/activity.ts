'use server'

import { createClient } from '@/lib/supabase/server'

const BOARD_TABLES: Record<string, string> = {
  pipeline:   'monday_pipeline_items',
  contacts:   'monday_contacts',
  leads:      'monday_leads',
  properties: 'monday_properties',
  referrals:  'monday_referrals',
}

// NVML increment ladder. Pipeline column id = color_mm3jcha2.
const NVML_NEXT: Record<string, string> = {
  '':              'NVML',
  'NVML':          'NVML 2',
  'NVML 2':        'NVML 3',
  'NVML 3':        'SATURDAY CALL',
  'SATURDAY CALL': 'SATURDAY CALL',
}

const FOLLOW_UP_COLUMN: Record<string, string> = {
  pipeline:   'date_mkvwk1we',
  properties: 'date_mkvd8wke',
  leads:      'date_mktztctz',
  referrals:  'date_mktztctz',
}

export type ActivityType =
  | 'call_connected'
  | 'call_nvml'
  | 'note'
  | 'status_change'
  | 'follow_up_set'
  | 'appraisal_booked'
  | 'meeting_scheduled'
  | 'email_sent'
  | 'sms_sent'
  | 'import_note'

export type ActivityEntry = {
  id: string
  monday_item_id: string
  board_slug: string
  activity_type: ActivityType
  payload: Record<string, unknown>
  body: string | null
  created_at: string
}

export async function listContactActivity(params: {
  slug: string
  itemId: string
}): Promise<ActivityEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_activity')
    .select('id, monday_item_id, board_slug, activity_type, payload, body, created_at')
    .eq('board_slug', params.slug)
    .eq('monday_item_id', params.itemId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load activity: ${error.message}`)
  return (data ?? []) as ActivityEntry[]
}

async function logActivity(params: {
  slug: string
  itemId: string
  activity_type: ActivityType
  body?: string | null
  payload?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('contact_activity')
    .insert({
      board_slug: params.slug,
      monday_item_id: params.itemId,
      activity_type: params.activity_type,
      body: params.body ?? null,
      payload: params.payload ?? {},
      user_id: user?.id ?? null,
    })
    .select('id, monday_item_id, board_slug, activity_type, payload, body, created_at')
    .single()
  if (error) throw new Error(`Could not log activity: ${error.message}`)
  return data as ActivityEntry
}

async function patchRawCell(slug: string, itemId: string, columnId: string, text: string | null) {
  const table = BOARD_TABLES[slug]
  if (!table) throw new Error(`Unknown slug: ${slug}`)
  const supabase = await createClient()
  const { data: row, error: fetchErr } = await supabase
    .from(table)
    .select('raw')
    .eq('monday_item_id', itemId)
    .single()
  if (fetchErr) throw new Error(`Could not load row: ${fetchErr.message}`)
  const raw = (row?.raw ?? {}) as Record<string, { type: string; text: string | null; value: string | null }>
  const next = {
    ...raw,
    [columnId]: {
      type: raw[columnId]?.type ?? 'text',
      text,
      value: raw[columnId]?.value ?? null,
    },
  }
  const { error: updErr } = await supabase
    .from(table)
    .update({ raw: next })
    .eq('monday_item_id', itemId)
  if (updErr) throw new Error(`Could not save: ${updErr.message}`)
}

function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// --- Quick Actions -----------------------------------------------------------

export async function quickActionCallConnected(params: {
  slug: string
  itemId: string
  note?: string
  followUpDays?: number  // default 7
}) {
  // Reset NVML, log activity, optionally set follow-up
  if (params.slug === 'pipeline') {
    await patchRawCell(params.slug, params.itemId, 'color_mm3jcha2', null)
  }
  const followUpCol = FOLLOW_UP_COLUMN[params.slug]
  let nextFollowUp: string | null = null
  if (followUpCol) {
    nextFollowUp = addDaysISO(params.followUpDays ?? 7)
    await patchRawCell(params.slug, params.itemId, followUpCol, nextFollowUp)
  }
  const entry = await logActivity({
    slug: params.slug,
    itemId: params.itemId,
    activity_type: 'call_connected',
    body: params.note ?? null,
    payload: nextFollowUp ? { next_follow_up: nextFollowUp } : {},
  })
  return { ok: true as const, entry, nextFollowUp }
}

export async function quickActionCallNvml(params: {
  slug: string
  itemId: string
  note?: string
  followUpDays?: number  // default 2
}) {
  // Increment NVML, log activity, set short follow-up
  let prevNvml: string | null = null
  let nextNvml: string | null = null
  if (params.slug === 'pipeline') {
    const supabase = await createClient()
    const { data: row } = await supabase
      .from('monday_pipeline_items')
      .select('raw')
      .eq('monday_item_id', params.itemId)
      .single()
    const raw = (row?.raw ?? {}) as Record<string, { text?: string | null } | undefined>
    prevNvml = raw?.color_mm3jcha2?.text ?? null
    const key = prevNvml ?? ''
    nextNvml = NVML_NEXT[key] ?? 'NVML'
    await patchRawCell(params.slug, params.itemId, 'color_mm3jcha2', nextNvml)
  }
  const followUpCol = FOLLOW_UP_COLUMN[params.slug]
  let nextFollowUp: string | null = null
  if (followUpCol) {
    nextFollowUp = addDaysISO(params.followUpDays ?? 2)
    await patchRawCell(params.slug, params.itemId, followUpCol, nextFollowUp)
  }
  const entry = await logActivity({
    slug: params.slug,
    itemId: params.itemId,
    activity_type: 'call_nvml',
    body: params.note ?? null,
    payload: { prev_nvml: prevNvml, next_nvml: nextNvml, next_follow_up: nextFollowUp },
  })
  return { ok: true as const, entry, nextNvml, nextFollowUp }
}

export async function quickActionNote(params: {
  slug: string
  itemId: string
  body: string
}) {
  if (!params.body.trim()) return { ok: false as const, reason: 'empty' }
  const entry = await logActivity({
    slug: params.slug,
    itemId: params.itemId,
    activity_type: 'note',
    body: params.body.trim(),
  })
  return { ok: true as const, entry }
}

export async function quickActionSetFollowUp(params: {
  slug: string
  itemId: string
  date: string  // YYYY-MM-DD
}) {
  const col = FOLLOW_UP_COLUMN[params.slug]
  if (col) await patchRawCell(params.slug, params.itemId, col, params.date)
  const entry = await logActivity({
    slug: params.slug,
    itemId: params.itemId,
    activity_type: 'follow_up_set',
    payload: { follow_up_date: params.date },
  })
  return { ok: true as const, entry, followUp: params.date }
}

export async function quickActionBookAppraisal(params: {
  slug: string
  itemId: string
  date?: string
  note?: string
}) {
  if (params.slug === 'pipeline') {
    await patchRawCell(params.slug, params.itemId, 'color_mm0dp0q8', 'BOOKED')
    if (params.date) {
      await patchRawCell(params.slug, params.itemId, 'date_mkzjzxnd', params.date)
    }
  }
  const entry = await logActivity({
    slug: params.slug,
    itemId: params.itemId,
    activity_type: 'appraisal_booked',
    body: params.note ?? null,
    payload: params.date ? { appraisal_date: params.date } : {},
  })
  return { ok: true as const, entry, appraisalDate: params.date ?? null }
}

export async function deleteActivityEntry(params: { id: string }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_activity')
    .delete()
    .eq('id', params.id)
  if (error) throw new Error(`Could not delete: ${error.message}`)
  return { ok: true as const }
}
