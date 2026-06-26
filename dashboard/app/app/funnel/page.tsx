import { createClient } from '@/lib/supabase/server'
import FunnelView from './FunnelView'

export const revalidate = 60

// Stage groupings — collapse Pipeline's groups into the funnel stages Daniel
// thinks about: Unfiltered → Considering (Warmstock/Happy to Chat) → Hot
// (Hotstock) → Booked Appraisal → Listing → Sold.
function classifyStage(group: string | null): string {
  if (!group) return 'Other'
  const g = group.toUpperCase()
  if (g.startsWith('UNFILTERED'))                        return 'Unfiltered'
  if (g.startsWith('NOT PICKING UP') || g.startsWith('UNSURE')) return 'Trying to reach'
  if (g.startsWith('HAPPY TO CHAT') || g.startsWith('WARMSTOCK')) return 'Considering'
  if (g.startsWith('HOTSTOCK'))                          return 'Hotstock'
  if (g.startsWith('OFF-MARKET'))                        return 'Off-Market'
  if (g.startsWith('NOT INTERESTED') || g.startsWith('LOST')) return 'Lost'
  if (g.startsWith('BUYERS OF PROPERTIES'))              return 'Past Buyers'
  return 'Other'
}

const FUNNEL_ORDER = [
  'Unfiltered',
  'Trying to reach',
  'Considering',
  'Hotstock',
  'Off-Market',
  'Past Buyers',
  'Lost',
  'Other',
]

export default async function FunnelPage() {
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const [{ data: pipeline }, { data: activityWeek }, { data: activityPrev }, { data: appraisalsBooked }] = await Promise.all([
    supabase
      .from('monday_pipeline_items')
      .select('monday_group_title, raw'),
    supabase
      .from('contact_activity')
      .select('activity_type, board_slug, monday_item_id, created_at')
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('contact_activity')
      .select('activity_type, board_slug, created_at')
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('monday_pipeline_items')
      .select('monday_item_id, name, raw')
      .filter('raw->color_mm0dp0q8->>text', 'eq', 'BOOKED'),
  ])

  const stageCounts = new Map<string, number>()
  let totalPipeline = 0
  let nvmlTotal = 0
  let saturdayCallTotal = 0
  let appraisedYes = 0

  for (const row of pipeline ?? []) {
    const r = row as { monday_group_title: string | null; raw: Record<string, { text?: string | null } | undefined> }
    const stage = classifyStage(r.monday_group_title)
    stageCounts.set(stage, (stageCounts.get(stage) ?? 0) + 1)
    totalPipeline++
    const nvml = r.raw?.color_mm3jcha2?.text
    if (nvml && nvml !== '') nvmlTotal++
    if (nvml === 'SATURDAY CALL') saturdayCallTotal++
    if (r.raw?.color_mm0dp0q8?.text === 'YES') appraisedYes++
  }

  // Count activity types this week vs last week.
  const countByType = (rows: { activity_type: string }[] | null | undefined) => {
    const m: Record<string, number> = {}
    for (const r of rows ?? []) m[r.activity_type] = (m[r.activity_type] ?? 0) + 1
    return m
  }
  const week  = countByType(activityWeek)
  const prev  = countByType(activityPrev)

  const orderedStages = FUNNEL_ORDER
    .filter(s => (stageCounts.get(s) ?? 0) > 0)
    .map(s => ({ stage: s, count: stageCounts.get(s) ?? 0 }))

  return (
    <FunnelView
      stages={orderedStages}
      totalPipeline={totalPipeline}
      nvmlTotal={nvmlTotal}
      saturdayCallTotal={saturdayCallTotal}
      appraisedYes={appraisedYes}
      appraisalsBookedTotal={(appraisalsBooked ?? []).length}
      week={week}
      prev={prev}
    />
  )
}
