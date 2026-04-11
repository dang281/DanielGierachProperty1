import { STATUS_LABEL, STATUS_COLOUR, STATUS_BG, STATUS_BORDER, type Status } from '@/types/content'

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      style={{
        color: STATUS_COLOUR[status],
        background: STATUS_BG[status],
        border: `1px solid ${STATUS_BORDER[status]}`,
      }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans"
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
