import { getContentItems, checkVisualMigration } from '@/lib/actions/content'
import { getAgents, getIssues, getAgentTokenData } from '@/lib/actions/paperclip'
import ContentCard from '@/components/dashboard/ContentCard'
import AttentionBar from '@/components/dashboard/AttentionBar'
import StatStrip from '@/components/dashboard/StatStrip'
import LiveFeed from '@/components/dashboard/LiveFeed'
import AgentIntelCards from '@/components/dashboard/AgentIntelCards'
import ProjectProposals from '@/components/dashboard/ProjectProposals'
import SuburbCoverage from '@/components/dashboard/SuburbCoverage'
import AutoRefresh from '@/components/dashboard/AutoRefresh'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

export default async function DashboardPage() {
  const [allItems, agents, issues, visualMigrationDone] = await Promise.all([
    getContentItems(),
    getAgents(),
    getIssues(),
    checkVisualMigration(),
  ])
  const tokenData = agents.length > 0 ? await getAgentTokenData(agents.map(a => a.id)) : {}
  const today = todayAEST()

  // Instagram excluded — not a current focus
  const items = allItems.filter(i => i.platform !== 'instagram')

  const postingToday   = items.filter(i => i.scheduled_date === today && i.status === 'scheduled')
  const readyForReview = items.filter(i => i.status === 'ready')
  const ideas          = items.filter(i => i.status === 'idea')
  const recentlyPosted = items.filter(i => i.status === 'posted').slice(0, 6)

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh intervalMs={30_000} />

      {/* Migration notice — auto-hides once column exists */}
      {!visualMigrationDone && (
        <div
          className="rounded-xl px-5 py-4 flex items-start gap-4"
          style={{ background: 'rgba(245,208,122,0.08)', border: '1px solid rgba(245,208,122,0.3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5d07a" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-sm font-sans font-semibold" style={{ color: '#f5d07a' }}>
              Database migration needed — visual fields not yet active
            </p>
            <p className="text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed">
              Run <code className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'rgba(245,208,122,0.12)', color: '#f5d07a' }}>dashboard/supabase/add-visual-fields.sql</code> in your Supabase SQL editor to enable visual briefs, Canva links, and visual feedback on content cards. This notice disappears automatically once the migration is applied.
            </p>
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                {readyForReview.map(item => (
                  <ContentCard key={item.id} item={item} showActions />
                ))}
              </div>
            )}
          </section>

          {/* Ideas Pipeline */}
          {ideas.length > 0 && (
            <section>
              <SectionHeader label="Ideas Pipeline" count={ideas.length} colour="rgba(28,25,23,0.4)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                {ideas.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* Recently Posted */}
          {recentlyPosted.length > 0 && (
            <section>
              <SectionHeader label="Recently Posted" count={recentlyPosted.length} colour="rgba(28,25,23,0.3)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 opacity-60">
                {recentlyPosted.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT — operations sidebar */}
        <div className="w-full lg:w-96 xl:w-[28rem] flex-shrink-0 flex flex-col gap-6">
          <LiveFeed agents={agents} issues={issues} />
        </div>

      </div>

      {/* Project Proposals — CEO-generated ideas awaiting approval */}
      <ProjectProposals issues={issues} agents={agents} />

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
        style={{ color: colour, background: 'rgba(28,25,23,0.06)' }}
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
      style={{ background: 'rgba(28,25,23,0.03)', border: '1px solid rgba(28,25,23,0.08)' }}
    >
      {message}
    </p>
  )
}
