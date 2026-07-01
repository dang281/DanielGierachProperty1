'use client'

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import AddressInput from '@/components/AddressInput'
import dynamic from 'next/dynamic'
import { addBoardItem, bulkDeleteItems, bulkMoveItems, deleteBoardItem, getLinkedItem, moveItemToGroup, updateBoardCell } from '@/lib/actions/board'
import ItemDetailPanel from './ItemDetailPanel'
import QueueView from '@/app/app/properties/QueueView'
import type { BoardColumn, BoardItem } from './types'
import type { BuyerBrief } from '@/types/buyers'

const PropertyMap = dynamic(() => import('@/app/app/properties/PropertyMap'), { ssr: false })

type MapData = {
  properties: unknown[]
  alerts: unknown[]
  buyers: BuyerBrief[]
} | null

const NEUTRAL_PILL = '#5b6470'
const EDITABLE_TEXT_TYPES = new Set(['text', 'long_text', 'numbers', 'phone', 'email', 'name'])
const EDITABLE_DATE_TYPES = new Set(['date'])
const EDITABLE_STATUS_TYPES = new Set(['status', 'color'])
const EDITABLE_DROPDOWN_TYPES = new Set(['dropdown'])
const READONLY_TYPES = new Set([
  'mirror', 'lookup', 'last_updated', 'pulse_updated',
  'board_relation', 'dependency', 'subtasks', 'timeline',
  'subitems',
])

type LabelOption = { key: string; label: string; color: string | null }

function statusOptions(settings: Record<string, unknown>): LabelOption[] {
  const labels = settings.labels
  const colors = settings.labels_colors as Record<string, { color?: string }> | undefined
  if (!labels) return []
  // Status columns use {0: "YES", ...} object; dropdown columns use [{id, name}].
  if (Array.isArray(labels)) {
    return (labels as Array<{ id: number | string; name: string }>)
      .map(l => ({ key: String(l.id), label: String(l.name), color: colors?.[String(l.id)]?.color ?? null }))
  }
  return Object.entries(labels as Record<string, string>)
    .filter(([, v]) => v !== '' && typeof v === 'string')
    .map(([k, v]) => ({ key: k, label: String(v), color: colors?.[k]?.color ?? null }))
}

function dropdownOptions(settings: Record<string, unknown>): LabelOption[] {
  const opts = settings.options as Array<{ id: number | string; name: string }> | undefined
  if (Array.isArray(opts)) {
    return opts.map(o => ({ key: String(o.id), label: String(o.name), color: null }))
  }
  const labels = settings.labels
  if (Array.isArray(labels)) {
    // Dropdown columns: labels is an array of {id, name}
    return (labels as Array<{ id: number | string; name: string }>)
      .map(l => ({ key: String(l.id), label: String(l.name), color: null }))
  }
  if (labels && typeof labels === 'object') {
    return Object.entries(labels as Record<string, string>)
      .map(([k, v]) => ({ key: k, label: String(v), color: null }))
  }
  return []
}

function colorForStatus(settings: Record<string, unknown>, text: string | null): string | null {
  if (!text) return null
  const opts = statusOptions(settings)
  return opts.find(o => o.label === text)?.color ?? null
}

function formatDateShort(d: string | null): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })
}

function formatNumber(n: string | null): string {
  if (n === null || n === '') return ''
  const num = Number(n)
  if (isNaN(num)) return n
  return num.toLocaleString('en-AU')
}

function StatusPill({
  text,
  color,
  onClick,
  editable,
}: {
  text: string
  color: string | null
  onClick?: () => void
  editable: boolean
}) {
  const bg = color ?? NEUTRAL_PILL
  return (
    <span
      onClick={onClick}
      className={[
        'inline-block px-2.5 py-0.5 rounded text-[12px] font-medium whitespace-nowrap text-white',
        editable ? 'cursor-pointer hover:opacity-90' : '',
      ].join(' ')}
      style={{ background: bg }}
    >
      {text}
    </span>
  )
}

function FixedPopover({
  anchor,
  onClose,
  children,
}: {
  anchor: DOMRect
  onClose: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', key)
    }
  }, [onClose])

  const top = Math.min(anchor.bottom + 4, window.innerHeight - 240)
  const left = Math.min(anchor.left, window.innerWidth - 260)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg shadow-xl p-2 min-w-[200px] max-w-[320px] max-h-[280px] overflow-auto"
      style={{ top, left }}
    >
      {children}
    </div>
  )
}

type EditableCellProps = {
  slug: string
  itemId: string
  col: BoardColumn
  cell: { type: string; text: string | null; value: string | null; linked_item_ids?: string[] } | undefined
  onLocalChange: (newText: string | null) => void
  onOpenLinked?: (itemId: string) => void
}

