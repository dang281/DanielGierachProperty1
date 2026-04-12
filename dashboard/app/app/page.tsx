import Link from 'next/link'
import { getContentItems } from '@/lib/actions/content'
import { getAgents, getIssues } from '@/lib/actions/paperclip'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import WeeklyForecast from '@/components/dashboard/WeeklyForecast'
import PublishingHealth from '@/components/dashboard/PublishingHealth'
import {
  PipelineDonut, HorizBars, CoverageProgress,
  type PipelineSlice, type BarItem,
} from '@/components/dashboard/DashboardCharts'
import { PROPOSAL_LABEL_ID } from '@/types/paperclip'
import { PLATFORM_COLOUR } from '@/types/content'
import type { Issue } from '@/types/paperclip'
import type { ContentItem } from '@/types/content'

/* ── Suburb coverage ──────────────────────────────── */
const ALL_SUBURBS = [
  'annerley','ascot','balmoral','belmont','brisbane cbd','bulimba',
  'camp hill','cannon hill','carina heights','carina','carindale','coorparoo',
  'dutton park','east brisbane','fortitude valley','greenslopes','hamilton',
  'hawthorne','hemmant','holland park west','holland park','kangaroo point',
  'morningside','mount gravatt east','mount gravatt','murarrie','new farm',
  'norman park','paddington','seven hills','stones corner','tarragindi',
  'teneriffe','tingalpa','upper mount gravatt','west end','woolloongabba',
]
const PAGE_PAT    = [/suburb|landing page|seo.*page|page.*seo/]
const ARTICLE_PAT = [/insight|article|selling.*guide|guide.*selling|selling in/]
const SOCIAL_PAT  = [/social|instagram|facebook|linkedin|spotlight/]

function bestStatus(suburb: string, issues: Issue[], patterns: RegExp[]) {
  const s = suburb.toLowerCase()
  const slug = s.replace(/\s+/g, '-')
  const matches = issues.filter(i => {
    if (i.status === 'cancelled') return false
    const t = i.title.toLowerCase()
    return (t.includes(s) || t.includes(slug)) && patterns.some(p => p.test(t))
  })
  if (!matches.length) return null
  if (matches.some(i => i.status === 'done'))         return 'done'
  if (matches.some(i => i.status === 'needs_review')) return 'needs_review'
  if (matches.some(i => i.status === 'in_progress'))  return 'in_progress'
  return 'todo'
}

function coverageStats(issues: Issue[]) {
  let full = 0, partial = 0
  for (const suburb of ALL_SUBURBS) {
    const statuses = [
      bestStatus(suburb, issues, PAGE_PAT),
      bestStatus(suburb, issues, ARTICLE_PAT),
      bestStatus(suburb, issues, SOCIAL_PAT),
    ]
    const done = statuses.filter(s => s === 'done').length
    if (done === 3) full++
    else if (done > 0 || statuses.some(s => s && s !== 'todo')) partial++
  }
  return { total: ALL_SUBURBS.length, full, partial }
}

/* ── Date helpers ─────────────────────────────────── */
function todayAEST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

function weekDays() {
  const now   = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Brisbane' }))
  const today = now.toLocaleDateString('en-CA')
  const day   = now.getDay()
  const mon   = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(mon)
    d.setDate(mon.getDate() + i)
    const iso = d.toLocaleDateString('en-CA')
    return {
      iso,
      short:   d.toLocaleDateString('en-AU', { weekday: 'short' }),
      display: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }),
      isToday: iso === today,
    }
  })
}

