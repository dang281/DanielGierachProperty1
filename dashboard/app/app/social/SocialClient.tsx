'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import ContentRow from '@/components/dashboard/ContentRow'
import { sendChangeRequestToAgent } from '@/lib/actions/paperclip'
import type { ContentItem } from '@/types/content'
import type { Issue } from '@/types/paperclip'

const PLATFORMS = [
  { value: 'linkedin',  label: 'LinkedIn',  colour: '#0a66c2' },
  { value: 'facebook',  label: 'Facebook',  colour: '#0866ff' },
]

const STATUSES = [
  { value: 'idea',      label: 'Needs Review', colour: '#c4912a' },
  { value: 'scheduled', label: 'Scheduled',    colour: '#22c55e' },
  { value: 'posted',    label: 'Posted',       colour: '#3b82f6' },
  { value: 'rejected',  label: 'Rejected',     colour: '#ef4444' },
  { value: 'archived',  label: 'Archive',      colour: '#6b5a3e' },
]

const PILLARS = [
  { value: 'seller',    label: 'Seller'    },
  { value: 'authority', label: 'Authority' },
  { value: 'suburb',    label: 'Suburb'    },
  { value: 'proof',     label: 'Proof'     },
  { value: 'buyer',     label: 'Buyer'     },
]

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

export default function SocialClient({
  items,
  pendingFeedback = [],
  issuesByPost = {},
}: {
  items: ContentItem[]
  pendingFeedback?: ContentItem[]
  issuesByPost?: Record<string, Issue>
}) {
  const [platform, setPlatform] = useState<string | null>(null)
  const [status,   setStatus]   = useState<string | null>(null)
  const [pillar,   setPillar]   = useState<string | null>(null)
  const [search,   setSearch]   = useState('')

  const filtered = useMemo(() => {
    let out = items
    if (platform) out = out.filter(i => i.platform === platform)
    if (status)   out = out.filter(i => i.status === status)
    if (pillar)   out = out.filter(i => i.content_pillar === pillar)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.caption?.toLowerCase().includes(q)
      )
    }
    return out
  }, [items, platform, status, pillar, search])

  // Counts for filter badges
  const counts = useMemo(() => ({
    platforms: Object.fromEntries(PLATFORMS.map(p => [p.value, items.filter(i => i.platform === p.value).length])),
    statuses:  Object.fromEntries(STATUSES.map(s => [s.value, items.filter(i => i.status === s.value).length])),
  }), [items])

  const showActions = !status || status === 'ready'

  return (
    <>
      {/* ── Change Requests ── */}
      {pendingFeedback.length > 0 && (
        <ChangeRequestsSection
          pendingFeedback={pendingFeedback}
          issuesByPost={issuesByPost}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-serif text-xl text-[var(--color-cream)]">Social</h1>
          <span className="text-sm font-sans text-[var(--color-cream-x)]">
            {filtered.length} of {items.length} posts
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cream-x)]"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[12px] font-sans rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card)] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] outline-none focus:border-[var(--color-gold)] w-44 sm:w-56"
          />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Platform */}
        <div className="flex items-center gap-1">
          <Chip active={platform === null} colour="var(--color-cream-dim)" onClick={() => setPlatform(null)}>
            All
          </Chip>
          {PLATFORMS.map(p => (
            <Chip
              key={p.value}
              active={platform === p.value}
              colour={p.colour}
              count={counts.platforms[p.value]}
              onClick={() => setPlatform(platform === p.value ? null : p.value)}
            >
              {p.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-[var(--color-border-w)]" />

        {/* Status */}
        <div className="flex items-center gap-1">
          {STATUSES.map(s => (
            <Chip
              key={s.value}
              active={status === s.value}
              colour={s.colour}
              count={counts.statuses[s.value]}
              onClick={() => setStatus(status === s.value ? null : s.value)}
            >
              {s.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-[var(--color-border-w)]" />

        {/* Pillar */}
        <div className="flex items-center gap-1">
          {PILLARS.map(p => (
            <Chip
              key={p.value}
              active={pillar === p.value}
              colour="var(--color-cream-dim)"
              onClick={() => setPillar(pillar === p.value ? null : p.value)}
            >
              {p.label}
            </Chip>
          ))}
        </div>

        {/* Clear */}
        {(platform || status || pillar || search) && (
          <button
            onClick={() => { setPlatform(null); setStatus(null); setPillar(null); setSearch('') }}
            className="text-[11px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] ml-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)]">
          <p className="text-sm font-sans text-[var(--color-cream-x)]">No posts match these filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map(item => (
            <ContentRow
              key={item.id}
              item={item}
              showActions={showActions && item.status === 'ready'}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ── Status legend definition ────────────────────────────────────────────────

const LEGEND = [
  { colour: '#f59e0b', label: 'Not sent to agent', desc: 'Feedback saved in dashboard — agent has not been notified' },
  { colour: '#9ca3af', label: 'Queued',             desc: 'Paperclip task created, agent has not started yet' },
  { colour: '#f59e0b', label: 'Agent working',      desc: 'Agent is actively making the requested changes' },
  { colour: '#8b5cf6', label: 'Needs review',       desc: 'Agent is done — check the post and approve or request further changes' },
  { colour: '#22c55e', label: 'Done',               desc: 'Change completed and closed' },
  { colour: '#6b7280', label: 'Cancelled',          desc: 'Task was dismissed or withdrawn' },
]

// ── Change Requests section ─────────────────────────────────────────────────

function ChangeRequestsSection({
  pendingFeedback,
  issuesByPost,
}: {
  pendingFeedback: ContentItem[]
  issuesByPost: Record<string, Issue>
}) {
  const [showLegend, setShowLegend] = useState(false)
  // Track sent state per post: postId -> identifier or 'sending'
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
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--color-cream-dim)]">
            Change Requests
          </h2>
          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(196,145,42,0.15)', color: '#c4912a' }}>
            {pendingFeedback.length}
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
        {pendingFeedback.map(post => {
          const issue = issuesByPost[post.id]
          const sentId = sent[post.id]
          const isSending = sentId === 'sending'
          const isJustSent = sentId && sentId !== 'sending'

          // Prefer live Paperclip issue; fall back to just-dispatched state
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

              {/* Agent status + optional send button */}
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

function Chip({
  children, active, colour, count, onClick,
}: {
  children: React.ReactNode
  active: boolean
  colour: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium border transition-all"
      style={active
        ? { color: colour, background: colour + '15', borderColor: colour + '40' }
        : { color: 'var(--color-cream-x)', background: 'transparent', borderColor: 'transparent' }
      }
    >
      {children}
      {count != null && (
        <span className="tabular-nums opacity-70 text-[10px]">{count}</span>
      )}
    </button>
  )
}
