'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import type { ContentItem, Pillar } from '@/types/content'
import { confirmSchedule, unscheduleItems } from '@/lib/actions/content'
import WeeklyContentReview from '@/components/dashboard/WeeklyContentReview'

type PageMode = 'main' | 'review'

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
  w1tue: { week: 1, day: 'Tue', type: 'authority',   typeLabel: 'Market / Authority', color: '#8b5cf6' },
  w1wed: { week: 1, day: 'Wed', type: 'poll',        typeLabel: 'Poll',               color: '#0a66c2' },
  w1thu: { week: 1, day: 'Thu', type: 'field-guide', typeLabel: 'Field Guide',        color: '#c4912a' },
  w2tue: { week: 2, day: 'Tue', type: 'authority',   typeLabel: 'Market / Authority', color: '#8b5cf6' },
  w2wed: { week: 2, day: 'Wed', type: 'poll',        typeLabel: 'Poll',               color: '#0a66c2' },
  w2thu: { week: 2, day: 'Thu', type: 'field-guide', typeLabel: 'Field Guide',        color: '#c4912a' },
}

// Day index within week (0 = Mon … 6 = Sun) → slot suffix, or null
const DAY_SLOT: (string | null)[] = [null, 'tue', 'wed', 'thu', null, null, null]

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PILLARS: { value: Pillar; label: string; color: string }[] = [
  { value: 'buyer',     label: 'Buyer',     color: '#14b8a6' },
  { value: 'seller',    label: 'Seller',    color: '#c4912a' },
  { value: 'authority', label: 'Authority', color: '#3b82f6' },
  { value: 'suburb',    label: 'Suburb',    color: '#22c55e' },
  { value: 'proof',     label: 'Proof',     color: '#a855f7' },
]

// ── Date helpers ──────────────────────────────────────────────────────────────

function getMondayUTC(baseDate: string, offset: number): Date {
  const [y, m, d] = baseDate.split('-').map(Number)
  const now = new Date(Date.UTC(y, m - 1, d))
  const dow   = now.getUTCDay()
  const toMon = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow
  const mon = new Date(now)
  mon.setUTCDate(mon.getUTCDate() + toMon + offset * 7)
  return mon
}

// Returns [[7 ISO dates for week1], [7 ISO dates for week2]]
function getTwoWeeks(baseDate: string, offset: number): [string[], string[]] {
  const mon1 = getMondayUTC(baseDate, offset)
  const mon2 = new Date(mon1); mon2.setUTCDate(mon1.getUTCDate() + 7)
  const toISO = (mon: Date, di: number) => {
    const d = new Date(mon); d.setUTCDate(mon.getUTCDate() + di)
    return d.toISOString().split('T')[0]
  }
  return [
    Array.from({ length: 7 }, (_, i) => toISO(mon1, i)),
    Array.from({ length: 7 }, (_, i) => toISO(mon2, i)),
  ]
}

