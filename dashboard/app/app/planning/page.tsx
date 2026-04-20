import { getContentItems } from '@/lib/actions/content'
import { getIssues } from '@/lib/actions/paperclip'
import { getSeoSchedule } from '@/lib/actions/seo-schedule'
import PlanningView from './PlanningView'
import CalendarGlossary from './CalendarGlossary'
import type { ContentItem } from '@/types/content'
import type { Issue } from '@/types/paperclip'

export default async function SocialMediaPage() {
  const [socialItems, seoItems, allIssues] = await Promise.all([
    getContentItems(),
    getSeoSchedule(),
    getIssues(),
  ])

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })

  // Calendar: all platforms, no archived
  const activeItems = socialItems.filter(i => i.status !== 'archived')
  const allItems: ContentItem[] = [...activeItems, ...seoItems as ContentItem[]]

  // Library: LinkedIn + Facebook only, no archived, no scheduled date (unscheduled posts only)
  const libraryItems = socialItems.filter(i =>
    i.status !== 'archived' &&
    ['linkedin', 'facebook'].includes(i.platform) &&
    !i.scheduled_date
  )

  // Change requests
  const pendingFeedback = socialItems.filter(i => i.visual_feedback)
  const issuesByPost: Record<string, Issue> = {}
  for (const item of pendingFeedback) {
    const match = allIssues.find(issue =>
      issue.title.includes(`"${item.title}"`) &&
      !['done', 'cancelled'].includes(issue.status)
    )
    if (match) issuesByPost[item.id] = match
  }

  return (
    <div className="flex flex-col gap-6">
      <PlanningView
        allItems={allItems}
        socialItems={libraryItems}
        today={today}
        pendingFeedback={pendingFeedback}
        issuesByPost={issuesByPost}
      />
      <CalendarGlossary />
    </div>
  )
}
