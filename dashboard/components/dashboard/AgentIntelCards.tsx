import type { Agent, Issue, AgentTokenData } from '@/types/paperclip'

const STATUS_COLOUR: Record<string, string> = {
  active: '#22c55e',
  idle:   '#9ca3af',
  paused: '#f97316',
  error:  '#ef4444',
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AgentIntelCards({
  agents,
  issues,
  tokenData,
}: {
  agents: Agent[]
  issues: Issue[]
  tokenData: Record<string, AgentTokenData>
}) {
  if (agents.length === 0) return null

  const maxCost = Math.max(...agents.map(a => tokenData[a.id]?.totalCost ?? 0), 0.01)

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
          Agent Intelligence
        </h2>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {agents.map(agent => {
          const td        = tokenData[agent.id] ?? { totalIn: 0, totalOut: 0, totalCached: 0, totalCost: 0, totalRuns: 0, avgPerRun: 0, avgCostPerRun: 0, recentRuns: [] }
          const colour    = STATUS_COLOUR[agent.status] ?? '#9ca3af'
          const agIssues  = issues.filter(i => i.assigneeAgentId === agent.id)
          const active    = agIssues.find(i => i.status === 'in_progress')
          const queue     = agIssues.filter(i => i.status === 'todo')
          const totalTok  = td.totalIn + td.totalOut
          const barPct    = td.totalCost ? Math.round((td.totalCost / maxCost) * 100) : 0
          const lastRun   = td.recentRuns[0]

          return (
            <div
              key={agent.id}
              className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-w)]">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: colour }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-[var(--color-cream)] truncate">
                    {agent.name}
                  </p>
                  <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-0.5">
                    Last active {timeAgo(agent.lastHeartbeatAt)} AEST
                  </p>
                </div>
                <span
                  className="text-[10px] font-sans font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ color: colour, background: colour + '20' }}
                >
                  {agent.status}
                </span>
              </div>

              <div className="flex flex-col gap-4 p-4">

                {/* Token usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-x)]">
                      Token Usage
                    </span>
                    <span className="text-[11px] font-sans text-[var(--color-gold)]">
                      {td.totalCost > 0 ? fmtUsd(td.totalCost) : '—'} total
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, background: 'rgba(196,145,42,0.6)' }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Total tokens', fmtK(totalTok)],
                      ['Avg / run',    fmtK(td.avgPerRun)],
                      ['Runs',         String(td.totalRuns)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="text-center py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <p className="font-serif text-base text-[var(--color-cream)]">{value}</p>
                        <p className="text-[9px] font-sans uppercase tracking-wide text-[var(--color-cream-x)] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {td.totalCached > 0 && (
                    <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-1.5">
                      {fmtK(td.totalCached)} cached tokens
                    </p>
                  )}
                </div>

                {/* Project pipeline */}
                <div>
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-x)] mb-2">
                    Project Pipeline
                  </p>

                  {/* Active task */}
                  {active ? (
                    <div
                      className="px-3 py-2 rounded-lg mb-2 flex items-start gap-2"
                      style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                        style={{ background: '#3b82f6' }}
                      />
                      <div>
                        <p className="text-[9px] font-sans font-bold uppercase tracking-wide mb-0.5" style={{ color: '#3b82f6' }}>
                          Working on
                        </p>
                        <p className="text-xs font-sans text-[var(--color-cream)] leading-snug">
                          {active.title}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="px-3 py-2 rounded-lg mb-2"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-xs font-sans text-[var(--color-cream-x)] italic">No active task</p>
                    </div>
                  )}

                  {/* Queue */}
                  {queue.length > 0 ? (
                    <div className="flex flex-col">
                      {queue.slice(0, 3).map(t => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 py-1.5 border-b border-[var(--color-border-w)] last:border-0"
                        >
                          <code className="text-[10px] font-mono flex-shrink-0" style={{ color: 'rgba(196,145,42,0.6)' }}>
                            {t.identifier}
                          </code>
                          <p className="text-[11px] font-sans text-[var(--color-cream-dim)] flex-1 leading-snug truncate">
                            {t.title}
                          </p>
                        </div>
                      ))}
                      {queue.length > 3 && (
                        <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-1">
                          +{queue.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] font-sans text-[var(--color-cream-x)] italic">Queue empty</p>
                  )}
                </div>

                {/* Last run */}
                {lastRun?.summary && (
                  <div
                    className="px-3 py-2.5 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: '2px solid rgba(196,145,42,0.25)',
                    }}
                  >
                    <p className="text-[9px] font-sans font-bold uppercase tracking-[0.12em] text-[var(--color-cream-x)] mb-1">
                      Last run
                    </p>
                    <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
                      {lastRun.summary}{lastRun.summary.length >= 180 ? '…' : ''}
                    </p>
                  </div>
                )}

              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
