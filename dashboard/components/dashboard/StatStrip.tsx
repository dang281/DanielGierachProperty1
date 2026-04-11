import type { Agent, Issue } from '@/types/paperclip'
import type { ContentItem } from '@/types/content'

export default function StatStrip({
  agents,
  issues,
  items,
}: {
  agents: Agent[]
  issues: Issue[]
  items: ContentItem[]
}) {
  const stats = [
    {
      value: agents.filter(a => a.status === 'active').length,
      label: 'Agents Active',
      colour: '#22c55e',
    },
    {
      value: issues.filter(i => i.status === 'in_progress').length,
      label: 'In Progress',
      colour: 'var(--color-gold)',
    },
    {
      value: issues.filter(i => i.status === 'needs_review').length + items.filter(i => i.status === 'ready').length,
      label: 'Need Review',
      colour: '#a855f7',
    },
    {
      value: issues.filter(i => i.status === 'done').length,
      label: 'Completed',
      colour: 'rgba(28,25,23,0.35)',
    },
  ]

  return (
    <div className="flex items-center gap-6 px-1">
      {stats.map(({ value, label, colour }, i) => (
        <div key={label} className="flex items-baseline gap-2">
          <span className="font-serif text-2xl leading-none" style={{ color: colour }}>
            {value}
          </span>
          <span className="text-[11px] font-sans uppercase tracking-[0.12em]" style={{ color: colour, opacity: 0.7 }}>
            {label}
          </span>
          {i < stats.length - 1 && (
            <span className="ml-4 text-[var(--color-border-w)] select-none">·</span>
          )}
        </div>
      ))}
    </div>
  )
}