function EditableCellInner({
  slug,
  itemId,
  col,
  cell,
  onLocalChange,
  onOpenLinked,
}: EditableCellProps) {
  // DEBUG: catch the {id, name} render error
  if (cell?.text && typeof cell.text !== 'string') {
    console.error('[EditableCell] non-string text', { col: col.column_id, type: col.column_type, cell })
  }
  if (cell?.linked_item_ids && cell.linked_item_ids.some(x => typeof x !== 'string')) {
    console.error('[EditableCell] non-string linked_item_ids', { col: col.column_id, ids: cell.linked_item_ids })
  }
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string>(cell?.text ?? '')
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const cellRef = useRef<HTMLDivElement>(null)
  const [, startTransition] = useTransition()

  const text = cell?.text ?? null
  const isReadOnly = READONLY_TYPES.has(col.column_type)
  const isStatus = EDITABLE_STATUS_TYPES.has(col.column_type)
  const isDropdown = EDITABLE_DROPDOWN_TYPES.has(col.column_type)
  const isText = EDITABLE_TEXT_TYPES.has(col.column_type)
  const isDate = EDITABLE_DATE_TYPES.has(col.column_type)
  const isLocation = col.column_type === 'location'

  function save(newText: string | null) {
    onLocalChange(newText)
    startTransition(async () => {
      try {
        await updateBoardCell({
          slug,
          itemId,
          columnId: col.column_id,
          columnType: col.column_type,
          text: newText,
        })
      } catch (e) {
        console.error('Save failed', e)
      }
    })
  }

  function openPicker() {
    if (cellRef.current) setAnchor(cellRef.current.getBoundingClientRect())
  }

  function startTextEdit() {
    setDraft(text ?? '')
    setEditing(true)
  }

  function commitTextEdit() {
    setEditing(false)
    const next = draft.trim() === '' ? null : draft
    if (next !== text) save(next)
  }

  // --- Picker / popover bodies ---
  if (anchor && isStatus) {
    const opts = statusOptions(col.settings)
    return (
      <>
        <div ref={cellRef}>
          {text
            ? <StatusPill text={text} color={colorForStatus(col.settings, text)} onClick={openPicker} editable />
            : <span onClick={openPicker} className="cursor-pointer text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)]">—</span>}
        </div>
        <FixedPopover anchor={anchor} onClose={() => setAnchor(null)}>
          <div className="flex flex-col gap-1">
            {opts.map(o => (
              <button
                key={o.key}
                onClick={() => { save(o.label); setAnchor(null) }}
                className="text-left px-2 py-1 rounded text-xs hover:bg-[var(--color-card-2)]"
              >
                <StatusPill text={o.label} color={o.color} editable={false} />
              </button>
            ))}
            {text && (
              <button
                onClick={() => { save(null); setAnchor(null) }}
                className="text-left px-2 py-1 rounded text-[11px] text-[var(--color-cream-x)] hover:bg-[var(--color-card-2)]"
              >
                Clear
              </button>
            )}
          </div>
        </FixedPopover>
      </>
    )
  }

  if (anchor && isDropdown) {
    const opts = dropdownOptions(col.settings)
    const selected = new Set((text ?? '').split(',').map(s => s.trim()).filter(Boolean))
    function toggle(label: string) {
      const next = new Set(selected)
      if (next.has(label)) next.delete(label); else next.add(label)
      save(next.size === 0 ? null : Array.from(next).join(', '))
    }
    return (
      <>
        <div ref={cellRef}>
          <div onClick={openPicker} className="cursor-pointer flex flex-wrap gap-1">
            {selected.size === 0
              ? <span className="text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)]">—</span>
              : Array.from(selected).map((p, i) => <StatusPill key={i} text={p} color={null} editable={false} />)}
          </div>
        </div>
        <FixedPopover anchor={anchor} onClose={() => setAnchor(null)}>
          <div className="flex flex-col gap-0.5">
            {opts.map(o => {
              const isOn = selected.has(o.label)
              return (
                <button
                  key={o.key}
                  onClick={() => toggle(o.label)}
                  className={[
                    'text-left px-2 py-1 rounded text-xs flex items-center gap-2',
                    isOn ? 'bg-[var(--color-card-2)]' : 'hover:bg-[var(--color-card-2)]',
                  ].join(' ')}
                >
                  <span className="w-3 h-3 rounded-sm border border-[var(--color-card-2)] flex items-center justify-center text-[10px]">
                    {isOn ? '✓' : ''}
                  </span>
                  {o.label}
                </button>
              )
            })}
            {opts.length === 0 && (
              <div className="text-[var(--color-cream-x)] text-xs px-2 py-1">No options</div>
            )}
          </div>
        </FixedPopover>
      </>
    )
  }

  // --- Long text: open a roomy floating editor so the whole note is readable
  const isLong = col.column_type === 'long_text'
  if (editing && isLong && anchor) {
    function close(commit: boolean) {
      if (commit) commitTextEdit()
      else { setEditing(false); setDraft(text ?? '') }
      setAnchor(null)
    }
    const titleText = col.title ?? 'Note'
    return (
      <>
        <span ref={cellRef} className="text-[var(--color-cream-dim)] truncate">
          {(text ?? '').slice(0, 60)}{(text ?? '').length > 60 ? '…' : ''}
        </span>
        <FixedPopover anchor={anchor} onClose={() => close(true)}>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-cream-dim)]">{titleText}</span>
            <span className="text-[10px] text-[var(--color-cream-x)]">Esc to cancel · ⌘/Ctrl+Enter to save</span>
          </div>
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') close(false)
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) close(true)
            }}
            className="w-[520px] max-w-[88vw] min-h-[280px] max-h-[60vh] bg-[var(--color-bg)] text-[var(--color-cream)] text-[13px] leading-relaxed outline-none p-3 resize-y rounded border border-[var(--color-card-2)] whitespace-pre-wrap"
          />
        </FixedPopover>
      </>
    )
  }

  // --- Inline text edit ---
  if (editing && isText && !isLong) {
    return (
      <input
        autoFocus
        type={col.column_type === 'email' ? 'email' : col.column_type === 'phone' ? 'tel' : col.column_type === 'numbers' ? 'number' : 'text'}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitTextEdit}
        onKeyDown={e => {
          if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') }
          if (e.key === 'Enter') commitTextEdit()
        }}
        className="w-full min-w-[120px] bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
      />
    )
  }

  if (editing && isLocation) {
    return (
      <AddressInput
        autoFocus
        value={draft}
        onChange={setDraft}
        onSelect={(addr) => { save(addr); setEditing(false) }}
        onBlur={commitTextEdit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') }
          if (e.key === 'Enter') commitTextEdit()
        }}
        className="w-full min-w-[200px] bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
      />
    )
  }

  if (editing && isDate) {
    return (
      <input
        autoFocus
        type="date"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitTextEdit}
        onKeyDown={e => {
          if (e.key === 'Escape') { setEditing(false); setDraft(text ?? '') }
          if (e.key === 'Enter') commitTextEdit()
        }}
        className="bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
      />
    )
  }

  // --- Display modes (clickable to edit when editable) ---
  const empty = !text || text === ''
  const isEmptyEditable = empty && (isText || isDate || isStatus || isDropdown || isLocation)

  if (empty && !isEmptyEditable) {
    return <span className="text-[var(--color-cream-x)]">—</span>
  }

  const dashClick = () => {
    if (isStatus || isDropdown) openPicker()
    else if (col.column_type === 'long_text') {
      if (cellRef.current) setAnchor(cellRef.current.getBoundingClientRect())
      startTextEdit()
    }
    else if (isText || isDate || isLocation) startTextEdit()
  }

  if (empty) {
    return (
      <div ref={cellRef}>
        <span onClick={dashClick} className="cursor-pointer text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)]">—</span>
      </div>
    )
  }

  switch (col.column_type) {
    case 'status':
    case 'color': {
      const color = colorForStatus(col.settings, text)
      return (
        <div ref={cellRef}>
          <StatusPill text={text!} color={color} onClick={openPicker} editable />
        </div>
      )
    }
    case 'dropdown': {
      const parts = (text ?? '').split(',').map(s => s.trim()).filter(Boolean)
      return (
        <div ref={cellRef}>
          <div onClick={openPicker} className="cursor-pointer flex flex-wrap gap-1">
            {parts.map((p, i) => <StatusPill key={i} text={p} color={null} editable={false} />)}
          </div>
        </div>
      )
    }
    case 'date': {
      const isFollowUp = (col.title ?? '').toLowerCase().includes('follow')
      let urgencyBg = ''
      if (isFollowUp && text) {
        const d = new Date(text)
        if (!isNaN(d.getTime())) {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
          const cellDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
          if (cellDay < today)      urgencyBg = 'block -mx-3 -my-1 px-3 py-1 bg-[#f87171]/40 text-[#0a0806] font-medium'
          else if (cellDay === today) urgencyBg = 'block -mx-3 -my-1 px-3 py-1 bg-[#fbbf24]/30 text-[#0a0806] font-medium'
        }
      }
      return (
        <span onClick={startTextEdit} className={`cursor-pointer hover:text-[var(--color-gold)] ${urgencyBg}`}>
          {formatDateShort(text)}
        </span>
      )
    }
    case 'last_updated':
    case 'pulse_updated':
      return <span className="text-[var(--color-cream-dim)]">{formatDateShort(text)}</span>
    case 'phone':
      return (
        <div className="flex items-center gap-2">
          <a href={`tel:${text}`} className="text-[var(--color-gold)] hover:underline whitespace-nowrap">{text}</a>
          {!isReadOnly && (
            <button onClick={startTextEdit} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">edit</button>
          )}
        </div>
      )
    case 'email':
      return (
        <div className="flex items-center gap-2 max-w-[220px]">
          <a href={`mailto:${text}`} className="text-[var(--color-gold)] hover:underline truncate">{text}</a>
          {!isReadOnly && (
            <button onClick={startTextEdit} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] text-[10px]">edit</button>
          )}
        </div>
      )
    case 'link': {
      let url: string | null = null
      try {
        const parsed = cell?.value ? JSON.parse(cell.value) : null
        url = parsed?.url ?? null
      } catch {}
      if (!url && text?.startsWith('http')) url = text
      if (!url) return <span className="text-[var(--color-cream-x)]">—</span>
      return (
        <a href={url} target="_blank" rel="noreferrer" className="text-[var(--color-gold)] hover:underline">
          Open
        </a>
      )
    }
    case 'location':
      return (
        <span onClick={startTextEdit} className="cursor-pointer hover:text-[var(--color-gold)] whitespace-nowrap">
          {text}
        </span>
      )
    case 'numbers':
      return (
        <span onClick={startTextEdit} className="cursor-pointer hover:text-[var(--color-gold)] tabular-nums">
          {formatNumber(text)}
        </span>
      )
    case 'long_text': {
      const compact = (text ?? '').slice(0, 60)
      const truncated = (text ?? '').length > 60
      return (
        <span
          ref={cellRef}
          onClick={(e) => {
            setAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())
            startTextEdit()
          }}
          title={text ?? undefined}
          className="cursor-pointer hover:text-[var(--color-gold)] text-[var(--color-cream-dim)]"
        >
          {compact}{truncated && '…'}
        </span>
      )
    }
    case 'board_relation':
    case 'dependency': {
      const names = (text ?? '').split(',').map(s => s.trim()).filter(Boolean)
      const linkedIds = cell?.linked_item_ids
      if (names.length === 0) return <span className="text-[var(--color-cream-x)]">—</span>
      return (
        <div
          className="flex flex-nowrap gap-1 overflow-hidden"
          title={names.join(' · ')}
        >
          {names.map((n, i) => {
            const id = linkedIds?.[i]
            return id && onOpenLinked ? (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onOpenLinked(id) }}
                className="inline-block px-2.5 py-0.5 rounded bg-[var(--color-card-2)] text-[12px] whitespace-nowrap text-[var(--color-cream)] hover:bg-[var(--color-gold)] hover:text-[var(--color-bg)] cursor-pointer"
                title="Open linked item"
              >
                {n}
              </button>
            ) : (
              <span
                key={i}
                className="inline-block px-2.5 py-0.5 rounded bg-[var(--color-card-2)] text-[12px] whitespace-nowrap text-[var(--color-cream)]"
              >
                {n}
              </span>
            )
          })}
        </div>
      )
    }
    case 'mirror':
    case 'lookup': {
      // Mirror columns often duplicate when a contact is linked to the same
      // property from multiple boards. Dedupe by chunk to show each address once.
      const txt = text ?? ''
      let display = txt
      if (txt && txt.length > 0) {
        // Try the simple "value repeats N times" pattern first
        const parts = txt.split(',').map(s => s.trim()).filter(Boolean)
        if (parts.length > 1) {
          const unique = Array.from(new Set(parts))
          // If only 1 unique part, just show it
          if (unique.length === 1) display = unique[0]
          // If parts evenly group into N copies of the same address (with commas inside)
          else for (let groupSize = 1; groupSize <= Math.floor(parts.length / 2); groupSize++) {
            if (parts.length % groupSize !== 0) continue
            const first = parts.slice(0, groupSize).join(', ')
            let allMatch = true
            for (let i = groupSize; i < parts.length; i += groupSize) {
              if (parts.slice(i, i + groupSize).join(', ') !== first) { allMatch = false; break }
            }
            if (allMatch) { display = first; break }
          }
        }
      }
      return <span className="text-[var(--color-cream-dim)] truncate">{display}</span>
    }
    case 'subtasks':
    case 'subitems': {
      let count = 0
      try {
        const parsed = cell?.value ? JSON.parse(cell.value) : null
        count = parsed?.linkedPulseIds?.length ?? 0
      } catch {}
      return count === 0
        ? <span className="text-[var(--color-cream-x)]">—</span>
        : <span className="text-xs text-[var(--color-cream-dim)]">{count}</span>
    }
    case 'timeline': {
      try {
        const parsed = cell?.value ? JSON.parse(cell.value) : null
        const from = parsed?.from
        const to = parsed?.to
        if (from && to) return <span className="whitespace-nowrap text-[var(--color-cream-dim)]">{formatDateShort(from)} → {formatDateShort(to)}</span>
      } catch {}
      return <span>{text}</span>
    }
    case 'text':
    default:
      return (
        <span onClick={startTextEdit} className="cursor-pointer hover:text-[var(--color-gold)]">
          {text}
        </span>
      )
  }
}