/* ── Page ─────────────────────────────────────────── */
export default async function DashboardPage() {
  const [allItems, agents, issues] = await Promise.all([
    getContentItems(),
    getAgents(),
    getIssues(),
  ])

  const today = todayAEST()
  const items = allItems.filter(i => i.platform !== 'instagram')

  const ready     = items.filter(i => i.status === 'ready')
  const scheduled = items.filter(i => i.status === 'scheduled')
  const posted    = items.filter(i => i.status === 'posted')
  const ideas     = items.filter(i => i.status === 'idea')
  const rejected  = items.filter(i => i.status === 'rejected')

  const proposals      = issues.filter(i => i.labelIds.includes(PROPOSAL_LABEL_ID) && i.status !== 'cancelled' && i.status !== 'done')
  const activeAgents   = agents.filter(a => a.status === 'active')
  const needsVisual    = items.filter(i => i.visual_status === 'needed' && i.status !== 'rejected')
  const postingToday   = items.filter(i => i.scheduled_date === today && i.status === 'scheduled')
  const totalApprovals = ready.length + proposals.length

  const days          = weekDays()
  const thisWeekItems = items.filter(i =>
    i.scheduled_date != null &&
    i.scheduled_date >= days[0].iso &&
    i.scheduled_date <= days[6].iso
  )

  const coverage = coverageStats(issues)

  const pipelineData: PipelineSlice[] = [
    { name: 'Ready',     value: ready.length,     colour: '#a855f7' },
    { name: 'Scheduled', value: scheduled.length, colour: '#22c55e' },
    { name: 'Posted',    value: posted.length,     colour: '#3b82f6' },
    { name: 'Ideas',     value: ideas.length,      colour: '#9ca3af' },
    { name: 'Rejected',  value: rejected.length,   colour: '#ef4444' },
  ]

  const platformData: BarItem[] = [
    { name: 'LinkedIn', value: items.filter(i => i.platform === 'linkedin').length, colour: '#0a66c2' },
    { name: 'Facebook', value: items.filter(i => i.platform === 'facebook').length, colour: '#0866ff' },
  ]

  const pillarColours: Record<string, string> = {
    seller: '#c4912a', authority: '#3b82f6', suburb: '#22c55e', proof: '#a855f7', buyer: '#14b8a6',
  }
  const pillarData: BarItem[] = ['seller','authority','suburb','proof','buyer'].map(p => ({
    name:   p.charAt(0).toUpperCase() + p.slice(1),
    value:  items.filter(i => i.content_pillar === p).length,
    colour: pillarColours[p],
  }))

  const visualsApproved = items.filter(i => i.visual_status === 'approved').length

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh intervalMs={30_000} />

      {/* ── KPI TILES ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile value={items.length}          label="Total posts"     sub={`${posted.length} published · ${scheduled.length} scheduled`} colour="var(--color-gold)" />
        <KpiTile value={`${coverage.full}/${coverage.total}`} label="Suburbs covered" sub={`${coverage.partial} in progress`} colour="#22c55e" />
        <KpiTile value={totalApprovals}        label="Need approval"   sub={totalApprovals > 0 ? `${ready.length} posts · ${proposals.length} proposals` : 'All clear'} colour={totalApprovals > 0 ? '#a855f7' : 'var(--color-cream-x)'} urgent={totalApprovals > 0} href="#attention" />
        <KpiTile value={activeAgents.length}   label="Agents active"   sub={`${issues.filter(i => i.status === 'in_progress').length} tasks running`} colour="#22c55e" />
      </div>

      {/* ── CHARTS ROW ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Content pipeline" subtitle="All posts by status">
          <PipelineDonut data={pipelineData} total={items.length} />
        </ChartCard>

        <ChartCard title="Platform split" subtitle="Posts per platform">
          <HorizBars data={platformData} />
          <div className="border-t border-[var(--color-border-w)] my-4" />
          <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-x)] mb-3">Content pillars</p>
          <HorizBars data={pillarData} />
        </ChartCard>

        <ChartCard title="Coverage &amp; visuals" subtitle={`${coverage.full} of ${coverage.total} suburbs fully covered`}>
          <CoverageProgress total={coverage.total} full={coverage.full} partial={coverage.partial} />
          <div className="border-t border-[var(--color-border-w)] my-4" />
          <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--color-cream-x)] mb-3">Visual production</p>
          <HorizBars data={[
            { name: 'Approved', value: visualsApproved,   colour: '#22c55e' },
            { name: 'Needed',   value: needsVisual.length, colour: '#9ca3af' },
          ]} />
        </ChartCard>
      </div>

      {/* ── THIS WEEK ──────────────────────── */}
      <ChartCard
        title="This week's content"
        subtitle={`${days[0].display} — ${days[6].display} · ${thisWeekItems.length} posts`}
      >
        <WeeklyForecast items={thisWeekItems} days={days} />
      </ChartCard>

      {/* ── NEEDS ATTENTION + AGENTS ─────── */}
      <div id="attention" className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-4">

        {/* Attention panel */}
        <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border-w)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--color-border-w)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {totalApprovals > 0 && (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#a855f7' }} />
              )}
              <h2 className="text-[12px] font-sans font-semibold text-[var(--color-cream)]">
                Needs your attention
              </h2>
            </div>
            {totalApprovals > 0 && (
              <span className="text-[11px] font-sans px-2 py-0.5 rounded-full" style={{ color: '#a855f7', background: 'rgba(168,85,247,0.12)' }}>
                {totalApprovals} items
              </span>
            )}
          </div>

          {totalApprovals === 0 && postingToday.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-sans font-semibold" style={{ color: '#22c55e' }}>All clear</p>
              <p className="text-[11px] font-sans text-[var(--color-cream-x)] mt-1">Nothing needs your decision right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-w)]">

              {/* Posting today */}
              {postingToday.length > 0 && (
                <AttentionGroup
                  label="Publishing today"
                  count={postingToday.length}
                  colour="var(--color-gold)"
                  linkHref="/app/social"
                  linkLabel="View in Social"
                >
                  {postingToday.slice(0, 3).map(item => (
                    <AttentionRow key={item.id} item={item} />
                  ))}
                  {postingToday.length > 3 && (
                    <MoreLink href="/app/social" count={postingToday.length - 3} />
                  )}
                </AttentionGroup>
              )}

              {/* Posts ready */}
              {ready.length > 0 && (
                <AttentionGroup
                  label="Posts ready for review"
                  count={ready.length}
                  colour="#a855f7"
                  linkHref="/app/social"
                  linkLabel="Review all"
                >
                  {ready.slice(0, 3).map(item => (
                    <AttentionRow key={item.id} item={item} showApprove />
                  ))}
                  {ready.length > 3 && (
                    <MoreLink href="/app/social" count={ready.length - 3} />
                  )}
                </AttentionGroup>
              )}

              {/* Proposals */}
              {proposals.length > 0 && (
                <AttentionGroup
                  label="Project proposals"
                  count={proposals.length}
                  colour="#6366f1"
                  linkHref="/app/projects"
                  linkLabel="Review all"
                >
                  {proposals.slice(0, 2).map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-2.5">
                      <code className="text-[10px] font-mono text-[var(--color-cream-x)] flex-shrink-0">{p.identifier}</code>
                      <p className="flex-1 text-[12px] font-sans text-[var(--color-cream)] truncate">{p.title}</p>
                      <Link href="/app/projects" className="text-[10px] font-sans font-semibold flex-shrink-0" style={{ color: '#6366f1' }}>
                        Review →
                      </Link>
                    </div>
                  ))}
                  {proposals.length > 2 && (
                    <MoreLink href="/app/projects" count={proposals.length - 2} />
                  )}
                </AttentionGroup>
              )}
            </div>
          )}
        </div>

        {/* Agent status */}
        <AgentStatusPanel agents={agents} issues={issues} />
      </div>

      {/* ── PUBLISHING HEALTH ─────────── */}
      <PublishingHealth items={items} />

    </div>
  )
}

