import { getContentItems } from '@/lib/actions/content'
import { getAgents, getIssues } from '@/lib/actions/paperclip'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import AttentionBar from '@/components/dashboard/AttentionBar'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import CompactProposals from '@/components/dashboard/CompactProposals'
import WeeklyContentReview from '@/components/dashboard/WeeklyContentReview'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

// Posting schedule: Tue/Wed/Thu = days 2/3/4
const POSTING_DAYS = new Set([2, 3, 4])

function nextNSlots(today: string, n: number): string[] {
  const slots: string[] = []
  const d = new Date(today + 'T00:00:00')
  while (slots.length < n) {
    d.setDate(d.getDate() + 1)
    if (POSTING_DAYS.has(d.getDay())) {
      slots.push(d.toLocaleDateString('en-CA'))
    }
  }
  return slots
}

export default async function DashboardPage() {
  const [allItems, agents, issues] = await Promise.all([
    getContentItems(),
    getAgents(),
    getIssues(),
  ])

  const items = allItems.filter(i => i.platform === 'linkedin')
  const reviewItems = items.filter(i => i.status === 'ready')
  const today = todayAEST()

  // Content gap detection — next 6 posting slots with no scheduled post
  const scheduledDates = new Set(
    items.filter(i => i.scheduled_date).map(i => i.scheduled_date as string)
  )
  const upcomingSlots = nextNSlots(today, 6)
  const gapDates = upcomingSlots.filter(d => !scheduledDates.has(d))

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={30_000} />

      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--color-gold)' }}>
          Overview
        </p>
        <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
          Dashboard
        </h1>
      </div>

      {/* Priority alerts */}
      <AttentionBar reviewItems={reviewItems} issues={issues} />

      {/* Content gaps warning */}
      {gapDates.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.3)' }}>
          <span className="text-sm" style={{ color: '#f97316' }}>⚠</span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-sans font-semibold" style={{ color: '#f97316' }}>
              {gapDates.length} upcoming slot{gapDates.length !== 1 ? 's' : ''} with no post scheduled
            </p>
            <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
              {gapDates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })).join(', ')}
              {' · '}
              <a href="/app/planning" className="text-[var(--color-gold)] hover:underline">Open Schedule →</a>
            </p>
          </div>
        </div>
      )}

      {/* ── Content workflow — primary focus ── */}
      <WeeklyContentReview initialItems={items} today={today} />

      {/* ── Agent activity — secondary / collapsed ── */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none select-none">
          <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
            Agent Activity
          </h2>
          <div className="flex-1 h-px bg-[var(--color-border-w)]" />
          {agents.length > 0 && (
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full"
              style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}>
              {agents.filter((a: { status: string }) => a.status === 'active').length} active
            </span>
          )}
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] group-open:hidden">▸ Show</span>
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] hidden group-open:inline">▾ Hide</span>
        </summary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <AgentStatusPanel agents={agents} issues={issues} />
          <CompactProposals issues={issues} agents={agents} />
        </div>
      </details>

    </div>
  )
}
