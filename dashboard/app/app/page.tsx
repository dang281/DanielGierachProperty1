import { getContentItems } from '@/lib/actions/content'
import { getAgents, getIssues } from '@/lib/actions/paperclip'
import { getLatestAgentReport, getRecentMarketIntel, getOpenOpportunities } from '@/lib/actions/reports'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import PublishingHealth from '@/components/dashboard/PublishingHealth'
import PriorityPanel from '@/components/dashboard/PriorityPanel'
import WeeklyContentReview from '@/components/dashboard/WeeklyContentReview'
import AgentOutputSummary from '@/components/dashboard/AgentOutputSummary'
import MarketIntelFeed from '@/components/dashboard/MarketIntelFeed'
import GrowthOpportunities from '@/components/dashboard/GrowthOpportunities'
import {
  PipelineDonut, HorizBars,
  type PipelineSlice, type BarItem,
} from '@/components/dashboard/DashboardCharts'
import { PLATFORM_COLOUR, PILLAR_COLOUR } from '@/types/content'
import type { ContentItem } from '@/types/content'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [allItems, agents, issues, latestReport, intelItems, opportunities] = await Promise.all([
    getContentItems(),
    getAgents(),
    getIssues(),
    getLatestAgentReport(),
    getRecentMarketIntel(7),
    getOpenOpportunities(),
  ])

  const today = todayAEST()
  const items = allItems.filter(i => i.platform !== 'instagram')

  const ready     = items.filter(i => i.status === 'ready')
  const scheduled = items.filter(i => i.status === 'scheduled')
  const posted    = items.filter(i => i.status === 'posted')
  const ideas     = items.filter(i => i.status === 'idea')
  const rejected  = items.filter(i => i.status === 'rejected')

  const activeAgents = agents.filter(a => a.status === 'active')

  // ── Chart data ──────────────────────────────────────────────────────────────
  const pipelineData: PipelineSlice[] = [
    { name: 'Ready',     value: ready.length,     colour: '#a855f7' },
    { name: 'Scheduled', value: scheduled.length, colour: '#22c55e' },
    { name: 'Posted',    value: posted.length,    colour: '#3b82f6' },
    { name: 'Ideas',     value: ideas.length,     colour: '#9ca3af' },
    { name: 'Rejected',  value: rejected.length,  colour: '#ef4444' },
  ]

  const platformData: BarItem[] = [
    { name: 'LinkedIn', value: items.filter(i => i.platform === 'linkedin').length, colour: '#0a66c2' },
    { name: 'Facebook', value: items.filter(i => i.platform === 'facebook').length, colour: '#0866ff' },
  ]

  const pillarData: BarItem[] = (['seller','authority','suburb','proof','buyer'] as const).map(p => ({
    name:   p.charAt(0).toUpperCase() + p.slice(1),
    value:  items.filter(i => i.content_pillar === p).length,
    colour: PILLAR_COLOUR[p],
  }))

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={30_000} />

      {/* ── 1. PRIORITY PANEL ─────────────────────────────────────────────── */}
      <PriorityPanel items={items} today={today} />

      {/* ── 2. WEEKLY CONTENT REVIEW ──────────────────────────────────────── */}
      <WeeklyContentReview initialItems={items} />

      {/* ── 3. ANALYTICS ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Content pipeline" subtitle={`${items.length} total posts`}>
          <PipelineDonut data={pipelineData} total={items.length} />
        </ChartCard>

        <ChartCard title="Platform split" subtitle="Posts per platform">
          <HorizBars data={platformData} />
          <div className="border-t border-[var(--color-border-w)] my-4" />
          <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-x)] mb-3">
            Content pillars
          </p>
          <HorizBars data={pillarData} />
        </ChartCard>

        <ChartCard title="Quick stats" subtitle="Live pipeline snapshot">
          <div className="grid grid-cols-2 gap-3">
            <StatTile value={ready.length}     label="Need approval"  colour="#a855f7" />
            <StatTile value={scheduled.length} label="Scheduled"      colour="#22c55e" />
            <StatTile value={posted.length}    label="Published"      colour="#3b82f6" />
            <StatTile value={activeAgents.length} label="Agents active" colour="var(--color-gold)" />
          </div>
        </ChartCard>
      </div>

      {/* ── 4. AGENT STATUS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[288px_1fr] gap-4">
        <AgentStatusPanel agents={agents} issues={issues} />
        <PublishingHealth items={items} />
      </div>

      {/* ── 5. AGENT OUTPUT SUMMARY ───────────────────────────────────────── */}
      <AgentOutputSummary report={latestReport} />

      {/* ── 6. MARKET INTEL + GROWTH ──────────────────────────────────────── */}
      {(intelItems.length > 0 || opportunities.length > 0) ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MarketIntelFeed items={intelItems} />
          <GrowthOpportunities initialOpportunities={opportunities} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MarketIntelFeed items={[]} />
          <GrowthOpportunities initialOpportunities={[]} />
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border-w)] p-5 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)]">{title}</p>
        <p className="text-[11px] font-sans text-[var(--color-cream-x)] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function StatTile({ value, label, colour }: {
  value: string | number; label: string; colour: string
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-[var(--color-border-w)]">
      <span className="text-[22px] leading-none font-sans font-bold tabular-nums" style={{ color: colour }}>
        {value}
      </span>
      <span className="text-[10px] font-sans text-[var(--color-cream-x)]">{label}</span>
    </div>
  )
}
