'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendChangeRequestToAgent } from '@/lib/actions/paperclip'
import type { ContentItem } from '@/types/content'
import type { Issue } from '@/types/paperclip'

const ISSUE_STATUS_LABEL: Record<string, string> = {
  todo:         'Queued',
  in_progress:  'Agent working',
  needs_review: 'Needs review',
  done:         'Done',
  cancelled:    'Cancelled',
}

const ISSUE_STATUS_COLOUR: Record<string, string> = {
  todo:         '#9ca3af',
  in_progress:  '#f59e0b',
  needs_review: '#8b5cf6',
  done:         '#22c55e',
  cancelled:    '#6b7280',
}

const LEGEND = [
  { colour: '#f59e0b', label: 'Not sent to agent', desc: 'Feedback saved in dashboard — agent has not been notified' },
  { colour: '#9ca3af', label: 'Queued',             desc: 'Paperclip task created, agent has not started yet' },
  { colour: '#f59e0b', label: 'Agent working',      desc: 'Agent is actively making the requested changes' },
  { colour: '#8b5cf6', label: 'Needs review',       desc: 'Agent is done — check the post and approve or request further changes' },
  { colour: '#22c55e', label: 'Done',               desc: 'Change completed and closed' },
  { colour: '#6b7280', label: 'Cancelled',          desc: 'Task was dismissed or withdrawn' },
]

export default function ChangeRequests({
  items,
  issuesByPost,
}: {
  items: ContentItem[]
  issuesByPost: Record<string, Issue>
}) {
  const [showLegend, setShowLegend] = useState(false)
  const [sent, setSent] = useState<Record<string, string>>({})

  async function handleSend(post: ContentItem) {
    if (!post.visual_feedback) return
    setSent(s => ({ ...s, [post.id]: 'sending' }))
    const result = await sendChangeRequestToAgent(post.id, post.title, post.visual_feedback)
    if (result.success && result.identifier) {
      setSent(s => ({ ...s, [post.id]: result.identifier! }))
    } else {
      setSent(s => { const n = { ...s }; delete n[post.id]; return n })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--color-cream-dim)]">
            Change Requests
          </h2>
          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(196,145,42,0.15)', color: '#c4912a' }}>
            {items.length}
          </span>
        </div>
        <button
          onClick={() => setShowLegend(v => !v)}
          className="text-[10px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] flex items-center gap-1 transition-colors"
        >
          Status guide
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            {showLegend
              ? <path d="M2 7 L5 4 L8 7"/>
              : <path d="M2 3 L5 6 L8 3"/>}
          </svg>
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="rounded-xl border border-[var(--color-border-w)] px-4 py-3 flex flex-col gap-2"
          style={{ background: 'var(--color-card)' }}>
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-cream-x)' }}>Agent task status</p>
          {LEGEND.map(l => (
            <div key={l.label} className="flex items-start gap-2.5">
              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-px"
                style={{ color: l.colour, background: `${l.colour}18`, border: `1px solid ${l.colour}44` }}>
                {l.label}
              </span>
              <span className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">
                {l.desc}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Post rows */}
      <div className="flex flex-col gap-2">
        {items.map(post => {
          const issue = issuesByPost[post.id]
          const sentId = sent[post.id]
          const isSending = sentId === 'sending'
          const isJustSent = sentId && sentId !== 'sending'

          const status = issue?.status ?? null
          const statusLabel = status
            ? (ISSUE_STATUS_LABEL[status] ?? status)
            : isJustSent ? 'Queued' : 'Not sent to agent'
          const statusColour = status
            ? (ISSUE_STATUS_COLOUR[status] ?? '#9ca3af')
            : isJustSent ? '#9ca3af' : '#f59e0b'
          const identifier = issue?.identifier ?? (isJustSent ? sentId : null)

          const cleanTitle = post.title
            .replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s\-]+|Poll[:\s\-]+)/i, '')
            .trim()

          return (
            <div key={post.id}
              className="flex items-start gap-4 rounded-xl border px-4 py-3"
              style={{ background: 'var(--color-card)', borderColor: 'rgba(196,145,42,0.25)' }}>

              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#c4912a' }} />

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Link href={`/app/content/${post.id}`}
                  className="text-[13px] font-sans font-semibold text-[var(--color-cream)] hover:text-[var(--color-gold)] transition-colors truncate">
                  {cleanTitle}
                </Link>
                <p className="text-[11px] font-sans text-[var(--color-cream-dim)] line-clamp-2">
                  {post.visual_feedback}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: statusColour, background: `${statusColour}18`, border: `1px solid ${statusColour}44` }}>
                  {statusLabel}
                </span>
                {identifier && (
                  <span className="text-[9px] font-mono text-[var(--color-cream-x)]">{identifier}</span>
                )}
                {!issue && !isJustSent && (
                  <button
                    onClick={() => handleSend(post)}
                    disabled={isSending}
                    className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full transition-all disabled:opacity-50"
                    style={{
                      color: '#c4912a',
                      background: 'rgba(196,145,42,0.1)',
                      border: '1px solid rgba(196,145,42,0.3)',
                    }}
                  >
                    {isSending ? 'Sending…' : 'Send to agent'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
