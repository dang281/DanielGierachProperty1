import { getContentItems } from '@/lib/actions/content'
import SocialClient from './SocialClient'
import AutoRefresh from '@/components/dashboard/AutoRefresh'

export default async function SocialPage() {
  const allItems = await getContentItems()
  const items = allItems.filter(i => i.platform !== 'instagram')

  return (
    <div className="flex flex-col gap-5">
      <AutoRefresh intervalMs={60_000} />
      <SocialClient items={items} />
    </div>
  )
}
