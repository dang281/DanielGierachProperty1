import Link from 'next/link'
import { getContentItems } from '@/lib/actions/content'
import type { ContentItem, Status } from '@/types/content'
import { STATUS_COLOUR, STATUS_BG, STATUS_BORDER, PLATFORM_COLOUR } from '@/types/content'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  // Week starts Monday; find Monday on/before firstDay
  const startDow = (firstDay.getDay() + 6) % 7 // 0=Mon
  const start = new Date(year, month, 1 - startDow)

  const lastDay = new Date(year, month + 1, 0)
  const endDow = (lastDay.getDay() + 6) % 7
  const end = new Date(year, month + 1, 6 - endDow)

  const weeks: Date[][] = []
  const cur = new Date(start)
  while (cur <= end) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>
}) {
  const sp = await searchParams
  const now = new Date()
  const year  = sp.y ? parseInt(sp.y)  : now.getFullYear()
  const month = sp.m ? parseInt(sp.m) - 1 : now.getMonth()

  const items = await getContentItems()
  const today = todayAEST()

  // Group by date
  const byDate: Record<string, ContentItem[]> = {}
  for (const item of items) {
    if (!item.scheduled_date) continue
    if (!byDate[item.scheduled_date]) byDate[item.scheduled_date] = []
    byDate[item.scheduled_date].push(item)
  }

  const weeks = getMonthGrid(year, month)

  const monthLabel = new Date(year, month).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  const prevDate = month === 0 ? `?y=${year - 1}&m=12` : `?y=${year}&m=${month}`
  const nextDate = month === 11 ? `?y=${year + 1}&m=1` : `?y=${year}&m=${month + 2}`

  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--color-cream)] font-serif text-xl">{monthLabel}</h1>
        <div className="flex gap-2">
          <Link
            href={prevDate}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            Prev
          </Link>
          <Link
            href={`/app/calendar`}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            Today
          </Link>
          <Link
            href={nextDate}
            className="text-[var(--color-cream-dim)] text-sm font-sans px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border-w)] hover:border-[var(--color-border)] transition-colors"
          >
            Next
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-[var(--color-border-w)] overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border-w)] bg-[var(--color-card)]">
          {DOW.map(d => (
            <div
              key={d}
              className="text-center text-[var(--color-cream-x)] text-xs font-sans py-2 tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 border-b border-[var(--color-border-w)] last:border-b-0"
          >
            {week.map((date, di) => {
              const dateStr = date.toLocaleDateString('en-CA')
              const isThisMonth = date.getMonth() === month
              const isToday = dateStr === today
              const dayItems = byDate[dateStr] || []

              return (
                <div
                  key={di}
                  className={`min-h-[90px] p-2 border-r border-[var(--color-border-w)] last:border-r-0 ${
                    !isThisMonth ? 'opacity-30' : ''
                  }`}
                  style={isToday ? { background: 'rgba(196,145,42,0.06)' } : {}}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-sans w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-[var(--color-gold)] text-[var(--color-bg)] font-semibold'
                          : 'text-[var(--color-cream-dim)]'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {dayItems.map(item => (
                      <Link
                        key={item.id}
                        href={`/app/content/${item.id}`}
                        style={{
                          color: STATUS_COLOUR[item.status as Status],
                          background: STATUS_BG[item.status as Status],
                          borderColor: STATUS_BORDER[item.status as Status],
                          borderLeftColor: PLATFORM_COLOUR[item.platform],
                        }}
                        className="text-[10px] font-sans leading-tight px-1.5 py-1 rounded border-l-2 border truncate block hover:opacity-80 transition-opacity"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
