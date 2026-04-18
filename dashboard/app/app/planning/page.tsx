import { getContentItems } from '@/lib/actions/content'
import { getSeoSchedule } from '@/lib/actions/seo-schedule'
import CalendarClient from '../calendar/CalendarClient'
import type { ContentItem } from '@/types/content'

export default async function SocialMediaPage() {
  const [socialItems, seoItems] = await Promise.all([
    getContentItems(),
    getSeoSchedule(),
  ])

  const allItems: ContentItem[] = [...socialItems, ...seoItems as ContentItem[]]
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1"
          style={{ color: 'var(--color-gold)' }}>
          Social Media
        </p>
        <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
          Content Calendar
        </h1>
      </div>
      <CalendarClient
        items={allItems}
        today={today}
        defaultView="month"
        defaultPlatform="linkedin"
      />
    </div>
  )
}
