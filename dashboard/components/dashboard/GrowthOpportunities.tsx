'use client'

import { useState, useTransition } from 'react'
import type { Opportunity } from '@/types/reports'
import { CATEGORY_COLOUR, CATEGORY_LABEL, PRIORITY_LABEL, PRIORITY_COLOUR } from '@/types/reports'
import { updateOpportunityStatus } from '@/lib/actions/reports'

// ─── Setup notice ─────────────────────────────────────────────────────────────

function SetupNotice() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-w)] bg-[var(--color-card)] p-5 flex flex-col gap-2">
      <p className="text-[12px] font-sans font-semibold text-[var(--color-cream-dim)]">
        Growth Opportunities
      </p>
      <p className="text-[11px] font-sans text-[var(--color-cream-x)] leading-relaxed">
        The CEO agent will generate 3–5 strategic opportunities here each Sunday. They appear after running
        the{' '}
        <code className="text-[10px] bg-[rgba(255,255,255,0.06)] px-1 py-0.5 rounded">opportunities.sql</code>{' '}
        migration and adding the opportunities step to the CEO agent instructions.
      </p>
    </div>
  )
}

// ─── Opportunity card ─────────────────────────────────────────────────────────

function OpportunityCard({
  opp,
  onStatusChange,
}: {
  opp: Opportunity
  onStatusChange: (id: string, status: Opportunity['status']) => void
}) {
  const [isPending, startTransition] = useTransition()
  const catColour = CATEGORY_COLOUR[opp.category ?? ''] ?? '#9ca3af'
  const catLabel  = CATEGORY_LABEL[opp.category ?? ''] ?? 'General'
  const priColour = PRIORITY_COLOUR[opp.priority]
  const priLabel  = PRIORITY_LABEL[opp.priority]

  function setStatus(status: Opportunity['status']) {
    startTransition(async () => {
      await updateOpportunityStatus(opp.id, status)
      onStatusChange(opp.id, status)
    })
  }

  const isDone      = opp.status === 'done' || opp.status === 'dismissed'
  const isInProgress = opp.status === 'in_progress'

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 transition-colors"
      style={{
        borderColor: isDone ? 'var(--color-border-w)' : `${catColour}35`,
        background:  isDone ? 'transparent' : `${catColour}06`,
        opacity:     isDone ? 0.5 : 1,
        borderLeft:  `3px solid ${catColour}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: catColour, background: `${catColour}18` }}>
            {catLabel}
          </span>
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: priColour, background: `${priColour}15` }}>
            {priLabel} priority
          </span>
          {isInProgress && (
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}>
              In progress
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)] leading-snug">
        {opp.title}
      </p>

      {/* Why / Impact / Action */}
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--color-cream-x)] mb-0.5">
            Why it matters
          </p>
          <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
            {opp.why_it_matters}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--color-cream-x)] mb-0.5">
            Expected impact
          </p>
          <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
            {opp.expected_impact}
          </p>
        </div>
        <div className="rounded-lg border p-2.5" style={{ borderColor: `${catColour}30`, background: `${catColour}08` }}>
          <p className="text-[9px] font-sans font-bold uppercase tracking-wider mb-0.5" style={{ color: catColour }}>
            Next action
          </p>
          <p className="text-[11px] font-sans font-semibold text-[var(--color-cream)] leading-relaxed">
            {opp.next_action}
          </p>
        </div>
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border-w)]">
          {!isInProgress && (
            <button
              onClick={() => setStatus('in_progress')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-all"
              style={{ background: catColour, color: '#fff', opacity: isPending ? 0.6 : 1 }}
            >
              Start →
            </button>
          )}
          {isInProgress && (
            <button
              onClick={() => setStatus('done')}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold"
              style={{ background: '#22c55e', color: '#fff', opacity: isPending ? 0.6 : 1 }}
            >
              ✓ Mark done
            </button>
          )}
          <button
            onClick={() => setStatus('dismissed')}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold border text-[var(--color-cream-x)]"
            style={{ borderColor: 'var(--color-border-w)', opacity: isPending ? 0.6 : 1 }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GrowthOpportunities({
  initialOpportunities,
}: {
  initialOpportunities: Opportunity[]
}) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities)

  if (opportunities.length === 0) return <SetupNotice />

  function handleStatusChange(id: string, status: Opportunity['status']) {
    setOpportunities(prev =>
      prev.map(o => o.id === id ? { ...o, status } : o),
    )
  }

  const open       = opportunities.filter(o => o.status === 'open' || o.status === 'in_progress')
  const done       = opportunities.filter(o => o.status === 'done' || o.status === 'dismissed')
  const weekLabel  = opportunities[0]
    ? new Date(opportunities[0].week_generated + 'T00:00:00').toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : ''

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
          Growth Opportunities
        </h2>
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">
          {open.length} open
          {done.length > 0 ? ` · ${done.length} closed` : ''}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border-w)]" />
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Week of {weekLabel}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {open.map(opp => (
          <OpportunityCard key={opp.id} opp={opp} onStatusChange={handleStatusChange} />
        ))}
        {done.map(opp => (
          <OpportunityCard key={opp.id} opp={opp} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </section>
  )
}