// Skip re-render when only callbacks change (they always do). Compare on the
// data props that actually affect what we render.
const EditableCell = memo(EditableCellInner, (prev, next) =>
  prev.slug   === next.slug   &&
  prev.itemId === next.itemId &&
  prev.col    === next.col    &&
  prev.cell   === next.cell   &&
  Boolean(prev.onOpenLinked) === Boolean(next.onOpenLinked)
)

type SortDir = 'asc' | 'desc'

type ViewMode = 'table' | 'map' | 'queue'

type ViewState = {
  search: string
  groupFilter: string
  sortKey: string | null
  sortDir: SortDir
  hidden: string[]
  view: ViewMode
}

// Per-board default-hidden columns. Show only the essentials on first load —
// the user can re-enable any via the Columns menu. Only applied when there's
// no prior preference in localStorage (i.e. first-time load on this board).
const DEFAULT_HIDDEN_COLUMNS: Record<string, string[]> = {
  pipeline: [
    'email_mkwpd6dn',         // Email — use detail panel
    'link_mkvv2dsy',          // Price Finder — detail panel
    'date_mkzjzxnd',          // Event date (historical noise)
    'text_mm0d1cy2',          // Appraisal Range — detail panel
    'long_text_mm35hdg2',     // Second Notes
    'long_text_mm3xdjdm',     // Third Notes
    'long_text_mm3xbawf',     // Third Notes cont.
  ],
  contacts: [
    'lookup_mkv11gr0',        // Mirror Properties Address — mostly duplicates linked property
  ],
  leads: [
    'lookup_mkwq1n91',        // Mirror (generic)
    'lookup_mkv1bshd',        // Address Mirror of Contacts — open panel for full address
    'pulse_updated_mkv4s3cn', // Auto last-updated timestamp
    'date4',                  // Date — Follow Up Date is the actionable one
  ],
  referrals: [
    'pulse_updated_mkvv446w', // Auto last-updated timestamp
    'long_text_mkvva4px',     // Generic "Long text" — open panel for full notes
  ],
}

