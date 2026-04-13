import { PLATFORM_COLOUR, type Platform } from '@/types/content'

const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin:  'LinkedIn',
  instagram: 'Instagram',
  facebook:  'Facebook',
  seo:       'Website',
}

export default function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      style={{
        color: PLATFORM_COLOUR[platform],
        background: `${PLATFORM_COLOUR[platform]}18`,
        border: `1px solid ${PLATFORM_COLOUR[platform]}40`,
      }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans"
    >
      {PLATFORM_LABEL[platform]}
    </span>
  )
}