/* ── Sub-components ─────────────────────────────────── */

function KpiTile({ value, label, sub, colour, urgent, href }: {
  value: string | number; label: string; sub?: string
  colour: string; urgent?: boolean; href?: string
}) {
  const inner = (
    <div
      className="rounded-xl px-4 py-4 bg-[var(--color-card)] border border-[var(--color-border-w)] flex flex-col gap-1 hover:shadow-sm transition-shadow h-full"
      style={urgent ? { borderTop: `2px solid ${colour}` } : undefined}
    >
      <span className="text-[28px] leading-none font-sans font-bold tabular-nums" style={{ color: colour }}>
        {value}
      </span>
      <span className="text-[12px] font-sans font-semibold text-[var(--color-cream)] mt-0.5">{label}</span>
      {sub && <span className="text-[10px] font-sans text-[var(--color-cream-x)] leading-tight">{sub}</span>}
    </div>
  )
  return href ? <a href={href} className="block">{inner}</a> : inner
}

function ChartCard({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border-w)] p-5 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-sans font-semibold text-[var(--color-cream)]">{title}</p>
        <p className="text-[11px] font-sans text-[var(--color-cream-x)] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function AttentionGroup({ label, count, colour, linkHref, linkLabel, children }: {
  label: string; count: number; colour: string
  linkHref: string; linkLabel: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2 bg-[rgba(28,25,23,0.02)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase" style={{ color: colour }}>
            {label}
          </span>
          <span className="text-[10px] font-sans tabular-nums px-1.5 py-0.5 rounded-full" style={{ color: colour, background: colour + '18' }}>
            {count}
          </span>
        </div>
        <Link href={linkHref} className="text-[10px] font-sans font-semibold text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </div>
  )
}

function AttentionRow({ item, showApprove }: { item: ContentItem; showApprove?: boolean }) {
  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
  const PLATFORM_LABEL: Record<string, string> = { linkedin: 'LI', facebook: 'FB' }
  const dateStr = item.scheduled_date
    ? new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    : null

  return (
    <div className="flex items-center gap-3 px-5 py-2.5">
      <span
        className="text-[9px] font-sans font-bold uppercase tracking-wide w-5 flex-shrink-0"
        style={{ color: platformColour }}
      >
        {PLATFORM_LABEL[item.platform] ?? item.platform}
      </span>
      <Link
        href={`/app/content/${item.id}`}
        className="flex-1 text-[12px] font-sans text-[var(--color-cream)] truncate hover:text-[var(--color-gold)] transition-colors"
      >
        {item.title}
      </Link>
      {dateStr && (
        <span className="text-[10px] font-sans text-[var(--color-cream-x)] tabular-nums flex-shrink-0">{dateStr}</span>
      )}
      {showApprove && (
        <Link
          href="/app/social"
          className="text-[10px] font-sans font-semibold flex-shrink-0"
          style={{ color: '#a855f7' }}
        >
          Review →
        </Link>
      )}
    </div>
  )
}

function MoreLink({ href, count }: { href: string; count: number }) {
  return (
    <div className="px-5 py-2">
      <Link
        href={href}
        className="text-[11px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-gold)] transition-colors"
      >
        + {count} more — view all →
      </Link>
    </div>
  )
}
