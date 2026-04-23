'use client'

import { useState, useMemo, useEffect, useTransition, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import type { ContentItem, Platform, Status, Pillar } from '@/types/content'
import {
  PLATFORM_COLOUR, STATUS_COLOUR, STATUS_BG, STATUS_BORDER, PILLAR_COLOUR,
} from '@/types/content'
import { rescheduleItem, createItem, bulkMarkPosted, regenerateVisual, getNextSameTypePost, swapPost, updateItemStatus, getPostForDate, scheduleLibraryPost } from '@/lib/actions/content'
import { requestFactCheck, requestNewPostForDate } from '@/lib/actions/paperclip'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode       = 'week' | 'twoweek' | 'month'
type PlatformFilter = 'all' | Platform
type PillarFilter   = 'all' | Pillar

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7
  return addDays(d, -day)
}

function getWeekDays(anchor: Date): Date[] {
  const mon = mondayOf(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

function getMonthGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const start    = new Date(year, month, 1 - startDow)
  const lastDay  = new Date(year, month + 1, 0)
  const endDow   = (lastDay.getDay() + 6) % 7
  const end      = new Date(year, month + 1, 6 - endDow)
  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= end) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
    weeks.push(week)
  }
  return weeks
}

function nextAvailableSlot(items: ContentItem[], platform: Platform): string {
  const occupied = new Set(
    items
      .filter(i => ['ready', 'scheduled', 'idea'].includes(i.status) && i.platform === platform)
      .map(i => i.scheduled_date)
      .filter(Boolean) as string[]
  )
  const d = new Date()
  d.setDate(d.getDate() + 1)
  for (let i = 0; i < 90; i++) {
    if ([1, 3, 5].includes(d.getDay())) {
      const str = d.toLocaleDateString('en-CA')
      if (!occupied.has(str)) return str
    }
    d.setDate(d.getDate() + 1)
  }
  return new Date().toLocaleDateString('en-CA')
}

// ─── Title helpers ────────────────────────────────────────────────────────────

function cleanTitle(raw: string): string {
  return raw
    .replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s-]+|Poll[:\s-]+)/i, '')
    .trim()
}

type PostType = 'Poll' | 'Article' | 'Authority' | 'Market' | 'Post'

const POST_TYPE_COLOUR: Record<PostType, string> = {
  Poll:      '#8b5cf6',
  Article:   '#f59e0b',
  Authority: '#06b6d4',
  Market:    '#10b981',
  Post:      '#6b7280',
}

