import type { Agent, Issue } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
}
const STATUS_COLOUR: Record<string, string> = {
  active: '#22c55e', idle: '#9ca3af', paused: '#f97316', error: '#ef4444',
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

export default function AgentStatusPanel({ agents, issues }: { agents: Agent[]; issues: Issue[] }) {
  const agentMap    = Object.fromEntries(agents.map(a => [a.id, a]))
  const activeIssues = issues.filter(i => i.status === 'in_progress')
  const queue       = issues
    .filter(i => i.status === 'todo')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority ?? 'low'] ?? 3) - (order[b.priority ?? 'low'] ?? 3)
    })
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-3">

      {/* Agents */}
      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--color-border-w)] flex items-center gap-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22c55e' }} />
          </span>
          <span className="text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--color-cream-dim)]">
            Agents
          </span>
          <span className="ml-auto text-[10px] font-sans text-[var(--color-cream-x)]">
            {agents.filter(a => a.status === 'active').length} active
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border-w)]">
          {agents.map(agent => {
            const task   = activeIssues.find(i => i.assigneeAgentId === agent.id)
            const colour = STATUS_COLOUR[agent.status] ?? '#9ca3af'

            return (
              <div key={agent.id} className="px-4 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colour }} />
                  <span className="text-xs font-sans font-semibold text-[var(--color-cream)] flex-1 min-w-0 truncate">
                    {agent.name}
                  </span>
                  <span className="text-[9px] font-sans text-[var(--color-cream-x)] flex-shrink-0">
                    {timeAgo(agent.lastHeartbeatAt)}
                  </span>
                </div>
                {task ? (
                  <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-snug pl-3.5 line-clamp-1">
                    <code className="text-[9px] text-[var(--color-cream-x)] mr-1">{task.identifier}</code>
                    {task.title}
                  </p>
                ) : (
                  <p className="text-[11px] font-sans text-[var(--color-cream-x)] italic pl-3.5">
                    {agent.status === 'idle' ? 'Idle' : agent.status}
                  </p>
                )}
              </div>
            )
          })}

          {agents.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-xs font-sans text-[var(--color-cream-x)] italic">No agents connected</p>
            </div>
          )}
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--color-border-w)] flex items-center">
            <span className="text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--color-cream-dim)]">
              Queue
            </span>
            <span className="ml-auto text-[10px] font-sans text-[var(--color-cream-x)]">
              {queue.length} tasks
            </span>
          </div>
          <div className="divide-y divide-[var(--color-border-w)]">
            {queue.map((issue, idx) => {
              const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
              const agent   = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
              return (
                <div key={issue.id} className="flex items-start gap-2.5 px-4 py-2">
                  <span className="text-[10px] font-mono text-[var(--color-cream-x)] mt-0.5 w-4 flex-shrink-0 text-right">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <code className="text-[9px] font-mono text-[var(--color-cream-x)]">{issue.identifier}</code>
                      {issue.priority && (
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wide px-1 py-0.5 rounded"
                          style={{ color: pColour, background: pColour + '18' }}>
                          {issue.priority}
                        </span>
                      )}
                      {agent && <span className="text-[9px] font-sans text-[var(--color-cream-x)] truncate">{agent.name}</span>}
                    </div>
                    <p className="text-[11px] font-sans text-[var(--color-cream)] leading-snug line-clamp-1">
                      {issue.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
