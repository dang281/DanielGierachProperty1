'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  quickActionCallConnected,
  quickActionCallNvml,
  quickActionSetFollowUp,
} from '@/lib/actions/activity'
import { getLinkedItem } from '@/lib/actions/board'
import ItemDetailPanel from '@/app/app/board/[slug]/ItemDetailPanel'
import type { BoardColumn, BoardItem } from '@/app/app/board/[slug]/types'
import type { TodayItem } from './today-types'

function daysAgo(d: string | null): number {
  if (!d) return 0
  const date = new Date(d)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / 86400000)
}

const SLUG_LABEL: Record<string, string> = {
  pipeline:  'Properties',
  leads:     'Buyers',
  referrals: 'Referrals',
}

export default function TodayView({
  overdue,
  today,
  saturday,
  todayDateLabel,
}: {
  overdue: TodayItem[]
  today: TodayItem[]
  saturday: TodayItem[]
  todayDateLabel: string
}) {
  const router = useRouter()
  const [detail, setDetail] = useState<{ slug: string; item: BoardItem; columns: BoardColumn[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actedIds, setActedIds] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  async function openDetail(slug: string, itemId: string) {
    setDetailLoading(true)
    try {
      const res = await getLinkedItem(itemId)
      if (res) setDetail({ slug: res.slug, item: res.item as BoardItem, columns: res.columns as BoardColumn[] })
    } catch (e) { console.error(e) }
    finally { setDetailLoading(false) }
  }

  function markActed(slug: string, itemId: string) {
    setActedIds(prev => new Set(prev).add(`${slug}:${itemId}`))
  }

  function visible(items: TodayItem[]) {
    return items.filter(i => !actedIds.has(`${i.slug}:${i.monday_item_id}`))
  }

  function quickConnected(item: TodayItem) {
    markActed(item.slug, item.monday_item_id)
    startTransition(async () => {
      try { await quickActionCallConnected({ slug: item.slug, itemId: item.monday_item_id }) }
      catch (e) { console.error(e) }
    })
  }
  function quickNvml(item: TodayItem) {
    markActed(item.slug, item.monday_item_id)
    startTransition(async () => {
      try { await quickActionCallNvml({ slug: item.slug, itemId: item.monday_item_id }) }
      catch (e) { console.error(e) }
    })
  }
  function quickSnooze(item: TodayItem, days: number) {
    markActed(item.slug, item.monday_item_id)
    const d = new Date()
    d.setDate(d.getDate() + days)
    const iso = d.toISOString().slice(0, 10)
    startTransition(async () => {
      try { await quickActionSetFollowUp({ slug: item.slug, itemId: item.monday_item_id, date: iso }) }
      catch (e) { console.error(e) }
    })
  }

  const overdueV  = visible(overdue)
  const todayV    = visible(today)
  const saturdayV = visible(saturday)
  const total     = overdueV.length + todayV.length + saturdayV.length

  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-5 border-b border-[var(--color-card-2)] flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif">Today</h1>
          <p className="text-[var(--color-cream-dim)] text-sm">{todayDateLabel}</p>
        </div>
        <div className="text-sm text-[var(--color-cream-dim)]">
          <span className="text-[var(--color-cream)] text-2xl font-serif mr-2">{total}</span>
          {total === 1 ? 'item' : 'items'} to action
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-6">
        <Section
          title="Overdue"
          subtitle="Follow-up date has passed"
          accent="#ef4444"
          items={overdueV}
          openDetail={openDetail}
          quickConnected={quickConnected}
          quickNvml={quickNvml}
          quickSnooze={quickSnooze}
          showDaysAgo
        />
        <Section
          title="Due today"
          subtitle="Follow up today"
          accent="#f59e0b"
          items={todayV}
          openDetail={openDetail}
          quickConnected={quickConnected}
          quickNvml={quickNvml}
          quickSnooze={quickSnooze}
        />
        <Section
          title="Saturday calls"
          subtitle="Tagged SATURDAY CALL on NVML"
          accent="#16a34a"
          items={saturdayV}
          openDetail={openDetail}
          quickConnected={quickConnected}
          quickNvml={quickNvml}
          quickSnooze={quickSnooze}
        />
        {total === 0 && (
          <div className="text-center py-16 text-[var(--color-cream-dim)]">
            <div className="text-2xl font-serif mb-2">All caught up</div>
            <div className="text-sm">No follow-ups due today.</div>
            <button
              onClick={() => router.push('/app/board/pipeline')}
              className="mt-4 text-[var(--color-gold)] text-sm hover:underline"
            >Open Properties pipeline →</button>
          </div>
        )}
      </div>

      {detailLoading && (
        <div className="fixed top-6 right-6 bg-[var(--color-card)] border border-[var(--color-card-2)] rounded-lg px-3 py-2 text-xs text-[var(--color-cream-dim)] z-50 shadow-xl">
          Loading…
        </div>
      )}

      {detail && (
        <ItemDetailPanel
          item={detail.item}
          columns={detail.columns}
          slug={detail.slug}
          onClose={() => setDetail(null)}
          onLocalChange={() => { /* refresh from server when panel closes via revalidate */ }}
          onOpenLinked={(id) => openDetail(detail.slug, id)}
        />
      )}
    </div>
  )
}

