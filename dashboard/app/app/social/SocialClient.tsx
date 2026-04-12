'use client'

import { useState, useMemo } from 'react'
import ContentRow from '@/components/dashboard/ContentRow'
import type { ContentItem } from '@/types/content'

const PLATFORMS = [
  { value: 'linkedin',  label: 'LinkedIn',  colour: '#0a66c2' },
  { value: 'facebook',  label: 'Facebook',  colour: '#0866ff' },
]

const STATUSES = [
  { value: 'ready',     label: 'Ready',     colour: '#a855f7' },
  { value: 'scheduled', label: 'Scheduled', colour: '#22c55e' },
  { value: 'posted',    label: 'Posted',    colour: '#3b82f6' },
  { value: 'idea',      label: 'Ideas',     colour: '#9ca3af' },
  { value: 'rejected',  label: 'Rejected',  colour: '#ef4444' },
]

const PILLARS = [
  { value: 'seller',    label: 'Seller'    },
  { value: 'authority', label: 'Authority' },
  { value: 'suburb',    label: 'Suburb'    },
  { value: 'proof',     label: 'Proof'     },
  { value: 'buyer',     label: 'Buyer'     },
]

export default function SocialClient({ items }: { items: ContentItem[] }) {
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
