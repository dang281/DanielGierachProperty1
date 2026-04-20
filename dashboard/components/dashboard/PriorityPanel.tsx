import Link from 'next/link'
import type { ContentItem } from '@/types/content'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriorityCard {
  colour:      string
  urgent:      boolean
  icon:        string
  label:       string
  value:       string | number
  description: string
  href:        string
  cta:         string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PriorityPanel({
  items,
  today,
}: {
  items: ContentItem[]
  today: string
}) {
  // ── 1. Approvals needed — all ready LinkedIn posts ────────────────────────
  const readyPosts   = items.filter(i => i.status === 'ready' && i.platform === 'linkedin')
  const postingToday = items.filter(i => i.scheduled_date === today && i.status === 'scheduled')
  const approvalsUrgent = readyPosts.length > 0 || postingToday.length > 0

  let approvalLabel       = 'Nothing to approve'
  let approvalDescription = 'All LinkedIn posts reviewed. Next batch queues Sunday.'
  if (postingToday.length > 0) {
    approvalLabel       = `${postingToday.length} post${postingToday.length > 1 ? 's' : ''} publishing today`
    approvalDescription = `${postingToday[0].title}${postingToday.length > 1 ? ` + ${postingToday.length - 1} more` : ''}`
  } else if (readyPosts.length > 0) {
    approvalLabel       = `${readyPosts.length} LinkedIn post${readyPosts.length > 1 ? 's' : ''} need review`
    approvalDescription = readyPosts[0].title + (readyPosts.length > 1 ? ` + ${readyPosts.length - 1} more` : '')
  }

  // ── 2. Publishing health ──────────────────────────────────────────────────
  const overdue = items.filter(
    i => i.scheduled_date && i.scheduled_date < today && i.status !== 'posted' && i.status !== 'rejected',
  )
  const scheduledDates = new Set(
    items
      .filter(i => i.scheduled_date && (i.status === 'ready' || i.status === 'scheduled'))
      .map(i => i.scheduled_date!),
  )
  let nextGapDate: string | null = null
  for (let d = 1; d <= 14; d++) {
    const dt  = new Date(today + 'T00:00:00')
    dt.setDate(dt.getDate() + d)
    const iso = dt.toLocaleDateString('en-CA')
    if (!scheduledDates.has(iso)) { nextGapDate = iso; break }
  }

  const healthUrgent = overdue.length > 0
  let healthLabel       = 'Publishing on track'
  let healthDescription = nextGapDate
    ? `Next gap: ${new Date(nextGapDate + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}`
    : 'Fully covered next 14 days'
  if (overdue.length > 0) {
    healthLabel       = `${overdue.length} overdue post${overdue.length > 1 ? 's' : ''}`
    healthDescription = `${overdue[0].title} — was ${new Date(overdue[0].scheduled_date! + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
  }

  // ── 3. Visuals backlog ──────────────────────────────────────────────────────
  const upcoming30 = new Date(today + 'T00:00:00')
  upcoming30.setDate(upcoming30.getDate() + 30)
  const upcoming30Str = upcoming30.toLocaleDateString('en-CA')
  const missingVisual = items.filter(
    i =>
      i.visual_status === 'needed' &&
      (i.status === 'ready' || i.status === 'scheduled') &&
      i.scheduled_date &&
      i.scheduled_date >= today &&
      i.scheduled_date <= upcoming30Str,
  )
  const visualsUrgent = missingVisual.length > 0
  const mostUrgentVisual = missingVisual[0]
  let visualLabel       = 'All visuals ready'
  let visualDescription = 'Every upcoming post has a visual attached.'
  if (missingVisual.length > 0) {
    visualLabel       = `${missingVisual.length} visual${missingVisual.length > 1 ? 's' : ''} needed`
    visualDescription = mostUrgentVisual
      ? `${mostUrgentVisual.title}${missingVisual.length > 1 ? ` + ${missingVisual.length - 1} more` : ''}`
      : `${missingVisual.length} post${missingVisual.length > 1 ? 's' : ''} missing visuals`
  }

  const cards: PriorityCard[] = [
    {
      colour:      postingToday.length > 0 ? 'var(--color-gold)' : approvalsUrgent ? '#a855f7' : '#22c55e',
      urgent:      approvalsUrgent,
      icon:        postingToday.length > 0 ? '📤' : approvalsUrgent ? '📝' : '✓',
      label:       approvalLabel,
      value:       postingToday.length > 0 ? postingToday.length : readyPosts.length,
      description: approvalDescription,
      href:        '/app/social',
      cta:         approvalsUrgent ? 'Review now →' : 'View social →',
    },
    {
      colour:      healthUrgent ? '#ef4444' : '#22c55e',
      urgent:      healthUrgent,
      icon:        healthUrgent ? '⚠' : '📅',
      label:       healthLabel,
      value:       overdue.length > 0 ? overdue.length : nextGapDate ? '14d' : '✓',
      description: healthDescription,
      href:        '/app/calendar',
      cta:         healthUrgent ? 'Fix now →' : 'View calendar →',
    },
    {
      colour:      visualsUrgent ? '#f97316' : '#22c55e',
      urgent:      visualsUrgent,
      icon:        visualsUrgent ? '🎨' : '✓',
      label:       visualLabel,
      value:       missingVisual.length > 0 ? missingVisual.length : '✓',
      description: visualDescription,
      href:        mostUrgentVisual ? `/app/content/${mostUrgentVisual.id}` : '/app/social',
      cta:         visualsUrgent ? 'Open first →' : 'View social →',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <Link key={i} href={card.href} className="group block">
          <div
            className="rounded-xl bg-[var(--color-card)] border p-4 h-full flex flex-col gap-3 transition-all hover:shadow-md"
            style={{
              borderColor: card.urgent ? `${card.colour}50` : 'var(--color-border-w)',
              borderTop:   card.urgent ? `2px solid ${card.colour}` : undefined,
              background:  card.urgent ? `${card.colour}08` : 'var(--color-card)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {card.urgent && (
                  <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: card.colour }} />
                )}
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider" style={{ color: card.colour }}>
                  {card.label}
                </span>
              </div>
              {typeof card.value === 'number' && card.value > 0 ? (
                <span
                  className="text-[22px] font-sans font-bold tabular-nums leading-none flex-shrink-0"
                  style={{ color: card.colour }}
                >
                  {card.value}
                </span>
              ) : card.value === '✓' ? (
                <span className="text-[18px] leading-none flex-shrink-0" style={{ color: card.colour }}>✓</span>
              ) : (
                <span className="text-[14px] font-sans font-bold leading-none flex-shrink-0" style={{ color: card.colour }}>
                  {card.value}
                </span>
              )}
            </div>

            <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-snug line-clamp-2 flex-1">
              {card.description}
            </p>

            <span
              className="text-[10px] font-sans font-semibold group-hover:underline"
              style={{ color: card.colour }}
            >
              {card.cta}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
