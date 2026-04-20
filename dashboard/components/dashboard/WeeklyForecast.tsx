import Link from 'next/link'
import type { ContentItem } from '@/types/content'
import { PLATFORM_COLOUR } from '@/types/content'

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: 'LI', facebook: 'FB',
}

const VISUAL_DOT: Record<string, { colour: string; label: string }> = {
  needed:         { colour: '#9ca3af', label: 'Visual needed'   },
  draft:          { colour: '#818cf8', label: 'Visual ready'    },
  needs_revision: { colour: '#f97316', label: 'Needs revision'  },
  approved:       { colour: '#22c55e', label: 'Visual approved' },
}

interface Day {
  iso:     string
  short:   string   // "Mon"
  display: string   // "Mon 14 Apr"
  isToday: boolean
}

interface Props {
  items: ContentItem[]
  days:  Day[]
}

export default function WeeklyForecast({ items, days }: Props) {
  const hasAny = days.some(d =>
    items.some(i => i.scheduled_date === d.iso)
  )

  return (
    <div>
      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayPosts = items
            .filter(i => i.scheduled_date === day.iso)
            .sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))

          return (
            <div key={day.iso} className="flex flex-col gap-1.5 min-w-0">
              {/* Day header */}
              <div
                className="rounded-lg px-2 py-1.5 text-center"
                style={day.isToday
                  ? { background: 'var(--color-gold)', }
                  : { background: 'rgba(28,25,23,0.04)' }
                }
              >
                <p
                  className="text-[10px] font-sans font-semibold uppercase tracking-wide leading-none"
                  style={{ color: day.isToday ? '#1c1917' : 'var(--color-cream-dim)' }}
                >
                  {day.short}
                </p>
                <p
                  className="text-[11px] font-sans font-bold leading-none mt-0.5 tabular-nums"
                  style={{ color: day.isToday ? '#1c1917' : 'var(--color-cream)' }}
                >
                  {new Date(day.iso + 'T00:00:00').getDate()}
                </p>
              </div>

              {/* Posts for this day */}
              {dayPosts.length === 0 ? (
                <div
                  className="flex-1 rounded-lg border border-dashed flex items-center justify-center py-3 min-h-[60px]"
                  style={{ borderColor: 'rgba(28,25,23,0.10)' }}
                >
                  <span className="text-[9px] font-sans text-[var(--color-cream-x)]">—</span>
                </div>
              ) : (
                dayPosts.map(item => {
                  const platformColour = PLATFORM_COLOUR[item.platform] ?? '#9ca3af'
                  const visual = VISUAL_DOT[item.visual_status] ?? VISUAL_DOT.needed

                  return (
                    <Link
                      key={item.id}
                      href={`/app/content/${item.id}`}
                      className="group flex flex-col gap-1 rounded-lg p-2 border border-[var(--color-border-w)] bg-[var(--color-card)] hover:shadow-sm transition-shadow"
                      style={{ borderLeft: `2px solid ${platformColour}` }}
                    >
                      {/* Platform + time */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-[9px] font-sans font-bold uppercase tracking-wide"
                          style={{ color: platformColour }}
                        >
                          {PLATFORM_LABEL[item.platform] ?? item.platform}
                        </span>
                        {item.scheduled_time && (
                          <span className="text-[9px] font-sans text-[var(--color-cream-x)] tabular-nums">
                            {item.scheduled_time}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-[10px] font-sans font-semibold text-[var(--color-cream)] leading-tight line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                        {item.title}
                      </p>

                      {/* Visual status */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: visual.colour }}
                        />
                        <span className="text-[9px] font-sans text-[var(--color-cream-x)] truncate">
                          {visual.label}
                        </span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      {!hasAny && (
        <p className="text-[12px] font-sans text-[var(--color-cream-x)] text-center py-6">
          Nothing scheduled this week.
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border-w)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ background: '#0a66c2' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">LinkedIn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ background: '#0866ff' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Facebook</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Visual approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9ca3af' }} />
          <span className="text-[10px] font-sans text-[var(--color-cream-x)]">Visual needed</span>
        </div>
        <Link href="/app/calendar" className="ml-auto text-[10px] font-sans font-semibold text-[var(--color-gold)] hover:underline">
          Full calendar →
        </Link>
      </div>
    </div>
  )
}
