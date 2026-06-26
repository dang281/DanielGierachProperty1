'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import BuyerForm from './BuyerForm'
import { setBuyerStatus, deleteBuyer } from '@/lib/actions/buyers'
import { matchBuyersToListing } from '@/lib/buyer-matching'
import type { BuyerBrief, BuyerStatus } from '@/types/buyers'
import { STATUS_LABELS, STATUS_COLOURS, PROPERTY_TYPE_LABELS, type PropertyType } from '@/types/buyers'
import type { PropertyAlert } from '../PropertyMap'

const PropertyMap = dynamic(() => import('../PropertyMap'), { ssr: false })

type Props = {
  buyers: BuyerBrief[]
  alerts: PropertyAlert[]
}

const FILTER_TABS: { value: BuyerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'bought', label: 'Bought' },
  { value: 'archived', label: 'Archived' },
]

function fmtPrice(n: number | null) {
  if (n == null) return null
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`.replace('.00M', 'M')
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

export default function BuyersClient({ buyers, alerts }: Props) {
  const [tab, setTab] = useState<BuyerStatus | 'all'>('active')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'cards' | 'map'>('cards')
  const [editing, setEditing] = useState<BuyerBrief | null>(null)
  const [creating, setCreating] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Count matches per buyer
  const matchCountByBuyer = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const listing of alerts) {
      const matches = matchBuyersToListing(listing, buyers)
      for (const m of matches) {
        counts[m.buyer.id] = (counts[m.buyer.id] ?? 0) + 1
      }
    }
    return counts
  }, [buyers, alerts])

  // Total matched listings (sum of unique listings that match ≥1 active buyer)
  const totalMatchedListings = useMemo(() => {
    return alerts.filter(a => matchBuyersToListing(a, buyers).length > 0).length
  }, [buyers, alerts])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: buyers.length, active: 0, bought: 0, archived: 0 }
    buyers.forEach(b => { c[b.status]++ })
    return c
  }, [buyers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return buyers
      .filter(b => tab === 'all' || b.status === tab)
      .filter(b => {
        if (!q) return true
        return (
          b.name.toLowerCase().includes(q) ||
          b.suburbs.some(s => s.toLowerCase().includes(q)) ||
          (b.extras ?? '').toLowerCase().includes(q) ||
          (b.notes ?? '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        // active first, then bought, then archived
        const order = { active: 0, bought: 1, archived: 2 }
        const so = order[a.status] - order[b.status]
        if (so !== 0) return so
        return (matchCountByBuyer[b.id] ?? 0) - (matchCountByBuyer[a.id] ?? 0)
      })
  }, [buyers, tab, search, matchCountByBuyer])

  function handleStatusChange(id: string, status: BuyerStatus) {
    startTransition(async () => {
      await setBuyerStatus(id, status)
      router.refresh()
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name} permanently? This cannot be undone. Use Archive instead if unsure.`)) return
    startTransition(async () => {
      await deleteBuyer(id)
      router.refresh()
    })
  }

  function handleSaved() {
    setCreating(false)
    setEditing(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Link
            href="/app/properties"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] hover:text-[var(--color-gold)]"
          >
            ← Properties
          </Link>
          <h1 className="font-serif text-3xl text-[var(--color-cream)] mt-1">Buyers</h1>
          <p className="text-sm text-[var(--color-cream-dim)] mt-1">
            Buyers you're helping find a place. Their briefs match against live REA listings on the property map.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-5 py-2.5 text-sm font-semibold bg-[var(--color-cream)] text-[var(--color-bg)] rounded-md hover:bg-[var(--color-gold)] hover:text-[var(--color-cream)] transition-colors self-start sm:self-auto"
        >
          + Add buyer
        </button>
      </div>

      {/* View toggle + filters + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Cards / Map toggle */}
        <div className="flex gap-0.5 bg-[var(--color-card-2)] p-0.5 rounded-md">
          {(['cards', 'map'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                'px-3 py-1.5 text-xs font-semibold rounded transition-colors capitalize flex items-center gap-1.5',
                view === v
                  ? 'bg-[var(--color-cream)] text-[var(--color-card)]'
                  : 'text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]',
              ].join(' ')}
            >
              {v}
              {v === 'map' && totalMatchedListings > 0 && (
                <span className={[
                  'text-[10px] font-mono px-1.5 rounded',
                  view === v ? 'bg-[var(--color-gold)] text-[var(--color-card)]' : 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]',
                ].join(' ')}>
                  {totalMatchedListings}
                </span>
              )}
            </button>
          ))}
        </div>

        {view === 'cards' && (
          <>
            <div className="flex gap-1 bg-[var(--color-card-2)] p-1 rounded-md">
              {FILTER_TABS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={[
                    'px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5',
                    tab === t.value
                      ? 'bg-[var(--color-cream)] text-[var(--color-card)]'
                      : 'text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]',
                  ].join(' ')}
                >
                  {t.label}
                  <span className={[
                    'text-[10px] font-mono px-1.5 rounded',
                    tab === t.value ? 'bg-[var(--color-card)]/30' : 'bg-[var(--color-card)]',
                  ].join(' ')}>
                    {counts[t.value]}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, suburb, notes…"
              className="flex-1 bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </>
        )}

        {view === 'map' && (
          <p className="text-xs text-[var(--color-cream-dim)] sm:ml-2">
            Pins with a <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-gold)] text-white text-[9px] font-bold align-middle">#</span> badge match one or more of your active buyers. Click a pin to see who.
          </p>
        )}
      </div>

      {/* Content */}
      {view === 'map' ? (
        <div
          className="rounded-xl overflow-hidden border border-[var(--color-border-w)] bg-[var(--color-card)]"
          style={{ position: 'relative', height: 'calc(100vh - 220px)', minHeight: 540 }}
        >
          <PropertyMap properties={[]} alerts={alerts} buyers={buyers.filter(b => b.status === 'active')} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setCreating(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => (
            <BuyerCard
              key={b.id}
              buyer={b}
              matchCount={matchCountByBuyer[b.id] ?? 0}
              onEdit={() => setEditing(b)}
              onStatusChange={s => handleStatusChange(b.id, s)}
              onDelete={() => handleDelete(b.id, b.name)}
            />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <BuyerForm
          buyer={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-[var(--color-card)] border border-dashed border-[var(--color-border-w)] rounded-lg p-12 text-center">
      <p className="font-serif text-xl text-[var(--color-cream)] mb-2">No buyers in this view</p>
      <p className="text-sm text-[var(--color-cream-dim)] mb-5 max-w-md mx-auto">
        Add a buyer brief — suburbs, price, and what they're after. The dashboard map will surface matching REA listings as they arrive.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 text-sm font-semibold bg-[var(--color-cream)] text-[var(--color-bg)] rounded-md hover:bg-[var(--color-gold)] hover:text-[var(--color-cream)] transition-colors"
      >
        + Add first buyer
      </button>
    </div>
  )
}

function BuyerCard({
  buyer, matchCount, onEdit, onStatusChange, onDelete,
}: {
  buyer: BuyerBrief
  matchCount: number
  onEdit: () => void
  onStatusChange: (s: BuyerStatus) => void
  onDelete: () => void
}) {
  const isActive = buyer.status === 'active'
  const statusColour = STATUS_COLOURS[buyer.status]

  return (
    <div
      className={[
        'bg-[var(--color-card)] border rounded-lg p-5 flex flex-col gap-3 transition-colors',
        isActive ? 'border-[var(--color-border-w)]' : 'border-[var(--color-border-w)] opacity-75',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <button
            onClick={onEdit}
            className="font-serif text-lg text-[var(--color-cream)] hover:text-[var(--color-gold)] text-left leading-tight"
          >
            {buyer.name}
          </button>
          {buyer.phone && (
            <a
              href={`tel:${buyer.phone.replace(/\s/g, '')}`}
              className="block text-xs text-[var(--color-cream-dim)] hover:text-[var(--color-gold)] mt-0.5 font-mono"
            >
              {buyer.phone}
            </a>
          )}
        </div>
        <span
          className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider rounded"
          style={{ background: statusColour + '20', color: statusColour }}
        >
          {STATUS_LABELS[buyer.status]}
        </span>
      </div>

      {/* Match count — the headline value */}
      {isActive && (
        <div
          className={[
            'rounded-md px-3 py-2 flex items-center gap-2 border',
            matchCount > 0
              ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold)]'
              : 'bg-[var(--color-card-2)] border-[var(--color-border-w)]',
          ].join(' ')}
        >
          <span
            className={[
              'font-mono text-sm font-semibold tabular-nums',
              matchCount > 0 ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream-dim)]',
            ].join(' ')}
          >
            {matchCount}
          </span>
          <span className="text-xs text-[var(--color-cream-dim)]">
            {matchCount === 1 ? 'matching listing right now' : 'matching listings right now'}
          </span>
          {matchCount > 0 && (
            <Link
              href="/app/properties?layer=alerts"
              className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold)] hover:underline"
            >
              View map →
            </Link>
          )}
        </div>
      )}

      {/* Suburbs */}
      <div>
        <SubLabel>Suburbs</SubLabel>
        {buyer.suburbs.length === 0 ? (
          <p className="text-xs text-[var(--color-cream-x)] italic">No suburbs set</p>
        ) : (
          <div className="flex flex-wrap gap-1 mt-1">
            {buyer.suburbs.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 text-[11px] bg-[var(--color-card-2)] text-[var(--color-cream)] rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price + criteria row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <SubLabel>Budget</SubLabel>
          <p className="font-mono text-sm text-[var(--color-cream)] mt-0.5">
            {buyer.price_min || buyer.price_max
              ? `${fmtPrice(buyer.price_min) ?? '—'} – ${fmtPrice(buyer.price_max) ?? '—'}`
              : <span className="text-[var(--color-cream-x)] italic">Any</span>}
          </p>
        </div>
        <div>
          <SubLabel>Minimums</SubLabel>
          <p className="text-sm text-[var(--color-cream)] mt-0.5">
            {buyer.beds_min || buyer.baths_min || buyer.car_min ? (
              <span className="font-mono">
                {buyer.beds_min}🛏  {buyer.baths_min}🛁  {buyer.car_min}🚗
              </span>
            ) : (
              <span className="text-[var(--color-cream-x)] italic">Any</span>
            )}
          </p>
        </div>
      </div>

      {/* Property types */}
      {buyer.property_types.length > 0 && (
        <div>
          <SubLabel>Types</SubLabel>
          <div className="flex flex-wrap gap-1 mt-1">
            {buyer.property_types.map(t => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] bg-[var(--color-card-2)] text-[var(--color-cream-dim)] rounded"
              >
                {PROPERTY_TYPE_LABELS[t as PropertyType] ?? t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extras */}
      {buyer.extras && (
        <div>
          <SubLabel>Wants</SubLabel>
          <p className="text-xs text-[var(--color-cream-dim)] line-clamp-2 mt-0.5">{buyer.extras}</p>
        </div>
      )}

      {/* Action menu */}
      <div className="flex items-center gap-2 mt-1 pt-3 border-t border-[var(--color-border-w)]">
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-[var(--color-cream-dim)] hover:text-[var(--color-gold)]"
        >
          Edit
        </button>
        <div className="text-[var(--color-cream-x)]">·</div>
        {isActive ? (
          <>
            <button
              onClick={() => onStatusChange('bought')}
              className="text-xs font-semibold text-[var(--color-cream-dim)] hover:text-[#22c55e]"
            >
              Mark as bought
            </button>
            <div className="text-[var(--color-cream-x)]">·</div>
            <button
              onClick={() => onStatusChange('archived')}
              className="text-xs font-semibold text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
            >
              Archive
            </button>
          </>
        ) : (
          <button
            onClick={() => onStatusChange('active')}
            className="text-xs font-semibold text-[var(--color-cream-dim)] hover:text-[var(--color-gold)]"
          >
            Reactivate
          </button>
        )}
        <button
          onClick={onDelete}
          className="ml-auto text-xs text-[var(--color-cream-x)] hover:text-[#dc2626]"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">
      {children}
    </p>
  )
}
