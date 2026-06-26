'use client'

import { useMemo, useState } from 'react'
import { STAGE_COLORS, STAGE_ORDER, type AppointmentRow, type PipelineRow } from './types'

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
}

function daysFromNow(d: string | null): number | null {
  if (!d) return null
  return Math.round((new Date(d).getTime() - Date.now()) / 86400000)
}

function stageColor(stage: string | null) {
  if (!stage) return '#c4912a'
  return STAGE_COLORS[stage] ?? '#c4912a'
}

function stageRank(stage: string | null) {
  const i = STAGE_ORDER.findIndex(s => s === stage)
  return i === -1 ? 999 : i
}

export default function PipelineView({
  pipeline,
  appointments,
  lastImportAt,
}: {
  pipeline: PipelineRow[]
  appointments: AppointmentRow[]
  lastImportAt: string | null
}) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [selected, setSelected] = useState<PipelineRow | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pipeline.filter(p => {
      if (stageFilter !== 'All' && p.stage !== stageFilter) return false
      if (!q) return true
      return (
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.address ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').toLowerCase().includes(q) ||
        (p.contact_name_freeform ?? '').toLowerCase().includes(q)
      )
    })
  }, [pipeline, search, stageFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, PipelineRow[]>()
    for (const row of filtered) {
      const stage = row.stage ?? 'Other'
      if (!map.has(stage)) map.set(stage, [])
      map.get(stage)!.push(row)
    }
    return Array.from(map.entries()).sort(([a], [b]) => stageRank(a) - stageRank(b))
  }, [filtered])

  const stageCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of pipeline) {
      const stage = row.stage ?? 'Other'
      counts.set(stage, (counts.get(stage) ?? 0) + 1)
    }
    return counts
  }, [pipeline])

  const appointmentsByItem = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>()
    for (const a of appointments) {
      if (!a.parent_monday_item_id) continue
      if (!map.has(a.parent_monday_item_id)) map.set(a.parent_monday_item_id, [])
      map.get(a.parent_monday_item_id)!.push(a)
    }
    return map
  }, [appointments])

  const stages = ['All', ...STAGE_ORDER]

  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--color-card-2)] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif">Pipeline</h1>
          <p className="text-[var(--color-cream-dim)] text-sm">
            {pipeline.length} contacts across {grouped.length} stages
            {lastImportAt && (
              <>
                {' · '}
                Last import {formatDate(lastImportAt)}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search name, address, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-sm w-72 outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </header>

      {/* Stage filter pills */}
      <div className="px-6 py-3 border-b border-[var(--color-card-2)] flex flex-wrap gap-1.5">
        {stages.map(s => {
          const isActive = stageFilter === s
          const count = s === 'All' ? pipeline.length : stageCounts.get(s) ?? 0
          if (s !== 'All' && count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-[var(--color-card-2)] border-[var(--color-gold)] text-[var(--color-cream)]'
                  : 'bg-transparent border-[var(--color-card-2)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]',
              ].join(' ')}
            >
              {s !== 'All' && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ background: stageColor(s) }}
                />
              )}
              {s}
              <span className="ml-1.5 text-[var(--color-cream-x)]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* List + detail */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-4 space-y-5">
          {grouped.length === 0 && (
            <div className="text-[var(--color-cream-dim)] text-sm py-12 text-center">
              No matches. Try a different search or stage.
            </div>
          )}
          {grouped.map(([stage, rows]) => (
            <section key={stage}>
              <h2 className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--color-cream-dim)] uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: stageColor(stage) }} />
                {stage}
                <span className="text-[var(--color-cream-x)] text-xs normal-case tracking-normal">
                  {rows.length}
                </span>
              </h2>
              <ul className="divide-y divide-[var(--color-card-2)] border border-[var(--color-card-2)] rounded-lg overflow-hidden">
                {rows.map(row => {
                  const isSelected = selected?.monday_item_id === row.monday_item_id
                  const appts = appointmentsByItem.get(row.monday_item_id) ?? []
                  const nextAppt = appts
                    .filter(a => a.date_booked_for && a.status !== 'Done')
                    .sort((a, b) => (a.date_booked_for ?? '').localeCompare(b.date_booked_for ?? ''))[0]
                  return (
                    <li
                      key={row.monday_item_id}
                      onClick={() => setSelected(isSelected ? null : row)}
                      className={[
                        'cursor-pointer px-4 py-3 grid grid-cols-12 gap-3 items-start text-sm transition-colors',
                        isSelected ? 'bg-[var(--color-card-2)]' : 'bg-[var(--color-card)] hover:bg-[var(--color-card-2)]',
                      ].join(' ')}
                    >
                      <div className="col-span-4">
                        <div className="font-medium">{row.name || row.address || 'Unnamed'}</div>
                        {row.contact_name_freeform && row.contact_name_freeform !== row.name && (
                          <div className="text-xs text-[var(--color-cream-dim)] mt-0.5">{row.contact_name_freeform}</div>
                        )}
                        {row.address && row.name !== row.address && (
                          <div className="text-xs text-[var(--color-cream-x)] mt-0.5">{row.address}</div>
                        )}
                      </div>
                      <div className="col-span-3 text-[var(--color-cream-dim)] text-xs">
                        {row.phone && <div>{row.phone}</div>}
                        {row.email && <div className="truncate">{row.email}</div>}
                      </div>
                      <div className="col-span-2 text-xs">
                        {row.nvml_status && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#cab641]/20 text-[#cab641] mr-1">
                            {row.nvml_status}
                          </span>
                        )}
                        {row.appraised && row.appraised !== 'NOT YET' && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#037f4c]/20 text-[#22c55e]">
                            {row.appraised}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 text-xs text-right text-[var(--color-cream-dim)]">
                        {row.follow_up_date && (
                          <FollowUp date={row.follow_up_date} />
                        )}
                        {nextAppt?.date_booked_for && (
                          <div className="mt-0.5 text-[#3b82f6]">
                            Appt {formatDate(nextAppt.date_booked_for)}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <aside className="w-[420px] border-l border-[var(--color-card-2)] bg-[var(--color-card)] overflow-auto">
            <DetailPanel row={selected} appointments={appointmentsByItem.get(selected.monday_item_id) ?? []} onClose={() => setSelected(null)} />
          </aside>
        )}
      </div>
    </div>
  )
}

function FollowUp({ date }: { date: string }) {
  const days = daysFromNow(date)
  const overdue = days !== null && days < 0
  const soon = days !== null && days <= 7 && days >= 0
  const color = overdue ? '#ef4444' : soon ? '#f97316' : 'var(--color-cream-dim)'
  return (
    <div style={{ color }}>
      Follow up {formatDate(date)}
      {days !== null && (
        <span className="ml-1 text-[var(--color-cream-x)]">
          ({overdue ? `${-days}d late` : days === 0 ? 'today' : `${days}d`})
        </span>
      )}
    </div>
  )
}

function DetailPanel({
  row,
  appointments,
  onClose,
}: {
  row: PipelineRow
  appointments: AppointmentRow[]
  onClose: () => void
}) {
  return (
    <div className="p-5 space-y-5 text-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-serif">{row.name || row.address || 'Unnamed'}</div>
          {row.address && row.address !== row.name && (
            <div className="text-xs text-[var(--color-cream-dim)] mt-0.5">{row.address}</div>
          )}
          {row.stage && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: stageColor(row.stage) }} />
              {row.stage}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <section className="space-y-1.5">
        {row.phone && <Field label="Phone" value={row.phone} link={`tel:${row.phone}`} />}
        {row.email && <Field label="Email" value={row.email} link={`mailto:${row.email}`} />}
        {row.owner_type && <Field label="Owner type" value={row.owner_type} />}
        {row.property_type && <Field label="Property type" value={row.property_type} />}
        {row.appraised && <Field label="Appraised" value={row.appraised} />}
        {row.appraisal_range && <Field label="Appraisal range" value={row.appraisal_range} />}
        {row.buy_to_sell && <Field label="Buy to sell" value={row.buy_to_sell} />}
        {row.nvml_status && <Field label="NVML" value={row.nvml_status} />}
        {row.follow_up_date && <Field label="Follow up" value={formatDate(row.follow_up_date) ?? ''} />}
        {row.nurture_cloud_url && (
          <Field label="NurtureCloud" value="Open" link={row.nurture_cloud_url} />
        )}
        {row.price_finder_url && (
          <Field label="Price Finder" value="Open" link={row.price_finder_url} />
        )}
      </section>

      {row.quick_recap && (
        <section>
          <div className="text-xs uppercase tracking-wide text-[var(--color-cream-dim)] mb-1">Quick recap</div>
          <div className="bg-[var(--color-card-2)] rounded p-3 whitespace-pre-wrap">{row.quick_recap}</div>
        </section>
      )}

      {row.notes_combined && (
        <section>
          <div className="text-xs uppercase tracking-wide text-[var(--color-cream-dim)] mb-1">Notes</div>
          <div className="bg-[var(--color-card-2)] rounded p-3 whitespace-pre-wrap text-xs">{row.notes_combined}</div>
        </section>
      )}

      {appointments.length > 0 && (
        <section>
          <div className="text-xs uppercase tracking-wide text-[var(--color-cream-dim)] mb-1">Touchpoints</div>
          <ul className="space-y-1">
            {appointments
              .sort((a, b) => (b.date_booked_for ?? '').localeCompare(a.date_booked_for ?? ''))
              .map(a => (
                <li key={a.monday_item_id} className="text-xs bg-[var(--color-card-2)] rounded p-2">
                  <div className="flex items-center justify-between">
                    <span>{a.name}</span>
                    <span className="text-[var(--color-cream-x)]">
                      {a.date_booked_for ? formatDate(a.date_booked_for) : ''}
                    </span>
                  </div>
                  {a.status && <div className="text-[var(--color-cream-dim)] mt-0.5">{a.status}</div>}
                  {a.notes && <div className="text-[var(--color-cream-x)] mt-0.5">{a.notes}</div>}
                </li>
              ))}
          </ul>
        </section>
      )}

      <footer className="text-xs text-[var(--color-cream-x)] pt-2 border-t border-[var(--color-card-2)]">
        Monday id {row.monday_item_id}
        {row.updated_at_monday && (
          <> · Updated {formatDate(row.updated_at_monday)}</>
        )}
      </footer>
    </div>
  )
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-[var(--color-cream-dim)] uppercase tracking-wide">{label}</div>
      <div className="col-span-2">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" className="text-[var(--color-gold)] hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
