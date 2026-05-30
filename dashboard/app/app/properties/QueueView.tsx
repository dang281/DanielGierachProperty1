'use client'

import { useTransition, useState } from 'react'
import { logContactCall, setCallback } from '@/lib/actions/properties'
import type { PropertyAlert } from './PropertyMap'

type Property = {
  id: string
  owner_name: string
  address: string
  suburb: string
  phone: string | null
  last_contact_date: string | null
  callback_date: string | null
  notes: string | null
  lat: number | null
  lng: number | null
}

type QueueEntry = Property & {
  reason: string
  reasonColor: string
  urgency: number   // lower = higher priority
  distM?: number
  alertAddress?: string
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function daysSince(d: string | null): number {
  if (!d) return 9999
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

function isCallbackDue(d: string | null): boolean {
  if (!d) return false
  return new Date(d) > new Date()
}

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`
}

function buildQueue(properties: Property[], alerts: PropertyAlert[]): QueueEntry[] {
  const today = new Date().toISOString().split('T')[0]
  const activeAlerts = alerts.filter(a => !a.actioned && a.lat && a.lng)

  const entries: QueueEntry[] = []

  for (const p of properties) {
    // Skip snoozed contacts
    if (isCallbackDue(p.callback_date)) continue

    const days = daysSince(p.last_contact_date)
    const cat = p.notes ?? ''

    // --- Priority 1: Near an active alert ---
    if (p.lat && p.lng && activeAlerts.length > 0) {
      let closestDist = Infinity
      let closestAlert: PropertyAlert | null = null
      for (const a of activeAlerts) {
        const d = haversineM(p.lat, p.lng, a.lat!, a.lng!)
        if (d < closestDist) { closestDist = d; closestAlert = a }
      }
      if (closestDist <= 500 && closestAlert) {
        entries.push({
          ...p,
          urgency: closestDist < 100 ? 0 : 1,
          reason: `${fmtDist(closestDist)} from new listing`,
          reasonColor: closestDist < 100 ? '#ef4444' : '#f97316',
          distM: closestDist,
          alertAddress: closestAlert.listing_address,
        })
        continue
      }
    }

    // --- Priority 2: Category-based cycles ---
    const cycles: Record<string, number> = {
      'Selling Jul-Dec 2026': 14,
      'Selling 2027+':        30,
      'Happy to chat':        30,
      'Unsure stock':         45,
      'Not picking up phone': 90,
    }
    const cycle = cycles[cat] ?? 60

    if (days >= cycle) {
      const neverCalled = p.last_contact_date === null
      entries.push({
        ...p,
        urgency: neverCalled ? 2 : 3,
        reason: neverCalled ? 'Never contacted' : `${days} days since last call`,
        reasonColor: neverCalled ? '#6366f1' : days > cycle * 2 ? '#ef4444' : days > cycle * 1.5 ? '#f97316' : '#c4912a',
      })
    }
  }

  return entries.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency - b.urgency
    if (a.distM !== undefined && b.distM !== undefined) return a.distM - b.distM
    return daysSince(a.last_contact_date) - daysSince(b.last_contact_date)
  })
}

function CallbackPicker({ id, onDone }: { id: string; onDone: () => void }) {
  const [pending, start] = useTransition()
  const options = [
    { label: 'Tomorrow', days: 1 },
    { label: '3 days',   days: 3 },
    { label: '1 week',   days: 7 },
    { label: '2 weeks',  days: 14 },
  ]
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[11px] text-[var(--color-cream-x)]">Remind me in:</span>
      {options.map(o => (
        <button
          key={o.days}
          disabled={pending}
          onClick={() => start(async () => { await setCallback(id, o.days); onDone() })}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)] hover:bg-[var(--color-card-2)] transition-colors disabled:opacity-50"
        >
          {o.label}
        </button>
      ))}
      <button onClick={onDone} className="text-[11px] text-[var(--color-cream-x)] hover:text-[var(--color-cream)] px-1">✕</button>
    </div>
  )
}

function QueueCard({ entry, index }: { entry: QueueEntry; index: number }) {
  const [spokePending, startSpoke] = useTransition()
  const [done, setDone] = useState(false)
  const [showCallback, setShowCallback] = useState(false)
  const [outcome, setOutcome] = useState<'spoke' | 'no_answer' | null>(null)

  if (done) return null

  return (
    <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-4 flex flex-col gap-3">
      {/* Reason badge + position */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: entry.reasonColor, background: `${entry.reasonColor}18` }}
          >
            {entry.reason}
          </span>
          {entry.alertAddress && (
            <span className="text-[10px] text-[var(--color-cream-x)] truncate max-w-[200px]">
              {entry.alertAddress}
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-cream-x)] tabular-nums">
          #{index + 1}
        </span>
      </div>

      {/* Name + address */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-[var(--color-cream)] text-[15px] leading-snug">
            {entry.owner_name}
          </div>
          <div className="text-[12px] text-[var(--color-cream-dim)] mt-0.5">
            {entry.address}
          </div>
          {entry.notes && (
            <div className="text-[11px] text-[var(--color-cream-x)] mt-0.5">{entry.notes}</div>
          )}
        </div>

        {/* Call button — primary action */}
        {entry.phone ? (
          <a
            href={`tel:${entry.phone.replace(/\s/g, '')}`}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-[14px]"
            style={{ background: 'var(--color-gold)' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {entry.phone}
          </a>
        ) : (
          <span className="text-[12px] text-[var(--color-cream-x)] self-center">No phone</span>
        )}
      </div>

      {/* Outcome buttons */}
      {!showCallback && outcome === null && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border-w)]">
          <span className="text-[11px] text-[var(--color-cream-x)] mr-1">After calling:</span>

          <button
            disabled={spokePending}
            onClick={() => startSpoke(async () => {
              await logContactCall(entry.id)
              setOutcome('spoke')
              setTimeout(() => setDone(true), 800)
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
          >
            {spokePending ? '…' : '✓ Spoke'}
          </button>

          <button
            onClick={() => { setOutcome('no_answer'); setTimeout(() => setDone(true), 600) }}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:bg-[var(--color-card-2)] transition-colors"
          >
            No answer
          </button>

          <button
            onClick={() => setShowCallback(true)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:bg-[var(--color-card-2)] transition-colors"
          >
            ↩ Callback
          </button>
        </div>
      )}

      {outcome === 'spoke' && (
        <div className="text-[12px] font-semibold pt-1 border-t border-[var(--color-border-w)]" style={{ color: '#22c55e' }}>
          ✓ Logged — moving to bottom of queue
        </div>
      )}

      {outcome === 'no_answer' && (
        <div className="text-[12px] text-[var(--color-cream-x)] pt-1 border-t border-[var(--color-border-w)]">
          Skipped — try again later
        </div>
      )}

      {showCallback && (
        <div className="pt-1 border-t border-[var(--color-border-w)]">
          <CallbackPicker id={entry.id} onDone={() => { setShowCallback(false); setDone(true) }} />
        </div>
      )}
    </div>
  )
}

export default function QueueView({ properties, alerts }: { properties: Property[]; alerts: PropertyAlert[] }) {
  const queue = buildQueue(properties, alerts)

  if (queue.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-cream-dim)] text-[13px]">
        Queue is clear — all contacts are up to date.
      </div>
    )
  }

  const alertMatches = queue.filter(e => e.distM !== undefined)
  const overdueCount = queue.filter(e => e.distM === undefined).length

  return (
    <div className="flex flex-col gap-4">
      {/* Queue stats */}
      <div className="flex items-center gap-4 text-[12px]">
        {alertMatches.length > 0 && (
          <span className="font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>
            🏠 {alertMatches.length} near new listing{alertMatches.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="text-[var(--color-cream-x)]">
          {queue.length} to call · work top to bottom
        </span>
      </div>

      {/* Queue cards */}
      <div className="flex flex-col gap-3">
        {queue.map((entry, i) => (
          <QueueCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}
