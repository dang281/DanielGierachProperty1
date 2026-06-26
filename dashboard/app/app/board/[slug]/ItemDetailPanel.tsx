'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { updateBoardCell } from '@/lib/actions/board'
import {
  deleteActivityEntry,
  listContactActivity,
  quickActionBookAppraisal,
  quickActionCallConnected,
  quickActionCallNvml,
  quickActionNote,
  quickActionSetFollowUp,
  type ActivityEntry,
} from '@/lib/actions/activity'
import type { BoardColumn, BoardItem } from './types'

const NEUTRAL_PILL = '#5b6470'
const READONLY_TYPES = new Set([
  'mirror', 'lookup', 'last_updated', 'pulse_updated',
  'board_relation', 'dependency', 'subtasks', 'timeline', 'subitems',
])

function statusColorFor(settings: Record<string, unknown>, text: string | null): string | null {
  if (!text) return null
  const labels = settings.labels
  const colors = settings.labels_colors as Record<string, { color?: string }> | undefined
  if (!labels) return null
  if (Array.isArray(labels)) {
    const l = (labels as Array<{ id: number | string; name: string }>).find(x => x?.name === text)
    return l ? (colors?.[String(l.id)]?.color ?? null) : null
  }
  const entry = Object.entries(labels as Record<string, string>).find(([, v]) => v === text)
  if (!entry) return null
  return colors?.[entry[0]]?.color ?? null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ItemDetailPanel({
  item,
  columns,
  slug,
  groupOptions,
  onClose,
  onLocalChange,
  onMoveGroup,
  onOpenLinked,
}: {
  item: BoardItem
  columns: BoardColumn[]
  slug: string
  groupOptions?: string[]
  onClose: () => void
  onLocalChange: (itemId: string, columnId: string, columnType: string, newText: string | null) => void
  onMoveGroup?: (itemId: string, newGroup: string) => void
  onOpenLinked?: (itemId: string) => void
}) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bucket columns by type so the panel reads in a sensible order.
  const contactCols = columns.filter(c => ['phone', 'email', 'location'].includes(c.column_type))
  const statusCols  = columns.filter(c => ['status', 'color', 'dropdown'].includes(c.column_type))
  const dateCols    = columns.filter(c => ['date', 'timeline'].includes(c.column_type))
  const numberCols  = columns.filter(c => c.column_type === 'numbers')
  const linkCols    = columns.filter(c => c.column_type === 'link')
  const textCols    = columns.filter(c => ['text'].includes(c.column_type))
  const longCols    = columns.filter(c => c.column_type === 'long_text')
  const relCols     = columns.filter(c => ['board_relation', 'dependency', 'mirror', 'lookup'].includes(c.column_type))

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <aside
        ref={drawerRef}
        onClick={e => e.stopPropagation()}
        className="absolute top-0 right-0 h-full w-[520px] max-w-[95vw] bg-[var(--color-bg)] border-l border-[var(--color-card-2)] shadow-2xl overflow-y-auto"
      >
        <header className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-card-2)] px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-xl text-[var(--color-cream)] truncate">{item.name || '(no name)'}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-cream-x)]">{slug}</span>
              {item.monday_group_title && groupOptions && onMoveGroup && (
                <GroupSwitcher
                  current={item.monday_group_title}
                  options={groupOptions}
                  onChange={(g) => onMoveGroup(item.monday_item_id, g)}
                />
              )}
              {item.monday_group_title && !onMoveGroup && (
                <span className="bg-[var(--color-card)] border border-[var(--color-card-2)] text-[var(--color-gold)] rounded px-2 py-1 text-xs">{item.monday_group_title}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-2xl leading-none -mt-1"
            aria-label="Close"
          >×</button>
        </header>

        <div className="px-5 py-4 space-y-6 text-[var(--color-cream)]">
          <QuickActions slug={slug} itemId={item.monday_item_id} onLogged={() => { /* timeline self-refreshes */ }} />

          {contactCols.length > 0 && (
            <Section title="Contact">
              {contactCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {statusCols.length > 0 && (
            <Section title="Status">
              {statusCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {dateCols.length > 0 && (
            <Section title="Dates">
              {dateCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {numberCols.length > 0 && (
            <Section title="Numbers">
              {numberCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {linkCols.length > 0 && (
            <Section title="Links">
              {linkCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {textCols.length > 0 && (
            <Section title="Text">
              {textCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}
          {longCols.length > 0 && (
            <Section title="Notes">
              {longCols.map(c => <PanelLongText key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} />)}
            </Section>
          )}
          {relCols.length > 0 && (
            <Section title="Linked">
              {relCols.map(c => <PanelField key={c.column_id} col={c} item={item} slug={slug} onLocalChange={onLocalChange} onOpenLinked={onOpenLinked} />)}
            </Section>
          )}

          <ActivityTimeline slug={slug} itemId={item.monday_item_id} />

          <div className="text-[10px] text-[var(--color-cream-x)] pt-4 border-t border-[var(--color-card-2)]">
            id {item.monday_item_id} · updated {formatDate(item.updated_at_monday)}
          </div>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-cream-dim)] mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function GroupSwitcher({
  current,
  options,
  onChange,
}: {
  current: string
  options: string[]
  onChange: (g: string) => void
}) {
  return (
    <select
      value={current}
      onChange={e => { if (e.target.value !== current) onChange(e.target.value) }}
      className="bg-[var(--color-card)] border border-[var(--color-card-2)] text-[var(--color-gold)] rounded px-2 py-1 text-xs outline-none focus:border-[var(--color-gold)]"
    >
      {options.map(g => <option key={g} value={g}>{g}</option>)}
    </select>
  )
}

function PanelField({
  col, item, slug, onLocalChange, onOpenLinked,
}: {
  col: BoardColumn
  item: BoardItem
  slug: string
  onLocalChange: (itemId: string, columnId: string, columnType: string, newText: string | null) => void
  onOpenLinked?: (itemId: string) => void
}) {
  const cell = item.raw[col.column_id]
  const text = cell?.text ?? null
  const linkedIds = cell?.linked_item_ids
  const isReadOnly = READONLY_TYPES.has(col.column_type)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text ?? '')
  const [, startTransition] = useTransition()

  function save(newText: string | null) {
    onLocalChange(item.monday_item_id, col.column_id, col.column_type, newText)
    startTransition(async () => {
      try {
        await updateBoardCell({
          slug,
          itemId: item.monday_item_id,
          columnId: col.column_id,
          columnType: col.column_type,
          text: newText,
        })
      } catch (e) {
        console.error(e)
      }
    })
  }

  function commitText() {
    setEditing(false)
    const next = draft.trim() === '' ? null : draft
    if (next !== text) save(next)
  }

  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-xs items-start">
      <div className="text-[var(--color-cream-dim)] pt-1">{col.title}</div>
      <div>
        {renderPanelValue({ col, text, value: cell?.value ?? null, linkedIds, editing, draft, setDraft, setEditing, save, commitText, isReadOnly, onOpenLinked })}
      </div>
    </div>
  )
}

function renderPanelValue({
  col, text, value, linkedIds, editing, draft, setDraft, setEditing, save, commitText, isReadOnly, onOpenLinked,
}: {
  col: BoardColumn
  text: string | null
  value: string | null
  linkedIds?: string[]
  editing: boolean
  draft: string
  setDraft: (s: string) => void
  setEditing: (b: boolean) => void
  save: (s: string | null) => void
  commitText: () => void
  isReadOnly: boolean
  onOpenLinked?: (itemId: string) => void
}) {
  const empty = !text || text === ''

  if (editing && (col.column_type === 'text' || col.column_type === 'phone' || col.column_type === 'email' || col.column_type === 'numbers' || col.column_type === 'location')) {
    return (
      <input
        autoFocus
        type={col.column_type === 'email' ? 'email' : col.column_type === 'phone' ? 'tel' : col.column_type === 'numbers' ? 'number' : 'text'}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitText}
        onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') } }}
        className="w-full bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
      />
    )
  }
  if (editing && col.column_type === 'date') {
    return (
      <input
        autoFocus
        type="date"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitText}
        onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') } }}
        className="bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
      />
    )
  }

  if (empty) {
    if (isReadOnly) return <span className="text-[var(--color-cream-x)]">—</span>
    return (
      <span onClick={() => { setDraft(''); setEditing(true) }} className="cursor-pointer text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)]">+ add</span>
    )
  }

  switch (col.column_type) {
    case 'status':
    case 'color': {
      const color = statusColorFor(col.settings, text)
      return (
        <StatusPicker col={col} text={text} color={color} save={save} />
      )
    }
    case 'dropdown': {
      return <DropdownPicker col={col} text={text} save={save} />
    }
    case 'phone':
      return (
        <div className="flex items-center gap-2">
          <a href={`tel:${text}`} className="text-[var(--color-gold)] hover:underline">{text}</a>
          <button onClick={() => { setDraft(text!); setEditing(true) }} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">edit</button>
        </div>
      )
    case 'email':
      return (
        <div className="flex items-center gap-2 truncate">
          <a href={`mailto:${text}`} className="text-[var(--color-gold)] hover:underline truncate">{text}</a>
          <button onClick={() => { setDraft(text!); setEditing(true) }} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">edit</button>
        </div>
      )
    case 'link': {
      let url: string | null = null
      try {
        const parsed = value ? JSON.parse(value) : null
        url = parsed?.url ?? null
      } catch {}
      if (!url && text?.startsWith('http')) url = text
      if (!url) return <span className="text-[var(--color-cream-x)]">—</span>
      return <a href={url} target="_blank" rel="noreferrer" className="text-[var(--color-gold)] hover:underline">Open</a>
    }
    case 'location':
      return <span onClick={() => { setDraft(text!); setEditing(true) }} className="cursor-pointer hover:text-[var(--color-gold)]">{text}</span>
    case 'date':
      return <span onClick={() => { setDraft(text!); setEditing(true) }} className="cursor-pointer hover:text-[var(--color-gold)]">{formatDate(text)}</span>
    case 'last_updated':
    case 'pulse_updated':
      return <span className="text-[var(--color-cream-dim)]">{formatDate(text)}</span>
    case 'numbers':
      return <span onClick={() => { setDraft(text!); setEditing(true) }} className="cursor-pointer hover:text-[var(--color-gold)] tabular-nums">{text}</span>
    case 'board_relation':
    case 'dependency': {
      const names = (text ?? '').split(',').map(s => s.trim()).filter(Boolean)
      return (
        <div className="flex flex-wrap gap-1">
          {names.map((n, i) => {
            const id = linkedIds?.[i]
            return id && onOpenLinked ? (
              <button
                key={i}
                onClick={() => onOpenLinked(id)}
                className="inline-block px-2 py-0.5 rounded bg-[var(--color-card-2)] text-[11px] hover:bg-[var(--color-gold)] hover:text-[var(--color-bg)] transition-colors cursor-pointer"
                title="Open linked item"
              >{n} ↗</button>
            ) : (
              <span key={i} className="inline-block px-2 py-0.5 rounded bg-[var(--color-card-2)] text-[11px]">{n}</span>
            )
          })}
        </div>
      )
    }
    case 'mirror':
    case 'lookup':
      return <span className="text-[var(--color-cream-dim)]">{text}</span>
    case 'timeline': {
      try {
        const parsed = value ? JSON.parse(value) : null
        if (parsed?.from && parsed?.to) return <span className="text-[var(--color-cream-dim)]">{formatDate(parsed.from)} → {formatDate(parsed.to)}</span>
      } catch {}
      return <span>{text}</span>
    }
    default:
      return <span onClick={() => { setDraft(text!); setEditing(true) }} className="cursor-pointer hover:text-[var(--color-gold)]">{text}</span>
  }
}

function StatusPicker({
  col, text, color, save,
}: {
  col: BoardColumn
  text: string
  color: string | null
  save: (s: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const labelsRaw = col.settings.labels
  const colors = col.settings.labels_colors as Record<string, { color?: string }> | undefined
  const opts = Array.isArray(labelsRaw)
    ? (labelsRaw as Array<{ id: number | string; name: string }>).map(l => ({ label: String(l.name), color: colors?.[String(l.id)]?.color ?? null }))
    : labelsRaw && typeof labelsRaw === 'object'
      ? Object.entries(labelsRaw as Record<string, string>).filter(([, v]) => v !== '' && typeof v === 'string').map(([k, v]) => ({ label: String(v), color: colors?.[k]?.color ?? null }))
      : []
  return (
    <div className="relative inline-block">
      <span
        onClick={() => setOpen(o => !o)}
        className="inline-block px-2 py-0.5 rounded text-[11px] text-white cursor-pointer"
        style={{ background: color ?? NEUTRAL_PILL }}
      >{text}</span>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg shadow-xl p-2 flex flex-col gap-1 min-w-[180px] max-h-[260px] overflow-auto">
          {opts.map(o => (
            <button
              key={o.label}
              onClick={() => { save(o.label); setOpen(false) }}
              className="text-left px-2 py-1 rounded text-xs hover:bg-[var(--color-card-2)]"
            >
              <span className="inline-block px-2 py-0.5 rounded text-[11px] text-white" style={{ background: o.color ?? NEUTRAL_PILL }}>{o.label}</span>
            </button>
          ))}
          <button onClick={() => { save(null); setOpen(false) }} className="text-left px-2 py-1 text-[var(--color-cream-x)] text-[11px] hover:bg-[var(--color-card-2)] rounded">Clear</button>
        </div>
      )}
    </div>
  )
}

function DropdownPicker({
  col, text, save,
}: {
  col: BoardColumn
  text: string
  save: (s: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const opts = (col.settings.options as Array<{ id: number | string; name: string }> | undefined) ?? []
  const selected = new Set((text ?? '').split(',').map(s => s.trim()).filter(Boolean))
  function toggle(label: string) {
    const next = new Set(selected)
    if (next.has(label)) next.delete(label); else next.add(label)
    save(next.size === 0 ? null : Array.from(next).join(', '))
  }
  return (
    <div className="relative inline-block">
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer flex flex-wrap gap-1">
        {Array.from(selected).map((p, i) => (
          <span key={i} className="inline-block px-2 py-0.5 rounded bg-[#5b6470] text-[11px] text-white">{p}</span>
        ))}
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg shadow-xl p-2 min-w-[200px] max-h-[300px] overflow-auto flex flex-col gap-0.5">
          {opts.map(o => {
            const on = selected.has(o.name)
            return (
              <button key={String(o.id)} onClick={() => toggle(o.name)} className={['text-left px-2 py-1 rounded text-xs flex items-center gap-2', on ? 'bg-[var(--color-card-2)]' : 'hover:bg-[var(--color-card-2)]'].join(' ')}>
                <span className="w-3 h-3 rounded-sm border border-[var(--color-card-2)] flex items-center justify-center text-[10px]">{on ? '✓' : ''}</span>
                {o.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Quick Actions ---------------------------------------------------------

type QuickActionEvent = { type: string; createdAt: string }
const QUICK_ACTION_BUS = new EventTarget()

function QuickActions({ slug, itemId, onLogged }: { slug: string; itemId: string; onLogged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [showNote, setShowNote] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showAppraisal, setShowAppraisal] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [dateDraft, setDateDraft] = useState('')

  async function run<T>(label: string, fn: () => Promise<T>) {
    setBusy(label)
    try {
      await fn()
      QUICK_ACTION_BUS.dispatchEvent(new CustomEvent('logged', { detail: { slug, itemId } }))
      onLogged()
    } catch (e) { console.error(e) }
    finally { setBusy(null) }
  }

  return (
    <section className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg p-3">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-cream-dim)] mb-2">Quick actions</h3>
      <div className="grid grid-cols-5 gap-1.5">
        <button
          onClick={() => run('connected', () => quickActionCallConnected({ slug, itemId }))}
          disabled={busy !== null}
          className="bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white rounded-md px-2 py-2 text-[11px] font-medium leading-tight"
          title="Reset NVML, set follow-up to +7d"
        >Called<br/>Connected</button>
        <button
          onClick={() => run('nvml', () => quickActionCallNvml({ slug, itemId }))}
          disabled={busy !== null}
          className="bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white rounded-md px-2 py-2 text-[11px] font-medium leading-tight"
          title="Increment NVML, set follow-up to +2d"
        >Called<br/>NVML</button>
        <button
          onClick={() => setShowNote(s => !s)}
          disabled={busy !== null}
          className="bg-[var(--color-card-2)] hover:bg-[#3a3631] text-[var(--color-cream)] rounded-md px-2 py-2 text-[11px] font-medium leading-tight"
        >Add<br/>Note</button>
        <button
          onClick={() => { setDateDraft(addDaysISO(7)); setShowFollowUp(true) }}
          disabled={busy !== null}
          className="bg-[var(--color-card-2)] hover:bg-[#3a3631] text-[var(--color-cream)] rounded-md px-2 py-2 text-[11px] font-medium leading-tight"
        >Set<br/>Follow-up</button>
        <button
          onClick={() => { setDateDraft(addDaysISO(3)); setShowAppraisal(true) }}
          disabled={busy !== null}
          className="bg-[var(--color-gold)] hover:opacity-90 text-[var(--color-bg)] rounded-md px-2 py-2 text-[11px] font-medium leading-tight"
        >Book<br/>Appraisal</button>
      </div>

      {showNote && (
        <div className="mt-3 flex gap-2">
          <textarea
            autoFocus
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            placeholder="Note…"
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-card-2)] text-[var(--color-cream)] rounded p-2 text-xs outline-none min-h-[60px]"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => run('note', async () => {
                const body = noteDraft.trim()
                if (!body) return
                await quickActionNote({ slug, itemId, body })
                setNoteDraft(''); setShowNote(false)
              })}
              disabled={!noteDraft.trim()}
              className="bg-[var(--color-gold)] disabled:opacity-40 text-[var(--color-bg)] rounded px-3 py-1 text-xs font-medium"
            >Save</button>
            <button onClick={() => { setShowNote(false); setNoteDraft('') }} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">Cancel</button>
          </div>
        </div>
      )}

      {showFollowUp && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="date"
            value={dateDraft}
            onChange={e => setDateDraft(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-card-2)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
          />
          <button
            onClick={() => run('follow_up', async () => {
              if (!dateDraft) return
              await quickActionSetFollowUp({ slug, itemId, date: dateDraft })
              setShowFollowUp(false)
            })}
            className="bg-[var(--color-gold)] text-[var(--color-bg)] rounded px-3 py-1 text-xs font-medium"
          >Save</button>
          <button onClick={() => setShowFollowUp(false)} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">Cancel</button>
        </div>
      )}

      {showAppraisal && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="date"
            value={dateDraft}
            onChange={e => setDateDraft(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-card-2)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
          />
          <button
            onClick={() => run('appraisal', async () => {
              await quickActionBookAppraisal({ slug, itemId, date: dateDraft || undefined })
              setShowAppraisal(false)
            })}
            className="bg-[var(--color-gold)] text-[var(--color-bg)] rounded px-3 py-1 text-xs font-medium"
          >Save</button>
          <button onClick={() => setShowAppraisal(false)} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">Cancel</button>
        </div>
      )}
    </section>
  )
}

function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ---- Activity Timeline -----------------------------------------------------

const ACTIVITY_LABEL: Record<string, { label: string; color: string }> = {
  call_connected:    { label: 'Connected',         color: '#16a34a' },
  call_nvml:         { label: 'No voicemail',      color: '#ea580c' },
  note:              { label: 'Note',              color: '#c4912a' },
  follow_up_set:     { label: 'Follow-up set',     color: '#3b82f6' },
  appraisal_booked:  { label: 'Appraisal booked',  color: '#c4912a' },
  status_change:     { label: 'Status changed',    color: '#94a3b8' },
  meeting_scheduled: { label: 'Meeting',           color: '#3b82f6' },
  email_sent:        { label: 'Email sent',        color: '#6366f1' },
  sms_sent:          { label: 'SMS sent',          color: '#6366f1' },
  import_note:       { label: 'Imported note',     color: '#6b7280' },
}

function ActivityTimeline({ slug, itemId }: { slug: string; itemId: string }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    listContactActivity({ slug, itemId })
      .then(rows => { setEntries(rows); setLoading(false) })
      .catch(e => { console.error(e); setLoading(false) })
  }

  useEffect(() => {
    refresh()
    function onLogged(e: Event) {
      const ev = e as CustomEvent<{ slug: string; itemId: string }>
      if (ev.detail?.slug === slug && ev.detail?.itemId === itemId) refresh()
    }
    QUICK_ACTION_BUS.addEventListener('logged', onLogged)
    return () => QUICK_ACTION_BUS.removeEventListener('logged', onLogged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, itemId])

  function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    setEntries(prev => prev.filter(e => e.id !== id))
    deleteActivityEntry({ id }).catch(console.error)
  }

  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-cream-dim)] mb-2">Activity</h3>
      {loading ? (
        <div className="text-[var(--color-cream-x)] text-xs">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-[var(--color-cream-x)] text-xs">No activity yet — use Quick Actions above to log your first interaction.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(e => {
            const meta = ACTIVITY_LABEL[e.activity_type] ?? { label: e.activity_type, color: '#6b7280' }
            const payload = e.payload as Record<string, unknown>
            return (
              <li key={e.id} className="bg-[var(--color-card-2)] rounded p-3 text-xs group">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] text-white font-medium" style={{ background: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-cream-x)]">{formatDate(e.created_at)}</span>
                </div>
                {e.body ? <div className="whitespace-pre-wrap text-[var(--color-cream)]">{e.body}</div> : null}
                {payload.next_nvml ? <div className="text-[var(--color-cream-dim)] mt-1">NVML → {String(payload.next_nvml)}</div> : null}
                {payload.next_follow_up ? <div className="text-[var(--color-cream-dim)] mt-1">Follow-up set to {String(payload.next_follow_up)}</div> : null}
                {payload.follow_up_date ? <div className="text-[var(--color-cream-dim)] mt-1">Follow-up: {String(payload.follow_up_date)}</div> : null}
                {payload.appraisal_date ? <div className="text-[var(--color-cream-dim)] mt-1">Appraisal: {String(payload.appraisal_date)}</div> : null}
                <button onClick={() => remove(e.id)} className="text-[var(--color-cream-x)] hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 mt-1">Delete</button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function PanelLongText({
  col, item, slug, onLocalChange,
}: {
  col: BoardColumn
  item: BoardItem
  slug: string
  onLocalChange: (itemId: string, columnId: string, columnType: string, newText: string | null) => void
}) {
  const cell = item.raw[col.column_id]
  const text = cell?.text ?? null
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text ?? '')
  const [, startTransition] = useTransition()

  function save() {
    setEditing(false)
    const next = draft.trim() === '' ? null : draft
    if (next === text) return
    onLocalChange(item.monday_item_id, col.column_id, col.column_type, next)
    startTransition(async () => {
      try {
        await updateBoardCell({
          slug, itemId: item.monday_item_id, columnId: col.column_id, columnType: col.column_type, text: next,
        })
      } catch (e) { console.error(e) }
    })
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-cream-dim)] mb-1">{col.title}</div>
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') } }}
          className="w-full min-h-[100px] bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded p-2 text-xs outline-none"
        />
      ) : (
        <div
          onClick={() => { setDraft(text ?? ''); setEditing(true) }}
          className="bg-[var(--color-card-2)] rounded p-3 whitespace-pre-wrap text-xs cursor-text min-h-[40px] hover:ring-1 hover:ring-[var(--color-gold)]"
        >
          {text || <span className="text-[var(--color-cream-x)]">Click to add notes…</span>}
        </div>
      )}
    </div>
  )
}