// Per-board default column order. Applied only on first load of the board
// (when there's no localStorage colOrder). Any columns not listed here fall
// to the end of the table in their natural Monday order.
const DEFAULT_COLUMN_ORDER: Record<string, string[]> = {
  pipeline: [
    'property_contact',       // Contact
    'phone_mkvdbvr4',         // Phone
    'date_mkvwk1we',          // Follow Up Date
    'color_mm0dp0q8',         // Appraised?
    'color_mm0dpras',         // Buy to Sell?
    'link_mkvdcbdw',          // Nurture Cloud Link
    'link_mm3hsnx0',          // Dup. of Nurture Cloud Link
    'long_text_mkvwnqqp',     // First Notes
    'property_address',       // Address
    'color_mkvvc85t',         // Owner Type
  ],
}

// Per-board fallback group order. Each entry is a prefix matched
// case-insensitively against monday_group_title; the first match wins.
// Used only when the user has not manually reordered groups (no localStorage
// groupOrder).
const DEFAULT_GROUP_ORDER: Record<string, string[]> = {
  pipeline: [
    'HOTSTOCK',
    'WARMSTOCK',
    'HAPPY TO CHAT',
    'UNSURE STOCK',
    'NOT PICKING UP',
    'UNFILTERED',
  ],
}

function applyDefaultGroupOrder(slug: string, groups: string[]): string[] {
  const prefixes = DEFAULT_GROUP_ORDER[slug]
  if (!prefixes) return groups
  const remaining = new Set(groups)
  const ordered: string[] = []
  for (const prefix of prefixes) {
    for (const g of groups) {
      if (remaining.has(g) && g.toUpperCase().startsWith(prefix)) {
        ordered.push(g)
        remaining.delete(g)
      }
    }
  }
  for (const g of groups) if (remaining.has(g)) ordered.push(g)
  return ordered
}

function defaultWidthFor(type: string): number {
  switch (type) {
    case 'name': return 280
    case 'text': return 180
    case 'long_text': return 240
    case 'status': case 'color': return 140
    case 'dropdown': return 200
    case 'phone': return 150
    case 'email': return 220
    case 'date': case 'last_updated': case 'pulse_updated': return 130
    case 'numbers': return 120
    case 'link': return 80
    case 'location': return 240
    case 'board_relation': case 'dependency': return 200
    case 'mirror': case 'lookup': return 220
    case 'timeline': return 200
    default: return 160
  }
}

function compareCells(a: string | null, b: string | null, dir: SortDir): number {
  if (a === b) return 0
  if (a === null || a === '') return 1
  if (b === null || b === '') return -1
  const asNumA = Number(a)
  const asNumB = Number(b)
  if (!isNaN(asNumA) && !isNaN(asNumB)) {
    return dir === 'asc' ? asNumA - asNumB : asNumB - asNumA
  }
  return dir === 'asc'
    ? a.localeCompare(b, undefined, { sensitivity: 'base' })
    : b.localeCompare(a, undefined, { sensitivity: 'base' })
}

