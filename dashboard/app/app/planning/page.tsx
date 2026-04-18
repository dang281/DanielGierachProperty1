import { createClient } from '@/lib/supabase/server'
import PlanningClient from './PlanningClient'
import type { ContentItem } from '@/types/content'

export default async function PlanningPage() {
  const supabase = await createClient()

  // Brisbane "today" — passed to client so it can compute any week offset
  const baseDate = new Date(Date.now() + 10 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  // Library: all ready/idea LinkedIn posts (oldest first for suggestions)
  const { data: library } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .in('status', ['ready', 'idea'])
    .order('created_at', { ascending: true })

  // All scheduled LinkedIn posts — client filters by whichever week is shown
  const { data: allScheduled } = await supabase
    .from('content_items')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true })

  // Count issued field guides for issue numbering
  const { count: fieldGuideCount } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('platform', 'linkedin')
    .in('status', ['scheduled', 'posted'])
    .or('title.ilike.%Article Feature%,title.ilike.%Field Guide%')

  return (
    <PlanningClient
      libraryPosts={(library ?? []) as ContentItem[]}
      allScheduled={(allScheduled ?? []) as ContentItem[]}
      baseDate={baseDate}
      nextFieldGuideIssue={(fieldGuideCount ?? 0) + 1}
    />
  )
}
