import Link from 'next/link'
import type { ContentItem } from '@/types/content'
import { PLATFORM_COLOUR } from '@/types/content'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

// ISO week key: e.g. "2026-W15"
function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const week = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function mondayOfWeek(weekKey: string): Date {
  const [year, w] = weekKey.split('-W')
  const jan4 = new Date(parseInt(year), 0, 4)
  const jan4Dow = jan4.getDay() || 7
  const mon = new Date(jan4)
  mon.setDate(jan4.getDate() - (jan4Dow - 1) + (parseInt(w) - 1) * 7)
  return mon
}

function shortWeekLabel(weekKey: string): string {
  const mon = mondayOfWeek(weekKey)
  return mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

// ─── Component ────────────────────────────────────────────────────────────────

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: 'LI',
  facebook: 'FB',
}

export default function PublishingHealth({ items }: { items: ContentItem[] }) {
  const today = todayAEST()

  // ── 1. Activity chart: posts created & published per week (last 8 weeks) ──
  const currentWeek = isoWeekKey(today)
  const allWeeks: string[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today + 'T00:00:00')
    d.setDate(d.getDate() - i * 7)
    allWeeks.push(isoWeekKey(d.toLocaleDateString('en-CA')))
  }

  const createdByWeek: Record<string, number> = {}
  const publishedByWeek: Record<string, number> = {}
  for (const w of allWeeks) {
    createdByWeek[w] = 0
    publishedByWeek[w] = 0
  }

  for (const item of items) {
    if (item.created_at) {
      const wk = isoWeekKey(item.created_at.slice(0, 10))
      if (wk in createdByWeek) createdByWeek[wk]++
    }
    if (item.status === 'posted' && item.scheduled_date) {
      const wk = isoWeekKey(item.scheduled_date)
      if (wk in publishedByWeek) publishedByWeek[wk]++
    }
  }

  const maxBar = Math.max(1, ...allWeeks.map(w => Math.max(createdByWeek[w], publishedByWeek[w])))

  // ── 2. Overdue posts: scheduled_date < today, not posted/rejected ──
  const overdue = items.filter(
    i =>
      i.scheduled_date &&
      i.scheduled_date < today &&
      i.status !== 'posted' &&
      i.status !== 'rejected',
  )

  // ── 3. Upcoming posts missing visuals (next 30 days, ready/scheduled) ──
  const thirtyDays = new Date(today + 'T00:00:00')
  thirtyDays.setDate(thirtyDays.getDate() + 30)
  const thirtyStr = thirtyDays.toLocaleDateString('en-CA')

  const missingVisuals = items.filter(
    i =>
      i.visual_status === 'needed' &&
      (i.status === 'ready' || i.status === 'scheduled') &&
      i.scheduled_date &&
      i.scheduled_date <= thirtyStr &&
      i.scheduled_date >= today,
  )

  // ── 4. Coverage gaps: days in next 14 with no content ──
  const scheduledDates = new Set(
    items
      .filter(i => i.scheduled_date && (i.status === 'ready' || i.status === 'scheduled'))
      .map(i => i.scheduled_date!),
  )
  const gapDays: string[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today + 'T00:00:00')
    d.setDate(d.getDate() + i)
    const ds = d.toLocaleDateString('en-CA')
    if (!scheduledDates.has(ds)) {
      gapDays.push(ds)
    }
  }
  // Consolidate into streaks and take first 5 single-day gaps
  const singleGaps = gapDays.slice(0, 5)

  // ── 5. Publishing rate (posted this week vs last week) ──
  const thisWeekPublished = publishedByWeek[currentWeek] ?? 0
  const lastWeekKey = allWeeks[allWeeks.length - 2]
  const lastWeekPublished = publishedByWeek[lastWeekKey] ?? 0

  // ── 6. Platform posting frequency (last 30 days, posted only) ──
  const posted30 = items.filter(
    i =>
      i.status === 'posted' &&
      i.scheduled_date &&
      i.scheduled_date >= new Date(new Date(today).getTime() - 30 * 86400000)
        .toLocaleDateString('en-CA'),
  )
  const liCount = posted30.filter(i => i.platform === 'linkedin').length
  const fbCount = posted30.filter(i => i.platform === 'facebook').length
  const totalPosted30 = posted30.length

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-dim)]">
          Publishing Health
        </h2>
        <div className="flex-1 h-px bg-[var(--color-border-w)]" />
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Last 8 weeks</span>
      </div>

      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Left: Activity chart ── */}
          <div>
            <p className="text-[11px] font-sans font-semibold text-[var(--color-cream)] mb-4">
              Content created vs published
            </p>

            {/* Bars */}
            <div className="flex items-end gap-1.5 h-[80px]">
              {allWeeks.map((wk, i) => {
                const created   = createdByWeek[wk] ?? 0
                const published = publishedByWeek[wk] ?? 0
                const isCurrentWeek = wk === currentWeek
                const createdH  = Math.round((created   / maxBar) * 72)
                const pubH      = Math.round((published / maxBar) * 72)

                return (
                  <div key={wk} className="flex-1 flex flex-col items-center gap-0.5 group">
                    {/* Tooltip on hover */}
                    <div className="relative flex items-end gap-0.5 h-[72px] w-full">
                      {/* Created bar */}
                      <div
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(createdH, created > 0 ? 4 : 0)}px`,
                          background: isCurrentWeek
                            ? 'rgba(196,145,42,0.6)'
                            : 'rgba(196,145,42,0.25)',
                          alignSelf: 'flex-end',
                        }}
                        title={`Week of ${shortWeekLabel(wk)}: ${created} created`}
                      />
                      {/* Published bar */}
                      <div
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(pubH, published > 0 ? 4 : 0)}px`,
                          background: isCurrentWeek ? '#22c55e' : 'rgba(34,197,94,0.35)',
                          alignSelf: 'flex-end',
                        }}
                        title={`Week of ${shortWeekLabel(wk)}: ${published} published`}
                      />
                    </div>
                    <span
                      className="text-[8px] font-sans tabular-nums"
                      style={{
                        color: isCurrentWeek ? 'var(--color-gold)' : 'var(--color-cream-x)',
                        fontWeight: isCurrentWeek ? 700 : 400,
                      }}
                    >
                      {shortWeekLabel(wk).split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border-w)]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded-sm" style={{ background: 'rgba(196,145,42,0.5)' }} />
                <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded-sm" style={{ background: '#22c55e' }} />
                <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Published</span>
              </div>
              <div className="flex-1" />
              {/* Platform breakdown for last 30d */}
              {totalPosted30 > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-sans text-[var(--color-cream-x)]">30d published:</span>
                  <span className="text-[10px] font-sans font-semibold" style={{ color: '#0a66c2' }}>
                    {liCount} LI
                  </span>
                  <span className="text-[10px] font-sans font-semibold" style={{ color: '#1877f2' }}>
                    {fbCount} FB
                  </span>
                </div>
              )}
              {totalPosted30 === 0 && (
                <span className="text-[10px] font-sans text-[var(--color-cream-x)]">No posts published in 30 days</span>
              )}
            </div>
          </div>

          {/* ── Right: Action items ── */}
          <div className="flex flex-col gap-3">

            {/* Overdue */}
            <ActionBlock
              colour={overdue.length > 0 ? '#ef4444' : '#22c55e'}
              label="Overdue"
              description={
                overdue.length > 0
                  ? `${overdue.length} post${overdue.length > 1 ? 's' : ''} past scheduled date — not posted`
                  : 'Nothing overdue'
              }
              isEmpty={overdue.length === 0}
            >
              {overdue.slice(0, 3).map(item => (
                <ActionItem key={item.id} item={item} />
              ))}
              {overdue.length > 3 && (
                <Link href="/app/social" className="text-[10px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors">
                  + {overdue.length - 3} more →
                </Link>
              )}
            </ActionBlock>

            {/* Missing visuals */}
            <ActionBlock
              colour={missingVisuals.length > 0 ? '#f97316' : '#22c55e'}
              label="Missing visuals"
              description={
                missingVisuals.length > 0
                  ? `${missingVisuals.length} upcoming post${missingVisuals.length > 1 ? 's' : ''} need a design`
                  : 'All upcoming posts have designs'
              }
              isEmpty={missingVisuals.length === 0}
            >
              {missingVisuals.slice(0, 3).map(item => (
                <ActionItem key={item.id} item={item} showDate />
              ))}
              {missingVisuals.length > 3 && (
                <Link href="/app/social" className="text-[10px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors">
                  + {missingVisuals.length - 3} more →
                </Link>
              )}
            </ActionBlock>

            {/* Schedule gaps */}
            <ActionBlock
              colour={singleGaps.length > 5 ? '#9ca3af' : '#22c55e'}
              label="Schedule gaps (next 14 days)"
              description={
                gapDays.length === 14
                  ? 'Nothing scheduled for the next 14 days'
                  : gapDays.length > 0
                  ? `${gapDays.length} day${gapDays.length > 1 ? 's' : ''} with no content`
                  : 'Fully covered for the next 14 days'
              }
              isEmpty={gapDays.length === 0}
            >
              {singleGaps.slice(0, 4).map(ds => {
                const label = new Date(ds + 'T00:00:00').toLocaleDateString('en-AU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
                return (
                  <Link
                    key={ds}
                    href={`/app/calendar`}
                    className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--color-cream-x)] group-hover:bg-[var(--color-gold)] flex-shrink-0" />
                    <span className="text-[10px] font-sans text-[var(--color-cream-dim)]">{label}</span>
                    <span className="text-[10px] font-sans text-[var(--color-cream-x)] group-hover:text-[var(--color-gold)] ml-auto">Schedule →</span>
                  </Link>
                )
              })}
              {gapDays.length > 4 && (
                <span className="text-[10px] font-sans text-[var(--color-cream-x)]">
                  + {gapDays.length - 4} more gaps
                </span>
              )}
            </ActionBlock>

          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBlock({
  colour,
  label,
  description,
  isEmpty,
  children,
}: {
  colour: string
  label: string
  description: string
  isEmpty: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-2"
      style={{
        borderColor: isEmpty ? 'var(--color-border-w)' : `${colour}40`,
        background: isEmpty ? 'transparent' : `${colour}08`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: colour }}
        />
        <span
          className="text-[10px] font-sans font-bold uppercase tracking-wide"
          style={{ color: colour }}
        >
          {label}
        </span>
      </div>
      <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-tight">
        {description}
      </p>
      {!isEmpty && children && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[var(--color-border-w)]">
          {children}
        </div>
      )}
    </div>
  )
}

function ActionItem({
  item,
  showDate,
}: {
  item: ContentItem
  showDate?: boolean
}) {
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const PLATFORM_LABEL: Record<string, string> = { linkedin: 'LI', facebook: 'FB' }

  const dateStr = item.scheduled_date
    ? new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <Link
      href={`/app/content/${item.id}`}
      className="flex items-center gap-2 group hover:text-[var(--color-gold)] transition-colors"
    >
      <span
        className="text-[8px] font-sans font-bold uppercase w-4 flex-shrink-0"
        style={{ color: platformColour }}
      >
        {PLATFORM_LABEL[item.platform] ?? item.platform}
      </span>
      <span className="flex-1 text-[11px] font-sans text-[var(--color-cream)] truncate group-hover:text-[var(--color-gold)] transition-colors">
        {item.title}
      </span>
      {showDate && dateStr && (
        <span className="text-[10px] font-sans text-[var(--color-cream-x)] tabular-nums flex-shrink-0">
          {dateStr}
        </span>
      )}
      {!showDate && dateStr && (
        <span className="text-[10px] font-sans text-[#ef4444] tabular-nums flex-shrink-0">
          {dateStr}
        </span>
      )}
    </Link>
  )
}
