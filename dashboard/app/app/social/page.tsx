import { getContentItems } from '@/lib/actions/content'
import { getIssues } from '@/lib/actions/paperclip'
import SocialClient from './SocialClient'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import type { Issue } from '@/types/paperclip'

export default async function SocialPage() {
  const [allItems, allIssues] = await Promise.all([
    getContentItems(),
    getIssues(),
  ])
  const items = allItems.filter(i => i.platform !== 'instagram')

  // Posts that have outstanding change requests
  const pendingFeedback = items.filter(i => i.visual_feedback)

  // Match each pending post to its most recent open Paperclip issue.
  // Issues are titled: `Post sent back for review: "..."` or similar.
  const issuesByPost: Record<string, Issue> = {}
  for (const item of pendingFeedback) {
    const match = allIssues.find(issue =>
      issue.title.includes(`"${item.title}"`) &&
      !['done', 'cancelled'].includes(issue.status)
    )
    if (match) issuesByPost[item.id] = match
  }

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh intervalMs={60_000} />
      <SocialClient items={items} pendingFeedback={pendingFeedback} issuesByPost={issuesByPost} />
    </div>
  )
}
