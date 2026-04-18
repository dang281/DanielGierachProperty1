import { getContentItems } from '@/lib/actions/content'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import AttentionBar from '@/components/dashboard/AttentionBar'
import WeeklyContentReview from '@/components/dashboard/WeeklyContentReview'
import { getIssues } from '@/lib/actions/paperclip'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

// Posting schedule: Tue/Wed/Thu = days 2/3/4
const POSTING_DAYS = new Set([2, 3, 4])

function nextNSlots(today: string, n: number): string[] {
  const slots: string[] = []
  const d = new Date(today + 'T00:00:00')
  while (slots.length < n) {
    d.setDate(d.getDate() + 1)
    if (POSTING_DAYS.has(d.getDay())) {
      slots.push(d.toLocaleDateString('en-CA'))
    }
  }
  return slots
}

export default async function DashboardPage() {
  const [allItems, issues] = await Promise.all([
    getContentItems(),
    getIssues(),
  ])

  const items = allItems.filter(i => i.platform === 'linkedin')
  const reviewItems = items.filter(i => i.status === 'ready')
  const today = todayAEST()

  // Content gap detection — next 6 posting slots with no scheduled post
  const scheduledDates = new Set(
    items.filter(i => i.scheduled_date).map(i => i.scheduled_date as string)
  )
  const upcomingSlots = nextNSlots(today, 6)
  const gapDates = upcomingSlots.filter(d => !scheduledDates.has(d))

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={30_000} />

      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--color-gold)' }}>
          Overview
        </p>
        <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
          Dashboard
        </h1>
      </div>

      <AttentionBar reviewItems={reviewItems} issues={issues} />

      {gapDates.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.3)' }}>
          <span className="text-sm" style={{ color: '#f97316' }}>⚠</span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-sans font-semibold" style={{ color: '#f97316' }}>
              {gapDates.length} upcoming slot{gapDates.length !== 1 ? 's' : ''} with no post scheduled
            </p>
            <p className="text-[10px] font-sans" style={{ color: 'var(--color-cream-x)' }}>
              {gapDates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })).join(', ')}
              {' · '}
              <a href="/app/planning" className="text-[var(--color-gold)] hover:underline">Open Schedule →</a>
            </p>
          </div>
        </div>
      )}

      <WeeklyContentReview initialItems={items} today={today} />
    </div>
  )
}
