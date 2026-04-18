import { createClient } from '@/lib/supabase/server'
import PlanningClient from './PlanningClient'
import type { ContentItem } from '@/types/content'

// Calculate the 6 posting dates for the next two weeks (Tue/Wed/Thu × 2)
// Uses Brisbane time (UTC+10)
function getTwoWeekDates() {
  const now     = new Date(Date.now() + 10 * 60 * 60 * 1000) // Brisbane
  const dow     = now.getUTCDay() // 0=Sun 1=Mon … 6=Sat
  const toMon   = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow   // days to next Monday

  const add = (base: Date, days: number): string => {
    const d = new Date(base)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().split('T')[0]
  }

  return {
    w1tue: add(now, toMon + 1),
    w1wed: add(now, toMon + 2),
    w1thu: add(now, toMon + 3),
    w2tue: add(now, toMon + 8),
    w2wed: add(now, toMon + 9),
    w2thu: add(now, toMon + 10),
  }
}

export default async function PlanningPage() {
  const supabase = await createClient()
  const dates    = getTwoWeekDates()
  const slotDates = Object.values(dates)

  // Library: all ready/idea LinkedIn posts
  const { data: library } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .in('status', ['ready', 'idea'])
    .order('created_at', { ascending: false })

  // Pre-filled: already-scheduled posts landing on one of the 6 slot dates
  const { data: preFilled } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('status', 'scheduled')
    .in('scheduled_date', slotDates)

  // Count issued field guides so we can assign the next issue numbers
  const { count: fieldGuideCount } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'linkedin')
    .in('status', ['scheduled', 'posted'])
    .or('title.ilike.%Article Feature%,title.ilike.%Field Guide%')

  return (
    <PlanningClient
      libraryPosts={(library ?? []) as ContentItem[]}
      preFilled={(preFilled ?? []) as ContentItem[]}
      dates={dates}
      nextFieldGuideIssue={(fieldGuideCount ?? 0) + 1}
    />
  )
}