function getPostType(item: ContentItem): PostType {
  const t = item.title.toLowerCase()
  const notes = (item.notes ?? '').toLowerCase()
  const vb = (item.visual_brief ?? '').toLowerCase()

  // Poll check — overrides everything
  if (t.includes('poll') || (item.content_type ?? '').toLowerCase().includes('poll')) return 'Poll'

  // Day-of-week is authoritative for LinkedIn posts:
  // Tuesday = market/authority post, Thursday = article feature
  if (item.scheduled_date && item.platform === 'linkedin') {
    const dow = new Date(item.scheduled_date + 'T12:00:00').getDay() // 0=Sun,2=Tue,4=Thu
    if (dow === 4) return 'Article'   // Thursday → always Article
    if (dow === 2) {                  // Tuesday → market or authority
      if (item.content_pillar === 'authority' || vb.includes('checklist')) return 'Authority'
      return 'Market'
    }
  }

  // Fallback: title/notes keyword detection for posts without a scheduled date
  if (t.includes('field guide') || notes.includes('field guide')) return 'Article'
  if (t.includes('article feature') || t.includes('article')) return 'Article'
  if (item.content_pillar === 'authority' || vb.includes('checklist')) return 'Authority'
  if (vb.includes('market update') || vb.includes('inner east') || t.includes('market')) return 'Market'
  return 'Post'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<string, string>  = { linkedin: 'in', facebook: 'f', instagram: '✦', seo: '↗' }
const PLATFORM_LABEL: Record<string, string> = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', seo: 'Website' }

const VISUAL_DOT: Record<string, { colour: string; label: string }> = {
  needed:         { colour: '#9ca3af', label: 'Visual needed'   },
  draft:          { colour: '#818cf8', label: 'Design ready'    },
  needs_revision: { colour: '#f97316', label: 'Needs revision'  },
  approved:       { colour: '#22c55e', label: 'Visual approved' },
}

const PILLAR_LABEL: Record<Pillar, string> = {
  seller: 'Seller', authority: 'Authority', suburb: 'Suburb', proof: 'Proof', buyer: 'Buyer',
}

const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Simplified 3-status display ─────────────────────────────────────────────

type DisplayStatusFilter = 'all' | 'needs-attention' | 'scheduled' | 'posted'

function getDisplayStatus(item: ContentItem): 'needs-attention' | 'scheduled' | 'posted' {
  if (item.status === 'posted') return 'posted'
  // Needs Review (idea/draft) = always needs attention regardless of visual
  if (item.status === 'idea' || item.status === 'draft') return 'needs-attention'
  // Scheduled with no visual = still needs attention
  if (!item.visual_thumbnail) return 'needs-attention'
  return 'scheduled'
}

const DS_COLOUR: Record<string, string> = {
  'needs-attention': '#c4912a',
  'scheduled':       '#22c55e',
  'posted':          '#3b82f6',
}
const DS_BG: Record<string, string> = {
  'needs-attention': 'rgba(196,145,42,0.1)',
  'scheduled':       'rgba(34,197,94,0.08)',
  'posted':          'rgba(59,130,246,0.08)',
}
const DS_LABEL: Record<string, string> = {
  'needs-attention': 'Needs attention',
  'scheduled':       'Scheduled',
  'posted':          'Posted',
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ active, colour, onClick, children }: {
  active: boolean; colour?: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg border transition-all"
      style={active
        ? { background: colour ? `${colour}22` : 'rgba(196,145,42,0.18)', borderColor: colour ?? 'var(--color-gold)', color: colour ?? 'var(--color-gold)' }
        : { background: 'transparent', borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)' }}
    >
      {children}
    </button>
  )
}

// ─── Hover Preview ────────────────────────────────────────────────────────────

const QUICK_STATUSES: { value: Status; label: string }[] = [
  { value: 'idea',      label: 'Needs Review' },
  { value: 'scheduled', label: 'Scheduled'    },
  { value: 'posted',    label: 'Posted'       },
  { value: 'rejected',  label: 'Rejected'     },
]

function HoverPreview({ item: initialItem, rect, onRegenerate, onSwap, onStatusChange, onMouseEnter, onMouseLeave }: {
  item: ContentItem
  rect: DOMRect
  onRegenerate: (id: string, mode: 'primary' | 'alternate') => Promise<string | null>
  onSwap: (currentId: string, incomingId: string, date: string, incoming: ContentItem) => Promise<void>
  onStatusChange: (id: string, status: Status) => Promise<void>
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const [item, setItem]             = useState(initialItem)
  const [regenError, setRegenError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  // Swap flow
  const [candidate, setCandidate]   = useState<ContentItem | null>(null)
  const [swapLoading, setSwapLoading] = useState(false)
  const [swapError, setSwapError]   = useState<string | null>(null)
  // Fact-check
  const [factChecking, setFactChecking] = useState(false)
  const [factCheckId, setFactCheckId]   = useState<string | null>(null)
  // Status change
  const [statusChanging, setStatusChanging] = useState(false)
  const W = 320
  const screenW  = typeof window !== 'undefined' ? window.innerWidth  : 1400
  const screenH  = typeof window !== 'undefined' ? window.innerHeight : 900
  const left     = rect.right + W > screenW ? rect.left - W : rect.right
  const maxH     = screenH - 16
  const top      = Math.max(8, Math.min(rect.top, screenH - maxH))
  const pc       = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual   = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

  // Keep in sync if the parent item changes (e.g. after regen updates parent state)
  if (item.id !== initialItem.id) setItem(initialItem)

  async function handleCreate() {
    setRegenError(null)
    setRegenerating(true)
    try {
      const newUrl = await onRegenerate(item.id, 'primary')
      if (newUrl) setItem(prev => ({ ...prev, visual_thumbnail: newUrl, visual_status: 'approved' }))
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setRegenerating(false)
    }
  }

  // Step 1: find the candidate post to swap in
  async function handleAlternate() {
    setRegenError(null)
    setSwapError(null)
    setSwapLoading(true)
    try {
      const dow = item.scheduled_date
        ? new Date(item.scheduled_date + 'T12:00:00').getDay()
        : -1
      const isArticle = dow === 4
      const found = await getNextSameTypePost(item.id, isArticle)
      if (!found) {
        setSwapError('No other posts available in the queue.')
      } else {
        setCandidate(found as ContentItem)
      }
    } catch (e) {
      setSwapError(e instanceof Error ? e.message : 'Could not find a candidate')
    } finally {
      setSwapLoading(false)
    }
  }

  async function handleStatusChange(newStatus: Status) {
    if (newStatus === item.status || statusChanging) return
    setStatusChanging(true)
    try {
      await onStatusChange(item.id, newStatus)
      setItem(prev => ({ ...prev, status: newStatus }))
    } finally {
      setStatusChanging(false)
    }
  }

  async function handleFactCheck() {
    setFactChecking(true)
    try {
      const result = await requestFactCheck(item.id, item.title)
      setFactCheckId(result.identifier ?? 'sent')
    } catch { /* silently ignore */ } finally {
      setFactChecking(false)
    }
  }

  // Step 2: confirm the swap
  async function handleConfirmSwap() {
    if (!candidate || !item.scheduled_date) return
    setSwapLoading(true)
    setSwapError(null)
    try {
      await onSwap(item.id, candidate.id, item.scheduled_date, candidate as ContentItem)
    } catch (e) {
      setSwapError(e instanceof Error ? e.message : 'Swap failed')
    } finally {
      setSwapLoading(false)
    }
  }

  return (
    <div
      className="fixed z-50 rounded-xl border shadow-2xl flex flex-col"
      style={{ left, top, width: W, maxHeight: maxH, overflowY: 'auto', background: 'var(--color-bg)', borderColor: pc,
        boxShadow: `0 0 0 1px ${pc}33, 0 24px 48px rgba(0,0,0,0.65)` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Design preview */}
      {item.visual_thumbnail ? (
        <div className="relative w-full" style={{ aspectRatio: '1.91/1', background: '#111' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.visual_thumbnail} alt="Post visual"
            className="w-full h-full object-cover" style={{ opacity: regenerating ? 0.4 : 1, transition: 'opacity 0.2s' }} />
          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-sans font-semibold" style={{ color: '#c4912a' }}>Generating…</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full px-2 py-1"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
            <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center"
              style={{ background: pc, color: '#fff' }}>
              {PLATFORM_ICON[item.platform] ?? '?'}
            </span>
            <span className="text-[10px] font-sans font-semibold" style={{ color: '#fff' }}>
              {PLATFORM_LABEL[item.platform]}
            </span>
          </div>
          <span className="absolute top-2 right-2 text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ color: STATUS_COLOUR[item.status as Status], background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)', border: `1px solid ${STATUS_COLOUR[item.status as Status]}44` }}>
            {item.status}
          </span>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center" style={{ height: 72, background: `${pc}18` }}>
          {regenerating
            ? <span className="text-[10px] font-sans font-semibold" style={{ color: '#c4912a' }}>Generating…</span>
            : <span className="text-[10px] font-sans font-semibold opacity-50" style={{ color: pc }}>No visual yet</span>
          }
        </div>
      )}

      <div className="flex flex-col gap-2.5 p-4">
        {!item.visual_thumbnail && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
                style={{ background: pc, color: '#fff' }}>
                {PLATFORM_ICON[item.platform] ?? '?'}
              </span>
              <span className="text-[11px] font-sans font-semibold" style={{ color: pc }}>
                {PLATFORM_LABEL[item.platform]}
              </span>
            </div>
            <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ color: STATUS_COLOUR[item.status as Status], background: STATUS_BG[item.status as Status] }}>
              {item.status}
            </span>
          </div>
        )}

        <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)] leading-snug">{cleanTitle(item.title)}</p>

        {item.scheduled_date && (
          <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
            {new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
            {item.scheduled_time && ` · ${item.scheduled_time} AEST`}
          </p>
        )}

        {item.caption && (
          <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed line-clamp-4"
            style={{ borderLeft: `2px solid ${pc}44`, paddingLeft: 8 }}>
            {item.caption.slice(0, 280)}{item.caption.length > 280 ? '…' : ''}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: visual.colour }} />
            <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.content_pillar && (
              <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded"
                style={{ color: PILLAR_COLOUR[item.content_pillar], background: `${PILLAR_COLOUR[item.content_pillar]}22` }}>
                {PILLAR_LABEL[item.content_pillar]}
              </span>
            )}
          </div>
        </div>

        {/* ── Status picker ── */}
        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[9px] font-sans font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-cream-x)' }}>
            Set status
          </p>
          <div className="flex gap-1">
            {QUICK_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                disabled={statusChanging}
                className="flex-1 py-1 rounded text-[9px] font-sans font-semibold capitalize transition-all disabled:opacity-50"
                style={item.status === value
                  ? { background: `${STATUS_COLOUR[value]}22`, color: STATUS_COLOUR[value], border: `1px solid ${STATUS_COLOUR[value]}66` }
                  : { background: 'transparent', color: 'var(--color-cream-dim)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }
                }
              >
                {statusChanging && item.status !== value ? '' : label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual action buttons — only for LinkedIn posts */}
        {item.platform === 'linkedin' && (
          <>
            {candidate ? (
              /* Step 2: show candidate and ask to confirm */
              <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-[9px] font-sans font-semibold uppercase tracking-wider" style={{ color: '#c4912a' }}>
                  Replacing with:
                </p>
                <p className="text-[12px] font-sans font-semibold text-[var(--color-cream)] leading-snug">
                  {candidate.title.replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s\-]+|Poll[:\s\-]+)/i, '').trim()}
                </p>
                {candidate.caption && (
                  <p className="text-[10px] font-sans text-[var(--color-cream-dim)] leading-relaxed line-clamp-2">
                    {candidate.caption.slice(0, 120)}…
                  </p>
                )}
                {swapLoading ? (
                  <div className="text-[10px] font-sans text-center py-1" style={{ color: '#c4912a' }}>Swapping…</div>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleConfirmSwap}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-sans font-semibold border"
                      style={{ borderColor: 'rgba(196,145,42,0.5)', color: '#c4912a', background: 'rgba(196,145,42,0.12)', cursor: 'pointer' }}>
                      Confirm swap
                    </button>
                    <button
                      onClick={() => { setCandidate(null); setSwapError(null) }}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-sans font-semibold border"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-cream-dim)', background: 'transparent', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
                {swapError && <p className="text-[10px] font-sans" style={{ color: '#f97316' }}>{swapError}</p>}
              </div>
            ) : regenerating || swapLoading ? (
              <div className="w-full py-1.5 rounded-lg text-[11px] font-sans font-semibold text-center border mt-0.5"
                style={{ borderColor: 'rgba(196,145,42,0.3)', color: '#c4912a', background: 'rgba(196,145,42,0.06)' }}>
                {swapLoading ? 'Finding next post…' : 'Generating visual…'}
              </div>
            ) : (
              /* Step 1: normal action buttons */
              <div className="flex flex-col gap-1.5 mt-0.5">
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-sans font-semibold border transition-all"
                    style={{ borderColor: 'rgba(196,145,42,0.5)', color: '#c4912a', background: 'rgba(196,145,42,0.12)', cursor: 'pointer' }}>
                    Create Visual
                  </button>
                  <button
                    onClick={handleAlternate}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-sans font-semibold border transition-all"
                    style={{ borderColor: 'rgba(196,145,42,0.3)', color: 'var(--color-cream-dim)', background: 'transparent', cursor: 'pointer' }}>
                    Give another option
                  </button>
                </div>
                {factCheckId ? (
                  <div className="w-full py-1.5 rounded-lg text-[11px] font-sans font-semibold text-center border"
                    style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.06)' }}>
                    Fact-check sent · {factCheckId}
                  </div>
                ) : (
                  <button
                    onClick={handleFactCheck}
                    disabled={factChecking}
                    className="w-full py-1.5 rounded-lg text-[11px] font-sans font-semibold border transition-all disabled:opacity-50"
                    style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.06)', cursor: 'pointer' }}>
                    {factChecking ? 'Sending…' : 'Check accuracy'}
                  </button>
                )}
              </div>
            )}
            {(regenError || (swapError && !candidate)) && (
              <p className="text-[10px] font-sans mt-1" style={{ color: '#f97316' }}>
                {regenError || swapError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Smart Day Modal ──────────────────────────────────────────────────────────

const DAY_TYPE_META: Record<string, { label: string; colour: string; hint: string }> = {
  authority: { label: 'Market / Authority', colour: '#10b981', hint: 'Tuesday post — market update or authority take' },
  poll:      { label: 'Poll',               colour: '#8b5cf6', hint: 'Wednesday post — LinkedIn poll' },
  article:   { label: 'Field Guide',        colour: '#f59e0b', hint: 'Thursday post — field guide or article feature' },
}

function getDayType(dateStr: string): string | null {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  if (dow === 2) return 'authority'
  if (dow === 3) return 'poll'
  if (dow === 4) return 'article'
  return null
}

function SmartDayModal({ date, onClose, onScheduled }: {
  date: string
  onClose: () => void
  onScheduled: (item: ContentItem) => void
}) {
  const dayType = getDayType(date)
  const meta    = dayType ? DAY_TYPE_META[dayType] : null

  type Phase = 'loading' | 'found' | 'empty' | 'generating' | 'done' | 'error'
  const [phase, setPhase]         = useState<Phase>('loading')
  const [candidate, setCandidate] = useState<ContentItem | null>(null)
  const [seenIds, setSeenIds]     = useState<string[]>([])
  const [errMsg, setErrMsg]       = useState<string | null>(null)
  const [taskId, setTaskId]       = useState<string | null>(null)

  const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => { fetchCandidate([]) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCandidate(exclude: string[]) {
    setPhase('loading')
    setCandidate(null)
    try {
      const found = await getPostForDate(date, exclude)
      if (found) {
        setCandidate(found)
        setSeenIds(prev => [...prev, found.id])
        setPhase('found')
      } else {
        setPhase('empty')
      }
    } catch {
      setPhase('error')
      setErrMsg('Could not load library posts.')
    }
  }

  async function handleSchedule() {
    if (!candidate) return
    setPhase('loading')
    try {
      const item = await scheduleLibraryPost(candidate.id, date)
      onScheduled(item)
      setPhase('done')
    } catch {
      setPhase('error')
      setErrMsg('Failed to schedule post.')
    }
  }

  async function handleTryAnother() {
    fetchCandidate(seenIds)
  }

  async function handleGenerate() {
    setPhase('generating')
    try {
      const typeLabel = meta?.label ?? 'LinkedIn'
      const result = await requestNewPostForDate(date, typeLabel)
      if (result.success) {
        setTaskId(result.identifier ?? 'sent')
        setPhase('done')
      } else {
        setPhase('error')
        setErrMsg('Could not reach the agent. Try again.')
      }
    } catch {
      setPhase('error')
      setErrMsg('Could not reach the agent.')
    }
  }

  const overlay = 'fixed inset-0 z-50 flex items-center justify-center p-4'
  const card    = 'rounded-2xl border w-full max-w-sm flex flex-col gap-4 p-5'

  return (
    <div className={overlay} style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={card} style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest mb-0.5"
              style={{ color: meta?.colour ?? 'var(--color-gold)' }}>
              {meta?.label ?? 'Add post'}
            </p>
            <p className="text-[var(--color-cream)] font-serif text-sm leading-snug">{dayLabel}</p>
            {meta && (
              <p className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--color-cream-x)' }}>{meta.hint}</p>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-xl leading-none flex-shrink-0">×</button>
        </div>

        {/* Body */}
        {phase === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <span className="text-[11px] font-sans" style={{ color: 'var(--color-cream-x)' }}>Searching library…</span>
          </div>
        )}

        {phase === 'found' && candidate && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border p-3 flex flex-col gap-2"
              style={{ borderColor: 'rgba(196,145,42,0.3)', background: 'rgba(196,145,42,0.05)' }}>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-wider" style={{ color: 'var(--color-gold)' }}>
                From library
              </p>
              {candidate.visual_thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.visual_thumbnail} alt="" className="w-full rounded-lg object-cover"
                  style={{ maxHeight: 120, background: '#0a0806' }} />
              )}
              <p className="text-[12px] font-sans font-medium leading-snug" style={{ color: 'var(--color-cream)' }}>
                {candidate.title.replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s-]+|Poll[:\s-]+)/i, '').trim()}
              </p>
              {candidate.caption && (
                <p className="text-[10px] font-sans leading-relaxed line-clamp-3" style={{ color: 'var(--color-cream-x)' }}>
                  {candidate.caption.slice(0, 160)}…
                </p>
              )}
            </div>
            <button onClick={handleSchedule}
              className="w-full py-2.5 rounded-xl text-[12px] font-sans font-semibold transition-all"
              style={{ background: 'var(--color-gold)', color: '#1c1917' }}>
              Schedule this post
            </button>
            <div className="flex gap-2">
              <button onClick={handleTryAnother}
                className="flex-1 py-2 rounded-xl text-[11px] font-sans font-semibold border transition-all"
                style={{ borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)', background: 'transparent' }}>
                Try another
              </button>
              <button onClick={handleGenerate}
                className="flex-1 py-2 rounded-xl text-[11px] font-sans font-semibold border transition-all"
                style={{ borderColor: 'rgba(139,92,246,0.4)', color: '#8b5cf6', background: 'rgba(139,92,246,0.06)' }}>
                Generate new
              </button>
            </div>
          </div>
        )}

        {phase === 'empty' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-dashed p-4 text-center"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <p className="text-[11px] font-sans mb-1" style={{ color: 'var(--color-cream-x)' }}>
                No unscheduled {meta?.label ?? 'posts'} in the library.
              </p>
              <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)', opacity: 0.6 }}>
                The agent will write a fresh one and add it to Needs Review.
              </p>
            </div>
            <button onClick={handleGenerate}
              className="w-full py-2.5 rounded-xl text-[12px] font-sans font-semibold border transition-all"
              style={{ borderColor: 'rgba(139,92,246,0.4)', color: '#8b5cf6', background: 'rgba(139,92,246,0.06)' }}>
              Generate new post
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="flex items-center justify-center py-8">
            <span className="text-[11px] font-sans" style={{ color: '#8b5cf6' }}>Sending to agent…</span>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3">
            {taskId ? (
              <div className="rounded-xl border p-4 text-center"
                style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
                <p className="text-[12px] font-sans font-semibold mb-1" style={{ color: '#8b5cf6' }}>
                  Request sent
                </p>
                <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
                  The agent will write a {meta?.label ?? 'post'} for {dayLabel} and mark it Needs Review.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-center"
                style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}>
                <p className="text-[12px] font-sans font-semibold mb-1" style={{ color: '#22c55e' }}>Scheduled</p>
                <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
                  Post added to {dayLabel}.
                </p>
              </div>
            )}
            <button onClick={onClose}
              className="w-full py-2 rounded-xl text-[11px] font-sans font-semibold border"
              style={{ borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)', background: 'transparent' }}>
              Close
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-sans text-center" style={{ color: '#f97316' }}>{errMsg}</p>
            <button onClick={onClose}
              className="w-full py-2 rounded-xl text-[11px] font-sans font-semibold border"
              style={{ borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)', background: 'transparent' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quick Compose Modal ──────────────────────────────────────────────────────

// Derive the expected post type for a given date based on day-of-week guidelines
function getDayGuideline(dateStr: string): { label: string; pillar: Pillar | ''; contentType: string; hint: string } | null {
  const dow = new Date(dateStr + 'T12:00:00').getDay() // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  if (dow === 2) return { label: 'Market / Authority', pillar: 'seller',    contentType: 'Post', hint: 'Tuesday — market update or authority post (07:30 AEST)' }
  if (dow === 3) return { label: 'Poll',               pillar: 'authority', contentType: 'Poll', hint: 'Wednesday — LinkedIn poll (07:30 AEST)' }
  if (dow === 4) return { label: 'Field Guide',        pillar: 'authority', contentType: 'Post', hint: 'Thursday — field guide or article feature (07:30 AEST)' }
  return null
}

function QuickComposeModal({ date, allItems, onClose, onCreated }: {
  date: string
  allItems: ContentItem[]
  onClose: () => void
  onCreated: (item: ContentItem) => void
}) {
  const guideline = getDayGuideline(date)
  const [title, setTitle]         = useState('')
  const [platform, setPlatform]   = useState<Platform>('linkedin')
  const [pillar, setPillar]       = useState<Pillar | ''>(guideline?.pillar ?? 'suburb')
  const [schedDate, setSchedDate] = useState(date)
  const [schedTime, setSchedTime] = useState('07:30')
  const [caption, setCaption]     = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inCls  = "w-full rounded-lg border px-3 py-2 text-[12px] font-sans text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
  const inStyle = { background: 'var(--color-bg)', borderColor: 'var(--color-border-w)' }
  const lbCls  = "text-[10px] font-sans font-semibold text-[var(--color-cream-dim)] uppercase tracking-wider mb-1 block"

  function handleSmartQueue() {
    setSchedDate(nextAvailableSlot(allItems, platform))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setError(null)
    startTransition(async () => {
      try {
        const newItem = await createItem({
          title: title.trim(), platform,
          content_type: 'Post',
          caption: caption.trim() || null,
          platform_variants: null, objective: null, target_audience: null,
          expected_outcome: null, cta: null, destination_url: null,
          status: 'idea',
          content_pillar: (pillar || null) as Pillar | null,
          score: null,
          scheduled_date: schedDate,
          scheduled_time: schedTime || null,
          notes: null, visual_brief: null, canva_url: null,
          visual_thumbnail: null, visual_feedback: null,
          visual_status: 'needed',
        })
        onCreated(newItem)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-2xl border w-full max-w-md p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[var(--color-cream)] font-serif text-base">Quick Compose</h2>
          <button onClick={onClose} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-xl leading-none">×</button>
        </div>
        {guideline && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(196,145,42,0.08)', border: '1px solid rgba(196,145,42,0.25)' }}>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(196,145,42,0.2)', color: '#c4912a' }}>
              {guideline.label}
            </span>
            <span className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
              {guideline.hint}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={lbCls}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Post title…" className={inCls} style={inStyle} autoFocus />
          </div>

          <div>
            <label className={lbCls}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)}
              className={inCls} style={inStyle}>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div>
            <label className={lbCls}>Content Pillar</label>
            <select value={pillar} onChange={e => setPillar(e.target.value as Pillar | '')}
              className={inCls} style={inStyle}>
              <option value="">— none —</option>
              <option value="suburb">Suburb</option>
              <option value="seller">Seller</option>
              <option value="authority">Authority</option>
              <option value="proof">Proof</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={lbCls} style={{ marginBottom: 0 }}>Publish date</label>
              <button type="button" onClick={handleSmartQueue}
                className="text-[10px] font-sans font-semibold text-[var(--color-gold)] hover:underline">
                Next available slot →
              </button>
            </div>
            <div className="flex gap-2">
              <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                className={`${inCls} flex-1`} style={inStyle} />
              <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                className={`${inCls} w-32`} style={inStyle} />
            </div>
          </div>

          <div>
            <label className={lbCls}>Caption (optional)</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Draft caption…" rows={3}
              className={`${inCls} resize-none`} style={inStyle} />
          </div>

          {error && <p className="text-[11px] font-sans text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-xl text-[12px] font-sans font-semibold transition-opacity"
              style={{ background: 'var(--color-gold)', color: '#1c1917', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Creating…' : 'Add to calendar'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-sans font-semibold border text-[var(--color-cream-dim)]"
              style={{ borderColor: 'var(--color-border-w)', background: 'transparent' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Week card (display) ──────────────────────────────────────────────────────

function WeekCard({ item, onHoverEnter, onHoverLeave }: {
  item: ContentItem
  onHoverEnter?: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave?: () => void
}) {
  const pc       = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual   = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed
  const postType = getPostType(item)
  const typCol   = POST_TYPE_COLOUR[postType]

  return (
    <div
      onMouseEnter={e => onHoverEnter?.(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onHoverLeave}
    >
      <Link
        href={`/app/content/${item.id}`}
        className="group flex flex-col rounded-lg border overflow-hidden hover:shadow-md transition-all"
        style={{ borderColor: STATUS_BORDER[item.status as Status] ?? 'var(--color-border-w)',
          background: STATUS_BG[item.status as Status] ?? 'var(--color-card)',
          borderLeft: `3px solid ${pc}` }}
      >
        {item.visual_thumbnail && (
          <div className="w-full overflow-hidden" style={{ aspectRatio: '1/1' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.visual_thumbnail} alt=""
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <div className="flex flex-col gap-1.5 px-2.5 py-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                style={{ background: pc, color: '#fff' }}>
                {PLATFORM_ICON[item.platform] ?? '?'}
              </span>
              <span className="text-[10px] font-sans font-semibold truncate" style={{ color: pc }}>
                {PLATFORM_LABEL[item.platform]}
              </span>
            </div>
            {item.scheduled_time && (
              <span className="text-[10px] font-sans tabular-nums text-[var(--color-cream-x)] flex-shrink-0">
                {item.scheduled_time}
              </span>
            )}
          </div>

          <p className="text-[11px] font-sans font-semibold text-[var(--color-cream)] leading-tight line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
            {cleanTitle(item.title)}
          </p>

          {item.content_pillar && (
            <span className="self-start text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded"
              style={{ color: PILLAR_COLOUR[item.content_pillar], background: `${PILLAR_COLOUR[item.content_pillar]}22` }}>
              {PILLAR_LABEL[item.content_pillar]}
            </span>
          )}

          {item.caption && (
            <p className="text-[10px] font-sans text-[var(--color-cream-x)] leading-tight line-clamp-2">
              {item.caption.slice(0, 100)}
            </p>
          )}

          <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: visual.colour }} />
              <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
            </div>
            <span className="text-[8px] font-sans font-bold uppercase tracking-wide px-1 py-0.5 rounded flex-shrink-0"
              style={{ color: typCol, background: `${typCol}22` }}>
              {postType}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── Draggable wrapper ────────────────────────────────────────────────────────

// ─── SEO article chip (non-draggable, links to live site) ────────────────────

function SeoWeekChip({ item }: { item: ContentItem }) {
  const isDraft = item.notes?.includes('Staged')
  // Staged = teal (scheduled, not yet indexed)
  // Live   = green (published, visible on site)
  const bg       = isDraft ? '#0d9488' : '#16a34a'
  const border   = isDraft ? '1.5px solid #0f766e' : '1.5px solid #15803d'
  const iconBg   = isDraft ? '#0f766e' : '#14532d'
  const text     = '#f0fdf4'
  const badgeBg  = isDraft ? '#0f766e' : '#15803d'
  const badgeTxt = isDraft ? '#99f6e4' : '#bbf7d0'
  const badgeLabel = isDraft ? 'staged' : 'live'
  return (
    <a
      href={item.destination_url ?? '#'}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-sans leading-tight hover:opacity-90 transition-opacity"
      style={{ background: bg, border }}
    >
      <span className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: '#fff' }}>
        ↗
      </span>
      <span className="flex-1 min-w-0 truncate font-medium" style={{ color: text }}>{item.title}</span>
      <span className="text-[8px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full"
        style={{ background: badgeBg, color: badgeTxt }}>
        {badgeLabel}
      </span>
    </a>
  )
}

function DraggableWeekCard({ item, onHoverEnter, onHoverLeave }: {
  item: ContentItem
  onHoverEnter: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      suppressHydrationWarning
      style={{ opacity: isDragging ? 0 : 1, touchAction: 'none', cursor: 'grab' }}>
      <WeekCard item={item} onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} />
    </div>
  )
}

// ─── Droppable day column ─────────────────────────────────────────────────────

function DroppableDay({ date, dateStr, today, index, dayItems, onHoverEnter, onHoverLeave, onCompose }: {
  date: Date
  dateStr: string
  today: string
  index: number
  dayItems: ContentItem[]
  onHoverEnter: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave: () => void
  onCompose: (date: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })
  const isToday = dateStr === today

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Day header */}
      <div className="rounded-xl px-3 py-2 text-center"
        style={isToday
          ? { background: 'var(--color-gold)' }
          : { background: 'var(--color-card)', border: '1px solid var(--color-border-w)' }}>
        <p className="text-[10px] font-sans font-bold uppercase tracking-widest leading-none"
          style={{ color: isToday ? '#1c1917' : 'var(--color-cream-dim)' }}>
          {DOW_SHORT[index]}
        </p>
        <p className="text-lg font-serif font-semibold leading-tight mt-0.5 tabular-nums"
          style={{ color: isToday ? '#1c1917' : 'var(--color-cream)' }}>
          {date.getDate()}
        </p>
        <p className="text-[9px] font-sans leading-none mt-0.5"
          style={{ color: isToday ? 'rgba(28,25,23,0.6)' : 'var(--color-cream-x)' }}>
          {dayItems.length > 0 ? `${dayItems.length} post${dayItems.length > 1 ? 's' : ''}` : 'No posts'}
        </p>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex flex-col gap-2 rounded-lg min-h-[80px] transition-all"
        style={isOver ? { outline: '2px dashed var(--color-gold)', outlineOffset: 3, borderRadius: 8 } : {}}>
        {dayItems.length === 0 ? (
          <button onClick={() => onCompose(dateStr)}
            className="rounded-xl border border-dashed flex flex-col items-center justify-center py-8 gap-1.5 hover:border-[var(--color-gold)] transition-colors group w-full"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-[9px] font-sans text-[var(--color-cream-x)]">Nothing scheduled</span>
            <span className="text-[9px] font-sans font-semibold text-[var(--color-gold)] group-hover:underline">+ Add post</span>
          </button>
        ) : (
          <>
            {dayItems.map(item => item.platform === 'seo'
              ? <SeoWeekChip key={item.id} item={item} />
              : <DraggableWeekCard key={item.id} item={item}
                  onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} />
            )}
            <button onClick={() => onCompose(dateStr)}
              className="rounded border border-dashed flex items-center justify-center py-1 hover:border-[var(--color-gold)] transition-colors group"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-[9px] font-sans text-[var(--color-cream-x)] group-hover:text-[var(--color-gold)]">+ Add</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Week view ────────────────────────────────────────────────────────────────

function WeekView({ items, weekDays, today, onHoverEnter, onHoverLeave, onCompose }: {
  items: ContentItem[]; weekDays: Date[]; today: string
  onHoverEnter: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave: () => void
  onCompose: (date: string) => void
}) {
  const byDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.scheduled_date) continue
    if (!byDate[item.scheduled_date]) byDate[item.scheduled_date] = []
    byDate[item.scheduled_date].push(item)
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((date, i) => {
        const dateStr  = isoDate(date)
        const dayItems = (byDate[dateStr] ?? []).sort(
          (a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''),
        )
        return (
          <DroppableDay key={dateStr} date={date} dateStr={dateStr} today={today}
            index={i} dayItems={dayItems}
            onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} onCompose={onCompose} />
        )
      })}
    </div>
  )
}

// ─── Month view ───────────────────────────────────────────────────────────────

function MonthCard({ item, onHoverEnter, onHoverLeave, selectMode, selected, onSelect }: {
  item: ContentItem
  onHoverEnter?: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave?: () => void
  selectMode?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  const pc = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'

  if (item.platform === 'seo') {
    const seoIsDraft  = item.notes?.includes('Staged')
    const seoText     = '#f0fdf4'
    const seoBg       = seoIsDraft ? '#0d9488' : '#16a34a'
    const seoBorderCl = seoIsDraft ? '#0f766e' : '#15803d'
    return (
      <a href={item.destination_url ?? '#'} target="_blank" rel="noreferrer"
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-sans font-medium leading-tight truncate hover:opacity-90 transition-opacity border-l-2"
        style={{ color: seoText, background: seoBg, borderColor: seoBorderCl }}
        title={item.title}>
        <span className="w-3 h-3 rounded text-[7px] font-bold flex items-center justify-center flex-shrink-0"
          style={{ background: seoBorderCl, color: '#fff' }}>↗</span>
        <span className="truncate">{item.title}</span>
      </a>
    )
  }

  const ds       = getDisplayStatus(item)
  const postType = getPostType(item)
  const typCol   = POST_TYPE_COLOUR[postType]

  const visual   = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed
  const inner = (
    <>
      {item.visual_thumbnail ? (
        <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '1/1' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.visual_thumbnail} alt="" className="w-full h-full object-cover" />
          {/* Status dot overlay */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full border border-[rgba(0,0,0,0.4)]"
            style={{ background: STATUS_COLOUR[item.status as Status] }} title={item.status} />
          {/* Visual status dot */}
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: visual.colour }} title={visual.label} />
        </div>
      ) : (
        <div className="relative w-full flex items-center justify-center flex-shrink-0 py-1.5"
          style={{ background: `${pc}18` }}>
          <span className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center"
            style={{ background: pc, color: '#fff' }}>
            {PLATFORM_ICON[item.platform] ?? '?'}
          </span>
          {/* Status dot (no thumbnail state) */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full border border-[rgba(0,0,0,0.2)]"
            style={{ background: STATUS_COLOUR[item.status as Status] }} title={item.status} />
        </div>
      )}
      <div className="px-1.5 pt-1 pb-0.5">
        <span className="text-[10px] font-sans font-medium leading-snug line-clamp-2" style={{ color: DS_COLOUR[ds] }}>
          {cleanTitle(item.title)}
        </span>
      </div>
      <div className="px-1.5 pb-1">
        <span className="text-[8px] font-sans font-bold uppercase tracking-wide px-1 py-0.5 rounded"
          style={{ color: typCol, background: `${typCol}22` }}>
          {postType}
        </span>
      </div>
      {selectMode && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ background: selected ? DS_COLOUR['posted'] : 'transparent',
            borderColor: selected ? DS_COLOUR['posted'] : 'rgba(255,255,255,0.4)' }}>
          {selected && <span className="text-[8px] text-white font-bold">✓</span>}
        </div>
      )}
    </>
  )

  if (selectMode) {
    return (
      <div
        onClick={() => onSelect?.(item.id)}
        className="relative flex flex-col rounded overflow-hidden border-l-2 cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: selected ? `${DS_COLOUR['posted']}18` : DS_BG[ds], borderColor: pc }}
        title={item.title}
      >
        {inner}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={e => onHoverEnter?.(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onHoverLeave}
    >
      <Link
        href={`/app/content/${item.id}`}
        className="relative flex flex-col rounded overflow-hidden hover:opacity-80 transition-opacity border-l-2"
        style={{ background: DS_BG[ds], borderColor: pc }}
        title={item.title}
      >
        {inner}
      </Link>
    </div>
  )
}

function MonthView({ items, year, month, today, onHoverEnter, onHoverLeave, selectMode, selectedIds, onSelect, onCompose }: {
  items: ContentItem[]; year: number; month: number; today: string
  onHoverEnter?: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave?: () => void
  selectMode?: boolean
  selectedIds?: Set<string>
  onSelect?: (id: string) => void
  onCompose?: (date: string) => void
}) {
  const byDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.scheduled_date) continue
    if (!byDate[item.scheduled_date]) byDate[item.scheduled_date] = []
    byDate[item.scheduled_date].push(item)
  }
  const weeks = getMonthGrid(year, month)
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="rounded-xl border border-[var(--color-border-w)] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--color-border-w)] bg-[var(--color-card)]">
        {DOW.map(d => (
          <div key={d} className="text-center text-[var(--color-cream-x)] text-[11px] font-sans py-2 tracking-wide">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-[var(--color-border-w)] last:border-b-0">
          {week.map((date, di) => {
            const dateStr     = date.toLocaleDateString('en-CA')
            const isThisMonth = date.getMonth() === month
            const isToday     = dateStr === today
            const isPast      = dateStr < today

            const dayItems = (byDate[dateStr] ?? []).sort(
              (a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''),
            )
            const cellBg = isToday
              ? 'rgba(196,145,42,0.1)'
              : isPast
                ? 'rgba(0,0,0,0.18)'
                : 'transparent'
            return (
              <div key={di}
                className={`min-h-[120px] p-2 border-r border-[var(--color-border-w)] last:border-r-0 transition-colors ${!isThisMonth ? 'opacity-40' : ''}`}
                style={{ background: cellBg, opacity: isPast && isThisMonth ? 0.55 : undefined }}>
                <div className="flex items-center justify-between mb-1.5 group/cell">
                  <span className={`text-[11px] font-sans w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[var(--color-gold)] text-[var(--color-bg)] font-bold' : 'text-[var(--color-cream-dim)]'
                  }`}>{date.getDate()}</span>
                  <div className="flex items-center gap-1">
                    {dayItems.length > 3 && (
                      <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{dayItems.length}</span>
                    )}
                    {onCompose && !selectMode && (
                      <button
                        onClick={() => onCompose(dateStr)}
                        className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"
                        style={{ color: 'var(--color-gold)', border: '1px solid rgba(196,145,42,0.4)', background: 'rgba(196,145,42,0.08)' }}
                        title="Add post"
                      >
                        <span className="text-[11px] leading-none">+</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {dayItems.slice(0, 3).map(item => (
                    <MonthCard key={item.id} item={item}
                      onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave}
                      selectMode={selectMode} selected={selectedIds?.has(item.id)} onSelect={onSelect} />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[9px] font-sans text-[var(--color-cream-x)] pl-1">+{dayItems.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Filter options ───────────────────────────────────────────────────────────

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string; colour?: string; soon?: boolean }[] = [
  { value: 'all',       label: 'All' },
  { value: 'linkedin',  label: 'LinkedIn',  colour: '#0a66c2' },
  { value: 'facebook',  label: 'Facebook',  colour: '#1877f2', soon: true },
  { value: 'instagram', label: 'Instagram', colour: '#e1306c' },
  { value: 'seo',       label: 'Website',   colour: '#10b981' },
]

const PILLAR_OPTIONS: { value: PillarFilter; label: string }[] = [
  { value: 'all',       label: 'All pillars' },
  { value: 'suburb',    label: 'Suburb'    },
  { value: 'seller',    label: 'Seller'    },
  { value: 'authority', label: 'Authority' },
  { value: 'proof',     label: 'Proof'     },
  { value: 'buyer',     label: 'Buyer'     },
]

// ─── Main client component ────────────────────────────────────────────────────

export default function CalendarClient({
  items: initialItems,
  today,
  defaultView = 'month',
  defaultPlatform = 'all',
}: {
  items: ContentItem[]
  today: string
  defaultView?: ViewMode
  defaultPlatform?: PlatformFilter
}) {
  const [localItems, setLocalItems] = useState<ContentItem[]>(initialItems)
  const [view, setView]             = useState<ViewMode>(defaultView)
  const [platform, setPlatform]     = useState<PlatformFilter>(defaultPlatform ?? 'all')
  const [dStatus, setDStatus]       = useState<DisplayStatusFilter>('all')
  const [pillar, setPillar]         = useState<PillarFilter>('all')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPosting, startPostTransition] = useTransition()

  const todayDate = new Date(today + 'T00:00:00')
  const [weekAnchor, setWeekAnchor] = useState<Date>(todayDate)
  const [monthYear, setMonthYear]   = useState(todayDate.getFullYear())
  const [monthIdx, setMonthIdx]     = useState(todayDate.getMonth())

  // DnD
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  // Hover — with delay so mouse can travel from card to preview without it closing
  const [hovered, setHovered] = useState<{ item: ContentItem; rect: DOMRect } | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCardHoverEnter(item: ContentItem, rect: DOMRect) {
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null }
    setHovered({ item, rect })
  }
  function handleCardHoverLeave() {
    hideTimerRef.current = setTimeout(() => { setHovered(null) }, 400)
  }
  function handlePreviewEnter() {
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null }
  }
  function handlePreviewLeave() {
    setHovered(null)
  }

  async function handleRegenerate(id: string, mode: 'primary' | 'alternate'): Promise<string | null> {
    const newUrl = await regenerateVisual(id, mode)
    if (newUrl) {
      setLocalItems(prev => prev.map(i =>
        i.id === id ? { ...i, visual_thumbnail: newUrl, visual_status: 'approved' } : i
      ))
    }
    return newUrl
  }

  async function handleStatusChange(id: string, newStatus: Status): Promise<void> {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    await updateItemStatus(id, newStatus)
  }

  async function handleSwap(
    currentId: string,
    incomingId: string,
    date: string,
    incoming: ContentItem,
  ): Promise<void> {
    await swapPost(currentId, incomingId, date)
    // Update local state: unschedule current, schedule incoming
    setLocalItems(prev => prev.map(i => {
      if (i.id === currentId) return { ...i, scheduled_date: null, status: 'ready' as Status }
      if (i.id === incomingId) return { ...i, scheduled_date: date, status: 'scheduled' as Status }
      return i
    }))
    setHovered(null)
    // If the incoming post has no visual, generate one now
    if (!incoming.visual_thumbnail) {
      const newUrl = await regenerateVisual(incomingId, 'primary').catch(() => null)
      if (newUrl) {
        setLocalItems(prev => prev.map(i =>
          i.id === incomingId ? { ...i, visual_thumbnail: newUrl, visual_status: 'approved' } : i
        ))
      }
    }
  }

  // Compose — week view "+" opens quick compose; month view "+" opens smart modal
  const [composingDate, setComposingDate] = useState<string | null>(null)
  const [smartDate,     setSmartDate]     = useState<string | null>(null)

  // Derived
  const weekDays = getWeekDays(weekAnchor)
  const weekRangeLabel = (() => {
    const mon = weekDays[0]
    const sun = weekDays[6]
    return `${mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
  })()

  // Two-week view: this week + next week (always relative to today)
  const thisWeekDays = getWeekDays(todayDate)
  const nextWeekDays = getWeekDays(addDays(todayDate, 7))
  const thisWeekLabel = (() => {
    const mon = thisWeekDays[0]; const sun = thisWeekDays[6]
    return `${mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
  })()
  const nextWeekLabel = (() => {
    const mon = nextWeekDays[0]; const sun = nextWeekDays[6]
    return `${mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${sun.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
  })()
  const monthLabel = new Date(monthYear, monthIdx).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  function handleBulkMarkPosted() {
    const ids = Array.from(selectedIds)
    setLocalItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, status: 'posted' as const } : i))
    setSelectedIds(new Set())
    setSelectMode(false)
    startPostTransition(() => bulkMarkPosted(ids))
  }

  const filtered = useMemo(() => localItems.filter(item => {
    if (platform !== 'all' && item.platform !== platform) return false
    if (dStatus !== 'all' && getDisplayStatus(item) !== dStatus) return false
    if (pillar !== 'all' && item.content_pillar !== pillar) return false
    return true
  }), [localItems, platform, dStatus, pillar])

  // Urgent items: LinkedIn posts needing attention within next 14 days
  const urgentItems = useMemo(() => {
    const todayMs  = new Date(today + 'T00:00:00').getTime()
    const limitMs  = todayMs + 14 * 24 * 60 * 60 * 1000
    return localItems.filter(item =>
      item.platform === 'linkedin' &&
      getDisplayStatus(item) === 'needs-attention' &&
      item.scheduled_date !== null &&
      (() => {
        const d = new Date(item.scheduled_date! + 'T00:00:00').getTime()
        return d >= todayMs && d <= limitMs
      })()
    ).sort((a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))
  }, [localItems, today])

  // DnD handlers
  function handleDragStart(event: DragStartEvent) {
    setDraggingId(event.active.id as string)
    setHovered(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDraggingId(null)
    if (!over) return
    const itemId  = active.id as string
    const newDate = over.id as string
    const current = localItems.find(i => i.id === itemId)
    if (!current || current.scheduled_date === newDate) return
    // Optimistic
    const snapshot = localItems
    setLocalItems(prev => prev.map(i => i.id === itemId ? { ...i, scheduled_date: newDate } : i))
    rescheduleItem(itemId, newDate).catch(() => setLocalItems(snapshot))
  }

  // Nav
  function prevPeriod() {
    if (view === 'week') setWeekAnchor(d => addDays(d, -7))
    else { if (monthIdx === 0) { setMonthIdx(11); setMonthYear(y => y - 1) } else setMonthIdx(m => m - 1) }
  }
  function nextPeriod() {
    if (view === 'week') setWeekAnchor(d => addDays(d, 7))
    else { if (monthIdx === 11) { setMonthIdx(0); setMonthYear(y => y + 1) } else setMonthIdx(m => m + 1) }
  }
  function goToday() { setWeekAnchor(todayDate); setMonthYear(todayDate.getFullYear()); setMonthIdx(todayDate.getMonth()) }

  const needsAttentionCount = filtered.filter(i => getDisplayStatus(i) === 'needs-attention' && i.scheduled_date).length
  const scheduledCount      = filtered.filter(i => getDisplayStatus(i) === 'scheduled').length
  const postedCount         = filtered.filter(i => getDisplayStatus(i) === 'posted').length
  const draggingItem = draggingId ? localItems.find(i => i.id === draggingId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">

        {/* ── Attention banner ── */}
        {urgentItems.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border"
            style={{ background: 'rgba(196,145,42,0.06)', borderColor: 'rgba(196,145,42,0.3)' }}>
            <span style={{ color: '#c4912a' }}>⚠</span>
            <div>
              <p className="text-[11px] font-sans font-semibold" style={{ color: '#c4912a' }}>
                {urgentItems.length} post{urgentItems.length !== 1 ? 's' : ''} need attention in the next 14 days
              </p>
              <p className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--color-cream-x)' }}>
                {urgentItems.slice(0, 3).map(i =>
                  new Date(i.scheduled_date! + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
                ).join(' · ')}
                {urgentItems.length > 3 ? ` · +${urgentItems.length - 3} more` : ''}
                {' — '}
                <button onClick={() => setDStatus('needs-attention')}
                  className="text-[var(--color-gold)] hover:underline">
                  filter to show only these
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-[var(--color-border-w)] overflow-hidden"
            style={{ background: 'var(--color-card)' }}>
            {([['twoweek', '2 Weeks'], ['week', 'Week'], ['month', 'Month']] as [ViewMode, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-[11px] font-sans font-semibold transition-colors"
                style={view === v
                  ? { background: 'var(--color-gold)', color: '#1c1917' }
                  : { background: 'transparent', color: 'var(--color-cream-dim)' }}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {PLATFORM_OPTIONS.map(opt => (
              opt.soon && platform !== opt.value ? (
                <button
                  key={opt.value}
                  onClick={() => setPlatform(opt.value)}
                  className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg border transition-all"
                  style={{ background: 'transparent', borderColor: 'var(--color-border-w)', color: 'var(--color-cream-x)', opacity: 0.5 }}
                >
                  {opt.label} <span className="text-[9px] opacity-70">soon</span>
                </button>
              ) : (
                <Chip key={opt.value} active={platform === opt.value} colour={opt.colour} onClick={() => setPlatform(opt.value)}>
                  {opt.label}
                </Chip>
              )
            ))}
          </div>

          <div className="w-px h-5 bg-[var(--color-border-w)] hidden sm:block" />

          {/* Display-status filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Chip active={dStatus === 'all'} onClick={() => setDStatus('all')}>
              All
            </Chip>
            <Chip active={dStatus === 'needs-attention'} colour={DS_COLOUR['needs-attention']} onClick={() => setDStatus('needs-attention')}>
              {DS_LABEL['needs-attention']}
            </Chip>
            <Chip active={dStatus === 'scheduled'} colour={DS_COLOUR['scheduled']} onClick={() => setDStatus('scheduled')}>
              {DS_LABEL['scheduled']}
            </Chip>
            <Chip active={dStatus === 'posted'} colour={DS_COLOUR['posted']} onClick={() => setDStatus('posted')}>
              {DS_LABEL['posted']}
            </Chip>
          </div>

          <div className="flex-1" />
          <button
            onClick={() => { setSelectMode(s => !s); setSelectedIds(new Set()) }}
            className="text-[11px] font-sans font-semibold px-3 py-1.5 rounded-lg border transition-all"
            style={selectMode
              ? { background: 'rgba(59,130,246,0.18)', borderColor: '#3b82f6', color: '#3b82f6' }
              : { background: 'transparent', borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)' }}>
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] px-2 py-1 rounded border border-[var(--color-border-w)]">AEST</span>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-sans">
            <span style={{ color: DS_COLOUR['needs-attention'] }}>{needsAttentionCount} needs attention</span>
            <span style={{ color: DS_COLOUR['scheduled'] }}>{scheduledCount} scheduled</span>
            <span style={{ color: DS_COLOUR['posted'] }}>{postedCount} posted</span>
          </div>
        </div>

        {/* Pillar filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] mr-1">Pillar:</span>
          {PILLAR_OPTIONS.map(opt => (
            <Chip key={opt.value} active={pillar === opt.value}
              colour={opt.value !== 'all' ? PILLAR_COLOUR[opt.value as Pillar] : undefined}
              onClick={() => setPillar(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>

        {/* ── Navigation (hidden in twoweek mode) ── */}
        {view !== 'twoweek' && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button onClick={prevPeriod} className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors">‹</button>
              <button onClick={goToday}    className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors">Today</button>
              <button onClick={nextPeriod} className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors">›</button>
            </div>
            <h2 className="text-[var(--color-cream)] font-serif text-base">
              {view === 'week' ? weekRangeLabel : monthLabel}
            </h2>
          </div>
        )}

        {/* ── Calendar body ── */}
        {view === 'twoweek' ? (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-sans font-semibold tracking-[0.08em] uppercase text-[var(--color-cream-x)] mb-2">
                This week · {thisWeekLabel}
              </p>
              <WeekView
                items={filtered} weekDays={thisWeekDays} today={today}
                onHoverEnter={handleCardHoverEnter}
                onHoverLeave={handleCardHoverLeave}
                onCompose={setComposingDate}
              />
            </div>
            <div>
              <p className="text-[10px] font-sans font-semibold tracking-[0.08em] uppercase text-[var(--color-cream-x)] mb-2">
                Next week · {nextWeekLabel}
              </p>
              <WeekView
                items={filtered} weekDays={nextWeekDays} today={today}
                onHoverEnter={handleCardHoverEnter}
                onHoverLeave={handleCardHoverLeave}
                onCompose={setComposingDate}
              />
            </div>
          </div>
        ) : view === 'week' ? (
          <WeekView
            items={filtered} weekDays={weekDays} today={today}
            onHoverEnter={handleCardHoverEnter}
            onHoverLeave={handleCardHoverLeave}
            onCompose={setComposingDate}
          />
        ) : (
          <MonthView
            items={filtered} year={monthYear} month={monthIdx} today={today}
            onHoverEnter={selectMode ? undefined : handleCardHoverEnter}
            onHoverLeave={selectMode ? undefined : handleCardHoverLeave}
            selectMode={selectMode} selectedIds={selectedIds} onSelect={toggleSelect}
            onCompose={selectMode ? undefined : setSmartDate}
          />
        )}

        {/* ── Bulk action bar ── */}
        {selectMode && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.3)' }}>
            <span className="text-[11px] font-sans text-[var(--color-cream-dim)]">
              {selectedIds.size === 0 ? 'Click posts to select them' : `${selectedIds.size} post${selectedIds.size !== 1 ? 's' : ''} selected`}
            </span>
            <div className="flex-1" />
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkMarkPosted}
                disabled={isPosting}
                className="text-[11px] font-sans font-semibold px-4 py-2 rounded-lg transition-opacity"
                style={{ background: DS_COLOUR['posted'], color: '#fff', opacity: isPosting ? 0.6 : 1 }}>
                {isPosting ? 'Updating…' : `Mark ${selectedIds.size} as Posted`}
              </button>
            )}
            <button
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()) }}
              className="text-[11px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-cream)]">
              Cancel
            </button>
          </div>
        )}

      </div>

      {/* ── DnD ghost ── */}
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {draggingItem ? (
          <div style={{ width: 180, opacity: 0.9, cursor: 'grabbing', pointerEvents: 'none' }}>
            <WeekCard item={draggingItem} />
          </div>
        ) : null}
      </DragOverlay>

      {/* ── Hover preview ── */}
      {hovered && !draggingId && (
        <HoverPreview
          item={hovered.item}
          rect={hovered.rect}
          onRegenerate={handleRegenerate}
          onSwap={handleSwap}
          onStatusChange={handleStatusChange}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
        />
      )}

      {/* ── Quick compose (week view) ── */}
      {composingDate && (
        <QuickComposeModal
          date={composingDate}
          allItems={localItems}
          onClose={() => setComposingDate(null)}
          onCreated={newItem => setLocalItems(prev => [...prev, newItem])}
        />
      )}

      {/* ── Smart day modal (month view "+") ── */}
      {smartDate && (
        <SmartDayModal
          date={smartDate}
          onClose={() => setSmartDate(null)}
          onScheduled={item => {
            setLocalItems(prev => {
              const exists = prev.find(i => i.id === item.id)
              if (exists) return prev.map(i => i.id === item.id ? item : i)
              return [...prev, item]
            })
            setSmartDate(null)
          }}
        />
      )}
    </DndContext>
  )
}
