'use client'

import { useState } from 'react'
import CalendarClient from '../calendar/CalendarClient'
import LibraryClient from './LibraryClient'
import ChangeRequests from './ChangeRequests'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import type { ContentItem } from '@/types/content'
import type { Issue } from '@/types/paperclip'

type ViewMode = 'calendar' | 'library'

export default function PlanningView({
  allItems,
  socialItems,
  today,
  pendingFeedback,
  issuesByPost,
}: {
  allItems: ContentItem[]       // calendar items (all platforms, no archived)
  socialItems: ContentItem[]    // LinkedIn + Facebook only (for library)
  today: string
  pendingFeedback: ContentItem[]
  issuesByPost: Record<string, Issue>
}) {
  const [view, setView] = useState<ViewMode>('calendar')

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1"
            style={{ color: 'var(--color-gold)' }}>
            Social Media
          </p>
          <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
            {view === 'calendar' ? 'Content Calendar' : 'Post Library'}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Calendar / Library toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--color-border-w)]"
            style={{ background: 'var(--color-card)' }}>
            {([
              { value: 'calendar' as ViewMode, label: 'Calendar', icon: '▦' },
              { value: 'library' as ViewMode, label: 'Library',  icon: '≡' },
            ]).map(tab => (
              <button
                key={tab.value}
                onClick={() => setView(tab.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-sans font-semibold transition-all"
                style={view === tab.value
                  ? { background: 'var(--color-gold)', color: '#1c1917' }
                  : { color: 'var(--color-cream-x)', background: 'transparent' }
                }
              >
                <span className="text-[10px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Manual refresh — calendar only */}
          {view === 'calendar' && <AutoRefresh intervalMs={60_000} showButton={true} />}
        </div>
      </div>

      {/* ── Change requests (both views) ── */}
      {pendingFeedback.length > 0 && (
        <ChangeRequests items={pendingFeedback} issuesByPost={issuesByPost} />
      )}

      {/* ── Main content ── */}
      {view === 'calendar' ? (
        <CalendarClient
          items={allItems}
          today={today}
          defaultView="month"
          defaultPlatform="linkedin"
        />
      ) : (
        <LibraryClient items={socialItems} />
      )}
    </div>
  )
}
