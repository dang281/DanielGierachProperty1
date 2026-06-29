'use client'

import { useMemo, useState } from 'react'
import type { ContentItem } from '@/types/content'
import { STATUS_LABEL, STATUS_COLOUR, STATUS_BG, STATUS_BORDER } from '@/types/content'
import { approvePost, unapprovePost, approveWeek, updateItem, regenerateVisual, scheduleLibraryPost } from '@/lib/actions/content'
import LinkedInPreview from '@/components/LinkedInPreview'

type Props = { items: ContentItem[] }

type DayRole = 'tool' | 'poll' | 'article'

type WeekBucket = {
  weekKey: string
  tueDate: string       // ISO date for Tuesday of this week
  weekLabel: string
  themeLabel: string | null
  tue?: ContentItem
  wed?: ContentItem
  thu?: ContentItem
}

const ROLE_COLOUR: Record<DayRole, string> = {
  tool:    '#c4912a',
  poll:    '#3b82f6',
  article: '#a855f7',
}

// Poll-first arc (revised 2026-05-30): Tue=poll, Wed=tool, Thu=article
const ROLE_LABEL: Record<DayRole, string> = {
  poll:    'TUE · POLL',
  tool:    'WED · TOOL',
  article: 'THU · ARTICLE',
}

const ROLE_TINT: Record<DayRole, string> = {
  tool:    'rgba(196,145,42,0.04)',
  poll:    'rgba(59,130,246,0.04)',
  article: 'rgba(168,85,247,0.04)',
}

// ─── Date utilities ──────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const weekNum = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function tuesdayOfWeek(weekKey: string): Date {
  const [year, w] = weekKey.split('-W')
  const jan4 = new Date(Date.UTC(+year, 0, 4))
  const jan4Dow = (jan4.getUTCDay() + 6) % 7 // Mon=0
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Dow + (+w - 1) * 7)
  const tue = new Date(monday)
  tue.setUTCDate(monday.getUTCDate() + 1)
  return tue
}

function fmtRange(tue: Date): string {
  const thu = new Date(tue)
  thu.setUTCDate(tue.getUTCDate() + 2)
  const opt: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  return `${tue.toLocaleDateString('en-AU', opt)} – ${thu.toLocaleDateString('en-AU', opt)} ${tue.getUTCFullYear()}`
}

function dayOfWeek(dateStr: string | null): number | null {
  if (!dateStr) return null
  return new Date(dateStr + 'T12:00:00Z').getUTCDay()
}

function thisWeekTuesday(): Date {
  const today = new Date()
  today.setUTCHours(12, 0, 0, 0)
  const dow = (today.getUTCDay() + 6) % 7 // Mon=0
  const monday = new Date(today)
  monday.setUTCDate(today.getUTCDate() - dow)
  const tue = new Date(monday)
  tue.setUTCDate(monday.getUTCDate() + 1)
  return tue
}

function extractTheme(item: ContentItem | undefined): string | null {
  if (!item) return null
  // Look for "Week theme: foo" in caption/notes
  const text = `${item.caption ?? ''}\n${item.notes ?? ''}`
  const m = text.match(/Week theme[:\s]+([a-z0-9\-]+)/i)
  if (m) return m[1].replace(/-/g, ' ')
  return null
}

