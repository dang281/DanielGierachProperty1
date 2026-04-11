'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { updateStatus, saveVisualFeedback, approveVisual } from '@/lib/actions/content'
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

const VISUAL_STATUS_CONFIG = {
  needed:         { label: 'Visual needed',    colour: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  draft:          { label: 'Visual ready',     colour: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  needs_revision: { label: 'Needs revision',   colour: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  approved:       { label: 'Visual approved',  colour: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
}

function VisualSection({ item }: { item: ContentItem }) {
  const [isPending, startTransition] = useTransition()
  const [givingFeedback, setGivingFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState(item.visual_feedback ?? '')
  const [showBrief, setShowBrief] = useState(false)

  const cfg = VISUAL_STATUS_CONFIG[item.visual_status] ?? VISUAL_STATUS_CONFIG.needed

  return (
    <div className="border-t border-[var(--color-border-w)] mt-1">
      {/* Visual thumbnail */}
      {item.visual_thumbnail && (
        <a href={item.canva_url ?? '#'} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.visual_thumbnail}
            alt="Visual preview"
            className="w-full object-cover"
            style={{ maxHeight: 140 }}
          />
        </a>
      )}

      <div className="px-4 py-2.5 flex flex-col gap-2">
        {/* Status row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-sans font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ color: cfg.colour, background: cfg.bg }}
          >
            {cfg.label}
          </span>
          <div className="flex items-center gap-2">
            {item.canva_url && (
              <a
                href={item.canva_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-sans font-semibold"
                style={{ color: '#818cf8' }}
              >
                Open in Canva ↗
              </a>
            )}
            {item.visual_brief && !item.canva_url && (
              <button
                onClick={() => setShowBrief(v => !v)}
                className="text-[10px] font-sans font-semibold"
                style={{ color: '#9ca3af' }}
              >
                {showBrief ? 'Hide brief ↑' : 'View brief ↓'}
              </button>
            )}
          </div>
        </div>

        {/* Visual brief */}
        {showBrief && item.visual_brief && (
          <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed whitespace-pre-wrap bg-[rgba(28,25,23,0.04)] rounded-lg p-2.5">
            {item.visual_brief}
          </p>
        )}

        {/* Existing feedback shown */}
        {item.visual_feedback && !givingFeedback && (
          <p className="text-[11px] font-sans leading-relaxed p-2 rounded-lg" style={{ background: 'rgba(249,115,22,0.07)', color: '#fed7aa' }}>
            {item.visual_feedback}
          </p>
        )}

        {/* Actions for draft / needs_revision */}
        {(item.visual_status === 'draft' || item.visual_status === 'needs_revision') && !givingFeedback && (
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => approveVisual(item.id))}
              className="flex-1 py-1.5 text-[10px] font-sans font-semibold rounded-lg transition-colors disabled:opacity-40"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
            >
              Approve visual
            </button>
            <button
              disabled={isPending}
              onClick={() => setGivingFeedback(true)}
              className="flex-1 py-1.5 text-[10px] font-sans font-semibold rounded-lg transition-colors disabled:opacity-40"
              style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316' }}
            >
              Give feedback
            </button>
          </div>
        )}

        {/* Feedback form */}
        {givingFeedback && (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="What needs changing? The agent will revise the visual."
              rows={2}
              className="w-full text-xs font-sans rounded-lg px-3 py-2 resize-none outline-none"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--color-cream)' }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setGivingFeedback(false); setFeedbackText(item.visual_feedback ?? '') }
              }}
            />
            <div className="flex gap-2">
              <button
                disabled={isPending || !feedbackText.trim()}
                onClick={() => startTransition(async () => {
                  await saveVisualFeedback(item.id, feedbackText.trim())
                  setGivingFeedback(false)
                })}
                className="flex-1 py-1.5 text-[10px] font-sans font-semibold rounded-lg disabled:opacity-40"
                style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}
              >
                {isPending ? 'Saving…' : 'Send feedback'}
              </button>
              <button
                onClick={() => { setGivingFeedback(false); setFeedbackText(item.visual_feedback ?? '') }}
                className="px-3 py-1.5 text-[10px] font-sans font-semibold rounded-lg"
                style={{ background: 'rgba(28,25,23,0.06)', color: 'var(--color-cream-x)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContentCard({ item, showActions = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'

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

      {/* Visual section */}
      <VisualSection item={item} />

      {/* Approve / Reject */}
      {showActions && item.status === 'ready' && (
        <div className="grid grid-cols-2 border-t border-[var(--color-border-w)]">
          <button
            onClick={() => startTransition(() => updateStatus(item.id, 'rejected'))}
            disabled={isPending}
            className="py-3 text-xs font-semibold font-sans text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
          >
            Reject
          </button>
          <button
            onClick={() => startTransition(() => updateStatus(item.id, 'scheduled'))}
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
