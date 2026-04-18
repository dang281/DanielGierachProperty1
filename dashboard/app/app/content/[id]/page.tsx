'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContentItem, updateItem, updateStatus, deleteItem, saveReviewRequest, clearReviewRequest } from '@/lib/actions/content'
import { notifyAgentOfStatusChange } from '@/lib/actions/paperclip'
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
  { value: 'archived',  label: 'Archived' },
]

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<ContentItem>>({})
  const [isPending, startTransition] = useTransition()
  const [reviewText, setReviewText] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [agentNotified, setAgentNotified] = useState<string | null>(null)
  const [editingCaption, setEditingCaption] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')

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

  function startEditCaption() {
    setCaptionDraft(item!.caption ?? '')
    setEditingCaption(true)
  }

  function saveCaption() {
    startTransition(async () => {
      await updateItem(item!.id, { caption: captionDraft || null })
      setItem({ ...item!, caption: captionDraft || null })
      setEditingCaption(false)
    })
  }

  function cancelEditCaption() {
    setEditingCaption(false)
    setCaptionDraft('')
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
      // Notify the agent for meaningful status changes
      if (['scheduled', 'posted', 'rejected', 'ready'].includes(status)) {
        const notified = await notifyAgentOfStatusChange(
          item!.title,
          status,
          item!.visual_feedback ?? undefined,
        )
        if (notified) {
          const labels: Record<string, string> = {
            scheduled: 'approved',
            posted:    'marked as posted',
            rejected:  'rejected',
            ready:     'sent back for review',
          }
          setAgentNotified(labels[status] ?? status)
          setTimeout(() => setAgentNotified(null), 5000)
        }
      }
    })
  }

  function submitReview() {
    if (!reviewText.trim()) return
    startTransition(async () => {
      await saveReviewRequest(item!.id, reviewText.trim())
      setItem({ ...item!, visual_feedback: reviewText.trim() } as ContentItem)
      setReviewText('')
      setReviewSent(true)
      setTimeout(() => setReviewSent(false), 3000)
    })
  }

  function clearReview() {
    startTransition(async () => {
      await clearReviewRequest(item!.id)
      setItem({ ...item!, visual_feedback: null } as ContentItem)
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

      {/* Agent notification banner */}
      {agentNotified && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-sans"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
          <span className="text-base">✓</span>
          <span>Post <strong>{agentNotified}</strong> — agent notified and will acknowledge on next run.</span>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              <h1 className="text-[var(--color-cream)] font-serif text-xl">{item.title}</h1>
              <CopyButton text={item.title.includes(' - ') ? item.title.split(' - ').slice(1).join(' - ') : item.title} label="Copy title" />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={item.status} />
            <PlatformBadge platform={item.platform} />
            {item.content_pillar && <PillarBadge pillar={item.content_pillar} />}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {item.canva_url && !editing && (
            <button
              onClick={() => window.open(item.canva_url!, '_blank', 'noreferrer')}
              className="text-xs font-sans px-3 py-1.5 rounded-lg font-semibold transition-colors"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              Open in Canva ↗
            </button>
          )}
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

      {/* Visual — image preview + download */}
      {item.visual_thumbnail && (
        <VisualPanel url={item.visual_thumbnail} status={item.visual_status} title={item.title} />
      )}

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

        {/* Article Intro */}
        {item.objective && (
          <div className="flex flex-col gap-1.5 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(196,145,42,0.06)', border: '1px solid rgba(196,145,42,0.2)' }}>
            <div className="flex items-center justify-between">
              <label className="text-[var(--color-gold)] text-xs tracking-wide uppercase font-sans font-semibold">
                Article intro — paste into LinkedIn's "Tell your network…" field
              </label>
              <CopyButton text={item.objective} label="Copy intro" />
            </div>
            <p className="text-[var(--color-cream)] text-sm font-sans leading-relaxed">
              {item.objective}
            </p>
          </div>
        )}

        {/* Caption */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">Caption</label>
            <div className="flex items-center gap-2">
              {!editing && item.caption && !editingCaption && <CopyButton text={item.caption} normalise />}
              {!editing && !editingCaption && (
                <button
                  onClick={startEditCaption}
                  className="flex items-center gap-1 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(240,236,228,0.06)', color: 'var(--color-cream-dim)', border: '1px solid rgba(240,236,228,0.12)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              )}
              {editingCaption && (
                <>
                  <button
                    onClick={cancelEditCaption}
                    className="text-[11px] font-sans px-2.5 py-1 rounded-lg border border-[var(--color-border-w)] text-[var(--color-cream-dim)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCaption}
                    disabled={isPending}
                    className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'rgba(196,145,42,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(196,145,42,0.3)' }}
                  >
                    {isPending ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
          {editing ? (
            <textarea
              rows={6}
              value={form.caption ?? ''}
              onChange={e => handleChange('caption', e.target.value || null)}
              className={inputClass + ' resize-y'}
            />
          ) : editingCaption ? (
            <textarea
              rows={10}
              autoFocus
              value={captionDraft}
              onChange={e => setCaptionDraft(e.target.value)}
              className={inputClass + ' resize-y'}
            />
          ) : (
            <p className="text-[var(--color-cream)] text-sm font-sans whitespace-pre-wrap leading-relaxed">
              {item.caption ?? <span className="text-[var(--color-cream-x)]">No caption</span>}
            </p>
          )}
        </div>

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

      {/* Request Changes */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">
            Request Changes
          </label>
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Visible to agent on next run</span>
        </div>

        {/* Pending review — show existing request */}
        {item.visual_feedback && (
          <div className="flex flex-col gap-2 rounded-lg border px-4 py-3"
            style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.25)' }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-sans text-[var(--color-cream)] leading-relaxed whitespace-pre-wrap flex-1">
                {item.visual_feedback}
              </p>
              <button
                onClick={clearReview}
                disabled={isPending}
                className="text-[10px] font-sans text-[var(--color-cream-x)] hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
              >
                Clear
              </button>
            </div>
            <p className="text-[10px] font-sans" style={{ color: 'rgba(251,191,36,0.7)' }}>
              Pending — agent will pick this up on the next run
            </p>
          </div>
        )}

        {/* New request textarea */}
        {!item.visual_feedback && (
          <div className="flex flex-col gap-2">
            <textarea
              rows={3}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Describe the changes you want the agent to make..."
              className={inputClass + ' resize-y'}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
                The agent will update the post and clear this request when done.
              </p>
              <button
                onClick={submitReview}
                disabled={isPending || !reviewText.trim()}
                className="text-xs font-sans px-4 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-40 flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.3)' }}
              >
                {reviewSent ? 'Sent!' : isPending ? 'Sending...' : 'Send to Agent'}
              </button>
            </div>
          </div>
        )}
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

// Normalise caption for clipboard: collapse hashtag lines into a single space-separated line
function normaliseForCopy(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  const hashtagBlock: string[] = []
  for (const line of lines) {
    if (line.trim().startsWith('#')) {
      hashtagBlock.push(line.trim())
    } else {
      if (hashtagBlock.length) {
        out.push(hashtagBlock.join(' '))
        hashtagBlock.length = 0
      }
      out.push(line)
    }
  }
  if (hashtagBlock.length) out.push(hashtagBlock.join(' '))
  // Collapse 3+ consecutive blank lines to 2
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function CopyButton({ text, label = 'Copy caption', normalise = false }: { text: string; label?: string; normalise?: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(normalise ? normaliseForCopy(text) : text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[11px] font-sans font-semibold px-2.5 py-1 rounded-lg transition-all"
      style={copied
        ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
        : { background: 'rgba(196,145,42,0.12)', color: 'var(--color-gold)', border: '1px solid rgba(196,145,42,0.25)' }
      }
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

function VisualPanel({ url, status, title }: { url: string; status: string; title: string }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      const obj  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = obj
      a.download = title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(obj)
    } catch {
      window.open(url, '_blank', 'noreferrer')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-xl overflow-hidden">
      <img src={url} alt="Post visual" className="w-full object-contain max-h-80 bg-[#0a0806]" />
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-w)]">
        <span className="text-[11px] font-sans text-[var(--color-cream-x)]">
          {status === 'approved' ? 'Visual approved' : 'Visual ready — download to post'}
        </span>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          style={{ background: 'rgba(196,145,42,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(196,145,42,0.3)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {downloading ? 'Downloading…' : 'Download image'}
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
