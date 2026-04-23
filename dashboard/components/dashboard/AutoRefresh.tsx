'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({
  intervalMs = 30_000,
  showButton = false,
}: {
  intervalMs?: number
  showButton?: boolean
}) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const refresh = useCallback(() => {
    setRefreshing(true)
    router.refresh()
    setLastRefreshed(new Date())
    setTimeout(() => setRefreshing(false), 800)
  }, [router])

  useEffect(() => {
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  if (!showButton) return null

  return (
    <button
      onClick={refresh}
      disabled={refreshing}
      title={lastRefreshed ? `Last refreshed ${lastRefreshed.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Refresh'}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-sans font-medium disabled:opacity-50"
      style={{
        color: 'var(--color-cream-x)',
        background: 'transparent',
        borderColor: 'var(--color-border-w)',
      }}
    >
      <svg
        width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={refreshing ? 'animate-spin' : ''}
        style={{ transition: 'transform 0.2s' }}
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
      </svg>
      {refreshing ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}
