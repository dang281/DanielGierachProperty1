import { createClient } from '@/lib/supabase/server'
import TodayView from './TodayView'
import type { TodayItem, ScoredCallSuggestion } from './today-types'

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

  // Sort by stage priority first (Hotstock → Warmstock → … → Lost), then by
  // urgency within that stage (oldest follow-up date first for overdue, name
  // alphabetical otherwise).
  const stagePriority = (it: TodayItem): number => {
    const g = (it.stage ?? '').toUpperCase()
    if (g.startsWith('HOTSTOCK'))         return 1
    if (g.startsWith('WARMSTOCK'))        return 2
    if (g.startsWith('HAPPY TO CHAT'))    return 3
    if (g.startsWith('UNSURE STOCK'))     return 4
    if (g.startsWith('NOT PICKING UP'))   return 5
    if (g.startsWith('UNFILTERED'))       return 6
    if (g.startsWith('OFF-MARKET'))       return 7
    if (g.startsWith('FROM OPEN HOMES'))  return 8
    if (g.startsWith('AUTO BUY TO SELL')) return 9
    if (g.startsWith('BUYERS OF PROPERTIES')) return 10
    if (g.startsWith('SCANNED QR'))       return 11
    if (g.startsWith('NOT INTERESTED'))   return 12
    if (g.startsWith('LOST'))             return 13
    return 50
  }
  const byStageThen = (key: (it: TodayItem) => string) =>
    (a: TodayItem, b: TodayItem) => {
      const sa = stagePriority(a), sb = stagePriority(b)
      if (sa !== sb) return sa - sb
      return key(a).localeCompare(key(b))
    }

  overdue.sort(byStageThen(it => it.follow_up ?? ''))
  todayList.sort(byStageThen(it => it.name ?? ''))
  saturday.sort(byStageThen(it => it.name ?? ''))

  // ── "Top 5 to call now" — heuristic ranking across pipeline rows.
  // Reads notes, stage, follow-up urgency, NVML, and appraisal status to pick
  // the 5 highest-signal contacts. No external AI required.
  function scorePipelineRow(p: RawRow): { score: number; reasons: string[] } | null {
    const raw = p.raw ?? {}
    const stage = (p.monday_group_title ?? '').toUpperCase()
    if (stage.startsWith('LOST') || stage.startsWith('NOT INTERESTED')) return null

    const reasons: string[] = []
    let score = 0

    // Base by stage
    if (stage.startsWith('HOTSTOCK'))         { score += 100; reasons.push('Hotstock') }
    else if (stage.startsWith('WARMSTOCK'))   { score += 60;  reasons.push('Warmstock') }
    else if (stage.startsWith('HAPPY TO CHAT')) { score += 40; reasons.push('Happy-to-chat') }
    else if (stage.startsWith('UNSURE STOCK')) { score += 30; reasons.push('Unsure') }
    else if (stage.startsWith('NOT PICKING UP')) { score += 25; reasons.push('Not picking up') }
    else if (stage.startsWith('OFF-MARKET'))  { score += 20; reasons.push('Off-market') }

    // Follow-up urgency
    const fu = (raw.date_mkvwk1we as { text?: string | null } | undefined)?.text
    if (fu) {
      const fuDate = new Date(fu)
      const today = new Date(); today.setHours(0,0,0,0)
      const cell = new Date(fuDate.getFullYear(), fuDate.getMonth(), fuDate.getDate())
      const daysOverdue = Math.floor((today.getTime() - cell.getTime()) / 86400000)
      if (daysOverdue > 0) {
        const bump = Math.min(daysOverdue * 5, 80)
        score += bump
        reasons.push(`${daysOverdue}d overdue follow-up`)
      } else if (daysOverdue === 0) {
        score += 35; reasons.push('Follow-up due today')
      }
    }

    // NVML — invested touches
    const nvml = (raw.color_mm3jcha2 as { text?: string | null } | undefined)?.text
    if (nvml === 'NVML 3')      { score += 40; reasons.push('3 NVML attempts — don\'t lose them') }
    else if (nvml === 'NVML 2') { score += 25; reasons.push('2 NVML attempts') }
    else if (nvml === 'NVML')   { score += 15; reasons.push('NVML logged') }
    else if (nvml === 'SATURDAY CALL') { score += 30; reasons.push('Saturday-call queue') }

    // Appraisal signals
    const appraised = (raw.color_mm0dp0q8 as { text?: string | null } | undefined)?.text
    if (appraised === 'BOOKED') { score += 80; reasons.push('Appraisal BOOKED') }
    else if (appraised === 'YES') { score += 50; reasons.push('Already appraised') }

    // Note keyword scan — Daniel-tuned signals
    const notes = [
      (raw.long_text_mkvwnqqp as { text?: string | null } | undefined)?.text,
      (raw.long_text_mm35hdg2 as { text?: string | null } | undefined)?.text,
      (raw.long_text_mm3xdjdm as { text?: string | null } | undefined)?.text,
      (raw.long_text_mm35b58k as { text?: string | null } | undefined)?.text,
    ].filter((s): s is string => !!s).join(' ').toLowerCase()
    if (notes) {
      if (/\b(selling|sell soon|will sell|want to sell)\b/.test(notes))  { score += 60; reasons.push('Notes mention selling') }
      if (/\b(spring|next year|early next|coming months)\b/.test(notes)) { score += 30; reasons.push('Notes signal timing') }
      if (/\b(another agent|competitor|other agents|interview)\b/.test(notes)) { score += 50; reasons.push('Competitor risk') }
      if (/\b(thinking|considering|might|deciding)\b/.test(notes))       { score += 25; reasons.push('Considering selling') }
      if (/\b(price|value|valuation|estimate)\b/.test(notes))            { score += 30; reasons.push('Price interest') }
      if (/\b(divorce|deceased|estate|relocat|move)\b/.test(notes))      { score += 40; reasons.push('Life-event signal') }
    }

    return { score, reasons: reasons.slice(0, 3) }
  }

  const scored: ScoredCallSuggestion[] = []
  for (const r of (pipeline.data ?? []) as RawRow[]) {
    const res = scorePipelineRow(r)
    if (!res || res.score <= 30) continue
    scored.push({
      slug: 'pipeline',
      monday_item_id: r.monday_item_id,
      name: r.name,
      stage: r.monday_group_title,
      phone: r.raw?.phone_mkvdbvr4?.text ?? null,
      email: r.raw?.email_mkwpd6dn?.text ?? null,
      follow_up: r.raw?.date_mkvwk1we?.text ?? null,
      nvml: r.raw?.color_mm3jcha2?.text ?? null,
      score: res.score,
      reasons: res.reasons,
    })
  }
  scored.sort((a, b) => b.score - a.score)
  const topFive = scored.slice(0, 5)

  return (
    <TodayView
      overdue={overdue}
      today={todayList}
      saturday={saturday}
      topFive={topFive}
      todayDateLabel={today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
    />
  )
}
