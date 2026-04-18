import { getOpportunities, getLatestAgentReport } from '@/lib/actions/growth'
import { createClient } from '@/lib/supabase/server'
import InitiativeCard from '@/components/dashboard/InitiativeCard'
import type { ContentItem } from '@/types/content'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Australia/Brisbane',
  })
}

/** Derive 3 observations from real content_items data — CEO voice, not bullet points */
function buildObservations(items: ContentItem[]): string[] {
  const today = new Date(Date.now() + 10 * 60 * 60 * 1000) // Brisbane UTC+10
  today.setHours(0, 0, 0, 0)

  const in30Days = new Date(today)
  in30Days.setDate(today.getDate() + 30)

  const scheduledNext30 = items.filter(i => {
    if (i.status !== 'scheduled' || !i.scheduled_date) return false
    const d = new Date(i.scheduled_date)
    return d >= today && d <= in30Days
  })

  const readyToSchedule = items.filter(i => i.status === 'ready')

  // Find the next scheduled post
  const nextPost = scheduledNext30.sort((a, b) =>
    (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? '')
  )[0]

  const observations: string[] = []

  // Observation 1 — pipeline health
  if (scheduledNext30.length === 0) {
    observations.push(
      'The content pipeline is empty for the next 30 days. Nothing is scheduled right now — this is the highest priority gap to close before anything else moves forward.'
    )
  } else if (scheduledNext30.length < 4) {
    observations.push(
      `There are ${scheduledNext30.length} post${scheduledNext30.length === 1 ? '' : 's'} scheduled in the next 30 days. That's a thin pipeline — the target is at least one per week to maintain visibility with Inner East homeowners.`
    )
  } else {
    observations.push(
      `${scheduledNext30.length} posts are scheduled across the next 30 days. The pipeline is in reasonable shape — the focus now is quality, not volume.`
    )
  }

  // Observation 2 — next post or ready items
  if (nextPost) {
    const dateLabel = formatDate(nextPost.scheduled_date!)
    observations.push(
      `The next post out is "${nextPost.title}", scheduled for ${dateLabel}. Make sure the visual is approved before it goes — that's the one thing that holds up otherwise ready content.`
    )
  } else if (readyToSchedule.length > 0) {
    observations.push(
      `There are ${readyToSchedule.length} post${readyToSchedule.length === 1 ? '' : 's'} marked ready but not yet scheduled. These should be placed on the calendar this week so nothing falls through the gap.`
    )
  } else {
    observations.push(
      'There are no posts in the ready queue right now. The next step is to move content from idea to ready so the pipeline has material to work with.'
    )
  }

  // Observation 3 — gap detection or general rhythm note
  if (scheduledNext30.length >= 4) {
    // Check for week-long gaps in scheduled content
    const scheduledDates = scheduledNext30
      .map(i => new Date(i.scheduled_date!))
      .sort((a, b) => a.getTime() - b.getTime())

    let longestGap = 0
    for (let i = 1; i < scheduledDates.length; i++) {
      const gap = (scheduledDates[i].getTime() - scheduledDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      if (gap > longestGap) longestGap = gap
    }

    if (longestGap > 10) {
      observations.push(
        `There's a ${Math.round(longestGap)}-day gap in the schedule. Consistent posting matters more than perfect content — a quiet week breaks the momentum that's been built.`
      )
    } else {
      observations.push(
        'The posting cadence looks consistent — no major gaps detected. The compound effect of regular visibility is what turns content into appraisal requests over time.'
      )
    }
  } else {
    observations.push(
      'Consistent weekly presence is what builds the mental association between Daniel and Inner East property in homeowners\' minds. One missed week is fine; two in a row starts to erode it.'
    )
  }

  return observations
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GrowthPage() {
  const supabase = await createClient()

  const [opportunities, latestReport, contentResult] = await Promise.all([
    getOpportunities(),
    getLatestAgentReport(),
    supabase
      .from('content_items')
      .select('*')
      .order('scheduled_date', { ascending: true, nullsFirst: false }),
  ])

  const contentItems = (contentResult.data ?? []) as ContentItem[]
  const observations = buildObservations(contentItems)

  // Count of posts scheduled in next 30 days for funnel stat
  const today = new Date(Date.now() + 10 * 60 * 60 * 1000)
  today.setHours(0, 0, 0, 0)
  const in30Days = new Date(today)
  in30Days.setDate(today.getDate() + 30)

  const scheduledCount = contentItems.filter(i => {
    if (i.status !== 'scheduled' || !i.scheduled_date) return false
    const d = new Date(i.scheduled_date)
    return d >= today && d <= in30Days
  }).length

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-2xl text-[var(--color-cream)]">Growth Command Centre</h1>
        <span className="text-sm font-sans text-[var(--color-cream-x)]">
          {opportunities.length} active initiative{opportunities.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Section A — CEO Brief ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionHeader label="CEO Brief" />

        {latestReport ? (
          /* Report exists — show the brief */
          <div className="rounded-2xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-6 flex flex-col gap-5">
            {/* Week label */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">
                Week of {formatDate(latestReport.week_start)}
              </span>
              {/* Mini stats */}
              <div className="flex items-center gap-4">
                {[
                  { label: 'Created',   value: latestReport.posts_created,   color: '#c4912a' },
                  { label: 'Published', value: latestReport.posts_published,  color: '#22c55e' },
                  { label: 'Rejected',  value: latestReport.posts_rejected,   color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-end">
                    <span className="font-sans text-lg font-bold tabular-nums" style={{ color: s.color }}>
                      {s.value}
                    </span>
                    <span className="font-sans text-[10px] text-[var(--color-cream-x)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full border-t border-[var(--color-border-w)]" />

            {/* Brief body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {latestReport.what_worked && (
                <BriefField
                  label="What worked"
                  text={latestReport.what_worked}
                  accent="#22c55e"
                />
              )}
              {latestReport.what_didnt_work && (
                <BriefField
                  label="What didn't work"
                  text={latestReport.what_didnt_work}
                  accent="#f97316"
                />
              )}
              {latestReport.next_week_focus && (
                <BriefField
                  label="Focus next week"
                  text={latestReport.next_week_focus}
                  accent="#c4912a"
                />
              )}
            </div>
          </div>
        ) : (
          /* No report yet — empty state styled as incoming message */
          <div className="rounded-2xl border border-dashed border-[var(--color-border-w)] bg-[var(--color-card)] p-6 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'var(--color-gold)' }}
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">
                Awaiting weekly brief
              </span>
            </div>
            <p className="font-sans text-[14px] text-[var(--color-cream-dim)] leading-relaxed max-w-xl">
              No weekly brief yet. The agent will brief you here each Sunday with what worked, what didn't, and what to focus on next week.
            </p>
          </div>
        )}

        {/* Auto-generated observations — always shown */}
        <div className="flex flex-col gap-3">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)] px-1">
            Content pipeline snapshot
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {observations.map((obs, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] px-4 py-3.5"
              >
                <p className="font-sans text-[13px] text-[var(--color-cream-dim)] leading-relaxed">
                  {obs}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section B — Active Initiatives ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SectionHeader label="Active Initiatives" />
          <a
            href="#"
            className="font-sans text-[12px] font-medium text-[var(--color-cream-dim)] hover:text-[var(--color-cream)] border border-[var(--color-border-w)] rounded-lg px-3 py-1.5 transition-colors"
          >
            + Add initiative
          </a>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-w)] bg-[var(--color-card)] px-6 py-10 text-center">
            <p className="font-sans text-[14px] text-[var(--color-cream-dim)]">
              No active initiatives. Add one to start tracking what's in play.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunities.map(o => (
              <InitiativeCard key={o.id} opportunity={o} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section C — Lead Funnel Health ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionHeader label="Lead Funnel Health" />

        <div className="rounded-2xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-5 flex flex-col gap-5">
          {/* WIP notice */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: '#c4912a', background: 'rgba(196,145,42,0.12)' }}
            >
              In progress
            </span>
            <span className="font-sans text-[12px] text-[var(--color-cream-x)]">
              Connect your CRM or update manually to close the loop between content and listings.
            </span>
          </div>

          {/* Four stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Content — real data */}
            <FunnelStat
              label="Content"
              value={scheduledCount.toString()}
              sub="posts next 30 days"
              color="#22c55e"
              live
            />
            {/* Visibility — manual */}
            <FunnelStat label="Visibility" value="—" sub="track manually" color="#6b7280" />
            {/* Enquiries — manual */}
            <FunnelStat label="Enquiries" value="—" sub="track manually" color="#6b7280" />
            {/* Listings — manual */}
            <FunnelStat label="Listings" value="—" sub="track manually" color="#6b7280" />
          </div>
        </div>
      </section>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cream-x)]">
        {label}
      </h2>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

function BriefField({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <p className="font-sans text-[13px] text-[var(--color-cream-dim)] leading-relaxed">{text}</p>
    </div>
  )
}

function FunnelStat({
  label,
  value,
  sub,
  color,
  live = false,
}: {
  label: string
  value: string
  sub: string
  color: string
  live?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card-2)] px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-cream-x)]">
          {label}
        </span>
        {live && (
          <span
            className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.15)' }}
          >
            live
          </span>
        )}
      </div>
      <span className="font-sans text-3xl font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="font-sans text-[11px] text-[var(--color-cream-x)]">{sub}</span>
    </div>
  )
}
