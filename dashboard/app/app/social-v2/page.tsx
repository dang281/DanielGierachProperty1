import { getContentItems } from '@/lib/actions/content'
import SocialV2Client from './SocialV2Client'

export const dynamic = 'force-dynamic'

export default async function SocialV2Page() {
  const allItems = await getContentItems()
  const linkedIn = allItems.filter(i => i.platform === 'linkedin')
  return <SocialV2Client items={linkedIn} />
}
