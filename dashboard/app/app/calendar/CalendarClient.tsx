'use client'

import { useState, useMemo, useTransition } from 'react'
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
import { rescheduleItem, createItem } from '@/lib/actions/content'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode       = 'week' | 'twoweek' | 'month'
type PlatformFilter = 'all' | Platform
type StatusFilter   = 'all' | Status
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

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_ICON: Record<string, string>  = { linkedin: 'in', facebook: 'f', instagram: '✦' }
const PLATFORM_LABEL: Record<string, string> = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram' }

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

function HoverPreview({ item, rect }: { item: ContentItem; rect: DOMRect }) {
  const W = 300
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1400
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 900
  const left    = rect.right + 12 + W > screenW ? rect.left - W - 12 : rect.right + 12
  const top     = Math.max(8, Math.min(rect.top, screenH - 480))
  const pc      = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual  = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

  return (
    <div
      className="fixed z-50 rounded-xl border shadow-2xl p-4 flex flex-col gap-3 pointer-events-none"
      style={{ left, top, width: W, background: 'var(--color-bg)', borderColor: pc,
        boxShadow: `0 0 0 1px ${pc}33, 0 20px 40px rgba(0,0,0,0.55)` }}
    >
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

      <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)] leading-snug">{item.title}</p>

      {item.scheduled_date && (
        <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
          {new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
          {item.scheduled_time && ` · ${item.scheduled_time} AEST`}
        </p>
      )}

      {item.caption && (
        <p className="text-[10px] font-sans text-[var(--color-cream-dim)] leading-relaxed line-clamp-5">
          {item.caption.slice(0, 300)}{item.caption.length > 300 ? '…' : ''}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: visual.colour }} />
          <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
        </div>
        {item.content_pillar && (
          <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded"
            style={{ color: PILLAR_COLOUR[item.content_pillar], background: `${PILLAR_COLOUR[item.content_pillar]}22` }}>
            {PILLAR_LABEL[item.content_pillar]}
          </span>
        )}
      </div>

      <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
        Click to view full post{item.canva_url ? ' · Canva attached' : ''}
      </p>
    </div>
  )
}

// ─── Quick Compose Modal ──────────────────────────────────────────────────────

