'use client'

import { useState, useTransition, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { PropertyAlert } from './PropertyMap'
import { addPropertyAlert, logContactCall } from '@/lib/actions/properties'
import QueueView from './QueueView'

const PropertyMap = dynamic(() => import('./PropertyMap'), { ssr: false })

type Property = {
  id: string
  owner_name: string
  address: string
  street_name: string
  suburb: string
  postcode: string | null
  phone: string | null
  email: string | null
  last_contact_date: string | null
  notes: string | null
  active: boolean
  lat: number | null
  lng: number | null
  callback_date: string | null
  monday_group: string | null
  monday_item_id: string | null
}

const GROUP_COLORS: Record<string, string> = {
  'Hotstock':        '#ef4444',
  'Warmstock':       '#f97316',
  'Happy to Chat':   '#22c55e',
  'Unsure Stock':    '#eab308',
  'Not Picking Up':  '#94a3b8',
  'Off-Market':      '#c4912a',
  'From Open Homes': '#6366f1',
  'Unfiltered':      '#a855f7',
  'Scanned QR':      '#14b8a6',
  'Past Buyers':     '#3b82f6',
  'Not Interested':  '#64748b',
  'Lost':            '#475569',
}

function groupColor(group: string | null) {
  return GROUP_COLORS[group ?? ''] ?? '#c4912a'
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
}

function daysSince(d: string | null): number | null {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearbyAlerts(p: Property, alerts: PropertyAlert[]): { dist: number; address: string }[] {
  if (!p.lat || !p.lng) return []
  return alerts
    .filter(a => !a.actioned && a.lat && a.lng)
    .map(a => ({ dist: haversineM(p.lat!, p.lng!, a.lat!, a.lng!), address: a.listing_address }))
    .filter(a => a.dist <= 500)
    .sort((a, b) => a.dist - b.dist)
}

function ContactAge({ date }: { date: string | null }) {
  const days = daysSince(date)
  if (days === null) return <span className="text-[var(--color-cream-x)]">Never</span>
  const label = formatDate(date)!
  const color = days > 90 ? '#ef4444' : days > 60 ? '#f97316' : days > 30 ? '#eab308' : '#22c55e'
  return <span style={{ color }} title={`${days} days ago`}>{label}</span>
}

export default function PropertiesView({ properties, alerts }: { properties: Property[]; alerts: PropertyAlert[] }) {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [selected, setSelected] = useState<Property | null>(null)
  const [view, setView] = useState<'list' | 'map' | 'queue'>('list')
  const [showAddListing, setShowAddListing] = useState(false)
  const [addPending, startAdd] = useTransition()
  const [callPending, startCall] = useTransition()
  const [justLogged, setJustLogged] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const groups = ['All', ...Array.from(new Set(properties.map(p => p.monday_group ?? p.suburb))).sort()]

  const filtered = properties.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.owner_name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.suburb.toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q)
    const effectiveGroup = p.monday_group ?? p.suburb
    const matchGroup = groupFilter === 'All' || effectiveGroup === groupFilter
    return matchSearch && matchGroup
  })

  // Group filtered by monday_group (fallback to suburb)
  const grouped = filtered.reduce<Record<string, Property[]>>((acc, p) => {
    const key = p.monday_group ?? p.suburb
    acc[key] = acc[key] ?? []
    acc[key].push(p)
    return acc
  }, {})
  const PIPELINE_ORDER = [
    'Hotstock', 'Warmstock', 'Happy to Chat', 'Unsure Stock', 'Not Picking Up',
    'Off-Market', 'From Open Homes', 'Unfiltered', 'Scanned QR', 'Past Buyers',
    'Not Interested', 'Lost',
  ]
  const groupOrder = Object.keys(grouped).sort((a, b) => {
    const ai = PIPELINE_ORDER.indexOf(a)
    const bi = PIPELINE_ORDER.indexOf(b)
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.localeCompare(b)
  })

  const groupCounts = properties.reduce<Record<string, number>>((acc, p) => {
    const key = p.monday_group ?? p.suburb
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-serif font-normal text-[var(--color-cream)] leading-tight">
            Tracked Contacts
          </h1>
          <p className="text-[12px] text-[var(--color-cream-x)] mt-0.5">
            {properties.length} contacts · {groups.length - 1} groups
            {alerts.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-semibold" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                {alerts.length} new listing{alerts.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddListing(true)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ background: '#f97316', color: 'white' }}
          >
            + Add Listing
          </button>
          <div className="flex items-center gap-1">
            {(['queue', 'list', 'map'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize ${
                  view === v
                    ? 'text-white'
                    : 'bg-[var(--color-card-2)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]'
                }`}
                style={view === v ? { background: v === 'queue' ? '#f97316' : 'var(--color-cream)' } : {}}
              >
                {v === 'queue' ? '⚡ Queue' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search + suburb filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-cream-x)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Name, address, suburb or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card)] text-[13px] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
        <select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card)] text-[13px] text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-gold)] min-w-[160px]"
        >
          {groups.map(g => (
            <option key={g} value={g}>
              {g === 'All' ? 'All groups' : `${g} (${groupCounts[g]})`}
            </option>
          ))}
        </select>
      </div>

      {/* Queue view */}
      {view === 'queue' && (
        <QueueView properties={properties} alerts={alerts} />
      )}

      {/* Map view */}
      {view === 'map' && (
        <div
          className="rounded-xl overflow-hidden border border-[var(--color-border-w)]"
          style={{ position: 'relative', height: 'calc(100vh - 200px)', minHeight: 520 }}
        >
          <PropertyMap
            properties={filtered}
            alerts={alerts}
          />
        </div>
      )}

      {/* List view — grouped by monday_group */}
      {view === 'list' && (
        <div className="flex flex-col gap-4">
          {groupOrder.length === 0 && (
            <div className="text-center py-16 text-[var(--color-cream-dim)] text-[13px]">
              No contacts match your search.
            </div>
          )}
          {groupOrder.map(grp => (
            <div key={grp} className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
              {/* Group header */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-w)]"
                style={{ borderLeft: `3px solid ${groupColor(grp)}` }}
              >
                <span className="text-[12px] font-semibold" style={{ color: groupColor(grp) }}>
                  {grp}
                </span>
                <span className="text-[11px] text-[var(--color-cream-x)]">
                  {grouped[grp].length} contact{grouped[grp].length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Contact rows */}
              <table className="w-full text-[13px]">
                <tbody>
                  {grouped[grp].map((p, i) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                      className={`border-b border-[var(--color-border-w)] last:border-0 cursor-pointer transition-colors ${
                        selected?.id === p.id
                          ? 'bg-[var(--color-gold-dim)]'
                          : 'hover:bg-[var(--color-card-2)]'
                      }`}
                    >
                      {/* Owner */}
                      <td className="px-4 py-2.5 font-medium text-[var(--color-cream)] w-[28%]">
                        {p.owner_name || <span className="text-[var(--color-cream-x)] italic text-[12px]">{p.address.split(',')[0]}</span>}
                      </td>

                      {/* Address + nearby listings */}
                      <td className="px-4 py-2.5 text-[var(--color-cream-dim)] w-[36%]">
                        <span>{p.address}</span>
                        {(() => {
                          const nearby = nearbyAlerts(p, alerts)
                          if (!nearby.length) return null
                          const closest = nearby[0]
                          const color = closest.dist < 100 ? '#ef4444' : closest.dist < 250 ? '#f97316' : '#eab308'
                          return (
                            <span
                              className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: `${color}22`, color }}
                              title={nearby.map(a => `${Math.round(a.dist)}m — ${a.address}`).join('\n')}
                            >
                              🏠 {Math.round(closest.dist)}m{nearby.length > 1 ? ` +${nearby.length - 1}` : ''}
                            </span>
                          )
                        })()}
                      </td>

                      {/* Phone — tap to call */}
                      <td className="px-4 py-2.5 w-[22%]">
                        {p.phone ? (
                          <a
                            href={`tel:${p.phone.replace(/\s/g, '')}`}
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-[var(--color-gold)] hover:underline"
                          >
                            {p.phone}
                          </a>
                        ) : (
                          <span className="text-[var(--color-cream-x)]">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-2.5 w-[14%] text-right">
                        {p.notes && (
                          <span className="text-[11px] text-[var(--color-cream-x)]">
                            {p.notes}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Selected detail panel */}
      {selected && (
        <div className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold-dim)] p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-[var(--color-cream)] text-[15px]">{selected.owner_name || selected.address.split(',')[0]}</div>
              <div className="text-[13px] text-[var(--color-cream-dim)]">{selected.address}, {selected.suburb} {selected.postcode}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[20px] leading-none"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-[13px]">
            {selected.phone && (
              <a
                href={`tel:${selected.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-white text-[12px]"
                style={{ background: 'var(--color-gold)' }}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call {selected.phone}
              </a>
            )}
            <button
              disabled={callPending || justLogged === selected.id}
              onClick={() => startCall(async () => {
                await logContactCall(selected.id)
                setJustLogged(selected.id)
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-60"
              style={justLogged === selected.id
                ? { borderColor: '#22c55e', color: '#22c55e', background: 'rgba(34,197,94,0.08)' }
                : { borderColor: 'var(--color-border-w)', color: 'var(--color-cream-dim)', background: 'var(--color-card)' }
              }
            >
              {justLogged === selected.id ? '✓ Logged today' : callPending ? 'Logging…' : 'Log call'}
            </button>
            <div className="ml-auto text-[12px] text-[var(--color-cream-dim)] self-center">
              Last contact: <ContactAge date={selected.last_contact_date} />
            </div>
          </div>
          {selected.notes && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border-w)] text-[12px] text-[var(--color-cream-dim)]">
              {selected.notes}
            </div>
          )}
        </div>
      )}

      {/* Add Listing modal */}
      {showAddListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddListing(false) }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-[17px] text-[var(--color-cream)]">Add New Listing</h2>
                <p className="text-[12px] text-[var(--color-cream-x)] mt-0.5">Pins it to the map and shows nearby contacts</p>
              </div>
              <button onClick={() => setShowAddListing(false)} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[22px] leading-none">&times;</button>
            </div>

            <form
              ref={formRef}
              action={(fd) => startAdd(async () => {
                await addPropertyAlert(fd)
                formRef.current?.reset()
                setShowAddListing(false)
              })}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">Address</label>
                <input name="address" required placeholder="77 Thackeray Street, Norman Park 4170" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card-2)] text-[13px] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]" />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">Suburb</label>
                  <input name="suburb" required placeholder="Norman Park" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card-2)] text-[13px] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]" />
                </div>
                <div className="flex flex-col gap-1 w-28">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">Type</label>
                  <select name="type" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card-2)] text-[13px] text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-gold)]">
                    <option value="sale">Sale</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">Price <span className="font-normal normal-case tracking-normal">(optional)</span></label>
                <input name="price" placeholder="$1,250,000 or Offers over $1.3M" className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card-2)] text-[13px] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">REA Link <span className="font-normal normal-case tracking-normal">(optional)</span></label>
                <input name="rea_link" type="url" placeholder="https://www.realestate.com.au/property/..." className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-w)] bg-[var(--color-card-2)] text-[13px] text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)]" />
              </div>

              <button
                type="submit"
                disabled={addPending}
                className="mt-2 w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: '#f97316' }}
              >
                {addPending ? 'Adding…' : 'Add to map'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
