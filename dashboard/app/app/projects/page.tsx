import { getAgents, getIssues } from '@/lib/actions/paperclip'
import ProjectProposals from '@/components/dashboard/ProjectProposals'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import { PROPOSAL_LABEL_ID } from '@/types/paperclip'
import type { Issue } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
}

export default async function ProjectsPage() {
  const [agents, issues] = await Promise.all([getAgents(), getIssues()])

  const proposals    = issues.filter(i => i.labelIds.includes(PROPOSAL_LABEL_ID) && i.status !== 'cancelled' && i.status !== 'done')
  const recentlyDone = issues.filter(i => i.status === 'done').slice(-10).reverse()
  const needsReview  = issues.filter(i => i.status === 'needs_review')

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={60_000} />

      {/* Header */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-2xl text-[var(--color-cream)]">Projects</h1>
        <span className="text-sm font-sans text-[var(--color-cream-x)]">{proposals.length} proposals pending</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Proposals pending', value: proposals.length, colour: '#6366f1' },
          { label: 'Needs review',      value: needsReview.length, colour: '#a855f7' },
          { label: 'Completed total',   value: issues.filter(i => i.status === 'done').length, colour: '#22c55e' },
        ].map(t => (
          <div key={t.label} className="rounded-xl px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <span className="text-xl font-sans font-bold tabular-nums" style={{ color: t.colour }}>{t.value}</span>
            <p className="text-[11px] font-sans text-[var(--color-cream-x)] mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Proposals */}
      <ProjectProposals issues={issues} agents={agents} />

      {/* Needs review */}
      {needsReview.length > 0 && (
        <section>
          <SectionLabel label="Needs review" count={needsReview.length} colour="#a855f7" />
          <IssueList issues={needsReview} />
        </section>
      )}

      {/* Recently completed */}
      {recentlyDone.length > 0 && (
        <section>
          <SectionLabel label="Recently completed" count={recentlyDone.length} colour="#6b7280" />
          <div className="opacity-60">
            <IssueList issues={recentlyDone} />
          </div>
        </section>
      )}
    </div>
  )
}

function SectionLabel({ label, count, colour = 'var(--color-cream-dim)' }: { label: string; count: number; colour?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h2 className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: colour }}>{label}</h2>
      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full" style={{ color: colour, background: colour + '20' }}>{count}</span>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

function IssueList({ issues }: { issues: Issue[] }) {
  return (
    <div className="flex flex-col gap-1">
      {issues.map(issue => {
        const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
        return (
          <div key={issue.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <code className="text-[10px] font-mono text-[var(--color-cream-x)] flex-shrink-0 w-16">{issue.identifier}</code>
            <p className="flex-1 text-sm font-sans text-[var(--color-cream)] min-w-0 truncate">{issue.title}</p>
            {issue.priority && (
              <span className="text-[9px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ color: pColour, background: pColour + '18' }}>
                {issue.priority}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
