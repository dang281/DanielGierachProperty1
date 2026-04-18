'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import type { ContentItem, Pillar } from '@/types/content'
import { confirmSchedule, unscheduleItems } from '@/lib/actions/content'
import CalendarClient from '../calendar/CalendarClient'

type PageMode = 'plan' | 'calendar'

// ── Types ─────────────────────────────────────────────────────────────────────

type SlotKey      = 'w1tue' | 'w1wed' | 'w1thu' | 'w2tue' | 'w2wed' | 'w2thu'
type PostCategory = 'authority' | 'poll' | 'field-guide'
type Dates        = Record<SlotKey, string>

// ── Slot configuration ────────────────────────────────────────────────────────

const SLOT_CONFIG: Record<SlotKey, {
  week: 1 | 2
  day: string
  type: PostCategory
  typeLabel: string
  color: string
}> = {
  w1tue: { week: 1, day: 'Tuesday',   type: 'authority',   typeLabel: 'Market / Authority', color: '#8b5cf6' },
  w1wed: { week: 1, day: 'Wednesday', type: 'poll',        typeLabel: 'Poll',               color: '#0a66c2' },
  w1thu: { week: 1, day: 'Thursday',  type: 'field-guide', typeLabel: 'Field Guide',        color: '#c4912a' },
  w2tue: { week: 2, day: 'Tuesday',   type: 'authority',   typeLabel: 'Market / Authority', color: '#8b5cf6' },
  w2wed: { week: 2, day: 'Wednesday', type: 'poll',        typeLabel: 'Poll',               color: '#0a66c2' },
  w2thu: { week: 2, day: 'Thursday',  type: 'field-guide', typeLabel: 'Field Guide',        color: '#c4912a' },
}

const WEEKS: { label: string; slots: SlotKey[] }[] = [
  { label: 'Week 1', slots: ['w1tue', 'w1wed', 'w1thu'] },
  { label: 'Week 2', slots: ['w2tue', 'w2wed', 'w2thu'] },
]

const PILLARS: { value: Pillar; label: string; color: string }[] = [
  { value: 'buyer',     label: 'Buyer',     color: '#14b8a6' },
  { value: 'seller',    label: 'Seller',    color: '#c4912a' },
  { value: 'authority', label: 'Authority', color: '#3b82f6' },
  { value: 'suburb',    label: 'Suburb',    color: '#22c55e' },
  { value: 'proof',     label: 'Proof',     color: '#a855f7' },
]

// ── Date helpers ──────────────────────────────────────────────────────────────

// baseDate: Brisbane "today" as YYYY-MM-DD (UTC+10, computed server-side)
// offset: week offset from the default window (0 = upcoming Mon week)
function getTwoWeekDates(baseDate: string, offset: number): Dates {
  const [y, m, d] = baseDate.split('-').map(Number)
  const now = new Date(Date.UTC(y, m - 1, d))
  const dow   = now.getUTCDay()
  const toMon = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow

  const add = (days: number): string => {
    const dt = new Date(now)
    dt.setUTCDate(dt.getUTCDate() + days + offset * 7)
    return dt.toISOString().split('T')[0]
  }

  return {
    w1tue: add(toMon + 1),
    w1wed: add(toMon + 2),
    w1thu: add(toMon + 3),
    w2tue: add(toMon + 8),
    w2wed: add(toMon + 9),
    w2thu: add(toMon + 10),
  }
}

function fmtDate(iso: string): string {
  const parts  = iso.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parts[2]} ${months[parts[1] - 1]}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function categorise(item: ContentItem): PostCategory {
  const ct = (item.content_type ?? '').toLowerCase()
  const t  = item.title.toLowerCase()
  if (ct === 'poll') return 'poll'
  if (t.includes('article') || t.includes('field guide')) return 'field-guide'
  return 'authority'
}

function shortTitle(title: string): string {
  return title.includes(' - ') ? title.split(' - ').slice(1).join(' - ') : title
}

