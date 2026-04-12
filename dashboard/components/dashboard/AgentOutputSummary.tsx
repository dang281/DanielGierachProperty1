import type { AgentReport } from '@/types/reports'

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ value, label, colour }: { value: number; label: string; colour: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-bg)]">
      <span className="text-[24px] font-sans font-bold tabular-nums leading-none" style={{ color: colour }}>
        {value}
      </span>
      <span className="text-[10px] font-sans text-[var(--color-cream-x)]">{label}</span>
    </div>
  )
}

// ─── Setup notice ─────────────────────────────────────────────────────────────

function SetupNotice() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-w)] bg-[var(--color-card)] p-5 flex flex-col gap-2">
      <p className="text-[12px] font-sans font-semibold text-[var(--color-cream-dim)]">
        Agent Output Summary
      </p>
      <p className="text-[11px] font-sans text-[var(--color-cream-x)] leading-relaxed">
        The social media agent will submit a weekly report here after each Sunday planning run. Reports appear automatically — no setup needed beyond running the{' '}
        <code className="text-[10px] bg-[rgba(255,255,255,0.06)] px-1 py-0.5 rounded">agent-reports.sql</code>{' '}
        migration in Supabase.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AgentOutputSummary({ report }: { report: AgentReport | null }) {
  if (!report) return <SetupNotice />

  const weekLabel = new Date(report.week_start + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
          Agent Output
        </h2>
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">
          Week of {weekLabel}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border-w)]" />
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Social Media Agent</span>
      </div>

      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Left: stats + themes */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile value={report.posts_created}   label="Posts created"   colour="var(--color-gold)" />
              <StatTile value={report.posts_scheduled} label="Posts scheduled" colour="#22c55e" />
              <StatTile value={report.posts_published} label="Posts published" colour="#3b82f6" />
              <StatTile value={report.posts_rejected}  label="Posts rejected"  colour={report.posts_rejected > 0 ? '#ef4444' : '#9ca3af'} />
            </div>

            {report.key_themes && report.key_themes.length > 0 && (
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-x)] mb-2">
                  Key themes this week
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {report.key_themes.map((theme, i) => (
                    <span key={i}
                      className="text-[10px] font-sans px-2 py-1 rounded-full border"
                      style={{ color: 'var(--color-cream-dim)', borderColor: 'var(--color-border-w)', background: 'rgba(255,255,255,0.03)' }}>
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: self-assessment */}
          <div className="flex flex-col gap-3">
            {report.what_worked && (
              <div className="rounded-lg p-3 border" style={{ borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.05)' }}>
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider mb-1" style={{ color: '#22c55e' }}>
                  What worked
                </p>
                <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
                  {report.what_worked}
                </p>
              </div>
            )}

            {report.what_didnt_work && (
              <div className="rounded-lg p-3 border" style={{ borderColor: 'rgba(249,115,22,0.25)', background: 'rgba(249,115,22,0.05)' }}>
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider mb-1" style={{ color: '#f97316' }}>
                  Needs improvement
                </p>
                <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
                  {report.what_didnt_work}
                </p>
              </div>
            )}

            {report.next_week_focus && (
              <div className="rounded-lg p-3 border border-[var(--color-border-w)]">
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider mb-1 text-[var(--color-cream-x)]">
                  Next week focus
                </p>
                <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
                  {report.next_week_focus}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
