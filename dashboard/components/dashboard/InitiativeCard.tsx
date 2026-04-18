'use client'

import { useTransition } from 'react'
import {
  updateOpportunityStatus,
  type GrowthOpportunity,
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  CATEGORY_LABEL,
  CATEGORY_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
} from '@/lib/actions/growth'

interface Props {
  opportunity: GrowthOpportunity
}

export default function InitiativeCard({ opportunity: o }: Props) {
  const [isPending, startTransition] = useTransition()

  const priorityStyle = PRIORITY_STYLE[o.priority] ?? PRIORITY_STYLE[3]
  const categoryStyle = o.category ? (CATEGORY_STYLE[o.category] ?? CATEGORY_STYLE['content']) : CATEGORY_STYLE['content']
  const categoryLabel = o.category ? (CATEGORY_LABEL[o.category] ?? o.category) : '—'
  const statusStyle   = STATUS_STYLE[o.status] ?? STATUS_STYLE['open']
  const statusLabel   = STATUS_LABEL[o.status] ?? o.status

  function markAs(newStatus: string) {
    startTransition(() => {
      updateOpportunityStatus(o.id, newStatus)
    })
  }

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-2xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-5 transition-opacity',
        isPending ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
    >
      {/* Top row — title + badges */}
      <div className="flex flex-wrap items-start gap-2">
        <h3 className="flex-1 min-w-0 font-sans font-semibold text-[15px] text-[var(--color-cream)] leading-tight">
          {o.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Priority badge */}
          <span
            className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{
              color: priorityStyle.text,
              background: priorityStyle.bg,
              borderColor: priorityStyle.border,
            }}
          >
            {PRIORITY_LABEL[o.priority] ?? '—'}
          </span>
          {/* Category badge */}
          <span
            className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: categoryStyle.text,
              background: categoryStyle.bg,
            }}
          >
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Status chip */}
      <div>
        <span
          className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-lg"
          style={{ color: statusStyle.text, background: statusStyle.bg }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Why it matters */}
      <p className="font-sans text-[13px] text-[var(--color-cream-dim)] leading-relaxed">
        {o.why_it_matters}
      </p>

      {/* Expected impact */}
      <div className="space-y-0.5">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">
          Impact
        </span>
        <p className="font-sans text-[12px] text-[var(--color-cream-x)] leading-relaxed">
          {o.expected_impact}
        </p>
      </div>

      {/* Next action box */}
      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card-2)] px-4 py-3">
        <p className="font-sans text-[13px] text-[var(--color-cream)] leading-snug">
          <span className="text-[var(--color-gold)] mr-1.5">→</span>
          {o.next_action}
        </p>
      </div>

      {/* Status change buttons */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-sans text-[11px] text-[var(--color-cream-x)]">Mark as:</span>
        {o.status !== 'in_progress' && (
          <button
            onClick={() => markAs('in_progress')}
            className="font-sans text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}
          >
            Validated
          </button>
        )}
        {o.status !== 'dismissed' && (
          <button
            onClick={() => markAs('dismissed')}
            className="font-sans text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: '#f97316', background: 'rgba(249,115,22,0.1)' }}
          >
            Stalled
          </button>
        )}
        {(o.status === 'in_progress' || o.status === 'dismissed') && (
          <button
            onClick={() => markAs('open')}
            className="font-sans text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}
          >
            Testing
          </button>
        )}
      </div>
    </div>
  )
}
