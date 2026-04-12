import { getContentItems } from '@/lib/actions/content'
import AutoRefresh from '@/components/dashboard/AutoRefresh'
import CalendarClient from './calendar/CalendarClient'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

export default async function DashboardPage() {
  const allItems = await getContentItems()
  const today    = todayAEST()

  // LinkedIn only — Facebook and Instagram are paused
  const items = allItems.filter(i => i.platform === 'linkedin')

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh intervalMs={30_000} />
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--color-cream)] font-serif text-xl">Content Calendar</h1>
      </div>
      <CalendarClient items={items} today={today} defaultView="twoweek" />
    </div>
  )
}