export default function BoardTable({
  label,
  slug,
  columns,
  items,
  mapData,
}: {
  label: string
  slug: string
  columns: BoardColumn[]
  items: BoardItem[]
  mapData?: MapData
}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [groupFilter, setGroupFilter] = useState<string>('All')
  const [rows, setRows] = useState<BoardItem[]>(items)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [bulkIds, setBulkIds] = useState<Set<string>>(new Set())
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [showColMenu, setShowColMenu] = useState(false)
  const [savedViews, setSavedViews] = useState<Array<{ name: string; state: ViewState }>>([])
  const [view, setView] = useState<ViewMode>('table')
  const [colWidths, setColWidths] = useState<Record<string, number>>({})
  const [colOrder, setColOrder] = useState<string[]>([])
  const [dragColId, setDragColId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)
  const [groupOrder, setGroupOrder] = useState<string[]>([])
  const [dragGroup, setDragGroup] = useState<string | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  // Load persisted column visibility + saved views from localStorage
  useEffect(() => {
    const storageKey = `board-prefs-${slug}`
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as { hidden?: string[]; views?: typeof savedViews; view?: ViewMode; widths?: Record<string, number>; order?: string[]; groupOrder?: string[] }
        if (parsed.hidden) setHiddenCols(new Set(parsed.hidden))
        else if (DEFAULT_HIDDEN_COLUMNS[slug]) setHiddenCols(new Set(DEFAULT_HIDDEN_COLUMNS[slug]))
        if (parsed.views) setSavedViews(parsed.views)
        if (parsed.view) setView(parsed.view)
        if (parsed.widths) setColWidths(parsed.widths)
        if (parsed.order) setColOrder(parsed.order)
        else if (DEFAULT_COLUMN_ORDER[slug]) setColOrder(DEFAULT_COLUMN_ORDER[slug])
        if (parsed.groupOrder) setGroupOrder(parsed.groupOrder)
      } else {
        // First time on this board — apply defaults
        if (DEFAULT_HIDDEN_COLUMNS[slug]) setHiddenCols(new Set(DEFAULT_HIDDEN_COLUMNS[slug]))
        if (DEFAULT_COLUMN_ORDER[slug]) setColOrder(DEFAULT_COLUMN_ORDER[slug])
      }
    } catch {}
  }, [slug])

  useEffect(() => {
    const storageKey = `board-prefs-${slug}`
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        hidden: Array.from(hiddenCols),
        views: savedViews,
        view,
        widths: colWidths,
        order: colOrder,
        groupOrder,
      }))
    } catch {}
  }, [hiddenCols, savedViews, view, slug, colWidths, colOrder, groupOrder])

  const allDataColumns = useMemo(
    () => {
      const base = columns.filter(c =>
        c.column_type !== 'name' &&
        c.column_type !== 'subtasks' &&
        c.column_type !== 'subitems' &&
        c.column_id !== 'long_text_mkza4vyp' && // Pipeline "Date & Time" — removed
        c.column_id !== 'long_text_mkza2qtb'    // Pipeline "Contact Name" — removed (use property_contact instead)
      )
      if (colOrder.length === 0) return base
      const byId = new Map(base.map(c => [c.column_id, c]))
      const ordered: typeof base = []
      for (const id of colOrder) {
        const c = byId.get(id)
        if (c) { ordered.push(c); byId.delete(id) }
      }
      // Any column not in saved order (newly imported, etc.) goes to the end
      for (const c of byId.values()) ordered.push(c)
      return ordered
    },
    [columns, colOrder]
  )
  const dataColumns = useMemo(
    () => allDataColumns.filter(c => !hiddenCols.has(c.column_id)),
    [allDataColumns, hiddenCols]
  )

  function moveColumn(dragId: string, targetId: string) {
    if (dragId === targetId) return
    const ids = allDataColumns.map(c => c.column_id)
    const from = ids.indexOf(dragId)
    const to   = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    ids.splice(from, 1)
    ids.splice(to, 0, dragId)
    setColOrder(ids)
  }

  const groups = useMemo(() => {
    const set = new Set<string>()
    for (const i of rows) if (i.monday_group_title) set.add(i.monday_group_title)
    return Array.from(set)
  }, [rows])

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return rows.filter(i => {
      if (groupFilter !== 'All' && i.monday_group_title !== groupFilter) return false
      if (!q) return true
      if ((i.name ?? '').toLowerCase().includes(q)) return true
      for (const cv of Object.values(i.raw)) {
        if (cv?.text?.toLowerCase().includes(q)) return true
      }
      return false
    })
  }, [rows, deferredSearch, groupFilter])

  const groupedRows = useMemo(() => {
    const map = new Map<string, BoardItem[]>()
    for (const row of filtered) {
      const g = row.monday_group_title ?? '(no group)'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(row)
    }
    if (sortKey) {
      for (const list of map.values()) {
        list.sort((a, b) => {
          const av = sortKey === 'name' ? a.name : a.raw[sortKey]?.text ?? null
          const bv = sortKey === 'name' ? b.name : b.raw[sortKey]?.text ?? null
          return compareCells(av, bv, sortDir)
        })
      }
    }
    const orderToUse = groupOrder.length > 0
      ? groupOrder
      : applyDefaultGroupOrder(slug, Array.from(map.keys()))
    const ordered: Array<[string, BoardItem[]]> = []
    for (const g of orderToUse) {
      const rows = map.get(g)
      if (rows) { ordered.push([g, rows]); map.delete(g) }
    }
    for (const [g, rows] of map) ordered.push([g, rows])
    return ordered
  }, [filtered, sortKey, sortDir, groupOrder, slug])

  function moveGroup(dragId: string, targetId: string) {
    if (dragId === targetId) return
    const present = Array.from(new Set([
      ...groupOrder,
      ...allGroups,
      ...rows.map(r => r.monday_group_title ?? '(no group)'),
    ]))
    const ids = present
    const from = ids.indexOf(dragId)
    const to   = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    ids.splice(from, 1)
    ids.splice(to, 0, dragId)
    setGroupOrder(ids)
  }

  function toggleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortKey(null); setSortDir('asc') }
    } else {
      setSortKey(key); setSortDir('asc')
    }
  }

  function toggleCollapse(group: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group); else next.add(group)
      return next
    })
  }

  function applyLocalChange(itemId: string, columnId: string, columnType: string, newText: string | null) {
    setRows(prev => prev.map(r => {
      if (r.monday_item_id !== itemId) return r
      const raw = { ...r.raw }
      raw[columnId] = {
        type: columnType,
        text: newText,
        value: raw[columnId]?.value ?? null,
      }
      const next: BoardItem = { ...r, raw }
      if (columnId === 'name' && newText !== null) next.name = newText
      return next
    }))
  }

  function applyLocalAdd(itemId: string, name: string, group: string) {
    setRows(prev => [
      ...prev,
      {
        monday_item_id: itemId,
        name,
        monday_group_title: group,
        raw: {},
        updated_at_monday: new Date().toISOString(),
      } as BoardItem,
    ])
  }

  function applyLocalDelete(itemId: string) {
    setRows(prev => prev.filter(r => r.monday_item_id !== itemId))
  }

  function applyLocalMove(itemId: string, newGroup: string) {
    setRows(prev => prev.map(r => r.monday_item_id === itemId
      ? { ...r, monday_group_title: newGroup }
      : r))
  }

  const allGroups = useMemo(() => {
    const set = new Set<string>()
    for (const i of rows) if (i.monday_group_title) set.add(i.monday_group_title)
    return Array.from(set)
  }, [rows])

  function toggleBulk(itemId: string) {
    setBulkIds(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId)
      return next
    })
  }

  function bulkAllInGroup(groupRows: BoardItem[], on: boolean) {
    setBulkIds(prev => {
      const next = new Set(prev)
      for (const r of groupRows) {
        if (on) next.add(r.monday_item_id); else next.delete(r.monday_item_id)
      }
      return next
    })
  }

  function toggleHidden(columnId: string) {
    setHiddenCols(prev => {
      const next = new Set(prev)
      if (next.has(columnId)) next.delete(columnId); else next.add(columnId)
      return next
    })
  }

  function saveCurrentView() {
    const name = window.prompt('Name this view')?.trim()
    if (!name) return
    const state: ViewState = {
      search, groupFilter, sortKey, sortDir,
      hidden: Array.from(hiddenCols),
      view,
    }
    setSavedViews(prev => [...prev.filter(v => v.name !== name), { name, state }])
  }

  function loadView(name: string) {
    const v = savedViews.find(x => x.name === name)
    if (!v) return
    setSearch(v.state.search)
    setGroupFilter(v.state.groupFilter)
    setSortKey(v.state.sortKey)
    setSortDir(v.state.sortDir)
    setHiddenCols(new Set(v.state.hidden))
    setView(v.state.view)
  }

  function deleteView(name: string) {
    setSavedViews(prev => prev.filter(v => v.name !== name))
  }

  const selectedItem = rows.find(r => r.monday_item_id === selectedId) ?? null

  const [linkedSelected, setLinkedSelected] = useState<{ slug: string; item: BoardItem; columns: BoardColumn[] } | null>(null)
  const [linkedLoading, setLinkedLoading] = useState(false)

  async function handleOpenLinked(itemId: string) {
    setLinkedLoading(true)
    try {
      const res = await getLinkedItem(itemId)
      if (res) setLinkedSelected({ slug: res.slug, item: res.item as BoardItem, columns: res.columns as BoardColumn[] })
    } catch (e) { console.error(e) } finally { setLinkedLoading(false) }
  }

  function startResize(colKey: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = colWidths[colKey] ?? (colKey === 'name' ? 260 : 160)
    const handle = e.currentTarget as HTMLElement
    const th = handle.closest('th') as HTMLTableHeaderCellElement | null
    if (!th) return
    let currentWidth = startWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMove(ev: MouseEvent) {
      currentWidth = Math.max(60, Math.min(800, startWidth + (ev.clientX - startX)))
      // Direct DOM update — no React re-render. Browser reflows column only.
      th!.style.width = `${currentWidth}px`
      th!.style.minWidth = `${currentWidth}px`
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Commit final width to React state once, after the drag ends.
      setColWidths(prev => ({ ...prev, [colKey]: currentWidth }))
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function exportCsv() {
    const csvEscape = (v: string) => {
      if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
      return v
    }
    const headers = ['Group', 'Name', ...dataColumns.map(c => c.title ?? c.column_id)]
    const lines = [headers.map(csvEscape).join(',')]
    for (const r of filtered) {
      const cells = [
        r.monday_group_title ?? '',
        r.name ?? '',
        ...dataColumns.map(c => r.raw[c.column_id]?.text ?? ''),
      ]
      lines.push(cells.map(s => csvEscape(String(s))).join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function widthFor(colKey: string, fallback: number): number {
    return colWidths[colKey] ?? fallback
  }

  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-4 border-b border-[var(--color-card-2)] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif">{label}</h1>
          <p className="text-[var(--color-cream-dim)] text-sm">
            {rows.length} items · {dataColumns.length}{hiddenCols.size > 0 ? `/${allDataColumns.length}` : ''} columns
            {hiddenCols.size > 0 && ' · some columns hidden'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {mapData && (
            <div className="flex bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setView('table')}
                className={['px-3 py-1.5', view === 'table' ? 'bg-[var(--color-card-2)] text-[var(--color-cream)]' : 'text-[var(--color-cream-dim)]'].join(' ')}
              >Table</button>
              <button
                onClick={() => setView('map')}
                className={['px-3 py-1.5', view === 'map' ? 'bg-[var(--color-card-2)] text-[var(--color-cream)]' : 'text-[var(--color-cream-dim)]'].join(' ')}
              >Map</button>
              <button
                onClick={() => setView('queue')}
                className={['px-3 py-1.5', view === 'queue' ? 'bg-[var(--color-card-2)] text-[var(--color-cream)]' : 'text-[var(--color-cream-dim)]'].join(' ')}
              >Queue</button>
            </div>
          )}
          <button
            onClick={() => {
              const allCollapsed = groups.length > 0 && groups.every(g => collapsed.has(g))
              setCollapsed(allCollapsed ? new Set() : new Set(groups))
            }}
            className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-xs hover:border-[var(--color-gold)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
            title={collapsed.size === groups.length && groups.length > 0 ? 'Expand all groups' : 'Collapse all groups'}
          >
            {collapsed.size === groups.length && groups.length > 0 ? '▾ Expand all' : '▸ Collapse all'}
          </button>
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--color-gold)]"
          >
            <option value="All">All groups</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ViewsMenu
            views={savedViews}
            onSave={saveCurrentView}
            onLoad={loadView}
            onDelete={deleteView}
          />
          <ColumnsMenu
            open={showColMenu}
            setOpen={setShowColMenu}
            columns={allDataColumns}
            hidden={hiddenCols}
            onToggle={toggleHidden}
          />
          <button
            onClick={exportCsv}
            className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-xs hover:border-[var(--color-gold)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
            title={`Export ${filtered.length} rows to CSV`}
          >
            Export
          </button>
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-sm w-64 outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </header>

      {view === 'map' && mapData ? (
        <div
          className="overflow-hidden border-t border-[var(--color-card-2)]"
          style={{ position: 'relative', height: 'calc(100vh - 160px)', minHeight: 520 }}
        >
          <PropertyMap
            properties={mapData.properties as any}
            alerts={mapData.alerts as any}
            buyers={mapData.buyers}
          />
        </div>
      ) : view === 'queue' && mapData ? (
        <div className="flex-1 overflow-auto">
          <QueueView
            properties={mapData.properties as any}
            alerts={mapData.alerts as any}
          />
        </div>
      ) : (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-[var(--color-bg)]">
            <tr>
              <SortableHeader
                colKey="name"
                title="Name"
                sortKey={sortKey}
                sortDir={sortDir}
                onClick={() => toggleSort('name')}
                sticky
                width={widthFor('name', 280)}
                onResizeStart={(e) => startResize('name', e)}
              />
              {dataColumns.map(c => (
                <SortableHeader
                  key={c.column_id}
                  colKey={c.column_id}
                  title={c.title ?? c.column_id}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onClick={() => toggleSort(c.column_id)}
                  width={widthFor(c.column_id, defaultWidthFor(c.column_type))}
                  onResizeStart={(e) => startResize(c.column_id, e)}
                  draggable
                  isDragging={dragColId === c.column_id}
                  isDragTarget={dragOverColId === c.column_id && dragColId !== null && dragColId !== c.column_id}
                  onDragStart={(e) => {
                    setDragColId(c.column_id)
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/colid', c.column_id)
                  }}
                  onDragOver={(e) => {
                    if (!dragColId || dragColId === c.column_id) return
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dragOverColId !== c.column_id) setDragOverColId(c.column_id)
                  }}
                  onDragLeave={() => {
                    if (dragOverColId === c.column_id) setDragOverColId(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const id = e.dataTransfer.getData('text/colid') || dragColId
                    if (id) moveColumn(id, c.column_id)
                    setDragColId(null)
                    setDragOverColId(null)
                  }}
                  onDragEnd={() => { setDragColId(null); setDragOverColId(null) }}
                />
              ))}
              <th className="px-2 py-1 border-b border-[var(--color-card-2)]" />
            </tr>
          </thead>

          <tbody>
            {groupedRows.length === 0 && (
              <tr>
                <td colSpan={dataColumns.length + 2} className="text-[var(--color-cream-dim)] text-sm py-12 text-center">
                  No matches.
                </td>
              </tr>
            )}
            {groupedRows.map(([group, groupRows]) => (
              <GroupBlock
                key={group}
                group={group}
                rows={groupRows}
                dataColumns={dataColumns}
                slug={slug}
                totalCols={dataColumns.length + 2}
                collapsed={collapsed.has(group)}
                onToggleCollapse={() => toggleCollapse(group)}
                applyLocalChange={applyLocalChange}
                applyLocalAdd={applyLocalAdd}
                applyLocalDelete={applyLocalDelete}
                bulkIds={bulkIds}
                toggleBulk={toggleBulk}
                bulkAllInGroup={bulkAllInGroup}
                onOpen={(id) => setSelectedId(id)}
                onOpenLinked={handleOpenLinked}
                isDragging={dragGroup === group}
                isDragTarget={dragOverGroup === group && dragGroup !== null && dragGroup !== group}
                onDragStart={() => setDragGroup(group)}
                onDragOver={(e) => {
                  if (!dragGroup || dragGroup === group) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverGroup !== group) setDragOverGroup(group)
                }}
                onDragLeave={() => { if (dragOverGroup === group) setDragOverGroup(null) }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragGroup) moveGroup(dragGroup, group)
                  setDragGroup(null); setDragOverGroup(null)
                }}
                onDragEnd={() => { setDragGroup(null); setDragOverGroup(null) }}
              />
            ))}
          </tbody>
        </table>
      </div>
      )}

      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          columns={allDataColumns}
          slug={slug}
          groupOptions={allGroups}
          onClose={() => setSelectedId(null)}
          onLocalChange={applyLocalChange}
          onMoveGroup={(id, g) => {
            applyLocalMove(id, g)
            moveItemToGroup({ slug, itemId: id, groupTitle: g }).catch(console.error)
          }}
          onOpenLinked={handleOpenLinked}
        />
      )}

      {linkedSelected && (
        <ItemDetailPanel
          item={linkedSelected.item}
          columns={linkedSelected.columns}
          slug={linkedSelected.slug}
          onClose={() => setLinkedSelected(null)}
          onLocalChange={() => { /* read-only across boards for v1 */ }}
          onOpenLinked={handleOpenLinked}
        />
      )}

      {linkedLoading && !linkedSelected && (
        <div className="fixed top-6 right-6 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-2 text-xs text-[var(--color-cream-dim)] z-50 shadow-xl">
          Loading linked item…
        </div>
      )}

      {bulkIds.size > 0 && (
        <BulkActionBar
          slug={slug}
          count={bulkIds.size}
          groups={allGroups}
          onMove={(g) => {
            const ids = Array.from(bulkIds)
            for (const id of ids) applyLocalMove(id, g)
            setBulkIds(new Set())
            bulkMoveItems({ slug, itemIds: ids, groupTitle: g }).catch(console.error)
          }}
          onDelete={() => {
            if (!confirm(`Delete ${bulkIds.size} item${bulkIds.size === 1 ? '' : 's'}?`)) return
            const ids = Array.from(bulkIds)
            for (const id of ids) applyLocalDelete(id)
            setBulkIds(new Set())
            bulkDeleteItems({ slug, itemIds: ids }).catch(console.error)
          }}
          onClear={() => setBulkIds(new Set())}
        />
      )}
    </div>
  )
}

