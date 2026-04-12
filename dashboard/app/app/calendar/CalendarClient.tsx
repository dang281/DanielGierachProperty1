'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ContentItem, Platform, Status } from '@/types/content'
import { PLATFORM_COLOUR, STATUS_COLOUR, STATUS_BG, STATUS_BORDER } from '@/types/content'

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode       = 'week' | 'month'
type PlatformFilter = 'all' | Platform
type StatusFilter   = 'all' | Status

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// Monday of the ISO week containing d
function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7 // 0=Mon
  return addDays(d, -day)
}

function getWeekDays(anchor: Date): Date[] {
  const mon = mondayOf(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

function getMonthGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startDow)
  const lastDay = new Date(year, month + 1, 0)
  const endDow = (lastDay.getDay() + 6) % 7
  const end = new Date(year, month + 1, 6 - endDow)
  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= end) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

// ─── Platform icons ───────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<string, string> = {
  linkedin:  'in',
  facebook:  'f',
  instagram: '✦',
}

const PLATFORM_LABEL: Record<string, string> = {
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
  instagram: 'Instagram',
}

const VISUAL_DOT: Record<string, { colour: string; label: string }> = {
  needed:         { colour: '#9ca3af', label: 'Visual needed'   },
  draft:          { colour: '#818cf8', label: 'Design ready'    },
  needs_revision: { colour: '#f97316', label: 'Needs revision'  },
  approved:       { colour: '#22c55e', label: 'Visual approved' },
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

function Chip({
  active,
  colour,
  onClick,
  children,
}: {
  active: boolean
  colour?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg border transition-all"
      style={
        active
          ? {
              background: colour ? `${colour}22` : 'rgba(196,145,42,0.18)',
              borderColor: colour ?? 'var(--color-gold)',
              color: colour ?? 'var(--color-gold)',
            }
          : {
              background: 'transparent',
              borderColor: 'var(--color-border-w)',
              color: 'var(--color-cream-dim)',
            }
      }
    >
      {children}
    </button>
  )
}

// ─── Post card (week view) ────────────────────────────────────────────────────

function WeekCard({ item }: { item: ContentItem }) {
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

  return (
    <Link
      href={`/app/content/${item.id}`}
      className="group flex flex-col rounded-lg border overflow-hidden hover:shadow-md transition-all"
      style={{
        borderColor: STATUS_BORDER[item.status as Status] ?? 'var(--color-border-w)',
        background: STATUS_BG[item.status as Status] ?? 'var(--color-card)',
        borderLeft: `3px solid ${platformColour}`,
      }}
    >
      {/* Thumbnail */}
      {item.visual_thumbnail && (
        <div className="w-full h-[72px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.visual_thumbnail}
            alt=""
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        {/* Platform + time row */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center flex-shrink-0"
              style={{ background: platformColour, color: '#fff' }}
            >
              {PLATFORM_ICON[item.platform] ?? '?'}
            </span>
            <span className="text-[10px] font-sans font-semibold truncate" style={{ color: platformColour }}>
              {PLATFORM_LABEL[item.platform]}
            </span>
          </div>
          {item.scheduled_time && (
            <span className="text-[10px] font-sans tabular-nums text-[var(--color-cream-x)] flex-shrink-0">
              {item.scheduled_time}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[11px] font-sans font-semibold text-[var(--color-cream)] leading-tight line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
          {item.title}
        </p>

        {/* Caption snippet */}
        {item.caption && (
          <p className="text-[10px] font-sans text-[var(--color-cream-x)] leading-tight line-clamp-2">
            {item.caption.slice(0, 100)}
          </p>
        )}

        {/* Footer: visual status + canva */}
        <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-1" title={visual.label}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: visual.colour }} />
            <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
          </div>
          {item.canva_url && (
            <a
              href={item.canva_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[9px] font-sans font-bold rounded px-1.5 py-0.5 flex-shrink-0"
              style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.15)' }}
            >
              Canva ↗
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Week view ────────────────────────────────────────────────────────────────

const DOW_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function WeekView({
  items,
  weekDays,
  today,
}: {
  items: ContentItem[]
  weekDays: Date[]
  today: string
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
        const dateStr = isoDate(date)
        const isToday = dateStr === today
        const dayItems = (byDate[dateStr] ?? []).sort(
          (a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''),
        )

        return (
          <div key={dateStr} className="flex flex-col gap-2 min-w-0">
            {/* Day header */}
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={
                isToday
                  ? { background: 'var(--color-gold)' }
                  : { background: 'var(--color-card)', border: '1px solid var(--color-border-w)' }
              }
            >
              <p
                className="text-[10px] font-sans font-bold uppercase tracking-widest leading-none"
                style={{ color: isToday ? '#1c1917' : 'var(--color-cream-dim)' }}
              >
                {DOW_SHORT[i]}
              </p>
              <p
                className="text-lg font-serif font-semibold leading-tight mt-0.5 tabular-nums"
                style={{ color: isToday ? '#1c1917' : 'var(--color-cream)' }}
              >
                {date.getDate()}
              </p>
              <p
                className="text-[9px] font-sans leading-none mt-0.5"
                style={{ color: isToday ? 'rgba(28,25,23,0.6)' : 'var(--color-cream-x)' }}
              >
                {dayItems.length > 0 ? `${dayItems.length} post${dayItems.length > 1 ? 's' : ''}` : 'No posts'}
              </p>
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-2">
              {dayItems.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed flex flex-col items-center justify-center py-8 gap-1.5"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <span className="text-[9px] font-sans text-[var(--color-cream-x)]">Nothing scheduled</span>
                  <Link
                    href={`/app/social?date=${dateStr}`}
                    className="text-[9px] font-sans font-semibold text-[var(--color-gold)] hover:underline"
                  >
                    + Add post
                  </Link>
                </div>
              ) : (
                dayItems.map(item => <WeekCard key={item.id} item={item} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Month view ───────────────────────────────────────────────────────────────

function MonthCard({ item }: { item: ContentItem }) {
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  return (
    <Link
      href={`/app/content/${item.id}`}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-sans leading-tight truncate hover:opacity-80 transition-opacity border-l-2"
      style={{
        color: STATUS_COLOUR[item.status as Status],
        background: STATUS_BG[item.status as Status],
        borderColor: platformColour,
        borderLeftColor: platformColour,
      }}
      title={`${item.title} — ${item.scheduled_time ?? ''}`}
    >
      <span
        className="w-3 h-3 rounded text-[7px] font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: platformColour, color: '#fff' }}
      >
        {PLATFORM_ICON[item.platform] ?? '?'}
      </span>
      <span className="truncate">
        {item.scheduled_time ? `${item.scheduled_time} ` : ''}
        {item.title}
      </span>
    </Link>
  )
}

function MonthView({
  items,
  year,
  month,
  today,
}: {
  items: ContentItem[]
  year: number
  month: number
  today: string
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
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border-w)] bg-[var(--color-card)]">
        {DOW.map(d => (
          <div key={d} className="text-center text-[var(--color-cream-x)] text-[11px] font-sans py-2 tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-[var(--color-border-w)] last:border-b-0">
          {week.map((date, di) => {
            const dateStr = date.toLocaleDateString('en-CA')
            const isThisMonth = date.getMonth() === month
            const isToday = dateStr === today
            const dayItems = (byDate[dateStr] ?? []).sort(
              (a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''),
            )

            return (
              <div
                key={di}
                className={`min-h-[100px] p-2 border-r border-[var(--color-border-w)] last:border-r-0 transition-colors ${
                  !isThisMonth ? 'opacity-25' : ''
                }`}
                style={isToday ? { background: 'rgba(196,145,42,0.06)' } : {}}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-sans w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[var(--color-gold)] text-[var(--color-bg)] font-bold'
                        : 'text-[var(--color-cream-dim)]'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayItems.length > 2 && (
                    <span className="text-[9px] font-sans text-[var(--color-cream-x)]">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  {dayItems.slice(0, 4).map(item => (
                    <MonthCard key={item.id} item={item} />
                  ))}
                  {dayItems.length > 4 && (
                    <span className="text-[9px] font-sans text-[var(--color-cream-x)] pl-1">
                      +{dayItems.length - 4} more
                    </span>
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

// ─── Main client component ────────────────────────────────────────────────────

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string; colour?: string }[] = [
  { value: 'all',       label: 'All platforms' },
  { value: 'linkedin',  label: 'LinkedIn',  colour: '#0a66c2' },
  { value: 'facebook',  label: 'Facebook',  colour: '#1877f2' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string; colour?: string }[] = [
  { value: 'all',       label: 'All statuses' },
  { value: 'ready',     label: 'Ready',     colour: '#a855f7' },
  { value: 'scheduled', label: 'Scheduled', colour: '#22c55e' },
  { value: 'posted',    label: 'Posted',    colour: '#60a5fa' },
  { value: 'idea',      label: 'Idea',      colour: '#9ca3af' },
]

export default function CalendarClient({
  items,
  today,
}: {
  items: ContentItem[]
  today: string
}) {
  const [view, setView] = useState<ViewMode>('week')
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  // Week navigation
  const todayDate = new Date(today + 'T00:00:00')
  const [weekAnchor, setWeekAnchor] = useState<Date>(todayDate)

  // Month navigation
  const [monthYear, setMonthYear] = useState(todayDate.getFullYear())
  const [monthIdx, setMonthIdx]   = useState(todayDate.getMonth())

  // Derived
  const weekDays = getWeekDays(weekAnchor)

  const weekRangeLabel = (() => {
    const mon = weekDays[0]
    const sun = weekDays[6]
    const monLabel = mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    const sunLabel = sun.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${monLabel} – ${sunLabel}`
  })()

  const monthLabel = new Date(monthYear, monthIdx).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  // Filtered items
  const filtered = useMemo(() => {
    return items.filter(item => {
      if (platform !== 'all' && item.platform !== platform) return false
      if (status !== 'all' && item.status !== status) return false
      return true
    })
  }, [items, platform, status])

  // Navigation
  function prevPeriod() {
    if (view === 'week') setWeekAnchor(d => addDays(d, -7))
    else {
      if (monthIdx === 0) { setMonthIdx(11); setMonthYear(y => y - 1) }
      else setMonthIdx(m => m - 1)
    }
  }
  function nextPeriod() {
    if (view === 'week') setWeekAnchor(d => addDays(d, 7))
    else {
      if (monthIdx === 11) { setMonthIdx(0); setMonthYear(y => y + 1) }
      else setMonthIdx(m => m + 1)
    }
  }
  function goToday() {
    setWeekAnchor(todayDate)
    setMonthYear(todayDate.getFullYear())
    setMonthIdx(todayDate.getMonth())
  }

  // Stats bar
  const total = filtered.filter(i => i.scheduled_date).length
  const ready = filtered.filter(i => i.status === 'ready').length
  const scheduled = filtered.filter(i => i.status === 'scheduled').length

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* View toggle */}
        <div
          className="flex rounded-lg border border-[var(--color-border-w)] overflow-hidden"
          style={{ background: 'var(--color-card)' }}
        >
          {(['week', 'month'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-[11px] font-sans font-semibold capitalize transition-colors"
              style={
                view === v
                  ? { background: 'var(--color-gold)', color: '#1c1917' }
                  : { background: 'transparent', color: 'var(--color-cream-dim)' }
              }
            >
              {v}
            </button>
          ))}
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-1.5">
          {PLATFORM_OPTIONS.map(opt => (
            <Chip
              key={opt.value}
              active={platform === opt.value}
              colour={opt.colour}
              onClick={() => setPlatform(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border-w)] hidden sm:block" />

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <Chip
              key={opt.value}
              active={status === opt.value}
              colour={opt.colour}
              onClick={() => setStatus(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Timezone badge */}
        <span className="text-[10px] font-sans text-[var(--color-cream-x)] px-2 py-1 rounded border border-[var(--color-border-w)]">
          AEST
        </span>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-sans">
          <span style={{ color: 'var(--color-cream-dim)' }}>{total} posts</span>
          <span style={{ color: '#a855f7' }}>{ready} ready</span>
          <span style={{ color: '#22c55e' }}>{scheduled} scheduled</span>
        </div>
      </div>

      {/* ── Navigation bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button
            onClick={prevPeriod}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            ‹
          </button>
          <button
            onClick={goToday}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextPeriod}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            ›
          </button>
        </div>
        <h2 className="text-[var(--color-cream)] font-serif text-base">
          {view === 'week' ? weekRangeLabel : monthLabel}
        </h2>
      </div>

      {/* ── Calendar body ── */}
      {view === 'week' ? (
        <WeekView items={filtered} weekDays={weekDays} today={today} />
      ) : (
        <MonthView items={filtered} year={monthYear} month={monthIdx} today={today} />
      )}

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--color-border-w)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: '#0a66c2' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">LinkedIn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: '#1877f2' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Facebook</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-border-w)]" />
        {Object.entries(VISUAL_DOT).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: v.colour }} />
            <span className="text-[10px] font-sans text-[var(--color-cream-x)]">{v.label}</span>
          </div>
        ))}
        <div className="w-px h-3 bg-[var(--color-border-w)]" />
        {Object.entries(STATUS_COLOUR).map(([k, c]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-[10px] font-sans text-[var(--color-cream-x)] capitalize">{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