function Section({
  title, subtitle, accent, items, openDetail, quickConnected, quickNvml, quickSnooze, showDaysAgo,
}: {
  title: string
  subtitle: string
  accent: string
  items: TodayItem[]
  openDetail: (slug: string, itemId: string) => void
  quickConnected: (item: TodayItem) => void
  quickNvml: (item: TodayItem) => void
  quickSnooze: (item: TodayItem, days: number) => void
  showDaysAgo?: boolean
}) {
  if (items.length === 0) return null
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--color-cream)]">
          {title} <span className="text-[var(--color-cream-x)] ml-1">{items.length}</span>
        </h2>
        <span className="text-[var(--color-cream-x)] text-xs">{subtitle}</span>
      </div>
      <ul className="divide-y divide-[var(--color-card-2)] border border-[var(--color-card-2)] rounded-lg overflow-hidden">
        {items.map(item => (
          <li
            key={`${item.slug}:${item.monday_item_id}`}
            className="bg-[var(--color-card)] hover:bg-[var(--color-card-2)] px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-sm"
          >
            <div className="sm:col-span-5 min-w-0">
              <button
                onClick={() => openDetail(item.slug, item.monday_item_id)}
                className="text-left font-medium text-[var(--color-cream)] hover:text-[var(--color-gold)] truncate block w-full"
              >
                {item.name || '(no name)'}
              </button>
              <div className="text-[10px] text-[var(--color-cream-x)] mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="uppercase tracking-wide">{SLUG_LABEL[item.slug] ?? item.slug}</span>
                {item.stage && <span>· {item.stage}</span>}
                {item.nvml && <span className="text-[#cab641]">· {item.nvml}</span>}
              </div>
            </div>
            <div className="sm:col-span-3 text-xs text-[var(--color-cream-dim)]">
              {item.phone && <a href={`tel:${item.phone}`} className="text-[var(--color-gold)] hover:underline whitespace-nowrap block">{item.phone}</a>}
              {item.email && <a href={`mailto:${item.email}`} className="text-[var(--color-cream-x)] hover:text-[var(--color-cream)] truncate block">{item.email}</a>}
            </div>
            <div className="sm:col-span-2 text-xs">
              {item.follow_up && (
                <div className="text-[var(--color-cream-dim)]">
                  {showDaysAgo ? <span className="text-red-400">{daysAgo(item.follow_up)}d overdue</span> : 'Today'}
                </div>
              )}
            </div>
            <div className="sm:col-span-2 flex gap-2 sm:gap-1 justify-end">
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  className="sm:hidden bg-[#16a34a] text-white rounded px-4 py-2 text-sm font-medium"
                  title="Call"
                >📞</a>
              )}
              <button
                onClick={() => quickConnected(item)}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-[10px] font-medium leading-tight"
                title="Called — Connected (resets NVML, follow-up +7d)"
              >✓ Connected</button>
              <button
                onClick={() => quickNvml(item)}
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white rounded px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-[10px] font-medium leading-tight"
                title="Called — NVML (increments, follow-up +2d)"
              >NVML</button>
              <button
                onClick={() => quickSnooze(item, 3)}
                className="bg-[var(--color-card-2)] hover:bg-[#3a3631] text-[var(--color-cream)] rounded px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-[10px] font-medium leading-tight"
                title="Snooze to +3 days"
              >+3d</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
