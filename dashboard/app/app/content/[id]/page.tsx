'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContentItem, updateItem, updateStatus, deleteItem } from '@/lib/actions/content'
import type { ContentItem, Platform, Pillar, Status } from '@/types/content'
import StatusBadge from '@/components/dashboard/StatusBadge'
import PlatformBadge from '@/components/dashboard/PlatformBadge'
import PillarBadge from '@/components/dashboard/PillarBadge'

const PLATFORMS: Platform[] = ['linkedin', 'instagram', 'facebook']
const PILLARS: { value: Pillar; label: string }[] = [
  { value: 'seller',    label: 'Seller' },
  { value: 'authority', label: 'Authority' },
  { value: 'suburb',    label: 'Suburb' },
  { value: 'proof',     label: 'Social Proof' },
  { value: 'buyer',     label: 'Buyer' },
]
const STATUSES: { value: Status; label: string }[] = [
  { value: 'idea',      label: 'Idea' },
  { value: 'ready',     label: 'Ready for Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'posted',    label: 'Posted' },
  { value: 'rejected',  label: 'Rejected' },
]

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<ContentItem>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    params.then(({ id }) => {
      getContentItem(id).then(data => {
        if (data) {
          setItem(data)
          setForm(data)
        }
      })
    })
  }, [params])

  if (!item) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-[var(--color-cream-dim)] text-sm font-sans">Loading...</p>
      </div>
    )
  }

  function handleChange(field: keyof ContentItem, value: string | number | null) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function save() {
    startTransition(async () => {
      await updateItem(item!.id, {
        title:           form.title,
        platform:        form.platform,
        content_pillar:  form.content_pillar,
        caption:         form.caption,
        status:          form.status,
        scheduled_date:  form.scheduled_date,
        scheduled_time:  form.scheduled_time,
        objective:       form.objective,
        target_audience: form.target_audience,
        expected_outcome:form.expected_outcome,
        cta:             form.cta,
        destination_url: form.destination_url,
        notes:           form.notes,
        score:           form.score,
      })
      setItem({ ...item!, ...form } as ContentItem)
      setEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm('Delete this post permanently?')) return
    startTransition(async () => {
      await deleteItem(item!.id)
      router.push('/app')
    })
  }

  function setStatus(status: Status) {
    startTransition(async () => {
      await updateStatus(item!.id, status)
      setItem({ ...item!, status })
    })
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/app"
        className="text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] text-xs font-sans transition-colors w-fit"
      >
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {editing ? (
            <input
              value={form.title ?? ''}
              onChange={e => handleChange('title', e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border-w)] text-[var(--color-cream)] font-serif text-xl rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-gold)] transition-colors w-full"
            />
          ) : (
            <h1 className="text-[var(--color-cream)] font-serif text-xl">{item.title}</h1>
          )}
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={item.status} />
            <PlatformBadge platform={item.platform} />
            {item.content_pillar && <PillarBadge pillar={item.content_pillar} />}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setForm(item) }}
                className="text-xs font-sans px-3 py-1.5 rounded-lg border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:border-[var(--color-border)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={isPending}
                className="text-xs font-sans px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-sans px-3 py-1.5 rounded-lg border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:border-[var(--color-border)] transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Status actions */}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          {STATUSES.filter(s => s.value !== item.status).map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              disabled={isPending}
              className="text-xs font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] text-[var(--color-cream-dim)] hover:border-[var(--color-border)] transition-colors disabled:opacity-50"
            >
              Mark as {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Main fields */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-xl p-6 flex flex-col gap-5">

        {/* Platform + Pillar + Status row */}
        {editing && (
          <div className="grid grid-cols-3 gap-4">
            <Field label="Platform">
              <select
                value={form.platform ?? ''}
                onChange={e => handleChange('platform', e.target.value)}
                className={selectClass}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Field label="Pillar">
              <select
                value={form.content_pillar ?? ''}
                onChange={e => handleChange('content_pillar', e.target.value || null)}
                className={selectClass}
              >
                <option value="">None</option>
                {PILLARS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status ?? 'idea'}
                onChange={e => handleChange('status', e.target.value)}
                className={selectClass}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* Date + Time + Score */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Scheduled Date">
            {editing ? (
              <input
                type="date"
                value={form.scheduled_date ?? ''}
                onChange={e => handleChange('scheduled_date', e.target.value || null)}
                className={inputClass}
              />
            ) : (
              <Value>{item.scheduled_date ?? 'Not set'}</Value>
            )}
          </Field>
          <Field label="Scheduled Time">
            {editing ? (
              <input
                type="time"
                value={form.scheduled_time ?? ''}
                onChange={e => handleChange('scheduled_time', e.target.value || null)}
                className={inputClass}
              />
            ) : (
              <Value>{item.scheduled_time ?? 'Not set'}</Value>
            )}
          </Field>
          <Field label="Score (1-10)">
            {editing ? (
              <input
                type="number"
                min={1}
                max={10}
                value={form.score ?? ''}
                onChange={e => handleChange('score', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass}
              />
            ) : (
              <Value>{item.score != null ? `${item.score}/10` : 'Not set'}</Value>
            )}
          </Field>
        </div>

        {/* Poll Options — shown prominently for polls */}
        {Array.isArray(item.platform_variants) && item.platform_variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">
              Poll Options — copy and paste into LinkedIn
            </label>
            <div className="flex flex-col gap-2">
              {item.platform_variants.map((opt, i) => (
                <PollOption key={i} index={i} text={opt} />
              ))}
            </div>
          </div>
        )}

        {/* Caption */}
        <Field label="Caption">
          {editing ? (
            <textarea
              rows={6}
              value={form.caption ?? ''}
              onChange={e => handleChange('caption', e.target.value || null)}
              className={inputClass + ' resize-y'}
            />
          ) : (
            <p className="text-[var(--color-cream)] text-sm font-sans whitespace-pre-wrap leading-relaxed">
              {item.caption ?? <span className="text-[var(--color-cream-x)]">No caption</span>}
            </p>
          )}
        </Field>

        {/* Objective */}
        <Field label="Objective">
          {editing ? (
            <input
              value={form.objective ?? ''}
              onChange={e => handleChange('objective', e.target.value || null)}
              className={inputClass}
            />
          ) : (
            <Value>{item.objective}</Value>
          )}
        </Field>

        {/* Target Audience */}
        <Field label="Target Audience">
          {editing ? (
            <input
              value={form.target_audience ?? ''}
              onChange={e => handleChange('target_audience', e.target.value || null)}
              className={inputClass}
            />
          ) : (
            <Value>{item.target_audience}</Value>
          )}
        </Field>

        {/* Expected Outcome */}
        <Field label="Expected Outcome">
          {editing ? (
            <input
              value={form.expected_outcome ?? ''}
              onChange={e => handleChange('expected_outcome', e.target.value || null)}
              className={inputClass}
            />
          ) : (
            <Value>{item.expected_outcome}</Value>
          )}
        </Field>

        {/* CTA + URL */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Call to Action">
            {editing ? (
              <input
                value={form.cta ?? ''}
                onChange={e => handleChange('cta', e.target.value || null)}
                className={inputClass}
              />
            ) : (
              <Value>{item.cta}</Value>
            )}
          </Field>
          <Field label="Destination URL">
            {editing ? (
              <input
                type="url"
                value={form.destination_url ?? ''}
                onChange={e => handleChange('destination_url', e.target.value || null)}
                className={inputClass}
              />
            ) : (
              <Value>{item.destination_url}</Value>
            )}
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes">
          {editing ? (
            <textarea
              rows={3}
              value={form.notes ?? ''}
              onChange={e => handleChange('notes', e.target.value || null)}
              className={inputClass + ' resize-y'}
            />
          ) : (
            <Value>{item.notes}</Value>
          )}
        </Field>
      </div>

      {/* Metadata + Delete */}
      <div className="flex items-center justify-between">
        <p className="text-[var(--color-cream-x)] text-xs font-sans">
          Created {new Date(item.created_at).toLocaleDateString('en-AU')}
          {item.updated_at !== item.created_at &&
            ` · Updated ${new Date(item.updated_at).toLocaleDateString('en-AU')}`}
        </p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-500 hover:text-red-400 text-xs font-sans transition-colors disabled:opacity-50"
        >
          Delete post
        </button>
      </div>
    </div>
  )
}

function PollOption({ index, text }: { index: number; text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-w)] px-4 py-2.5"
      style={{ background: 'var(--color-bg)' }}>
      <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-sans font-bold"
        style={{ background: 'rgba(196,145,42,0.15)', color: 'var(--color-gold)' }}>
        {index + 1}
      </span>
      <span className="flex-1 text-sm font-sans text-[var(--color-cream)]">{text}</span>
      <button
        onClick={copy}
        className="text-[10px] font-sans font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0"
        style={copied
          ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
          : { background: 'rgba(196,145,42,0.12)', color: 'var(--color-gold)' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

const inputClass =
  'w-full bg-[var(--color-bg)] border border-[var(--color-border-w)] text-[var(--color-cream)] rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-[var(--color-gold)] transition-colors'

const selectClass =
  'w-full bg-[var(--color-bg)] border border-[var(--color-border-w)] text-[var(--color-cream)] rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-[var(--color-gold)] transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">
        {label}
      </label>
      {children}
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--color-cream)] text-sm font-sans">
      {children ?? <span className="text-[var(--color-cream-x)]">Not set</span>}
    </p>
  )
}
