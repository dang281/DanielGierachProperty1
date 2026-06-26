import { createClient } from '@/lib/supabase/server'
import TodayView from './TodayView'
import type { TodayItem } from './today-types'

// Refresh cache every 30s.
export const revalidate = 30

const FOLLOW_UP_COLS: Record<string, string> = {
  pipeline:   'date_mkvwk1we',
  leads:      'date_mktztctz',
  referrals:  'date_mktztctz',
  properties: 'date_mkvd8wke',
}

type RawRow = {
  monday_item_id: string
  name: string | null
  monday_group_title: string | null
  raw: Record<string, { text?: string | null } | undefined> | null
}

function pickRow(slug: string, r: RawRow): TodayItem {
  const followUpCol = FOLLOW_UP_COLS[slug]
  const followUpDate = followUpCol ? (r.raw?.[followUpCol]?.text ?? null) : null
  const nvml         = slug === 'pipeline' ? (r.raw?.color_mm3jcha2?.text ?? null) : null
  const phone        = r.raw?.phone_mkvdbvr4?.text ?? r.raw?.contact_phone?.text ?? r.raw?.phone_mkvvdhxc?.text ?? null
  const email        = r.raw?.email_mkwpd6dn?.text ?? r.raw?.contact_email?.text ?? null
  return {
    slug,
    monday_item_id: r.monday_item_id,
    name:           r.name,
    stage:          r.monday_group_title,
    follow_up:      followUpDate,
    nvml,
    phone,
    email,
  }
}

function classify(item: TodayItem, today: string): 'overdue' | 'today' | 'saturday' | null {
  if (item.follow_up) {
    if (item.follow_up < today) return 'overdue'
    if (item.follow_up === today) return 'today'
  }
  if (item.nvml === 'SATURDAY CALL') return 'saturday'
  return null
}

export default async function TodayPage() {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const [pipeline, leads, referrals] = await Promise.all([
    supabase
      .from('monday_pipeline_items')
      .select('monday_item_id, name, monday_group_title, raw'),
    supabase
      .from('monday_leads')
      .select('monday_item_id, name, monday_group_title, raw'),
    supabase
      .from('monday_referrals')
      .select('monday_item_id, name, monday_group_title, raw'),
  ])

  const all: TodayItem[] = []
  for (const r of (pipeline.data ?? []) as RawRow[])   all.push(pickRow('pipeline',  r))
  for (const r of (leads.data ?? []) as RawRow[])      all.push(pickRow('leads',     r))
  for (const r of (referrals.data ?? []) as RawRow[])  all.push(pickRow('referrals', r))

  const overdue:   TodayItem[] = []
  const todayList: TodayItem[] = []
  const saturday:  TodayItem[] = []

  for (const it of all) {
    const k = classify(it, todayStr)
    if (k === 'overdue')   overdue.push(it)
    else if (k === 'today') todayList.push(it)
    else if (k === 'saturday') saturday.push(it)
  }

  overdue.sort((a, b) => (a.follow_up ?? '').localeCompare(b.follow_up ?? ''))
  todayList.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  saturday.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

  return (
    <TodayView
      overdue={overdue}
      today={todayList}
      saturday={saturday}
      todayDateLabel={today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
    />
  )
}
