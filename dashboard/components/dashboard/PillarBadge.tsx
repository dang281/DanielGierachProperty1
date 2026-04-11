import { PILLAR_COLOUR, type Pillar } from '@/types/content'

const PILLAR_LABEL: Record<Pillar, string> = {
  seller:    'Seller',
  authority: 'Authority',
  suburb:    'Suburb',
  proof:     'Social Proof',
  buyer:     'Buyer',
}

export default function PillarBadge({ pillar }: { pillar: Pillar }) {
  return (
    <span
      style={{
        color: PILLAR_COLOUR[pillar],
        background: `${PILLAR_COLOUR[pillar]}18`,
        border: `1px solid ${PILLAR_COLOUR[pillar]}35`,
      }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans"
    >
      {PILLAR_LABEL[pillar]}
    </span>
  )
}