// Derive the 6-key Dates record from two full weeks
function datesToSlots(weeks: [string[], string[]]): Dates {
  return {
    w1tue: weeks[0][1], w1wed: weeks[0][2], w1thu: weeks[0][3],
    w2tue: weeks[1][1], w2wed: weeks[1][2], w2thu: weeks[1][3],
  }
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d} ${months[m - 1]}`
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
  reviewItems,
  baseDate,
  today,
  nextFieldGuideIssue,
}: {
  libraryPosts:        ContentItem[]
  allScheduled:        ContentItem[]
  calendarItems:       ContentItem[]
  reviewItems:         ContentItem[]
  baseDate:            string
  today:               string
  nextFieldGuideIssue: number
}) {
  const [pageMode,     setPageMode]     = useState<PageMode>('main')
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [activeSlot,   setActiveSlot]   = useState<SlotKey | null>(null)
  const [pillarFilter, setPillarFilter] = useState<Pillar | null>(null)
  const [typeFilter,   setTypeFilter]   = useState<PostCategory | null>(null)
  const [confirmed,    setConfirmed]    = useState(false)
  const [isPending,    startTransition] = useTransition()

  const currentWeeks = useMemo(
    () => getTwoWeeks(baseDate, weekOffset),
    [baseDate, weekOffset],
  )
  const currentDates = useMemo(() => datesToSlots(currentWeeks), [currentWeeks])

  // Deduplicate library by title
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

  const preFilled = useMemo(() => {
    const slotDates = new Set(Object.values(currentDates))
    return allScheduled.filter(p => p.scheduled_date && slotDates.has(p.scheduled_date))
  }, [allScheduled, currentDates])

  const initialSlots = useMemo(
    () => buildSeedSlots(currentDates, preFilled, deduplicatedLibrary),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [slots, setSlots] = useState<Partial<Record<SlotKey, ContentItem>>>(initialSlots)

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
      if (typeFilter && categorise(p) !== typeFilter) return false
      if (pillarFilter && p.content_pillar !== pillarFilter) return false
      return true
    }),
    [deduplicatedLibrary, usedIds, activeType, typeFilter, pillarFilter],
  )

  const suggestions = useMemo(() => filteredLibrary.slice(0, 3), [filteredLibrary])
  const rest        = useMemo(() => filteredLibrary.slice(3),    [filteredLibrary])
  const filledCount = Object.values(slots).filter(Boolean).length

  // Calendar items indexed by date
  const calByDate = useMemo(() => {
    const m = new Map<string, ContentItem[]>()
    for (const item of calendarItems) {
      if (!item.scheduled_date) continue
      const arr = m.get(item.scheduled_date) ?? []
      arr.push(item)
      m.set(item.scheduled_date, arr)
    }
    return m
  }, [calendarItems])

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

  if (pageMode === 'review') {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1"
              style={{ color: 'var(--color-gold)' }}>Schedule</p>
            <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>Post Review</h1>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setPageMode('main')}
              className="px-4 py-1.5 rounded-xl text-xs font-sans font-semibold border transition-colors"
              style={{ color: 'var(--color-cream-dim)', borderColor: 'var(--color-border-w)', background: 'var(--color-card)' }}
            >
              ← Back to Schedule
            </button>
          </div>
        </div>
        <WeeklyContentReview initialItems={reviewItems} today={today} />
      </div>
    )
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
            Two-Week Planner
          </h1>
          <p className="text-xs mt-0.5 font-sans" style={{ color: 'var(--color-cream-x)' }}>
            {fmtDate(currentWeeks[0][0])} – {fmtDate(currentWeeks[1][6])} · LinkedIn
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Review button */}
          <button
            onClick={() => setPageMode('review')}
            className="px-4 py-1.5 rounded-xl text-xs font-sans font-semibold border transition-colors"
            style={{ color: 'var(--color-cream-dim)', borderColor: 'var(--color-border-w)', background: 'var(--color-card)' }}
          >
            {reviewItems.length > 0 ? `Review (${reviewItems.length})` : 'Review'}
          </button>

          {/* Week navigation */}
          <div className="flex items-center gap-0 rounded-xl overflow-hidden"
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
        </div>
      </div>

      {/* ── Main grid + library ── */}
      <div className="flex gap-5 items-start">

        {/* ── Two-week grid ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {currentWeeks.map((weekDates, wi) => {
            const label = `Week ${wi + 1}`
            const d0    = weekDates[0]
            const d6    = weekDates[6]
            return (
              <div key={wi}
                className="rounded-2xl overflow-hidden border border-[var(--color-border-w)]"
                style={{ background: 'var(--color-card)' }}>

                <div className="px-5 py-3 border-b border-[var(--color-border-w)] flex items-center gap-3">
                  <span className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'var(--color-gold)' }}>{label}</span>
                  <span className="text-[11px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
                    {fmtDate(d0)} – {fmtDate(d6)}
                  </span>
                </div>

                <div className="grid grid-cols-7 divide-x divide-[var(--color-border-w)]">
                  {weekDates.map((isoDate, di) => {
                    const suffix   = DAY_SLOT[di]
                    const slotKey  = suffix ? (`w${wi + 1}${suffix}` as SlotKey) : null
                    const isToday  = isoDate === today
                    const calItems = calByDate.get(isoDate) ?? []

                    if (slotKey) {
                      return (
                        <SlotCard
                          key={di}
                          slotKey={slotKey}
                          date={isoDate}
                          post={slots[slotKey] ?? null}
                          isActive={activeSlot === slotKey}
                          isToday={isToday}
                          issueNum={issueFor(slotKey)}
                          onToggle={() => toggleSlot(slotKey)}
                          onRemove={() => removePost(slotKey)}
                        />
                      )
                    }

                    return (
                      <DayCell
                        key={di}
                        label={DOW_LABELS[di]}
                        date={isoDate}
                        isToday={isToday}
                        items={calItems}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Library ── */}
        <div className="w-64 xl:w-72 flex-shrink-0 flex flex-col gap-3 sticky top-20"
          style={{ maxHeight: 'calc(100vh - 120px)' }}>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-sans font-semibold" style={{ color: 'var(--color-cream)' }}>
                Post Library
              </p>
              <p className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--color-cream-x)' }}>
                {activeSlot
                  ? `${SLOT_CONFIG[activeSlot].day} · ${SLOT_CONFIG[activeSlot].typeLabel}`
                  : `${filteredLibrary.length}${typeFilter ? '' : ` of ${deduplicatedLibrary.length}`} posts`
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

          {/* Type tabs */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-w)' }}>
            {([
              { value: null,          label: 'All',       color: 'var(--color-cream-dim)' },
              { value: 'authority',   label: 'Market',    color: '#10b981' },
              { value: 'poll',        label: 'Poll',      color: '#8b5cf6' },
              { value: 'field-guide', label: 'Article',   color: '#f59e0b' },
            ] as { value: PostCategory | null; label: string; color: string }[]).map((t, i) => (
              <button
                key={t.label}
                onClick={() => { setTypeFilter(t.value); setPillarFilter(null) }}
                className="flex-1 py-1.5 text-[10px] font-sans font-semibold transition-all"
                style={{
                  borderLeft: i > 0 ? '1px solid var(--color-border-w)' : undefined,
                  background: typeFilter === t.value ? `${t.color}22` : 'transparent',
                  color: typeFilter === t.value ? t.color : 'var(--color-cream-x)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pillar chips — hidden when a slot is active (slot type overrides) */}
          {!activeSlot && !typeFilter && (
            <div className="flex flex-wrap gap-1">
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
          )}

          <div className="overflow-y-auto flex flex-col gap-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {filteredLibrary.length === 0 ? (
              <div className="rounded-xl py-10 text-center"
                style={{ border: '1px dashed var(--color-border-w)' }}>
                <p className="text-xs font-sans" style={{ color: 'var(--color-cream-x)' }}>No posts match</p>
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
      </div>
    </div>
  )
}

// ── DayCell — non-posting day ─────────────────────────────────────────────────

function DayCell({ label, date, isToday, items }: {
  label:   string
  date:    string
  isToday: boolean
  items:   ContentItem[]
}) {
  const dayNum = date.split('-')[2].replace(/^0/, '')
  return (
    <div className="flex flex-col p-2.5 min-h-[140px]"
      style={{
        background: isToday ? 'rgba(196,145,42,0.05)' : 'transparent',
        opacity: 0.6,
      }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-sans font-bold"
          style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-x)' }}>
          {label}
        </span>
        <span className="text-[10px] font-sans tabular-nums"
          style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-x)' }}>
          {dayNum}
        </span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-1">
          <p className="text-[8px] font-sans leading-tight line-clamp-2"
            style={{ color: 'var(--color-cream-dim)' }}>
            {shortTitle(item.title)}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── SlotCard ──────────────────────────────────────────────────────────────────

function SlotCard({ slotKey, date, post, isActive, isToday, issueNum, onToggle, onRemove }: {
  slotKey:  SlotKey
  date:     string
  post:     ContentItem | null
  isActive: boolean
  isToday:  boolean
  issueNum: number | null
  onToggle: () => void
  onRemove: () => void
}) {
  const cfg     = SLOT_CONFIG[slotKey]
  const isEmpty = !post
  const dayNum  = date.split('-')[2].replace(/^0/, '')

  return (
    <div
      className="flex flex-col p-2.5 transition-all min-h-[140px]"
      style={{
        cursor: isEmpty ? 'pointer' : 'default',
        background: isActive
          ? 'rgba(196,145,42,0.05)'
          : isToday
          ? 'rgba(196,145,42,0.04)'
          : 'transparent',
        outline: isActive ? '2px solid rgba(196,145,42,0.35)' : 'none',
        outlineOffset: -2,
      }}
      onClick={isEmpty ? onToggle : undefined}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-sans font-bold"
          style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-dim)' }}>
          {cfg.day}
        </span>
        <span className="text-[10px] font-sans tabular-nums"
          style={{ color: isToday ? 'var(--color-gold)' : 'var(--color-cream-x)' }}>
          {dayNum}
        </span>
      </div>

      {/* Type label */}
      <span
        className="text-[8px] font-sans font-bold tracking-wider uppercase px-1 py-0.5 rounded self-start mb-2"
        style={{ background: cfg.color + '18', color: cfg.color }}>
        {cfg.typeLabel.split(' ')[0]}{issueNum != null ? ` ${issueNum}` : ''}
      </span>

      {post ? (
        <div className="flex flex-col gap-1.5 flex-1">
          {post.visual_thumbnail ? (
            <img
              src={post.visual_thumbnail}
              alt=""
              className="w-full rounded object-contain"
              style={{ maxHeight: 70, background: '#0a0806' }}
            />
          ) : (
            <div className="w-full rounded flex items-center justify-center"
              style={{ height: 40, background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(240,236,228,0.08)' }}>
              <span className="text-[8px] font-sans" style={{ color: 'var(--color-cream-x)' }}>No visual</span>
            </div>
          )}
          <p className="text-[10px] font-sans font-medium leading-snug flex-1"
            style={{ color: 'var(--color-cream)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {shortTitle(post.title)}
          </p>
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-[8px] font-sans font-semibold self-start px-1.5 py-0.5 rounded transition-colors"
            style={{ color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all"
          style={{ border: `1px dashed ${isActive ? 'rgba(196,145,42,0.5)' : 'rgba(240,236,228,0.08)'}` }}>
          {isActive ? (
            <p className="text-[9px] font-sans text-center px-1" style={{ color: 'var(--color-gold)' }}>
              ← Pick
            </p>
          ) : (
            <p className="text-[9px] font-sans text-center" style={{ color: 'rgba(240,236,228,0.2)' }}>+</p>
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
        border: highlighted ? '1px solid rgba(196,145,42,0.3)' : '1px solid var(--color-border-w)',
      }}
    >
      <div className="flex items-center gap-2.5">
        {post.visual_thumbnail ? (
          <img src={post.visual_thumbnail} alt=""
            className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
            style={{ background: '#0a0806' }} />
        ) : (
          <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(240,236,228,0.1)' }}>
            <span style={{ color: 'rgba(240,236,228,0.2)', fontSize: 16 }}>?</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-sans font-medium leading-snug mb-1"
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
            Use the Review tab to generate visuals inline.
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
