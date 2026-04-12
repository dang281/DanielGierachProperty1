import { getIssues } from '@/lib/actions/paperclip'
import SuburbCoverage from '@/components/dashboard/SuburbCoverage'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import { PROPOSAL_LABEL_ID } from '@/types/paperclip'
import type { Issue } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
}
const STATUS_COLOUR: Record<string, string> = {
  in_progress: '#22c55e', needs_review: '#a855f7', todo: '#9ca3af', done: '#6b7280',
}
const STATUS_LABEL: Record<string, string> = {
  in_progress: 'In Progress', needs_review: 'Needs Review', todo: 'Queued', done: 'Done',
}

export default async function SEOPage() {
  const issues = await getIssues()

  // Exclude proposals
  const seoIssues = issues.filter(i => !i.labelIds.includes(PROPOSAL_LABEL_ID))
  const active    = seoIssues.filter(i => i.status === 'in_progress')
  const review    = seoIssues.filter(i => i.status === 'needs_review')
  const queued    = seoIssues.filter(i => i.status === 'todo')
  const done      = seoIssues.filter(i => i.status === 'done')

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={60_000} />

      {/* Header */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-2xl text-[var(--color-cream)]">SEO</h1>
        <span className="text-sm font-sans text-[var(--color-cream-x)]">{seoIssues.length} issues</span>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active',      value: active.length,  colour: '#22c55e' },
          { label: 'Needs review', value: review.length, colour: '#a855f7' },
          { label: 'Queued',      value: queued.length,  colour: '#9ca3af' },
          { label: 'Completed',   value: done.length,    colour: '#6b7280' },
        ].map(t => (
          <div key={t.label} className="rounded-xl px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <span className="text-xl font-sans font-bold tabular-nums" style={{ color: t.colour }}>{t.value}</span>
            <p className="text-[11px] font-sans text-[var(--color-cream-x)] mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Suburb coverage */}
      <SuburbCoverage issues={issues} />

      {/* Active + needs review issues */}
      {[...active, ...review].length > 0 && (
        <section>
          <SectionLabel label="Active work" count={active.length + review.length} />
          <IssueList issues={[...active, ...review]} />
        </section>
      )}

      {/* Queued */}
      {queued.length > 0 && (
        <section>
          <SectionLabel label="Queued" count={queued.length} />
          <IssueList issues={queued} />
        </section>
      )}
    </div>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h2 className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cream-dim)]">{label}</h2>
      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full text-[var(--color-cream-x)] bg-[rgba(28,25,23,0.06)]">{count}</span>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

function IssueList({ issues }: { issues: Issue[] }) {
  return (
    <div className="flex flex-col gap-1">
      {issues.map(issue => {
        const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
        const sColour = STATUS_COLOUR[issue.status] ?? '#6b7280'
        return (
          <div
            key={issue.id}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border-w)]"
          >
            <code className="text-[10px] font-mono text-[var(--color-cream-x)] flex-shrink-0 w-16">{issue.identifier}</code>
            <p className="flex-1 text-sm font-sans text-[var(--color-cream)] min-w-0 truncate">{issue.title}</p>
            {issue.priority && (
              <span className="text-[9px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ color: pColour, background: pColour + '18' }}>
                {issue.priority}
              </span>
            )}
            <span className="text-[10px] font-sans font-semibold flex-shrink-0" style={{ color: sColour }}>
              {STATUS_LABEL[issue.status] ?? issue.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}
