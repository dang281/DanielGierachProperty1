'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { updateStatus } from '@/lib/actions/content'
import type { ContentItem } from '@/types/content'
import { PLATFORM_COLOUR } from '@/types/content'

interface Props {
  item: ContentItem
  showActions?: boolean
}

const PLATFORM_LABEL: Record<string, string> = {
  linkedin:  'LinkedIn',
  instagram: 'Instagram',
  facebook:  'Facebook',
}

const PILLAR_LABEL: Record<string, string> = {
  seller:    'Seller',
  authority: 'Authority',
  suburb:    'Suburb',
  proof:     'Proof',
  buyer:     'Buyer',
}

const VISUAL_DOT: Record<string, string> = {
  needed:         '#9ca3af',
  draft:          '#818cf8',
  needs_revision: '#f97316',
  approved:       '#22c55e',
}

const VISUAL_LABEL: Record<string, string> = {
  needed:         'Visual needed',
  draft:          'Visual ready',
  needs_revision: 'Revision needed',
  approved:       'Visual approved',
}

export default function ContentRow({ item, showActions = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visualDot = VISUAL_DOT[item.visual_status] ?? '#9ca3af'
  const visualLabel = VISUAL_LABEL[item.visual_status] ?? 'Visual needed'

  const dateStr = item.scheduled_date
    ? new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short',
      })
    : null

  return (
    <div
      className="group flex items-center bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-xl overflow-hidden hover:shadow-sm"
      style={{ borderLeft: `3px solid ${platformColour}` }}
    >
      {/* Platform */}
      <div className="px-3 w-24 flex-shrink-0">
        <span
          className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase"
          style={{ color: platformColour }}
        >
          {PLATFORM_LABEL[item.platform] ?? item.platform}
        </span>
      </div>

      {/* Title + caption */}
      <Link
        href={`/app/content/${item.id}`}
        className="flex-1 min-w-0 py-3 pr-4 group/link"
      >
        <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)] leading-snug truncate group-hover/link:text-[var(--color-gold)] transition-colors">
          {item.title}
        </p>
        {item.caption && (
          <p className="text-[11px] font-sans text-[var(--color-cream-x)] truncate mt-0.5 leading-relaxed">
            {item.caption}
          </p>
        )}
      </Link>

      {/* Meta */}
      <div className="hidden md:flex items-center gap-4 px-4 flex-shrink-0">
        {item.content_pillar && (
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] uppercase tracking-wide">
            {PILLAR_LABEL[item.content_pillar]}
          </span>
        )}

        {dateStr && (
          <span className="text-[11px] font-sans text-[var(--color-cream-dim)] tabular-nums whitespace-nowrap w-16 text-right">
            {dateStr}
          </span>
        )}

        {/* Visual status dot */}
        <div className="flex items-center gap-1.5 w-28 flex-shrink-0" title={visualLabel}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: visualDot }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] truncate">{visualLabel}</span>
        </div>
      </div>

      {/* Canva button — always visible when canva_url exists */}
      {item.canva_url ? (
        <a
          href={item.canva_url}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-lg text-[11px] font-sans font-bold whitespace-nowrap flex-shrink-0 border transition-all"
          style={{
            color: '#a78bfa',
            background: 'rgba(139,92,246,0.12)',
            borderColor: 'rgba(139,92,246,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.22)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Open in Canva ↗
        </a>
      ) : (
        <div className="w-[130px] flex-shrink-0" />
      )}

      {/* Actions */}
      {showActions && item.status === 'ready' && (
        <div className="flex items-stretch border-l border-[var(--color-border-w)] flex-shrink-0 self-stretch">
          <button
            onClick={() => startTransition(() => updateStatus(item.id, 'rejected'))}
            disabled={isPending}
            className="px-4 text-[11px] font-sans font-semibold text-[var(--color-cream-x)] hover:text-red-500 hover:bg-red-50 disabled:opacity-40 border-r border-[var(--color-border-w)]"
          >
            Reject
          </button>
          <button
            onClick={() => startTransition(() => updateStatus(item.id, 'scheduled'))}
            disabled={isPending}
            className="px-4 text-[11px] font-sans font-semibold disabled:opacity-40"
            style={{ color: '#22c55e' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            {isPending ? '…' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  )
}
