import type { Agent, Issue } from '@/types/paperclip'

const STATUS_DOT: Record<string, string> = {
  active: '#22c55e',
  idle:   '#9ca3af',
  paused: '#f97316',
  error:  '#ef4444',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AgentIntel({
  agents,
  issues,
}: {
  agents: Agent[]
  issues: Issue[]
}) {
  if (agents.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
          Agents
        </h2>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
      </div>
      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] divide-y divide-[var(--color-border-w)] overflow-hidden">
        {agents.map(agent => {
          const active    = issues.filter(i => i.assigneeAgentId === agent.id && i.status === 'in_progress')
          const review    = issues.filter(i => i.assigneeAgentId === agent.id && i.status === 'needs_review')
          const dotColour = STATUS_DOT[agent.status] ?? '#9ca3af'

          return (
            <div key={agent.id} className="px-4 py-3 flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: dotColour }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans text-[var(--color-cream)] truncate">
                  {agent.name}
                </p>
                <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-0.5">
                  {active.length > 0
                    ? `Working on: ${active[0].title.slice(0, 40)}${active[0].title.length > 40 ? '…' : ''}`
                    : `Last active ${timeAgo(agent.lastHeartbeatAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 text-right">
                {active.length > 0 && (
                  <span className="text-[11px] font-sans text-[var(--color-gold)]">
                    {active.length} active
                  </span>
                )}
                {review.length > 0 && (
                  <span className="text-[11px] font-sans" style={{ color: '#a855f7' }}>
                    {review.length} review
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
