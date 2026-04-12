import type { MarketIntel } from '@/types/reports'
import { CATEGORY_COLOUR, CATEGORY_LABEL } from '@/types/reports'

// ─── Setup notice ─────────────────────────────────────────────────────────────

function SetupNotice() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-w)] bg-[var(--color-card)] p-5 flex flex-col gap-2">
      <p className="text-[12px] font-sans font-semibold text-[var(--color-cream-dim)]">
        Market Intelligence Feed
      </p>
      <p className="text-[11px] font-sans text-[var(--color-cream-x)] leading-relaxed">
        The social media agent will log high-value market insights here during each daily scout run. Items
        appear automatically after running the{' '}
        <code className="text-[10px] bg-[rgba(255,255,255,0.06)] px-1 py-0.5 rounded">market-intel.sql</code>{' '}
        migration and adding the intel-writing step to the agent instructions.
      </p>
    </div>
  )
}

// ─── Intel card ───────────────────────────────────────────────────────────────

function IntelCard({ item }: { item: MarketIntel }) {
  const catColour = CATEGORY_COLOUR[item.category ?? ''] ?? '#9ca3af'
  const catLabel  = CATEGORY_LABEL[item.category ?? ''] ?? item.category ?? 'General'

  const dateLabel = item.published_date
    ? new Date(item.published_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    : new Date(item.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 transition-colors hover:border-[var(--color-border)]"
      style={{
        borderColor:  item.post_worthy ? `${catColour}40` : 'var(--color-border-w)',
        background:   item.post_worthy ? `${catColour}06` : 'var(--color-card)',
        borderLeft:   `3px solid ${catColour}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: catColour, background: `${catColour}18` }}
          >
            {catLabel}
          </span>
          {item.post_worthy && (
            <span
              className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}
            >
              ✦ Post Worthy
            </span>
          )}
          <span className="text-[9px] font-sans text-[var(--color-cream-x)]">
            Relevance {item.relevance_score}/10
          </span>
        </div>
        <span className="text-[9px] font-sans text-[var(--color-cream-x)] flex-shrink-0">{dateLabel}</span>
      </div>

      {/* Title */}
      <p className="text-[12px] font-sans font-semibold text-[var(--color-cream)] leading-snug">
        {item.title}
      </p>

      {/* Summary */}
      <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed line-clamp-3">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3">
        {item.suburbs && item.suburbs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.suburbs.slice(0, 3).map(s => (
              <span key={s} className="text-[8px] font-sans px-1.5 py-0.5 rounded-full border"
                style={{ color: 'var(--color-cream-x)', borderColor: 'var(--color-border-w)' }}>
                {s}
              </span>
            ))}
            {item.suburbs.length > 3 && (
              <span className="text-[8px] font-sans text-[var(--color-cream-x)]">+{item.suburbs.length - 3}</span>
            )}
          </div>
        )}
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-[9px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors flex-shrink-0"
          >
            Source ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MarketIntelFeed({ items }: { items: MarketIntel[] }) {
  if (items.length === 0) return <SetupNotice />

  const postWorthy = items.filter(i => i.post_worthy)
  const other      = items.filter(i => !i.post_worthy)

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
          Market Intelligence
        </h2>
        {postWorthy.length > 0 && (
          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full"
            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}>
            {postWorthy.length} post-worthy
          </span>
        )}
        <div className="flex-1 h-px bg-[var(--color-border-w)]" />
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Last 7 days</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Post-worthy first */}
        {postWorthy.map(item => <IntelCard key={item.id} item={item} />)}
        {other.map(item => <IntelCard key={item.id} item={item} />)}
      </div>
    </section>
  )
}
