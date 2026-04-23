'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { ContentItem } from '@/types/content'
import { STATUS_COLOUR, PLATFORM_COLOUR } from '@/types/content'

// ── Post type detection (mirrors CalendarClient logic) ────────────────────────

type PostType = 'Market' | 'Authority' | 'Poll' | 'Article' | 'Suburb Spotlight' | 'Post'

const TYPE_COLOUR: Record<PostType, string> = {
  Market:            '#10b981',
  Authority:         '#06b6d4',
  Poll:              '#8b5cf6',
  Article:           '#f59e0b',
  'Suburb Spotlight':'#ec4899',
  Post:              '#6b7280',
}

const TYPE_DESC: Record<PostType, string> = {
  Market:            'Data-led market updates · Publishes Tuesday',
  Authority:         "Daniel's opinion and expertise · Publishes Tuesday",
  Poll:              'LinkedIn native polls · Publishes Wednesday',
  Article:           'Suburb spotlights and long-form features · Publishes Thursday',
  'Suburb Spotlight':'Facebook suburb snapshots · As assigned',
  Post:              'General posts without a specific type',
}

const LINKEDIN_TYPES: PostType[] = ['Market', 'Authority', 'Poll', 'Article', 'Post']
const FACEBOOK_TYPES: PostType[] = ['Suburb Spotlight', 'Post']

function getPostType(item: ContentItem): PostType {
  const t    = item.title.toLowerCase()
  const vb   = (item.visual_brief ?? '').toLowerCase()
  const ct   = (item.content_type ?? '').toLowerCase()

  if (t.includes('poll') || ct.includes('poll')) return 'Poll'

  if (item.scheduled_date && item.platform === 'linkedin') {
    const dow = new Date(item.scheduled_date + 'T12:00:00').getDay()
    if (dow === 4) return 'Article'
    if (dow === 2) {
      if (item.content_pillar === 'authority' || vb.includes('checklist')) return 'Authority'
      return 'Market'
    }
  }

  if (t.includes('field guide') || t.includes('article feature') || t.includes('article')) return 'Article'
  if (item.content_pillar === 'authority' || vb.includes('checklist')) return 'Authority'
  if (vb.includes('market') || t.includes('market') || t.includes('rate') || t.includes('rba')) return 'Market'
  if (t.includes('suburb') || t.includes('spotlight')) {
    return item.platform === 'facebook' ? 'Suburb Spotlight' : 'Article'
  }
  return 'Post'
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^LinkedIn\s+(Field Guide\s*[-–]\s*|Article Feature\s*[-–]\s*|Post[:\s\-]+|Poll[:\s\-]+)/i, '')
    .trim()
}

// ── Star button ────────────────────────────────────────────────────────────────

function StarButton({ starred, onClick }: { starred: boolean; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onClick() }}
      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
      style={{
        background: starred ? 'rgba(196,145,42,0.95)' : 'rgba(10,8,6,0.6)',
        backdropFilter: 'blur(6px)',
        border: starred ? '1px solid rgba(196,145,42,0.5)' : '1px solid rgba(255,255,255,0.1)',
        opacity: starred ? 1 : undefined,
      }}
      title={starred ? 'Remove from favourites' : 'Add to favourites'}
    >
      <svg width="11" height="11" viewBox="0 0 24 24"
        fill={starred ? '#fff' : 'none'}
        stroke={starred ? '#fff' : 'rgba(255,255,255,0.6)'}
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  )
}

// ── Library card ───────────────────────────────────────────────────────────────

