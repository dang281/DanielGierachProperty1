import { getContentItems } from '@/lib/actions/content'
import CalendarClient from './CalendarClient'

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })
}

export default async function CalendarPage() {
  const allItems = await getContentItems()
  const items = allItems.filter(i => i.platform !== 'instagram')
  const today = todayAEST()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--color-cream)] font-serif text-xl">Content Calendar</h1>
      </div>
      <CalendarClient items={items} today={today} />
    </div>
  )
}
