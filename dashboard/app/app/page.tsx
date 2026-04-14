import { getContentItems } from '@/lib/actions/content'
import { getAgents, getIssues } from '@/lib/actions/paperclip'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import AttentionBar from '@/components/dashboard/AttentionBar'
import StatStrip from '@/components/dashboard/StatStrip'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import CompactProposals from '@/components/dashboard/CompactProposals'
import WeeklyContentReview from '@/components/dashboard/WeeklyContentReview'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
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

      <AttentionBar reviewItems={reviewItems} issues={issues} />

      <StatStrip agents={agents} issues={issues} items={items} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentStatusPanel agents={agents} issues={issues} />
        <CompactProposals issues={issues} agents={agents} />
      </div>

      <WeeklyContentReview initialItems={items} today={today} />
    </div>
  )
}
