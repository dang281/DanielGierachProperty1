import type { Issue } from '@/types/paperclip'
import type { ContentItem } from '@/types/content'

export default function AttentionBar({
  reviewItems,
  issues,
}: {
  reviewItems: ContentItem[]
  issues: Issue[]
}) {
  const pendingIssues = issues.filter(i => i.status === 'needs_review')
  const total = reviewItems.length + pendingIssues.length

  if (total === 0) return null

  const parts: string[] = []
  if (reviewItems.length > 0)
    parts.push(`${reviewItems.length} post${reviewItems.length > 1 ? 's' : ''} need${reviewItems.length === 1 ? 's' : ''} approval`)
  if (pendingIssues.length > 0)
    parts.push(`${pendingIssues.length} issue${pendingIssues.length > 1 ? 's' : ''} need${pendingIssues.length === 1 ? 's' : ''} review`)

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
        style={{ background: '#a855f7' }}
      />
      <p className="text-sm font-sans text-[var(--color-cream)]">
        {parts.join(' · ')}
      </p>
    </div>
  )
}
