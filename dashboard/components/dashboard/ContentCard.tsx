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

export default function ContentCard({ item, showActions = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'

  function approve() {
    startTransition(() => updateStatus(item.id, 'scheduled'))
  }
  function reject() {
    startTransition(() => updateStatus(item.id, 'rejected'))
  }

  return (
    <div
      className="bg-[var(--color-card)] rounded-xl flex flex-col overflow-hidden border border-[var(--color-border-w)] hover:border-[rgba(28,25,23,0.25)] transition-colors"
      style={{ borderLeft: `3px solid ${platformColour}` }}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Platform + Pillar row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase"
            style={{ color: platformColour }}
          >
            {PLATFORM_LABEL[item.platform] ?? item.platform}
          </span>
          <div className="flex items-center gap-2">
            {item.content_pillar && (
              <span className="text-[10px] font-sans text-[var(--color-cream-x)] uppercase tracking-wide">
                {PILLAR_LABEL[item.content_pillar]}
              </span>
            )}
            {item.score != null && (
              <span className="text-[10px] font-sans text-[var(--color-gold)]">
                {item.score}/10
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/app/content/${item.id}`}
          className="text-[var(--color-cream)] font-sans font-semibold text-sm leading-snug hover:text-[var(--color-gold)] transition-colors"
        >
          {item.title}
        </Link>

        {/* Caption preview */}
        {item.caption && (
          <p className="text-[var(--color-cream-dim)] text-xs leading-relaxed line-clamp-3 font-sans flex-1">
            {item.caption}
          </p>
        )}

        {/* Date */}
        <span className="text-[var(--color-cream-x)] text-[11px] font-sans">
          {item.scheduled_date
            ? new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
                weekday: 'short', day: 'numeric', month: 'short',
              })
            : 'No date set'}
        </span>
      </div>

      {/* Approve / Reject */}
      {showActions && item.status === 'ready' && (
        <div className="grid grid-cols-2 border-t border-[var(--color-border-w)]">
          <button
            onClick={reject}
            disabled={isPending}
            className="py-3 text-xs font-semibold font-sans text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
          >
            Reject
          </button>
          <button
            onClick={approve}
            disabled={isPending}
            className="py-3 text-xs font-semibold font-sans hover:bg-[rgba(34,197,94,0.1)] transition-colors disabled:opacity-40"
            style={{ color: '#22c55e' }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  )
}