function ColumnsMenu({
  open, setOpen, columns, hidden, onToggle,
}: {
  open: boolean
  setOpen: (b: boolean) => void
  columns: BoardColumn[]
  hidden: Set<string>
  onToggle: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open, setOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-xs hover:border-[var(--color-gold)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
      >Columns {hidden.size > 0 && <span className="text-[var(--color-gold)]">({columns.length - hidden.size}/{columns.length})</span>}</button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg shadow-xl p-2 min-w-[220px] max-h-[400px] overflow-auto flex flex-col gap-0.5">
          {columns.map(c => {
            const visible = !hidden.has(c.column_id)
            return (
              <button
                key={c.column_id}
                onClick={() => onToggle(c.column_id)}
                className="text-left px-2 py-1 rounded text-xs hover:bg-[var(--color-card-2)] flex items-center gap-2"
              >
                <span className="w-3 h-3 rounded-sm border border-[var(--color-card-2)] flex items-center justify-center text-[10px]">{visible ? '✓' : ''}</span>
                {c.title}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ViewsMenu({
  views, onSave, onLoad, onDelete,
}: {
  views: Array<{ name: string; state: ViewState }>
  onSave: () => void
  onLoad: (name: string) => void
  onDelete: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-1.5 text-xs hover:border-[var(--color-gold)] text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
      >Views {views.length > 0 && <span className="text-[var(--color-gold)]">({views.length})</span>}</button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg shadow-xl p-2 min-w-[220px] flex flex-col gap-0.5">
          {views.length === 0 && (
            <div className="text-[var(--color-cream-x)] text-xs px-2 py-1">No saved views</div>
          )}
          {views.map(v => (
            <div key={v.name} className="flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-[var(--color-card-2)] group">
              <button onClick={() => { onLoad(v.name); setOpen(false) }} className="flex-1 text-left">{v.name}</button>
              <button onClick={() => onDelete(v.name)} className="text-[var(--color-cream-x)] hover:text-red-400 opacity-0 group-hover:opacity-100">×</button>
            </div>
          ))}
          <button onClick={() => { onSave(); setOpen(false) }} className="text-left px-2 py-1 rounded text-xs text-[var(--color-gold)] hover:bg-[var(--color-card-2)] mt-1 border-t border-[var(--color-card-2)] pt-2">
            + Save current as view
          </button>
        </div>
      )}
    </div>
  )
}

function BulkActionBar({
  slug, count, groups, onMove, onDelete, onClear,
}: {
  slug: string
  count: number
  groups: string[]
  onMove: (g: string) => void
  onDelete: () => void
  onClear: () => void
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-card)] border border-[var(--color-gold)] rounded-xl shadow-2xl px-3 py-2 flex items-center gap-3 text-xs">
      <span className="text-[var(--color-cream)]">{count} selected</span>
      <span className="text-[var(--color-cream-x)]">·</span>
      <select
        onChange={e => { if (e.target.value) { onMove(e.target.value); e.currentTarget.value = '' } }}
        className="bg-[var(--color-card-2)] border border-[var(--color-card-2)] rounded px-2 py-1 text-xs outline-none"
        defaultValue=""
      >
        <option value="" disabled>Move to group…</option>
        {groups.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <button onClick={onDelete} className="text-red-400 hover:text-red-300">Delete</button>
      <button onClick={onClear} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)]">Clear</button>
    </div>
  )
}

function SortableHeader({
  title,
  colKey,
  sortKey,
  sortDir,
  onClick,
  sticky,
  width,
  onResizeStart,
  draggable,
  isDragging,
  isDragTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: {
  title: string
  colKey: string
  sortKey: string | null
  sortDir: SortDir
  onClick: () => void
  sticky?: boolean
  width: number
  onResizeStart: (e: React.MouseEvent) => void
  draggable?: boolean
  isDragging?: boolean
  isDragTarget?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}) {
  const active = sortKey === colKey
  const arrow = active ? (sortDir === 'asc' ? '↑' : '↓') : ''
  return (
    <th
      onClick={onClick}
      style={{ width, minWidth: width }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        'relative text-left text-[var(--color-cream-dim)] uppercase tracking-wide font-medium px-3 py-2 border-b border-r border-[var(--color-card-2)] whitespace-nowrap cursor-pointer hover:text-[var(--color-cream)] select-none truncate',
        sticky ? 'sticky left-0 z-30 bg-[var(--color-bg)] px-4' : '',
        active ? 'text-[var(--color-cream)]' : '',
        isDragging ? 'opacity-40' : '',
        isDragTarget ? 'shadow-[inset_3px_0_0_0_var(--color-gold)]' : '',
      ].join(' ')}
    >
      {title}{arrow && <span className="ml-1 text-[var(--color-gold)]">{arrow}</span>}
      <span
        onMouseDown={onResizeStart}
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[var(--color-gold)] active:bg-[var(--color-gold)]"
        aria-hidden
      />
    </th>
  )
}

function GroupBlockInner({
  group,
  rows,
  dataColumns,
  slug,
  totalCols,
  collapsed,
  onToggleCollapse,
  applyLocalChange,
  applyLocalAdd,
  applyLocalDelete,
  bulkIds,
  toggleBulk,
  bulkAllInGroup,
  onOpen,
  onOpenLinked,
  isDragging,
  isDragTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: {
  group: string
  rows: BoardItem[]
  dataColumns: BoardColumn[]
  slug: string
  totalCols: number
  collapsed: boolean
  onToggleCollapse: () => void
  applyLocalChange: (itemId: string, columnId: string, columnType: string, newText: string | null) => void
  applyLocalAdd: (itemId: string, name: string, group: string) => void
  applyLocalDelete: (itemId: string) => void
  bulkIds: Set<string>
  toggleBulk: (itemId: string) => void
  bulkAllInGroup: (rows: BoardItem[], on: boolean) => void
  onOpen: (itemId: string) => void
  onOpenLinked?: (itemId: string) => void
  isDragging?: boolean
  isDragTarget?: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}) {
  const allChecked = rows.length > 0 && rows.every(r => bulkIds.has(r.monday_item_id))
  const someChecked = rows.some(r => bulkIds.has(r.monday_item_id))
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [, startTransition] = useTransition()

  function commitAdd() {
    const name = draft.trim()
    if (!name) { setAdding(false); setDraft(''); return }
    setAdding(false)
    setDraft('')
    startTransition(async () => {
      try {
        const res = await addBoardItem({ slug, groupTitle: group, name })
        applyLocalAdd(res.monday_item_id, name, group)
      } catch (e) {
        console.error('Add failed', e)
      }
    })
  }

  function handleDelete(itemId: string, name: string | null) {
    if (!confirm(`Delete "${name || 'this item'}"?`)) return
    applyLocalDelete(itemId)
    startTransition(async () => {
      try {
        await deleteBoardItem({ slug, itemId })
      } catch (e) {
        console.error('Delete failed', e)
      }
    })
  }

  return (
    <>
      <tr
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={[
          isDragging ? 'opacity-40' : '',
          isDragTarget ? 'shadow-[inset_0_3px_0_0_var(--color-gold)]' : '',
        ].join(' ')}
      >
        <td
          colSpan={totalCols}
          className="sticky left-0 bg-[var(--color-card)] text-[var(--color-cream)] px-4 py-1 text-[13px] font-semibold uppercase tracking-wide border-b border-t border-[var(--color-card-2)] cursor-grab active:cursor-grabbing"
        >
          <span className="inline-flex items-center gap-2">
            <span className="text-[var(--color-cream-x)] text-[10px] select-none" title="Drag to reorder group">⋮⋮</span>
            <input
              type="checkbox"
              checked={allChecked}
              ref={el => { if (el) el.indeterminate = !allChecked && someChecked }}
              onChange={(e) => bulkAllInGroup(rows, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="accent-[var(--color-gold)] cursor-pointer"
              aria-label="Select all in group"
            />
            <span className="cursor-pointer" onClick={onToggleCollapse}>
              <span className="inline-block w-3 text-[var(--color-cream-dim)]">{collapsed ? '▸' : '▾'}</span>
              <span className="text-[var(--color-gold)] ml-1">{group}</span>
              <span className="ml-2 text-[var(--color-cream-x)]">{rows.length}</span>
            </span>
          </span>
        </td>
      </tr>
      {!collapsed && rows.map(row => (
        <tr
          key={row.monday_item_id}
          className="group hover:bg-[var(--color-card)]"
        >
          <td className="sticky left-0 z-10 bg-[var(--color-bg)] group-hover:bg-[var(--color-card)] px-4 py-0.5 border-b border-r border-[var(--color-card-2)] whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkIds.has(row.monday_item_id)}
                onChange={() => toggleBulk(row.monday_item_id)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Select row"
                className={[
                  'accent-[var(--color-gold)] cursor-pointer',
                  bulkIds.has(row.monday_item_id) ? '' : 'opacity-0 group-hover:opacity-100',
                ].join(' ')}
              />
              <button
                onClick={() => onOpen(row.monday_item_id)}
                className="text-[var(--color-cream-x)] hover:text-[var(--color-gold)] text-xs flex-shrink-0"
                aria-label="View more"
                title="View more"
              >▸</button>
              <div className="flex-1 min-w-0">
                <EditableCell
                  slug={slug}
                  itemId={row.monday_item_id}
                  col={{ column_id: 'name', title: 'Name', column_type: 'text', position: 0, settings: {} }}
                  cell={{ type: 'text', text: row.name, value: null }}
                  onLocalChange={(t) => applyLocalChange(row.monday_item_id, 'name', 'name', t)}
                />
              </div>
            </div>
          </td>
          {dataColumns.map(c => (
            <td
              key={c.column_id}
              className="px-3 py-0.5 border-b border-r border-[var(--color-card-2)] align-middle overflow-hidden whitespace-nowrap text-ellipsis"
            >
              <EditableCell
                slug={slug}
                itemId={row.monday_item_id}
                col={c}
                cell={row.raw[c.column_id]}
                onLocalChange={(t) => applyLocalChange(row.monday_item_id, c.column_id, c.column_type, t)}
                onOpenLinked={onOpenLinked}
              />
            </td>
          ))}
          <td className="px-2 py-1 border-b border-[var(--color-card-2)] text-right opacity-0 group-hover:opacity-100">
            <button
              onClick={() => handleDelete(row.monday_item_id, row.name)}
              className="text-[var(--color-cream-x)] hover:text-red-400 text-xs"
              aria-label="Delete row"
            >
              ×
            </button>
          </td>
        </tr>
      ))}
      {!collapsed && (
        <tr>
          <td
            colSpan={totalCols}
            className="sticky left-0 bg-[var(--color-bg)] px-4 py-1 border-b border-[var(--color-card-2)]"
          >
            {adding ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commitAdd}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitAdd()
                  if (e.key === 'Escape') { setAdding(false); setDraft('') }
                }}
                placeholder={`New item in ${group}`}
                className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-gold)] text-[var(--color-cream)] rounded px-2 py-1 text-xs outline-none"
              />
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="text-[var(--color-cream-x)] hover:text-[var(--color-gold)] text-xs"
              >
                + Add item
              </button>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// Skip GroupBlock re-renders unless the data that visibly affects it changed.
// Callbacks always close over the latest parent state via setX(prev => ...),
// so it's safe to ignore them in equality.
const GroupBlock = memo(GroupBlockInner, (prev, next) =>
  prev.group        === next.group        &&
  prev.rows         === next.rows         &&
  prev.dataColumns  === next.dataColumns  &&
  prev.slug         === next.slug         &&
  prev.totalCols    === next.totalCols    &&
  prev.collapsed    === next.collapsed    &&
  prev.bulkIds      === next.bulkIds      &&
  prev.isDragging   === next.isDragging   &&
  prev.isDragTarget === next.isDragTarget
)