function LibraryCard({ item, starred, onToggleStar }: {
  item: ContentItem
  starred: boolean
  onToggleStar: (id: string) => void
}) {
  const pc      = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const sc      = STATUS_COLOUR[item.status] ?? '#9ca3af'
  const title   = cleanTitle(item.title)

  return (
    <div className="relative group flex-shrink-0" style={{ width: 188 }}>
      <Link
        href={`/app/content/${item.id}`}
        className="flex flex-col rounded-xl overflow-hidden border transition-all hover:opacity-90"
        style={{ borderColor: 'var(--color-border-w)', background: 'var(--color-card)' }}
      >
        {/* Thumbnail / placeholder */}
        {item.visual_thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.visual_thumbnail} alt=""
            className="w-full object-cover flex-shrink-0"
            style={{ aspectRatio: '1/1' }} />
        ) : (
          <div className="w-full flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
            style={{ aspectRatio: '1/1', background: `${pc}14` }}>
            <span className="w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center"
              style={{ background: pc, color: '#fff' }}>
              {item.platform === 'linkedin' ? 'in' : item.platform === 'facebook' ? 'f' : '?'}
            </span>
            <span className="text-[9px] font-sans font-medium opacity-40" style={{ color: pc }}>
              No visual
            </span>
          </div>
        )}

        {/* Info */}
        <div className="p-2.5 flex flex-col gap-2">
          <p className="text-[11px] font-sans font-semibold leading-snug line-clamp-3"
            style={{ color: 'var(--color-cream)' }}>
            {title}
          </p>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded capitalize"
              style={{ color: sc, background: `${sc}18`, border: `1px solid ${sc}30` }}>
              {item.status}
            </span>
            {item.scheduled_date ? (
              <span className="text-[9px] font-sans tabular-nums" style={{ color: 'var(--color-cream-x)' }}>
                {new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'short',
                })}
              </span>
            ) : (
              <span className="text-[9px] font-sans italic" style={{ color: 'var(--color-cream-x)', opacity: 0.5 }}>
                Unscheduled
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Star — visible on hover (or always when starred) */}
      <div className={`transition-opacity ${starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <StarButton starred={starred} onClick={() => onToggleStar(item.id)} />
      </div>
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────

function TypeSection({ type, items, starredIds, onToggleStar }: {
  type: PostType
  items: ContentItem[]
  starredIds: Set<string>
  onToggleStar: (id: string) => void
}) {
  if (items.length === 0) return null
  const colour = TYPE_COLOUR[type]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colour }} />
          <h3 className="text-[12px] font-sans font-bold" style={{ color: 'var(--color-cream)' }}>
            {type}
          </h3>
          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full"
            style={{ background: `${colour}18`, color: colour }}>
            {items.length}
          </span>
        </div>
        <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
          {TYPE_DESC[type]}
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {items.map(item => (
          <LibraryCard
            key={item.id}
            item={item}
            starred={starredIds.has(item.id)}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

const LS_KEY = 'dg-library-starred'

export default function LibraryClient({ items }: { items: ContentItem[] }) {
  const [platform, setPlatform]   = useState<'linkedin' | 'facebook'>('linkedin')
  const [showPosted, setShowPosted] = useState(false)
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())

  // Load starred from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setStarredIds(new Set(JSON.parse(raw) as string[]))
    } catch { /* ignore */ }
  }, [])

  const toggleStar = useCallback((id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }, [])

  // Filter by platform + posted toggle
  const visible = useMemo(() => items.filter(item => {
    if (item.platform !== platform) return false
    if (!showPosted && item.status === 'posted') return false
    return true
  }), [items, platform, showPosted])

  // Separate starred from rest
  const starredItems = useMemo(
    () => visible.filter(i => starredIds.has(i.id)),
    [visible, starredIds],
  )

  // Group non-starred items by post type
  const typeGroups = useMemo(() => {
    const unstarred = visible.filter(i => !starredIds.has(i.id))
    const groups: Partial<Record<PostType, ContentItem[]>> = {}
    for (const item of unstarred) {
      const t = getPostType(item)
      if (!groups[t]) groups[t] = []
      groups[t]!.push(item)
    }
    return groups
  }, [visible, starredIds])

  const typeOrder = platform === 'linkedin' ? LINKEDIN_TYPES : FACEBOOK_TYPES

  const PLATFORM_TABS = [
    { value: 'linkedin' as const, label: 'LinkedIn', colour: '#0a66c2' },
    { value: 'facebook' as const, label: 'Facebook', colour: '#1877f2' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Platform tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--color-border-w)]"
          style={{ background: 'var(--color-card)' }}>
          {PLATFORM_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setPlatform(tab.value)}
              className="px-4 py-1.5 rounded-lg text-[12px] font-sans font-semibold transition-all"
              style={platform === tab.value
                ? { background: tab.colour, color: '#fff' }
                : { color: 'var(--color-cream-x)', background: 'transparent' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Post count */}
          <span className="text-[11px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
            {visible.length} posts
            {starredItems.length > 0 && (
              <span className="ml-2" style={{ color: '#c4912a' }}>
                · {starredItems.length} starred
              </span>
            )}
          </span>

          {/* Show posted toggle */}
          <button
            onClick={() => setShowPosted(s => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-sans font-semibold transition-all"
            style={showPosted
              ? { background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' }
              : { background: 'transparent', borderColor: 'var(--color-border-w)', color: 'var(--color-cream-x)' }
            }
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: showPosted ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
            {showPosted ? 'Hiding posted' : 'Show posted'}
          </button>
        </div>
      </div>

      {/* ── Favourites ── */}
      {starredItems.length > 0 && (
        <div className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ background: 'rgba(196,145,42,0.04)', borderColor: 'rgba(196,145,42,0.25)' }}>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#c4912a" stroke="#c4912a" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h3 className="text-[11px] font-sans font-bold tracking-[0.12em] uppercase" style={{ color: '#c4912a' }}>
              Favourites
            </h3>
            <span className="text-[10px] font-sans" style={{ color: 'rgba(196,145,42,0.6)' }}>
              · Ready to schedule
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {starredItems.map(item => (
              <LibraryCard
                key={item.id}
                item={item}
                starred={true}
                onToggleStar={toggleStar}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Type sections ── */}
      <div className="flex flex-col gap-8">
        {typeOrder.map(type => (
          <TypeSection
            key={type}
            type={type}
            items={typeGroups[type] ?? []}
            starredIds={starredIds}
            onToggleStar={toggleStar}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm font-sans" style={{ color: 'var(--color-cream-x)' }}>
            No posts found. {!showPosted ? 'Try enabling "Show posted" to see published content.' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