function QuickComposeModal({ date, allItems, onClose, onCreated }: {
  date: string
  allItems: ContentItem[]
  onClose: () => void
  onCreated: (item: ContentItem) => void
}) {
  const [title, setTitle]         = useState('')
  const [platform, setPlatform]   = useState<Platform>('linkedin')
  const [pillar, setPillar]       = useState<Pillar | ''>('suburb')
  const [schedDate, setSchedDate] = useState(date)
  const [schedTime, setSchedTime] = useState('08:00')
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
  const pc     = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const visual = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

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
          <div className="w-full h-[72px] overflow-hidden">
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
            {item.title}
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
            <div className="flex items-center gap-1" title={visual.label}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: visual.colour }} />
              <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{visual.label}</span>
            </div>
            {item.canva_url && (
              <a href={item.canva_url} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[9px] font-sans font-bold rounded px-1.5 py-0.5 flex-shrink-0"
                style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.15)' }}>
                Canva ↗
              </a>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── Draggable wrapper ────────────────────────────────────────────────────────

function DraggableWeekCard({ item, onHoverEnter, onHoverLeave }: {
  item: ContentItem
  onHoverEnter: (item: ContentItem, rect: DOMRect) => void
  onHoverLeave: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
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
            {dayItems.map(item => (
              <DraggableWeekCard key={item.id} item={item}
                onHoverEnter={onHoverEnter} onHoverLeave={onHoverLeave} />
            ))}
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

function MonthCard({ item }: { item: ContentItem }) {
  const pc = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  return (
    <Link href={`/app/content/${item.id}`}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-sans leading-tight truncate hover:opacity-80 transition-opacity border-l-2"
      style={{ color: STATUS_COLOUR[item.status as Status], background: STATUS_BG[item.status as Status], borderColor: pc }}
      title={`${item.title} — ${item.scheduled_time ?? ''}`}>
      <span className="w-3 h-3 rounded text-[7px] font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: pc, color: '#fff' }}>
        {PLATFORM_ICON[item.platform] ?? '?'}
      </span>
      <span className="truncate">{item.scheduled_time ? `${item.scheduled_time} ` : ''}{item.title}</span>
    </Link>
  )
}

function MonthView({ items, year, month, today }: {
  items: ContentItem[]; year: number; month: number; today: string
}) {
  const byDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.scheduled_date) continue
    if (!byDate[item.scheduled_date]) byDate[item.scheduled_date] = []
    byDate[item.scheduled_date].push(item)
  }
  const weeks = getMonthGrid(year, month)
  const DOW   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
            const dateStr    = date.toLocaleDateString('en-CA')
            const isThisMonth = date.getMonth() === month
            const isToday    = dateStr === today
            const dayItems   = (byDate[dateStr] ?? []).sort(
              (a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''),
            )
            return (
              <div key={di}
                className={`min-h-[100px] p-2 border-r border-[var(--color-border-w)] last:border-r-0 transition-colors ${!isThisMonth ? 'opacity-25' : ''}`}
                style={isToday ? { background: 'rgba(196,145,42,0.06)' } : {}}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-sans w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[var(--color-gold)] text-[var(--color-bg)] font-bold' : 'text-[var(--color-cream-dim)]'
                  }`}>{date.getDate()}</span>
                  {dayItems.length > 2 && (
                    <span className="text-[9px] font-sans text-[var(--color-cream-x)]">{dayItems.length}</span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayItems.slice(0, 4).map(item => <MonthCard key={item.id} item={item} />)}
                  {dayItems.length > 4 && (
                    <span className="text-[9px] font-sans text-[var(--color-cream-x)] pl-1">+{dayItems.length - 4} more</span>
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

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string; colour?: string }[] = [
  { value: 'linkedin', label: 'LinkedIn', colour: '#0a66c2' },
  { value: 'all',      label: 'All' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string; colour?: string }[] = [
  { value: 'all',       label: 'All statuses' },
  { value: 'ready',     label: 'Ready',     colour: '#a855f7' },
  { value: 'scheduled', label: 'Scheduled', colour: '#22c55e' },
  { value: 'posted',    label: 'Posted',    colour: '#60a5fa' },
  { value: 'idea',      label: 'Idea',      colour: '#9ca3af' },
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
  defaultView = 'week',
}: {
  items: ContentItem[]
  today: string
  defaultView?: ViewMode
}) {
  const [localItems, setLocalItems] = useState<ContentItem[]>(initialItems)
  const [view, setView]             = useState<ViewMode>(defaultView)
  const [platform, setPlatform]     = useState<PlatformFilter>('linkedin')
  const [status, setStatus]         = useState<StatusFilter>('all')
  const [pillar, setPillar]         = useState<PillarFilter>('all')

  const todayDate = new Date(today + 'T00:00:00')
  const [weekAnchor, setWeekAnchor] = useState<Date>(todayDate)
  const [monthYear, setMonthYear]   = useState(todayDate.getFullYear())
  const [monthIdx, setMonthIdx]     = useState(todayDate.getMonth())

  // DnD
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  // Hover
  const [hovered, setHovered] = useState<{ item: ContentItem; rect: DOMRect } | null>(null)

  // Compose
  const [composingDate, setComposingDate] = useState<string | null>(null)

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

  const filtered = useMemo(() => localItems.filter(item => {
    if (platform !== 'all' && item.platform !== platform) return false
    if (status !== 'all' && item.status !== status) return false
    if (pillar !== 'all' && item.content_pillar !== pillar) return false
    return true
  }), [localItems, platform, status, pillar])

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

  const total     = filtered.filter(i => i.scheduled_date).length
  const ready     = filtered.filter(i => i.status === 'ready').length
  const scheduled = filtered.filter(i => i.status === 'scheduled').length
  const draggingItem = draggingId ? localItems.find(i => i.id === draggingId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">

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
              <Chip key={opt.value} active={platform === opt.value} colour={opt.colour} onClick={() => setPlatform(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>

          <div className="w-px h-5 bg-[var(--color-border-w)] hidden sm:block" />

          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <Chip key={opt.value} active={status === opt.value} colour={opt.colour} onClick={() => setStatus(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>

          <div className="flex-1" />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)] px-2 py-1 rounded border border-[var(--color-border-w)]">AEST</span>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-sans">
            <span style={{ color: 'var(--color-cream-dim)' }}>{total} posts</span>
            <span style={{ color: '#a855f7' }}>{ready} ready</span>
            <span style={{ color: '#22c55e' }}>{scheduled} scheduled</span>
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
                onHoverEnter={(item, rect) => setHovered({ item, rect })}
                onHoverLeave={() => setHovered(null)}
                onCompose={setComposingDate}
              />
            </div>
            <div>
              <p className="text-[10px] font-sans font-semibold tracking-[0.08em] uppercase text-[var(--color-cream-x)] mb-2">
                Next week · {nextWeekLabel}
              </p>
              <WeekView
                items={filtered} weekDays={nextWeekDays} today={today}
                onHoverEnter={(item, rect) => setHovered({ item, rect })}
                onHoverLeave={() => setHovered(null)}
                onCompose={setComposingDate}
              />
            </div>
          </div>
        ) : view === 'week' ? (
          <WeekView
            items={filtered} weekDays={weekDays} today={today}
            onHoverEnter={(item, rect) => setHovered({ item, rect })}
            onHoverLeave={() => setHovered(null)}
            onCompose={setComposingDate}
          />
        ) : (
          <MonthView items={filtered} year={monthYear} month={monthIdx} today={today} />
        )}

        {/* ── Legend ── */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--color-border-w)]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: '#0a66c2' }} />
            <span className="text-[10px] font-sans text-[var(--color-cream-x)]">LinkedIn</span>
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
        <HoverPreview item={hovered.item} rect={hovered.rect} />
      )}

      {/* ── Quick compose ── */}
      {composingDate && (
        <QuickComposeModal
          date={composingDate}
          allItems={localItems}
          onClose={() => setComposingDate(null)}
          onCreated={newItem => setLocalItems(prev => [...prev, newItem])}
        />
      )}
    </DndContext>
  )
}
