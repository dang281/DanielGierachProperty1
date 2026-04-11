import { getContentItems } from '@/lib/actions/content'
import { getAgents, getIssues, getAgentTokenData } from '@/lib/actions/paperclip'
import ContentCard from '@/components/dashboard/ContentCard'
import AttentionBar from '@/components/dashboard/AttentionBar'
import StatStrip from '@/components/dashboard/StatStrip'
import IssuesBoard from '@/components/dashboard/IssuesBoard'
import AgentIntel from '@/components/dashboard/AgentIntel'
import AgentIntelCards from '@/components/dashboard/AgentIntelCards'
import SuburbCoverage from '@/components/dashboard/SuburbCoverage'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

export default async function DashboardPage() {
  const [items, agents, issues] = await Promise.all([
    getContentItems(),
    getAgents(),
    getIssues(),
  ])
  const tokenData = agents.length > 0 ? await getAgentTokenData(agents.map(a => a.id)) : {}
  const today = todayAEST()

  const postingToday   = items.filter(i => i.scheduled_date === today && i.status === 'scheduled')
  const readyForReview = items.filter(i => i.status === 'ready')
  const ideas          = items.filter(i => i.status === 'idea')
  const recentlyPosted = items.filter(i => i.status === 'posted').slice(0, 6)

  return (
    <div className="flex flex-col gap-5">

      {/* Attention bar */}
      <AttentionBar reviewItems={readyForReview} issues={issues} />

      {/* Stat strip */}
      {(agents.length > 0 || issues.length > 0) && (
        <StatStrip agents={agents} issues={issues} items={items} />
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT — content decisions */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Posting Today */}
          {postingToday.length > 0 && (
            <section>
              <SectionHeader label="Posting Today" count={postingToday.length} colour="var(--color-gold)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {postingToday.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* Ready for Review */}
          <section>
            <SectionHeader label="Ready for Review" count={readyForReview.length} colour="#a855f7" />
            {readyForReview.length === 0 ? (
              <EmptyState message="Nothing waiting for review." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {readyForReview.map(item => (
                  <ContentCard key={item.id} item={item} showActions />
                ))}
              </div>
            )}
          </section>

          {/* Ideas Pipeline */}
          {ideas.length > 0 && (
            <section>
              <SectionHeader label="Ideas Pipeline" count={ideas.length} colour="rgba(242,239,233,0.25)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {ideas.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* Recently Posted */}
          {recentlyPosted.length > 0 && (
            <section>
              <SectionHeader label="Recently Posted" count={recentlyPosted.length} colour="rgba(242,239,233,0.15)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 opacity-60">
                {recentlyPosted.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT — operations sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <IssuesBoard issues={issues} agents={agents} />
          <AgentIntel agents={agents} issues={issues} />
        </div>

      </div>

      {/* Agent Intelligence cards */}
      {agents.length > 0 && (
        <AgentIntelCards agents={agents} issues={issues} tokenData={tokenData} />
      )}

      {/* Suburb Coverage Matrix */}
      {issues.length > 0 && (
        <SuburbCoverage issues={issues} />
      )}

    </div>
  )
}

function SectionHeader({ label, count, colour }: { label: string; count: number; colour: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2
        className="font-sans text-xs font-semibold tracking-[0.15em] uppercase whitespace-nowrap"
        style={{ color: colour }}
      >
        {label}
      </h2>
      <span
        className="text-xs font-sans px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ color: colour, background: colour.startsWith('rgba') ? 'rgba(255,255,255,0.06)' : colour + '20' }}
      >
        {count}
      </span>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p
      className="text-[var(--color-cream-x)] text-sm font-sans mt-3 py-5 text-center rounded-xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      {message}
    </p>
  )
}
