'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import type { ContentItem, Status } from '@/types/content'
import { PLATFORM_COLOUR, PILLAR_COLOUR, STATUS_BG, STATUS_BORDER } from '@/types/content'
import { updateStatus, updateItem } from '@/lib/actions/content'

const VISUAL_SERVER = 'http://localhost:3033'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_ICON:  Record<string, string> = { linkedin: 'in', facebook: 'f' }
const PLATFORM_LABEL: Record<string, string> = { linkedin: 'LinkedIn', facebook: 'Facebook' }
const PILLAR_LABEL:   Record<string, string> = {
  seller: 'Seller', authority: 'Authority', suburb: 'Suburb', proof: 'Proof', buyer: 'Buyer',
}
const VISUAL_DOT: Record<string, { colour: string; label: string }> = {
  needed:         { colour: '#9ca3af', label: 'Visual needed'   },
  draft:          { colour: '#818cf8', label: 'Draft ready'     },
  needs_revision: { colour: '#f97316', label: 'Needs revision'  },
  approved:       { colour: '#22c55e', label: 'Visual approved' },
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ notes }: { notes: string | null }) {
  if (!notes) return null
  const m = notes.match(/\*\*Confidence:\s*(Ready|Check|Hold)\*\*/i)
  if (!m) return null
  const conf   = m[1] as 'Ready' | 'Check' | 'Hold'
  const colours: Record<string, string> = { Ready: '#22c55e', Check: '#f97316', Hold: '#ef4444' }
  return (
    <span
      className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ color: colours[conf], background: `${colours[conf]}18` }}
    >
      {conf}
    </span>
  )
}

// ─── Notes excerpt ────────────────────────────────────────────────────────────

