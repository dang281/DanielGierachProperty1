import type { Agent, Issue } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#6b7280',
}

const STATUS_COLOUR: Record<string, string> = {
  active: '#22c55e',
  idle:   '#9ca3af',
  paused: '#f97316',
  error:  '#ef4444',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function LiveFeed({
  agents,
  issues,
}: {
  agents: Agent[]
  issues: Issue[]
}) {
  if (agents.length === 0 && issues.length === 0) return null

  const activeIssues = issues.filter(i => i.status === 'in_progress')
  const queueIssues  = issues
    .filter(i => i.status === 'todo')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority ?? 'low'] ?? 3) - (order[b.priority ?? 'low'] ?? 3)
    })

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

  return (
    <div className="flex flex-col gap-4">

      {/* ── LIVE NOW ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {/* Pulsing live dot */}
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: '#22c55e' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: '#22c55e' }}
              />
            </span>
            <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
              Live Now
            </h2>
          </div>
          <div className="flex-1 border-t border-[var(--color-border-w)]" />
          <span className="text-[var(--color-cream-x)] text-[11px] font-sans flex-shrink-0">
            {activeIssues.length} active
          </span>
        </div>

        <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden divide-y divide-[var(--color-border-w)]">
          {agents.map(agent => {
            const task   = activeIssues.find(i => i.assigneeAgentId === agent.id)
            const colour = STATUS_COLOUR[agent.status] ?? '#9ca3af'
            const isActive = agent.status === 'active' && task

            return (
              <div
                key={agent.id}
                className="px-4 py-3"
                style={isActive ? { background: 'rgba(34,197,94,0.04)' } : undefined}
              >
                {/* Agent row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: colour }}
                  />
                  <span className="text-[11px] font-sans font-semibold text-[var(--color-cream)] flex-1 min-w-0 truncate">
                    {agent.name}
                  </span>
                  <span
                    className="text-[9px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: colour, background: colour + '20' }}
                  >
                    {agent.status}
                  </span>
                </div>

                {/* Active task */}
                {task ? (
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <code
                        className="text-[9px] font-mono font-semibold flex-shrink-0"
                        style={{ color: 'rgba(34,197,94,0.8)' }}
                      >
                        {task.identifier}
                      </code>
                      {task.priority && (
                        <span
                          className="text-[9px] font-sans font-bold uppercase tracking-wide px-1 py-0.5 rounded flex-shrink-0"
                          style={{
                            color: PRIORITY_COLOUR[task.priority],
                            background: PRIORITY_COLOUR[task.priority] + '20',
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                      <span className="text-[9px] font-sans text-[var(--color-cream-x)] ml-auto flex-shrink-0">
                        {timeAgo(task.startedAt)}
                      </span>
                    </div>
                    <p className="text-xs font-sans text-[var(--color-cream)] leading-snug">
                      {task.title}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-sans text-[var(--color-cream-x)] italic pl-4">
                    {agent.status === 'idle'   && `Idle — last active ${timeAgo(agent.lastHeartbeatAt)}`}
                    {agent.status === 'paused' && (agent.pauseReason ?? 'Paused')}
                    {agent.status === 'error'  && 'Error — check agent logs'}
                    {agent.status === 'active' && 'Running — no issue assigned'}
                  </p>
                )}
              </div>
            )
          })}

          {agents.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-sans text-[var(--color-cream-x)] italic">No agents connected</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SCHEDULED / QUEUE ────────────────────── */}
      {queueIssues.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
              Scheduled
            </h2>
            <div className="flex-1 border-t border-[var(--color-border-w)]" />
            <span className="text-[var(--color-cream-x)] text-[11px] font-sans flex-shrink-0">
              {queueIssues.length} queued
            </span>
          </div>

          <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
            {queueIssues.map((issue, idx) => {
              const agent = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
              const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'

              return (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border-w)] last:border-0"
                >
                  {/* Position number */}
                  <span
                    className="text-[10px] font-mono font-semibold text-[var(--color-cream-x)] mt-0.5 flex-shrink-0 w-5 text-right"
                  >
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-[9px] font-mono text-[var(--color-cream-x)] flex-shrink-0">
                        {issue.identifier}
                      </code>
                      {issue.priority && (
                        <span
                          className="text-[9px] font-sans font-bold uppercase tracking-wide px-1 py-0.5 rounded flex-shrink-0"
                          style={{ color: pColour, background: pColour + '18' }}
                        >
                          {issue.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-sans text-[var(--color-cream)] leading-snug line-clamp-2">
                      {issue.title}
                    </p>
                    {agent && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: STATUS_COLOUR[agent.status] ?? '#9ca3af' }}
                        />
                        <span className="text-[9px] font-sans text-[var(--color-cream-x)]">
                          {agent.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── NEEDS REVIEW ─────────────────────────── */}
      {(() => {
        const reviewIssues = issues.filter(i => i.status === 'needs_review')
        if (reviewIssues.length === 0) return null
        return (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#a855f7' }}>
                Needs Review
              </h2>
              <div className="flex-1 border-t border-[var(--color-border-w)]" />
              <span className="text-[11px] font-sans flex-shrink-0" style={{ color: '#a855f7' }}>
                {reviewIssues.length}
              </span>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)' }}>
              {reviewIssues.map(issue => {
                const agent = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
                return (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                    style={{ borderColor: 'rgba(168,85,247,0.12)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: '#a855f7' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-[9px] font-mono text-[var(--color-cream-x)]">{issue.identifier}</code>
                        {agent && <span className="text-[9px] font-sans text-[var(--color-cream-x)]">· {agent.name}</span>}
                      </div>
                      <p className="text-[11px] font-sans text-[var(--color-cream)] leading-snug">
                        {issue.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

    </div>
  )
}