// Normalise caption for LinkedIn paste: collapse hashtag lines into a single
// space-separated line, drop the markdown headers, drop trailing blanks.
function captionForClipboard(raw: string | null): string {
  if (!raw) return ''
  // If the caption contains markdown section headers, take only the body between
  // "## Caption" and the next "##" header.
  const captionMatch = raw.match(/##\s*Caption\s*\n([\s\S]+?)(?:\n##|$)/i)
  const hashtagsMatch = raw.match(/##\s*Hashtags\s*\n([\s\S]+?)(?:\n##|$)/i)
  let body = (captionMatch ? captionMatch[1] : raw).trim()
  body = body.replace(/^---+\s*$/gm, '').trim()
  const tags = hashtagsMatch
    ? hashtagsMatch[1].split('\n').map(s => s.trim()).filter(s => s.startsWith('#')).join(' ').trim()
    : ''
  return tags ? `${body}\n\n${tags}` : body
}

function firstCommentForClipboard(raw: string | null): string | null {
  if (!raw) return null
  const m = raw.match(/##\s*First [Cc]omment\s*\n([\s\S]+?)(?:\n##|$)/)
  if (!m) return null
  return m[1].trim().replace(/^---+\s*$/gm, '').trim()
}

function pollQuestionForClipboard(raw: string | null): string | null {
  if (!raw) return null
  const m = raw.match(/##\s*Poll [Qq]uestion\s*\n([\s\S]+?)(?:\n##|$)/)
  if (!m) return null
  return m[1].trim().replace(/^---+\s*$/gm, '').trim()
}

function pollOptionsForClipboard(raw: string | null): string | null {
  if (!raw) return null
  const m = raw.match(/##\s*Poll [Oo]ptions\s*\n([\s\S]+?)(?:\n##|$)/)
  if (!m) return null
  const lines = m[1].split('\n').map(s => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  return lines.join('\n')
}

function bucketize(items: ContentItem[], anchorTue: Date, weeksAhead: number): WeekBucket[] {
  const out: WeekBucket[] = []
  for (let i = 0; i < weeksAhead; i++) {
    const tue = new Date(anchorTue)
    tue.setUTCDate(anchorTue.getUTCDate() + i * 7)
    const tueDate = isoDate(tue)
    const weekKey = isoWeekKey(tueDate)
    const slots: Partial<Pick<WeekBucket, 'tue' | 'wed' | 'thu'>> = {}
    for (const it of items) {
      if (!it.scheduled_date) continue
      if (isoWeekKey(it.scheduled_date) !== weekKey) continue
      const dow = dayOfWeek(it.scheduled_date)
      if (dow === 2) slots.tue = it
      else if (dow === 3) slots.wed = it
      else if (dow === 4) slots.thu = it
    }
    const theme = extractTheme(slots.tue) ?? extractTheme(slots.wed) ?? extractTheme(slots.thu)
    out.push({
      weekKey,
      tueDate,
      weekLabel: fmtRange(tue),
      themeLabel: theme,
      ...slots,
    })
  }
  return out
}

function unscheduledThemes(items: ContentItem[]): Array<{ theme: string; posts: ContentItem[] }> {
  const noDate = items.filter(i => !i.scheduled_date && i.status !== 'archived' && i.status !== 'rejected')
  const grouped = new Map<string, ContentItem[]>()
  for (const it of noDate) {
    const theme = extractTheme(it) ?? '(no theme tag)'
    if (!grouped.has(theme)) grouped.set(theme, [])
    grouped.get(theme)!.push(it)
  }
  return Array.from(grouped.entries())
    .map(([theme, posts]) => ({ theme, posts }))
    .sort((a, b) => a.theme.localeCompare(b.theme))
}

// ─── UI bits ─────────────────────────────────────────────────────────────────

function StatusPill({ status, small }: { status: ContentItem['status']; small?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: small ? '2px 7px' : '3px 10px',
      borderRadius: 999,
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: STATUS_COLOUR[status],
      background: STATUS_BG[status],
      border: `1px solid ${STATUS_BORDER[status]}`,
      whiteSpace: 'nowrap',
    }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function btn(bg: string, color: string, border = 'none'): React.CSSProperties {
  return {
    fontFamily: 'inherit',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '7px 14px',
    borderRadius: 6,
    border,
    background: bg,
    color,
    cursor: 'pointer',
  }
}

function CopyButton({ text, label, disabled = false }: { text: string; label: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!text || disabled) return null
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} style={{
      fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '7px 12px', borderRadius: 6,
      border: copied ? '1px solid rgba(16,185,129,0.45)' : '1px solid rgba(196,145,42,0.4)',
      background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(196,145,42,0.12)',
      color: copied ? '#10b981' : '#c4912a',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {copied ? '✓ Copied' : `📋 ${label}`}
    </button>
  )
}

function PostCard({
  item,
  role,
  onApprove,
  onUnapprove,
  onRegenerate,
  onMove,
  onOpenPreview,
  onEdit,
  busyIds,
}: {
  item: ContentItem
  role: DayRole | null
  onApprove: (id: string) => void
  onUnapprove: (id: string) => void
  onRegenerate: (id: string) => void
  onMove: (id: string, date: string) => void
  onOpenPreview: (id: string) => void
  onEdit: (id: string, caption: string) => void
  busyIds: Set<string>
}) {
  const isApproved = item.status === 'approved' || item.status === 'scheduled' || item.status === 'posted'
  const isLocked = item.status === 'scheduled' || item.status === 'posted'
  const isBusy = busyIds.has(item.id)
  const colour = role ? ROLE_COLOUR[role] : '#78716c'
  const tint = role ? ROLE_TINT[role] : '#ffffff'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.caption ?? '')

  const captionText = captionForClipboard(item.caption)
  const firstComment = firstCommentForClipboard(item.caption)
  const pollQ = pollQuestionForClipboard(item.caption)
  const pollOpts = pollOptionsForClipboard(item.caption)
  const isPoll = role === 'poll' || /poll/i.test(item.title ?? '')

  return (
    <div style={{
      background: tint,
      border: '1px solid rgba(28,25,23,0.08)',
      borderTop: `4px solid ${colour}`,
      borderRadius: 10,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      flex: '1 1 280px',
      minWidth: 260,
      maxWidth: 380,
    }}>
      <style>{`@keyframes sv2spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: colour }}>
          {role ? ROLE_LABEL[role] : 'UNSCHEDULED'}
        </span>
        <StatusPill status={item.status} small />
      </div>

      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1c1917', lineHeight: 1.35 }}>
        {item.title}
      </div>

      <div style={{ fontSize: 11, color: '#78716c' }}>
        {item.scheduled_date ?? 'no date'} · {item.scheduled_time ?? '—'}
      </div>

      {item.visual_thumbnail && (
        <img src={item.visual_thumbnail} alt="" style={{
          width: '100%', height: 100, objectFit: 'cover',
          borderRadius: 6, border: '1px solid rgba(28,25,23,0.05)',
          opacity: isLocked ? 0.85 : 1,
        }} />
      )}

      {editing ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={6}
          style={{
            fontSize: 12, lineHeight: 1.4, padding: 8,
            border: '1px solid rgba(28,25,23,0.18)', borderRadius: 6,
            fontFamily: 'inherit', resize: 'vertical',
          }}
        />
      ) : (
        <div style={{
          fontSize: 12, color: '#44403c', lineHeight: 1.5,
          maxHeight: 84, overflow: 'hidden',
          whiteSpace: 'pre-wrap',
        }}>
          {(item.caption ?? '').slice(0, 220)}{(item.caption ?? '').length > 220 ? '…' : ''}
        </div>
      )}

      {/* Copy-to-clipboard row — visible for all non-edit states */}
      {!editing && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '8px 0', borderTop: '1px dashed rgba(28,25,23,0.1)',
        }}>
          <CopyButton text={captionText} label="Caption" />
          {isPoll && pollQ && <CopyButton text={pollQ} label="Poll Q" />}
          {isPoll && pollOpts && <CopyButton text={pollOpts} label="Poll options" />}
          {!isPoll && firstComment && <CopyButton text={firstComment} label="First comment" />}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
        {editing ? (
          <>
            <button onClick={() => { onEdit(item.id, draft); setEditing(false) }} disabled={isBusy} style={btn('#1c1917', '#fff')}>Save</button>
            <button onClick={() => { setDraft(item.caption ?? ''); setEditing(false) }} style={btn('transparent', '#78716c', '1px solid rgba(28,25,23,0.18)')}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => onOpenPreview(item.id)} style={btn('transparent', '#1c1917', '1px solid rgba(28,25,23,0.18)')}>Preview</button>
            {!isLocked && <button onClick={() => setEditing(true)} style={btn('transparent', '#78716c', '1px solid rgba(28,25,23,0.18)')}>Edit</button>}
            {!isLocked && (
              <button
                onClick={() => onRegenerate(item.id)}
                disabled={isBusy}
                style={{
                  ...btn('transparent', '#c4912a', '1px solid rgba(196,145,42,0.4)'),
                  opacity: isBusy ? 0.85 : 1,
                  cursor: isBusy ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isBusy && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 11,
                      height: 11,
                      border: '1.5px solid rgba(196,145,42,0.35)',
                      borderTopColor: '#c4912a',
                      borderRadius: '50%',
                      animation: 'sv2spin 0.7s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                )}
                {isBusy ? 'Regenerating…' : 'Regen visual'}
              </button>
            )}
            {item.visual_thumbnail && (
              <a
                href={item.visual_thumbnail}
                download
                target="_blank"
                rel="noopener"
                style={{
                  ...btn('transparent', '#1c1917', '1px solid rgba(28,25,23,0.18)'),
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                title="Download the visual to post on LinkedIn"
              >
                ⬇ Download
              </a>
            )}
            {!isLocked && (
              <label
                title="Move this post to a different date"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 8px',
                  border: '1px solid rgba(28,25,23,0.18)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#1c1917',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                📅
                <input
                  type="date"
                  defaultValue={item.scheduled_date ?? ''}
                  onChange={e => {
                    const d = e.target.value
                    if (d && d !== item.scheduled_date) onMove(item.id, d)
                  }}
                  disabled={isBusy}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    color: '#1c1917',
                    padding: 0,
                    cursor: isBusy ? 'wait' : 'pointer',
                    width: 100,
                  }}
                />
              </label>
            )}
            {!isLocked && !isApproved && <button onClick={() => onApprove(item.id)} disabled={isBusy} style={btn('#10b981', '#fff')}>Approve</button>}
            {!isLocked && isApproved && <button onClick={() => onUnapprove(item.id)} disabled={isBusy} style={btn('transparent', '#10b981', '1px solid rgba(16,185,129,0.4)')}>Unapprove</button>}
          </>
        )}
      </div>
    </div>
  )
}

function WeekRow({
  bucket,
  highlight,
  onApprove,
  onUnapprove,
  onApproveWeek,
  onRegenerate,
  onMove,
  onOpenPreview,
  onEdit,
  busyIds,
}: {
  bucket: WeekBucket
  highlight?: boolean
  onApprove: (id: string) => void
  onUnapprove: (id: string) => void
  onApproveWeek: (b: WeekBucket) => void
  onRegenerate: (id: string) => void
  onMove: (id: string, date: string) => void
  onOpenPreview: (id: string) => void
  onEdit: (id: string, caption: string) => void
  busyIds: Set<string>
}) {
  const weekItems = [bucket.tue, bucket.wed, bucket.thu].filter(Boolean) as ContentItem[]
  const allApproved = weekItems.length === 3 && weekItems.every(p => ['approved', 'scheduled', 'posted'].includes(p.status))
  const anyApprovable = weekItems.some(p => p.status === 'idea' || p.status === 'draft')

  const slots: [DayRole, ContentItem | undefined][] = [
    ['poll', bucket.tue],
    ['tool', bucket.wed],
    ['article', bucket.thu],
  ]

  return (
    <div style={{
      background: highlight ? '#fffdf6' : '#fafaf9',
      border: `1px solid ${highlight ? 'rgba(196,145,42,0.3)' : 'rgba(28,25,23,0.06)'}`,
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1c1917' }}>
            {bucket.weekLabel}
            {bucket.themeLabel && (
              <span style={{ marginLeft: 10, color: '#c4912a', textTransform: 'capitalize' }}>· {bucket.themeLabel}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>
            Week {bucket.weekKey.split('-W')[1]}{highlight ? ' · current' : ''} · {weekItems.length}/3 posts
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {allApproved ? (
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Arc complete</span>
          ) : weekItems.length < 3 ? (
            <span style={{ fontSize: 11, color: '#c4912a', fontWeight: 600 }}>
              {3 - weekItems.length} post(s) missing
            </span>
          ) : null}
          {anyApprovable && (
            <button onClick={() => onApproveWeek(bucket)} style={btn('#10b981', '#fff')}>Approve all 3</button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {slots.map(([role, it]) => it ? (
          <PostCard key={it.id} item={it} role={role}
            onApprove={onApprove} onUnapprove={onUnapprove}
            onRegenerate={onRegenerate} onMove={onMove}
            onOpenPreview={onOpenPreview} onEdit={onEdit}
            busyIds={busyIds}
          />
        ) : (
          <div key={role} style={{
            flex: '1 1 280px', minWidth: 260, maxWidth: 380,
            border: '1.5px dashed rgba(28,25,23,0.15)',
            borderRadius: 10, padding: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#a8a29e', fontSize: 12, minHeight: 220,
          }}>
            Missing {ROLE_LABEL[role].toLowerCase()}
          </div>
        ))}
      </div>
    </div>
  )
}

function ThemeBankRow({
  theme,
  posts,
  onSchedule,
  busyIds,
}: {
  theme: string
  posts: ContentItem[]
  onSchedule: (theme: string, posts: ContentItem[]) => void
  busyIds: Set<string>
}) {
  const tuePost = posts.find(p => /tool|tuesday/i.test(p.title ?? '') || p.content_type === 'tool')
  const wedPost = posts.find(p => /poll|wednesday/i.test(p.title ?? ''))
  const thuPost = posts.find(p => /article|field guide|thursday/i.test(p.title ?? ''))
  const trioReady = tuePost && wedPost && thuPost
  const isBusy = posts.some(p => busyIds.has(p.id))

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: 12, background: '#fff',
      border: '1px solid rgba(28,25,23,0.08)', borderRadius: 8,
      gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1c1917', textTransform: 'capitalize' }}>{theme}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['tool', 'poll', 'article'] as const).map(r => {
            const p = r === 'tool' ? tuePost : r === 'poll' ? wedPost : thuPost
            return (
              <span key={r} style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '2px 7px', borderRadius: 999,
                background: p ? `${ROLE_COLOUR[r]}18` : 'rgba(0,0,0,0.04)',
                color: p ? ROLE_COLOUR[r] : '#a8a29e',
              }}>
                {r} {p ? '✓' : '–'}
              </span>
            )
          })}
        </div>
      </div>
      <button
        onClick={() => onSchedule(theme, posts)}
        disabled={!trioReady || isBusy}
        style={{
          ...btn(trioReady ? '#1c1917' : 'rgba(0,0,0,0.06)', trioReady ? '#fff' : '#a8a29e'),
          cursor: trioReady ? 'pointer' : 'not-allowed',
        }}
      >
        {trioReady ? 'Schedule to next free week' : `${posts.length}/3 drafted`}
      </button>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SocialV2Client({ items }: Props) {
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [previewId, setPreviewId] = useState<string | null>(null)

  const anchor = useMemo(() => thisWeekTuesday(), [])
  const buckets = useMemo(() => bucketize(items, anchor, 5), [items, anchor])
  const themes = useMemo(() => unscheduledThemes(items), [items])
  const previewItem = previewId ? items.find(i => i.id === previewId) ?? null : null

  function markBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      if (busy) next.add(id); else next.delete(id)
      return next
    })
  }
  function safeRun(id: string, fn: () => Promise<unknown>) {
    markBusy(id, true)
    fn().catch(err => alert(`Action failed: ${err.message ?? err}`)).finally(() => markBusy(id, false))
  }

  function handleApprove(id: string)    { safeRun(id, () => approvePost(id)) }
  function handleUnapprove(id: string)  { safeRun(id, () => unapprovePost(id)) }
  function handleEdit(id: string, caption: string) { safeRun(id, () => updateItem(id, { caption })) }
  function handleRegenerate(id: string) { safeRun(id, () => regenerateVisual(id, 'primary')) }
  function handleMove(id: string, date: string) { safeRun(id, () => updateItem(id, { scheduled_date: date })) }

  function handleApproveWeek(b: WeekBucket) {
    const ids = [b.tue, b.wed, b.thu]
      .filter((p): p is ContentItem => !!p && !['scheduled', 'posted'].includes(p.status))
      .map(p => p.id)
    if (!ids.length) return
    approveWeek(ids).catch(err => alert(err.message ?? err))
  }

  function findNextFreeWeek(): WeekBucket | null {
    for (const b of buckets) {
      const items = [b.tue, b.wed, b.thu].filter(Boolean)
      if (items.length === 0) return b
    }
    return null
  }

  function handleScheduleTheme(_theme: string, posts: ContentItem[]) {
    const free = findNextFreeWeek()
    if (!free) {
      alert('No free week in the next 5 weeks. Scroll the rolling view further or unschedule a week.')
      return
    }
    const tuePost = posts.find(p => /tool|tuesday/i.test(p.title ?? '') || p.content_type === 'tool')
    const wedPost = posts.find(p => /poll|wednesday/i.test(p.title ?? ''))
    const thuPost = posts.find(p => /article|field guide|thursday/i.test(p.title ?? ''))
    if (!tuePost || !wedPost || !thuPost) {
      alert('This theme is missing one of tool/poll/article. Draft all three first.')
      return
    }
    const tue = new Date(free.tueDate + 'T12:00:00Z')
    const wed = new Date(tue); wed.setUTCDate(tue.getUTCDate() + 1)
    const thu = new Date(tue); thu.setUTCDate(tue.getUTCDate() + 2)
    Promise.all([
      scheduleLibraryPost(tuePost.id, isoDate(tue)),
      scheduleLibraryPost(wedPost.id, isoDate(wed)),
      scheduleLibraryPost(thuPost.id, isoDate(thu)),
    ]).catch(err => alert(`Scheduling failed: ${err.message ?? err}`))
  }

  const currentWeekKey = isoWeekKey(isoDate(anchor))

  // Quick counts
  const counts = useMemo(() => {
    const needsReview = items.filter(i => ['idea', 'draft'].includes(i.status)).length
    const approved = items.filter(i => i.status === 'approved').length
    const scheduled = items.filter(i => i.status === 'scheduled').length
    return { needsReview, approved, scheduled }
  }, [items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '4px 0', maxWidth: 1400 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1c1917 0%, #2a2520 100%)',
        borderRadius: 14, padding: '20px 24px', color: '#f0ece4',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: '#c4912a' }}>
            SOCIAL MEDIA 2.0
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, margin: '6px 0 4px', color: '#f0ece4' }}>
            Weekly Arc Workflow
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(240,236,228,0.55)', margin: 0, maxWidth: 540, lineHeight: 1.5 }}>
            One theme per week. Tuesday raises the question with a tool, Wednesday polls the gut answer,
            Thursday delivers the expert answer via an insights article. Approve the trio, the publisher does the rest.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Stat label="Needs review" value={counts.needsReview} colour="#c4912a" />
          <Stat label="Approved" value={counts.approved} colour="#10b981" />
          <Stat label="Scheduled" value={counts.scheduled} colour="#3b82f6" />
        </div>
      </div>

      {/* This Week */}
      <Section title="This week" subtitle={`Current arc — Tue ${fmtRange(anchor)}`}>
        {buckets[0] && (buckets[0].tue || buckets[0].wed || buckets[0].thu) ? (
          <WeekRow bucket={buckets[0]} highlight
            onApprove={handleApprove} onUnapprove={handleUnapprove}
            onApproveWeek={handleApproveWeek}
            onRegenerate={handleRegenerate}
            onMove={handleMove}
            onOpenPreview={setPreviewId} onEdit={handleEdit}
            busyIds={busyIds}
          />
        ) : (
          <EmptyState label="No posts scheduled for this week. Pick a theme from the Theme Bank below to schedule." />
        )}
      </Section>

      {/* Rolling 4 weeks upcoming */}
      <Section title="Upcoming 4 weeks" subtitle="Rolling view — current week pinned at top of section above">
        {buckets.slice(1).map(b => (
          <WeekRow key={b.weekKey} bucket={b} highlight={b.weekKey === currentWeekKey}
            onApprove={handleApprove} onUnapprove={handleUnapprove}
            onApproveWeek={handleApproveWeek}
            onRegenerate={handleRegenerate}
            onMove={handleMove}
            onOpenPreview={setPreviewId} onEdit={handleEdit}
            busyIds={busyIds}
          />
        ))}
      </Section>

      {/* Theme Bank */}
      <Section
        title="Theme bank"
        subtitle={`${themes.length} unscheduled theme${themes.length === 1 ? '' : 's'} — drafts ready to drop onto a future week`}
      >
        {themes.length === 0 ? (
          <EmptyState label="No unscheduled themes. Draft new themes via the social agent or by adding files to content/social/ with a 'Week theme:' tag." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {themes.map(({ theme, posts }) => (
              <ThemeBankRow key={theme} theme={theme} posts={posts}
                onSchedule={handleScheduleTheme} busyIds={busyIds}
              />
            ))}
          </div>
        )}
      </Section>

      {previewItem && (
        <div onClick={() => setPreviewId(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 600, width: '100%',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex', flexDirection: 'column',
            borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}>
            <div style={{
              flexShrink: 0,
              background: '#fff', padding: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid rgba(28,25,23,0.08)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 13, padding: '0 8px' }}>LinkedIn preview</span>
              <button onClick={() => setPreviewId(null)} style={btn('transparent', '#1c1917', '1px solid rgba(28,25,23,0.18)')}>Close</button>
            </div>
            <div style={{
              flex: 1, minHeight: 0,
              overflowY: 'auto', background: '#fff',
            }}>
              <LinkedInPreview item={previewItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 11.5, color: '#78716c', margin: '3px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      padding: 20, textAlign: 'center', color: '#a8a29e',
      fontSize: 12.5, background: '#fafaf9', borderRadius: 10,
      border: '1px dashed rgba(28,25,23,0.1)',
      lineHeight: 1.5,
    }}>{label}</div>
  )
}

function Stat({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: colour, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,228,0.55)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}