function buildSeedSlots(
  dates: Dates,
  preFilled: ContentItem[],
  library: ContentItem[],
): Partial<Record<SlotKey, ContentItem>> {
  const s: Partial<Record<SlotKey, ContentItem>> = {}
  const used = new Set<string>()

  for (const key of Object.keys(SLOT_CONFIG) as SlotKey[]) {
    const match = preFilled.find(p => p.scheduled_date === dates[key])
    if (match) { s[key] = match; used.add(match.id) }
  }

  for (const key of Object.keys(SLOT_CONFIG) as SlotKey[]) {
    if (s[key]) continue
    const slotType = SLOT_CONFIG[key].type
    const best = library.find(p => !used.has(p.id) && categorise(p) === slotType)
    if (best) { s[key] = best; used.add(best.id) }
  }

  return s
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlanningClient({
  libraryPosts,
  allScheduled,
  calendarItems,
  baseDate,
  today,
  nextFieldGuideIssue,
}: {
  libraryPosts:        ContentItem[]
  allScheduled:        ContentItem[]
  calendarItems:       ContentItem[]
  baseDate:            string
  today:               string
  nextFieldGuideIssue: number
}) {
  const [pageMode, setPageMode] = useState<PageMode>('plan')
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [activeSlot,   setActiveSlot]   = useState<SlotKey | null>(null)
  const [pillarFilter, setPillarFilter] = useState<Pillar | null>(null)
  const [confirmed,    setConfirmed]    = useState(false)
  const [isPending,    startTransition] = useTransition()

  const currentDates = useMemo(
    () => getTwoWeekDates(baseDate, weekOffset),
    [baseDate, weekOffset],
  )

  // Deduplicate library by title — prefer entry with visual_thumbnail
  const deduplicatedLibrary = useMemo(() => {
    const seen = new Map<string, ContentItem>()
    for (const post of libraryPosts) {
      const key = shortTitle(post.title).toLowerCase().trim()
      const existing = seen.get(key)
      if (!existing || (!existing.visual_thumbnail && post.visual_thumbnail)) {
        seen.set(key, post)
      }
    }
    return Array.from(seen.values())
  }, [libraryPosts])

  // Pre-filled from allScheduled for current week's slot dates
  const preFilled = useMemo(() => {
    const slotDates = new Set(Object.values(currentDates))
    return allScheduled.filter(p => p.scheduled_date && slotDates.has(p.scheduled_date))
  }, [allScheduled, currentDates])

  const initialSlots = useMemo(
    () => buildSeedSlots(currentDates, preFilled, deduplicatedLibrary),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // only for mount — weekOffset changes trigger the effect below
  )

  const [slots, setSlots] = useState<Partial<Record<SlotKey, ContentItem>>>(initialSlots)

  // Re-seed slots whenever the user navigates to a different week
  useEffect(() => {
    setSlots(buildSeedSlots(currentDates, preFilled, deduplicatedLibrary))
    setActiveSlot(null)
    setConfirmed(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  const activeType = activeSlot ? SLOT_CONFIG[activeSlot].type : null
  const usedIds    = useMemo(() =>
    new Set(Object.values(slots).map(p => p?.id).filter(Boolean) as string[]),
    [slots],
  )

  const filteredLibrary = useMemo(() =>
    deduplicatedLibrary.filter(p => {
      if (usedIds.has(p.id)) return false
      if (activeType && categorise(p) !== activeType) return false
      if (pillarFilter && p.content_pillar !== pillarFilter) return false
      return true
    }),
    [deduplicatedLibrary, usedIds, activeType, pillarFilter],
  )

  const suggestions = useMemo(() => filteredLibrary.slice(0, 3), [filteredLibrary])
  const rest        = useMemo(() => filteredLibrary.slice(3),    [filteredLibrary])
  const filledCount = Object.values(slots).filter(Boolean).length

  function assignPost(post: ContentItem) {
    if (!activeSlot) return
    setSlots(s => ({ ...s, [activeSlot]: post }))
    setActiveSlot(null)
  }

  function removePost(key: SlotKey) {
    setSlots(s => { const n = { ...s }; delete n[key]; return n })
  }

  function toggleSlot(key: SlotKey) {
    if (slots[key]) { setActiveSlot(null); return }
    setActiveSlot(k => k === key ? null : key)
  }

  function clearAllSlots() {
    setSlots({})
    setActiveSlot(null)
  }

  function handleConfirm() {
    const assignments = (Object.entries(slots) as [SlotKey, ContentItem][]).map(([key, post]) => ({
      id: post.id,
      scheduled_date: currentDates[key],
    }))
    startTransition(async () => {
      await confirmSchedule(assignments)
      setConfirmed(true)
    })
  }

  const issueFor = (key: SlotKey) =>
    key === 'w1thu' ? nextFieldGuideIssue :
    key === 'w2thu' ? nextFieldGuideIssue + 1 : null

  if (confirmed) {
    return <ConfirmedState slots={slots} dates={currentDates} onUndo={() => setConfirmed(false)} />
  }

  return (
    <div className="flex flex-col gap-5 pb-16">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1"
            style={{ color: 'var(--color-gold)' }}>
            Schedule
          </p>
          <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
            {pageMode === 'plan' ? 'Two-Week Planner' : 'Content Calendar'}
          </h1>
          {pageMode === 'plan' && (
            <p className="text-xs mt-0.5 font-sans" style={{ color: 'var(--color-cream-x)' }}>
              {fmtDate(currentDates.w1tue)}–{fmtDate(currentDates.w1thu)}
              &nbsp;·&nbsp;
              {fmtDate(currentDates.w2tue)}–{fmtDate(currentDates.w2thu)}
              &nbsp;·&nbsp; LinkedIn
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Plan / Calendar toggle */}
          <div className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--color-border-w)' }}>
            {(['plan', 'calendar'] as PageMode[]).map(m => (
              <button
                key={m}
                onClick={() => setPageMode(m)}
                className="px-4 py-1.5 text-xs font-sans font-semibold capitalize transition-colors"
                style={pageMode === m
                  ? { background: 'var(--color-gold)', color: '#0a0806' }
                  : { background: 'var(--color-card)', color: 'var(--color-cream-dim)' }}
              >
                {m === 'plan' ? 'Plan' : 'Calendar'}
              </button>
            ))}
          </div>

          {/* Plan-mode controls */}
          {pageMode === 'plan' && (
            <>
              {/* Week navigation */}
              <div className="flex items-center gap-1 rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--color-border-w)' }}>
                <button
                  onClick={() => setWeekOffset(o => o - 1)}
                  className="px-3 py-1.5 text-xs font-sans transition-colors hover:brightness-110"
                  style={{ color: 'var(--color-cream-dim)', background: 'var(--color-card)' }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-3 py-1.5 text-xs font-sans border-l border-r transition-colors"
                  style={{
                    color: weekOffset === 0 ? 'var(--color-gold)' : 'var(--color-cream-x)',
                    background: weekOffset === 0 ? 'rgba(196,145,42,0.08)' : 'var(--color-card)',
                    borderColor: 'var(--color-border-w)',
                  }}
                >
                  This Week
                </button>
                <button
                  onClick={() => setWeekOffset(o => o + 1)}
                  className="px-3 py-1.5 text-xs font-sans transition-colors hover:brightness-110"
                  style={{ color: 'var(--color-cream-dim)', background: 'var(--color-card)' }}
                >
                  Next →
                </button>
              </div>

              {filledCount > 0 && (
                <>
                  <button
                    onClick={clearAllSlots}
                    className="px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all"
                    style={{ color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)', background: 'var(--color-card)' }}
                  >
                    Clear all
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl text-sm font-sans font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'var(--color-gold)', color: '#0a0806' }}
                  >
                    {isPending ? 'Scheduling…' : `Confirm ${filledCount} of 6 →`}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Calendar mode ── */}
      {pageMode === 'calendar' && (
        <CalendarClient items={calendarItems} today={today} defaultView="twoweek" />
      )}

      {/* ── Plan mode body ── */}
      {pageMode === 'plan' && <div className="flex gap-5 items-start">

        {/* ── Calendar ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {WEEKS.map(({ label, slots: slotKeys }) => {
            const d0 = currentDates[slotKeys[0]]
            const d2 = currentDates[slotKeys[2]]
            return (
              <div key={label}
                className="rounded-2xl overflow-hidden border border-[var(--color-border-w)]"
                style={{ background: 'var(--color-card)' }}>

                <div className="px-5 py-3 border-b border-[var(--color-border-w)] flex items-center gap-3">
                  <span className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'var(--color-gold)' }}>{label}</span>
                  <span className="text-[11px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
                    {fmtDate(d0)} – {fmtDate(d2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-[var(--color-border-w)]">
                  {slotKeys.map(sk => (
                    <SlotCard
                      key={sk}
                      slotKey={sk}
                      date={currentDates[sk]}
                      post={slots[sk] ?? null}
                      isActive={activeSlot === sk}
                      issueNum={issueFor(sk)}
                      onToggle={() => toggleSlot(sk)}
                      onRemove={() => removePost(sk)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Library ── */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-3 sticky top-20"
          style={{ maxHeight: 'calc(100vh - 120px)' }}>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-sans font-semibold" style={{ color: 'var(--color-cream)' }}>
                Post Library
              </p>
              <p className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--color-cream-x)' }}>
                {activeSlot
                  ? `${SLOT_CONFIG[activeSlot].day} · ${SLOT_CONFIG[activeSlot].typeLabel}`
                  : `${deduplicatedLibrary.length} posts available`
                }
              </p>
            </div>
            {activeSlot && (
              <button
                onClick={() => setActiveSlot(null)}
                className="text-[10px] font-sans px-2 py-1 rounded-lg"
                style={{ color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}>
                Clear ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            <FilterChip active={!pillarFilter} color="var(--color-cream-dim)" onClick={() => setPillarFilter(null)}>
              All
            </FilterChip>
            {PILLARS.map(p => (
              <FilterChip
                key={p.value}
                active={pillarFilter === p.value}
                color={p.color}
                onClick={() => setPillarFilter(f => f === p.value ? null : p.value)}
              >
                {p.label}
              </FilterChip>
            ))}
          </div>

          <div className="overflow-y-auto flex flex-col gap-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {filteredLibrary.length === 0 ? (
              <div className="rounded-xl py-10 text-center"
                style={{ border: '1px dashed var(--color-border-w)' }}>
                <p className="text-xs font-sans" style={{ color: 'var(--color-cream-x)' }}>
                  No posts match
                </p>
              </div>
            ) : (
              <>
                {activeSlot && suggestions.length > 0 && (
                  <>
                    <SectionLabel color="var(--color-gold)">Suggested</SectionLabel>
                    {suggestions.map(p => (
                      <LibraryCard key={p.id} post={p} onAssign={() => assignPost(p)} highlighted />
                    ))}
                    {rest.length > 0 && <SectionLabel color="var(--color-cream-x)">All Posts</SectionLabel>}
                    {rest.map(p => (
                      <LibraryCard key={p.id} post={p} onAssign={() => assignPost(p)} />
                    ))}
                  </>
                )}
                {!activeSlot && filteredLibrary.map(p => (
                  <LibraryCard key={p.id} post={p} onAssign={() => assignPost(p)} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>}
    </div>
  )
}

// ── SlotCard ──────────────────────────────────────────────────────────────────

function SlotCard({ slotKey, date, post, isActive, issueNum, onToggle, onRemove }: {
  slotKey:  SlotKey
  date:     string
  post:     ContentItem | null
  isActive: boolean
  issueNum: number | null
  onToggle: () => void
  onRemove: () => void
}) {
  const cfg     = SLOT_CONFIG[slotKey]
  const isEmpty = !post

  return (
    <div
      className="flex flex-col p-4 transition-all"
      style={{
        minHeight: 220,
        cursor: isEmpty ? 'pointer' : 'default',
        background: isActive ? 'rgba(196,145,42,0.05)' : 'transparent',
        outline: isActive ? '2px solid rgba(196,145,42,0.35)' : 'none',
        outlineOffset: -2,
      }}
      onClick={isEmpty ? onToggle : undefined}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <div>
          <p className="text-[11px] font-sans font-semibold" style={{ color: 'var(--color-cream)' }}>
            {cfg.day}
          </p>
          <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
            {fmtDate(date)} · 07:30
          </p>
        </div>
        <span
          className="text-[8px] font-sans font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}28` }}
        >
          {cfg.typeLabel.split(' ')[0]}
        </span>
      </div>

      <p className="text-[9px] font-sans uppercase tracking-widest mb-3" style={{ color: cfg.color, opacity: 0.7 }}>
        {cfg.typeLabel}{issueNum != null ? ` · Issue ${issueNum}` : ''}
      </p>

      {post ? (
        <div className="flex flex-col gap-2.5 flex-1">
          {post.visual_thumbnail ? (
            <img
              src={post.visual_thumbnail}
              alt=""
              className="w-full rounded-lg object-contain"
              style={{ maxHeight: 100, background: '#0a0806' }}
            />
          ) : (
            <div className="w-full rounded-lg flex items-center justify-center"
              style={{ height: 60, background: 'rgba(0,0,0,0.25)', border: '1px dashed rgba(240,236,228,0.1)' }}>
              <span className="text-[9px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
                Visual needed
              </span>
            </div>
          )}
          <p className="text-[11px] font-sans font-medium leading-snug flex-1"
            style={{ color: 'var(--color-cream)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {shortTitle(post.title)}
          </p>
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-[9px] font-sans font-semibold self-start px-2 py-0.5 rounded transition-colors"
            style={{ color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all"
          style={{ border: `1.5px dashed ${isActive ? 'rgba(196,145,42,0.5)' : 'rgba(240,236,228,0.08)'}` }}>
          {isActive ? (
            <>
              <span className="text-lg">←</span>
              <p className="text-[10px] font-sans text-center px-2" style={{ color: 'var(--color-gold)' }}>
                Pick from library
              </p>
            </>
          ) : (
            <>
              <span className="text-xl font-light" style={{ color: 'rgba(240,236,228,0.15)' }}>+</span>
              <p className="text-[10px] font-sans text-center" style={{ color: 'var(--color-cream-x)' }}>
                Click to assign
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── LibraryCard ───────────────────────────────────────────────────────────────

function LibraryCard({ post, onAssign, highlighted = false }: {
  post:        ContentItem
  onAssign:    () => void
  highlighted?: boolean
}) {
  const cat      = categorise(post)
  const catColor = cat === 'poll' ? '#0a66c2' : cat === 'field-guide' ? '#c4912a' : '#8b5cf6'
  const catLabel = cat === 'poll' ? 'Poll' : cat === 'field-guide' ? 'Field Guide' : 'Authority'

  return (
    <button
      onClick={onAssign}
      className="w-full text-left rounded-xl p-3 transition-all hover:brightness-110"
      style={{
        background: highlighted ? 'rgba(196,145,42,0.06)' : 'var(--color-card)',
        border: highlighted
          ? '1px solid rgba(196,145,42,0.3)'
          : '1px solid var(--color-border-w)',
      }}
    >
      <div className="flex items-center gap-2.5">
        {post.visual_thumbnail ? (
          <img
            src={post.visual_thumbnail}
            alt=""
            className="w-14 h-14 rounded-lg object-contain flex-shrink-0"
            style={{ background: '#0a0806' }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(240,236,228,0.1)' }}>
            <span style={{ color: 'rgba(240,236,228,0.2)', fontSize: 18 }}>?</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-sans font-medium leading-snug mb-1.5"
            style={{ color: 'var(--color-cream)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {shortTitle(post.title)}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: catColor + '18', color: catColor, border: `1px solid ${catColor}30` }}>
              {catLabel}
            </span>
            {post.content_pillar && (
              <span className="text-[8px] font-sans px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(240,236,228,0.06)', color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}>
                {post.content_pillar}
              </span>
            )}
            {post.visual_thumbnail && (
              <span className="text-[8px] font-sans" style={{ color: '#22c55e' }}>✓ visual</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── ConfirmedState ────────────────────────────────────────────────────────────

function ConfirmedState({ slots, dates, onUndo }: {
  slots:  Partial<Record<SlotKey, ContentItem>>
  dates:  Dates
  onUndo: () => void
}) {
  const [undoing, startUndo] = useTransition()
  const scheduled = Object.entries(slots) as [SlotKey, ContentItem][]
  const needsVisual = scheduled.filter(([key, post]) =>
    SLOT_CONFIG[key].type !== 'poll' && !post.visual_thumbnail
  )

  function handleUndo() {
    const ids = scheduled.map(([, post]) => post.id)
    startUndo(async () => {
      await unscheduleItems(ids)
      onUndo()
    })
  }

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-3xl">
      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-2"
          style={{ color: '#22c55e' }}>
          Schedule Confirmed
        </p>
        <h1 className="text-2xl font-serif font-normal mb-1" style={{ color: 'var(--color-cream)' }}>
          {scheduled.length} post{scheduled.length !== 1 ? 's' : ''} scheduled
        </h1>
        <p className="text-sm font-sans" style={{ color: 'var(--color-cream-x)' }}>
          {fmtDate(dates.w1tue)} – {fmtDate(dates.w2thu)} · LinkedIn
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {scheduled.map(([key, post]) => {
          const cfg = SLOT_CONFIG[key]
          return (
            <div key={key} className="rounded-xl p-4"
              style={{ background: 'var(--color-card)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }} />
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest"
                  style={{ color: '#22c55e' }}>Scheduled</span>
              </div>
              <p className="text-[10px] font-sans mb-0.5" style={{ color: cfg.color }}>
                {cfg.day} · {cfg.typeLabel}
              </p>
              <p className="text-[10px] font-sans mb-2" style={{ color: 'var(--color-cream-x)' }}>
                {fmtDate(dates[key])} · 07:30
              </p>
              <p className="text-xs font-sans font-medium leading-snug mb-3"
                style={{ color: 'var(--color-cream)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {shortTitle(post.title)}
              </p>
              <Link href={`/app/content/${post.id}`}
                className="text-[10px] font-sans font-semibold"
                style={{ color: 'var(--color-gold)' }}>
                View post →
              </Link>
            </div>
          )
        })}
      </div>

      {needsVisual.length > 0 && (
        <div className="rounded-xl p-5"
          style={{ background: 'rgba(196,145,42,0.06)', border: '1px solid rgba(196,145,42,0.25)' }}>
          <p className="text-xs font-sans font-semibold mb-1" style={{ color: 'var(--color-gold)' }}>
            {needsVisual.length} post{needsVisual.length > 1 ? 's need' : ' needs'} a visual
          </p>
          <p className="text-[11px] font-sans mb-3" style={{ color: 'var(--color-cream-x)' }}>
            Run the generation script in your terminal. The post details are in its markdown file.
          </p>
          <div className="flex flex-col gap-2">
            {needsVisual.map(([key, post]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[9px] font-sans px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: SLOT_CONFIG[key].color + '18', color: SLOT_CONFIG[key].color }}>
                  {SLOT_CONFIG[key].typeLabel}
                </span>
                <p className="text-[11px] font-sans" style={{ color: 'var(--color-cream-dim)' }}>
                  {shortTitle(post.title)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/app/social"
          className="text-sm font-sans font-semibold"
          style={{ color: 'var(--color-gold)' }}>
          View all social posts →
        </Link>
        <button
          onClick={handleUndo}
          disabled={undoing}
          className="text-sm font-sans transition-all disabled:opacity-50"
          style={{ color: 'var(--color-cream-x)' }}
        >
          {undoing ? 'Undoing…' : 'Undo schedule'}
        </button>
      </div>
    </div>
  )
}

// ── Small shared components ───────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-[9px] font-sans font-bold uppercase tracking-widest pt-1"
      style={{ color }}>
      {children}
    </p>
  )
}

function FilterChip({ children, active, color, onClick }: {
  children: React.ReactNode
  active:   boolean
  color:    string
  onClick:  () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-sans px-2.5 py-0.5 rounded-full border transition-all"
      style={active
        ? { color, background: color + '18', borderColor: color + '45' }
        : { color: 'var(--color-cream-x)', background: 'transparent', borderColor: 'transparent' }
      }
    >
      {children}
    </button>
  )
}
