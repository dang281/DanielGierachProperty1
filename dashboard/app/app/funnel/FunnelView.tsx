'use client'

const ACTIVITY_LABEL: Record<string, string> = {
  call_connected:   'Calls connected',
  call_nvml:        'NVML attempts',
  note:             'Notes',
  follow_up_set:    'Follow-ups set',
  appraisal_booked: 'Appraisals booked',
  meeting_scheduled:'Meetings',
  email_sent:       'Emails',
  sms_sent:         'SMS',
}

const ACTIVITY_ORDER = ['call_connected', 'call_nvml', 'appraisal_booked', 'follow_up_set', 'note', 'email_sent']

function deltaLabel(now: number, prev: number): { sign: '+' | '-' | '='; pct: string; color: string } {
  if (prev === 0 && now === 0) return { sign: '=', pct: '0', color: 'var(--color-cream-x)' }
  if (prev === 0) return { sign: '+', pct: '∞', color: '#16a34a' }
  const change = ((now - prev) / prev) * 100
  if (change > 0) return { sign: '+', pct: change.toFixed(0), color: '#16a34a' }
  if (change < 0) return { sign: '-', pct: Math.abs(change).toFixed(0), color: '#ef4444' }
  return { sign: '=', pct: '0', color: 'var(--color-cream-x)' }
}

export default function FunnelView({
  stages,
  totalPipeline,
  nvmlTotal,
  saturdayCallTotal,
  appraisedYes,
  appraisalsBookedTotal,
  week,
  prev,
}: {
  stages: Array<{ stage: string; count: number }>
  totalPipeline: number
  nvmlTotal: number
  saturdayCallTotal: number
  appraisedYes: number
  appraisalsBookedTotal: number
  week: Record<string, number>
  prev: Record<string, number>
}) {
  const maxStage = stages.reduce((m, s) => Math.max(m, s.count), 1)

  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-5 border-b border-[var(--color-card-2)]">
        <h1 className="text-3xl font-serif">Funnel</h1>
        <p className="text-[var(--color-cream-dim)] text-sm">Where your {totalPipeline} contacts sit + what happened in the last 7 days</p>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6 space-y-8 max-w-5xl">
        {/* Pipeline funnel bars */}
        <section>
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-cream-dim)] mb-3">Pipeline distribution</h2>
          <ul className="space-y-1.5">
            {stages.map(s => {
              const pct = (s.count / maxStage) * 100
              const share = ((s.count / totalPipeline) * 100).toFixed(1)
              return (
                <li key={s.stage} className="grid grid-cols-[140px_1fr_80px] gap-3 items-center text-sm">
                  <span className="text-[var(--color-cream)] truncate">{s.stage}</span>
                  <div className="bg-[var(--color-card)] rounded h-7 overflow-hidden relative">
                    <div className="h-full bg-[var(--color-gold)]/60" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-xs text-[var(--color-cream)] font-medium">
                      {s.count}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-cream-x)] text-right">{share}%</span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Key signals */}
        <section>
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-cream-dim)] mb-3">Key signals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="With NVML status" value={nvmlTotal} sub={`${((nvmlTotal/totalPipeline)*100).toFixed(0)}% of pipeline`} />
            <StatCard label="Saturday calls queued" value={saturdayCallTotal} sub="oldest NVMLs" />
            <StatCard label="Appraised — YES" value={appraisedYes} sub="hot seller signal" />
            <StatCard label="Appraisals BOOKED" value={appraisalsBookedTotal} sub="scheduled" />
          </div>
        </section>

        {/* Weekly activity */}
        <section>
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-cream-dim)] mb-3">Last 7 days vs previous 7</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVITY_ORDER.map(t => {
              const now = week[t] ?? 0
              const prv = prev[t] ?? 0
              const d   = deltaLabel(now, prv)
              return (
                <div key={t} className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg p-4">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--color-cream-dim)]">{ACTIVITY_LABEL[t] ?? t}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif">{now}</span>
                    <span className="text-xs" style={{ color: d.color }}>{d.sign}{d.pct}%</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-cream-x)] mt-1">vs {prv} previous week</div>
                </div>
              )
            })}
          </div>
          {Object.keys(week).length === 0 && (
            <div className="text-[var(--color-cream-dim)] text-sm mt-3">
              No activity logged this week yet. Start using the Quick Actions on the Today page or detail panels — every click here is automatically counted.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-cream-dim)]">{label}</div>
      <div className="text-3xl font-serif mt-1">{value}</div>
      {sub && <div className="text-[10px] text-[var(--color-cream-x)] mt-1">{sub}</div>}
    </div>
  )
}
