import type { Issue, IssueStatus, Agent } from '@/types/paperclip'

const COLUMNS: { status: IssueStatus; label: string; colour: string }[] = [
  { status: 'in_progress',  label: 'In Progress',  colour: '#c4912a' },
  { status: 'needs_review', label: 'Needs Review', colour: '#a855f7' },
  { status: 'todo',         label: 'To Do',        colour: '#9ca3af' },
]

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#6b7280',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function IssueRow({ issue, agentName, colour }: { issue: Issue; agentName: string | null; colour: string }) {
  return (
    <div
      className="flex items-start gap-2.5 py-2.5 border-b border-[var(--color-border-w)] last:border-0"
    >
      <span
        className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: colour }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <code className="text-[10px] font-mono text-[var(--color-cream-x)] flex-shrink-0">
            {issue.identifier}
          </code>
          {issue.priority && (
            <span
              className="text-[9px] font-sans font-semibold uppercase tracking-wide px-1 py-0.5 rounded flex-shrink-0"
              style={{
                color: PRIORITY_COLOUR[issue.priority],
                background: PRIORITY_COLOUR[issue.priority] + '18',
              }}
            >
              {issue.priority}
            </span>
          )}
        </div>
        <p className="text-xs font-sans text-[var(--color-cream)] leading-snug line-clamp-2">
          {issue.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          {agentName && (
            <span className="text-[10px] font-sans text-[var(--color-cream-x)] truncate">
              {agentName}
            </span>
          )}
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] ml-auto flex-shrink-0">
            {timeAgo(issue.startedAt ?? issue.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function IssuesBoard({
  issues,
  agents,
}: {
  issues: Issue[]
  agents: Agent[]
}) {
  const agentMap   = Object.fromEntries(agents.map(a => [a.id, a.name]))
  const active     = issues.filter(i => i.status !== 'done' && i.status !== 'cancelled')

  if (active.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
          Issues
        </h2>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
        <span className="text-[var(--color-cream-x)] text-[11px] font-sans flex-shrink-0">
          {issues.filter(i => i.status === 'done').length} completed
        </span>
      </div>

      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
        {COLUMNS.map(({ status, label, colour }) => {
          const col = active.filter(i => i.status === status)
          if (col.length === 0) return null
          return (
            <div key={status} className="border-b border-[var(--color-border-w)] last:border-0">
              {/* Group header */}
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ background: colour + '0a' }}
              >
                <span
                  className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em]"
                  style={{ color: colour }}
                >
                  {label}
                </span>
                <span
                  className="text-[10px] font-sans px-1.5 rounded-full"
                  style={{ color: colour, background: colour + '20' }}
                >
                  {col.length}
                </span>
              </div>
              {/* Issue rows */}
              <div className="px-3">
                {col.map(issue => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    agentName={issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] ?? null : null}
                    colour={colour}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
