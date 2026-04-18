import { createClient } from '@/lib/supabase/server'
import { getContentItems } from '@/lib/actions/content'
import { getSeoSchedule } from '@/lib/actions/seo-schedule'
import PlanningClient from './PlanningClient'
import type { ContentItem } from '@/types/content'

export default async function PlanningPage() {
  const supabase = await createClient()

  // Brisbane "today" for both views
  const baseDate = new Date(Date.now() + 10 * 60 * 60 * 1000)
    .toISOString().split('T')[0]
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })

  // Fetch everything both views need in parallel
  const [socialItems, seoItems, libraryResult, allScheduledResult, fieldGuideResult] =
    await Promise.all([
      getContentItems(),
      getSeoSchedule(),

      // Planning: all ready/idea LinkedIn posts (oldest first for suggestions)
      supabase
        .from('content_items')
        .select('*')
        .eq('platform', 'linkedin')
        .in('status', ['ready', 'idea'])
        .order('created_at', { ascending: true }),

      // Planning: all scheduled LinkedIn posts (client filters by week)
      supabase
        .from('content_items')
        .select('*')
        .eq('platform', 'linkedin')
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true }),

      // Planning: count field guides for issue numbering
      supabase
        .from('content_items')
        .select('*', { count: 'exact', head: true })
        .eq('platform', 'linkedin')
        .in('status', ['scheduled', 'posted'])
        .or('title.ilike.%Article Feature%,title.ilike.%Field Guide%'),
    ])

  // Calendar view: all content items + SEO articles merged
  const calendarItems: ContentItem[] = [...socialItems, ...seoItems]

  return (
    <PlanningClient
      libraryPosts={(libraryResult.data ?? []) as ContentItem[]}
      allScheduled={(allScheduledResult.data ?? []) as ContentItem[]}
      calendarItems={calendarItems}
      baseDate={baseDate}
      today={today}
      nextFieldGuideIssue={(fieldGuideResult.count ?? 0) + 1}
    />
  )
}