function NotesExcerpt({ notes }: { notes: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!notes) return null

  // Extract the key lines for the triage summary
  const statLine    = notes.match(/\*\*1\. Stat to verify[^*]*:\*\*\s*([^\n]+)/i)
  const approveLine = notes.match(/\*\*3\. Approve or flag:\*\*\s*([^\n]+)/i)

  if (!statLine && !approveLine) {
    const snippet = notes.slice(0, 160)
    return (
      <p className="text-[10px] font-sans text-[var(--color-cream-x)] leading-relaxed">
        {snippet}{notes.length > 160 ? '…' : ''}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {statLine && (
        <p className="text-[10px] font-sans leading-snug">
          <span className="text-[var(--color-cream-x)]">Verify: </span>
          <span className="text-[var(--color-cream-dim)]">{statLine[1].trim()}</span>
        </p>
      )}
      {approveLine && (
        <p className="text-[10px] font-sans leading-snug">
          <span className="text-[var(--color-cream-x)]">Action: </span>
          <span className="text-[var(--color-cream-dim)]">{approveLine[1].trim()}</span>
        </p>
      )}
      <button
        onClick={() => setExpanded(e => !e)}
        className="text-[9px] font-sans text-[var(--color-gold)] hover:underline text-left"
      >
        {expanded ? '↑ Hide full notes' : '↓ Show full notes'}
      </button>
      {expanded && (
        <pre className="text-[9px] font-sans text-[var(--color-cream-x)] leading-relaxed whitespace-pre-wrap bg-[rgba(0,0,0,0.2)] rounded p-2 mt-1">
          {notes}
        </pre>
      )}
    </div>
  )
}

// ─── Revision form ────────────────────────────────────────────────────────────

function RevisionForm({
  item,
  onSent,
  onCancel,
}: {
  item: ContentItem
  onSent: () => void
  onCancel: () => void
}) {
  const [note, setNote]         = useState('')
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    startTransition(async () => {
      const appendedNote = item.notes
        ? `${item.notes}\n\n---\n**Daniel revision request:** ${note.trim()}`
        : `**Daniel revision request:** ${note.trim()}`
      await updateItem(item.id, { status: 'idea', notes: appendedNote })
      onSent()
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border-w)]">
      <p className="text-[10px] font-sans text-[var(--color-cream-x)]">Note for the agent:</p>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="What needs changing?"
        rows={2}
        autoFocus
        className="w-full rounded-lg border px-3 py-2 text-[11px] font-sans text-[var(--color-cream)] resize-none focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border-w)' }}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !note.trim()}
          className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-opacity"
          style={{ background: '#f97316', color: '#fff', opacity: isPending || !note.trim() ? 0.5 : 1 }}
        >
          {isPending ? 'Sending…' : 'Send to agent'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold border text-[var(--color-cream-dim)]"
          style={{ borderColor: 'var(--color-border-w)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Visual generation ────────────────────────────────────────────────────────

type VisualState = 'idle' | 'pinging' | 'generating' | 'done' | 'error' | 'fallback'

function buildVisualPayload(item: ContentItem): { type: string; params: Record<string, string> } {
  const shortTitle = (t: string) => t.includes(' - ') ? t.split(' - ').slice(1).join(' - ') : t
  const title   = shortTitle(item.title).slice(0, 80)
  const caption = (item.caption ?? '').replace(/\n+/g, ' ')
  const date    = item.scheduled_date ?? new Date().toISOString().split('T')[0]
  const tl      = item.title.toLowerCase()
  const isArticle   = tl.includes('article feature') || tl.includes('article:')
  const isFieldGuide = tl.includes('field guide') || (item.content_type ?? '').toLowerCase().includes('field guide')
  const LABEL_MAP: Record<string, string> = {
    buyer: 'BUYER INSIGHT', seller: 'SELLER INSIGHT',
    suburb: 'INNER EAST',   authority: 'AUTHORITY', proof: 'AUTHORITY',
  }
  if (isArticle && !isFieldGuide) {
    const slug = (item.destination_url ?? '').split('/').filter(Boolean).pop()
      ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return { type: 'article', params: {
      headline: title,
      excerpt: caption.split(/[.!?]/)[0].slice(0, 180),
      slug,
      date,
    }}
  }
  return { type: 'market', params: {
    label: isFieldGuide ? 'FIELD GUIDE' : (LABEL_MAP[item.content_pillar ?? ''] ?? 'MARKET UPDATE'),
    headline: title,
    body: caption.slice(0, 220),
    date,
  }}
}

function buildShellCommand(item: ContentItem): string {
  const { type, params } = buildVisualPayload(item)
  const date  = params.date ?? item.scheduled_date ?? 'YYYY-MM-DD'
  const slug  = type === 'article' ? '-article' : '-market'
  const out   = `content/social/images/${date}-linkedin${slug}.png`
  const flags = Object.entries(params)
    .map(([k, v]) => `  --${k} "${v}"`)
    .join(' \\\n')
  return `node scripts/screenshot-linkedin.mjs \\\n  --type ${type} \\\n${flags} \\\n  --out ${out}`
}

function GenerateVisualButton({ item, onGenerated }: {
  item:        ContentItem
  onGenerated: (url: string) => void
}) {
  const [state,   setState]   = useState<VisualState>('idle')
  const [url,     setUrl]     = useState<string | null>(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [copied,  setCopied]  = useState(false)

  const run = useCallback(async () => {
    setState('pinging')
    try {
      const ping = await fetch(`${VISUAL_SERVER}/ping`, {
        signal: AbortSignal.timeout(1500),
      })
      if (!ping.ok) throw new Error('Server not OK')
    } catch {
      setState('fallback')
      return
    }

    setState('generating')
    try {
      const { type, params } = buildVisualPayload(item)
      const res = await fetch(`${VISUAL_SERVER}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: item.id, type, params }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Generation failed')
      setUrl(data.url)
      onGenerated(data.url)
      setState('done')
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Generation failed')
      setState('error')
    }
  }, [item, onGenerated])

  function copyCmd() {
    navigator.clipboard.writeText(buildShellCommand(item))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state === 'idle') {
    return (
      <button onClick={run}
        className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold border transition-all"
        style={{ color: '#818cf8', borderColor: 'rgba(129,140,248,0.35)', background: 'rgba(129,140,248,0.08)' }}>
        Generate visual
      </button>
    )
  }

  if (state === 'pinging' || state === 'generating') {
    return (
      <span className="text-[10px] font-sans px-3 py-1.5 rounded-lg"
        style={{ color: 'var(--color-cream-x)', background: 'rgba(0,0,0,0.15)' }}>
        {state === 'pinging' ? 'Connecting…' : 'Generating…'}
      </span>
    )
  }

  if (state === 'done' && url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-sans font-semibold" style={{ color: '#22c55e' }}>✓ Visual ready</span>
        <img src={url} alt="" className="w-12 h-12 rounded object-contain" style={{ background: '#0a0806' }} />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-sans" style={{ color: '#ef4444' }}>Error: {errMsg}</span>
        <button onClick={() => setState('idle')} className="text-[9px] font-sans text-[var(--color-cream-x)] hover:underline">Retry</button>
      </div>
    )
  }

  // fallback — server not running
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border-w)' }}>
      <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
        Visual server not running. Start it with:
      </p>
      <code className="text-[9px] font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: '#818cf8' }}>
        node scripts/visual-server.mjs
      </code>
      <p className="text-[10px] font-sans mt-1" style={{ color: 'var(--color-cream-x)' }}>
        Or copy the command to run manually:
      </p>
      <pre className="text-[8px] font-mono leading-relaxed px-2 py-1.5 rounded overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--color-cream-dim)' }}>
        {buildShellCommand(item)}
      </pre>
      <div className="flex gap-2">
        <button onClick={copyCmd}
          className="text-[9px] font-sans font-semibold px-2 py-1 rounded"
          style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>
          {copied ? '✓ Copied' : 'Copy command'}
        </button>
        <button onClick={() => setState('idle')} className="text-[9px] font-sans text-[var(--color-cream-x)] hover:underline">
          Try again
        </button>
      </div>
    </div>
  )
}

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({ item, onAction }: { item: ContentItem; onAction: (id: string, action: 'approve' | 'reject' | 'revise') => void }) {
  const [showRevision, setShowRevision] = useState(false)
  const [isPending, startTransition]    = useTransition()
  const [actionDone, setActionDone]     = useState<string | null>(null)
  const [thumbUrl, setThumbUrl]         = useState<string | null>(item.visual_thumbnail ?? null)
  const pc     = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

  function approve() {
    startTransition(async () => {
      await updateStatus(item.id, 'scheduled')
      setActionDone('approved')
      onAction(item.id, 'approve')
    })
  }

  function reject() {
    startTransition(async () => {
      await updateStatus(item.id, 'rejected')
      setActionDone('rejected')
      onAction(item.id, 'reject')
    })
  }

  if (actionDone) {
    return (
      <div className="rounded-xl border px-4 py-3 flex items-center gap-3"
        style={{ borderColor: actionDone === 'approved' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)',
          background: actionDone === 'approved' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
        <span className="text-[11px] font-sans font-semibold" style={{ color: actionDone === 'approved' ? '#22c55e' : '#ef4444' }}>
          {actionDone === 'approved' ? '✓ Scheduled' : '✕ Rejected'}
        </span>
        <span className="text-[11px] font-sans text-[var(--color-cream-dim)] truncate">{item.title}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: STATUS_BORDER[item.status as Status] ?? 'var(--color-border-w)',
        background: STATUS_BG[item.status as Status] ?? 'var(--color-card)',
        borderLeft: `3px solid ${pc}` }}>
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Platform */}
          <span className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: pc, color: '#fff' }}>
            {PLATFORM_ICON[item.platform] ?? '?'}
          </span>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <ConfidenceBadge notes={item.notes} />
              {item.content_pillar && (
                <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: PILLAR_COLOUR[item.content_pillar], background: `${PILLAR_COLOUR[item.content_pillar]}22` }}>
                  {PILLAR_LABEL[item.content_pillar]}
                </span>
              )}
              {item.score != null && (
                <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded"
                  style={{ color: item.score >= 8 ? '#22c55e' : item.score >= 6 ? '#f97316' : '#ef4444',
                    background: 'rgba(0,0,0,0.2)' }}>
                  {item.score}/10
                </span>
              )}
              <span className="text-[9px] font-sans text-[var(--color-cream-x)] ml-auto flex-shrink-0">
                {PLATFORM_LABEL[item.platform]}
                {item.scheduled_date && ` · ${new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                {item.scheduled_time && ` ${item.scheduled_time}`}
              </span>
            </div>

            <Link href={`/app/content/${item.id}`}
              className="text-[13px] font-sans font-semibold text-[var(--color-cream)] leading-snug hover:text-[var(--color-gold)] transition-colors block mb-2">
              {item.title}
            </Link>

            {/* Notes */}
            <NotesExcerpt notes={item.notes} />
          </div>
        </div>

        {/* Visual status */}
        <div className="flex items-center gap-1.5 ml-9">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: visual.colour }} />
          <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
          {item.canva_url && (
            <a href={item.canva_url} target="_blank" rel="noreferrer"
              className="text-[9px] font-sans font-bold rounded px-1.5 py-0.5 ml-1"
              style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.15)' }}>
              Canva ↗
            </a>
          )}
          {thumbUrl && (
            <a href={thumbUrl} target="_blank" rel="noreferrer" className="ml-1">
              <img src={thumbUrl} alt="Visual preview" className="w-8 h-8 rounded object-contain"
                style={{ background: '#0a0806', border: '1px solid var(--color-border-w)' }} />
            </a>
          )}
        </div>

        {/* Revision form */}
        {showRevision && (
          <RevisionForm
            item={item}
            onSent={() => { setShowRevision(false); setActionDone('revised') }}
            onCancel={() => setShowRevision(false)}
          />
        )}

        {/* Action buttons */}
        {!showRevision && (
          <div className="flex flex-wrap items-center gap-2 ml-9">
            <button
              onClick={approve}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-all"
              style={{ background: '#22c55e', color: '#fff', opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? '…' : '✓ Approve'}
            </button>
            <button
              onClick={() => setShowRevision(true)}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold border transition-all"
              style={{ color: '#f97316', borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)',
                opacity: isPending ? 0.6 : 1 }}
            >
              Request revision
            </button>
            <button
              onClick={reject}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold border transition-all"
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'transparent',
                opacity: isPending ? 0.6 : 1 }}
            >
              Reject
            </button>
            {item.visual_status !== 'approved' && (
              <GenerateVisualButton
                item={item}
                onGenerated={url => setThumbUrl(url)}
              />
            )}
            <Link href={`/app/content/${item.id}`}
              className="ml-auto text-[9px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors flex-shrink-0">
              Edit in full →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 2-week schedule grid ─────────────────────────────────────────────────────

const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS_DOT: Record<string, string> = {
  ready:     '#a855f7',
  scheduled: '#22c55e',
  posted:    '#3b82f6',
  idea:      '#6b7280',
  rejected:  '#ef4444',
}

function mondayOf(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00')
  const day = (d.getDay() + 6) % 7 // 0=Mon
  d.setDate(d.getDate() - day)
  return d
}

function isoStr(d: Date): string {
  return d.toLocaleDateString('en-CA')
}

function ScheduleGrid({ allLinkedin, today }: { allLinkedin: ContentItem[]; today: string }) {
  const mon0 = mondayOf(today)
  const mon1 = new Date(mon0); mon1.setDate(mon0.getDate() + 7)

  const weeks = [mon0, mon1].map(mon => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i)
      return d
    })
    const label = `${days[0].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    return { days, label }
  })

  const byDate = new Map<string, ContentItem[]>()
  allLinkedin.forEach(item => {
    if (!item.scheduled_date) return
    const existing = byDate.get(item.scheduled_date) ?? []
    byDate.set(item.scheduled_date, [...existing, item])
  })

  const isTargetDay = (d: Date) => [2, 3, 4].includes(d.getDay()) // Tue/Wed/Thu

  return (
    <div className="flex flex-col gap-3">
      {weeks.map((week, wi) => (
        <div key={wi}>
          <p className="text-[10px] font-sans text-[var(--color-cream-x)] mb-1.5">
            {wi === 0 ? 'This week' : 'Next week'} · {week.label}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {week.days.map((day, di) => {
              const str     = isoStr(day)
              const isToday = str === today
              const posts   = byDate.get(str) ?? []
              const target  = isTargetDay(day)

              return (
                <div key={di}
                  className="rounded-lg p-1.5 flex flex-col gap-1 min-h-[64px]"
                  style={{
                    background: isToday ? 'rgba(196,145,42,0.08)' : target ? 'var(--color-card)' : 'transparent',
                    border: isToday ? '1px solid rgba(196,145,42,0.4)' : target ? '1px solid var(--color-border-w)' : '1px solid transparent',
                  }}>
                  <div className="flex items-center justify-between gap-0.5">
                    <span className="text-[9px] font-sans font-bold uppercase"
                      style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-dim)' }}>
                      {DOW_SHORT[di]}
                    </span>
                    <span className="text-[9px] font-sans tabular-nums"
                      style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-x)' }}>
                      {day.getDate()}
                    </span>
                  </div>

                  {posts.length > 0 ? (
                    posts.map((post, pi) => (
                      <div key={pi} className="flex items-start gap-1 group">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                          style={{ background: STATUS_DOT[post.status] ?? '#6b7280' }} />
                        <span className="text-[9px] font-sans leading-tight text-[var(--color-cream-dim)] line-clamp-2 group-hover:text-[var(--color-cream)] transition-colors">
                          {post.title}
                        </span>
                      </div>
                    ))
                  ) : target ? (
                    <span className="text-[8px] font-sans text-[var(--color-cream-x)] opacity-50 mt-auto">
                      {di === 1 ? 'Market / Authority' : di === 2 ? 'Poll' : di === 3 ? 'Field Guide' : ''}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        {[['ready', 'Needs approval'], ['scheduled', 'Approved'], ['idea', 'Queued (idea)']] .map(([s, l]) => (
          <div key={s} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[s] }} />
            <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WeeklyContentReview({
  initialItems,
  today,
}: {
  initialItems: ContentItem[]
  today: string
}) {
  const allLinkedin = initialItems
    .filter(i => i.platform === 'linkedin' && i.scheduled_date != null)
    .sort((a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))

  const [items, setItems] = useState<ContentItem[]>(
    initialItems
      .filter(i => i.status === 'ready' && i.platform === 'linkedin')
      .sort((a, b) => (a.scheduled_date ?? '9999').localeCompare(b.scheduled_date ?? '9999')),
  )

  function handleAction(id: string, _action: 'approve' | 'reject' | 'revise') {
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id))
    }, 1200)
  }

  return (
    <section className="flex flex-col gap-4">

      {/* ── Schedule grid ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
            LinkedIn Schedule
          </h2>
          <div className="flex-1 h-px bg-[var(--color-border-w)]" />
          <a href="/app/calendar" className="text-[10px] font-sans font-semibold text-[var(--color-gold)] hover:underline">
            Full calendar →
          </a>
        </div>
        <ScheduleGrid allLinkedin={allLinkedin} today={today} />
      </div>

      {/* ── Review queue ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
            Needs Approval
          </h2>
          {items.length > 0 && (
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full"
              style={{ color: '#a855f7', background: 'rgba(168,85,247,0.12)' }}>
              {items.length} post{items.length !== 1 ? 's' : ''}
            </span>
          )}
          <div className="flex-1 h-px bg-[var(--color-border-w)]" />
          <a href="/app/social" className="text-[10px] font-sans font-semibold text-[var(--color-gold)] hover:underline">
            All posts →
          </a>
        </div>

        {items.length === 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card)]">
            <span className="text-[11px]" style={{ color: '#22c55e' }}>✓</span>
            <span className="text-[11px] font-sans text-[var(--color-cream-x)]">
              All clear — no LinkedIn posts awaiting approval
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <ReviewCard key={item.id} item={item} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>

    </section>
  )
}
