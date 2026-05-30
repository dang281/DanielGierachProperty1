'use client'

import { useTransition } from 'react'
import { approveOpportunity } from '@/lib/actions/ceo-opportunities'

export default function ApproveOpportunityButton({
  weekKey,
  number,
  approved,
}: {
  weekKey: string
  number: number
  approved: boolean
}) {
  const [pending, startTransition] = useTransition()

  if (approved) {
    return (
      <span
        className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg"
        style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}
      >
        ✓ Approved
      </span>
    )
  }

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => approveOpportunity(weekKey, number))}
      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
      style={{
        borderColor: 'var(--color-border-w)',
        color: 'var(--color-cream-dim)',
        background: 'var(--color-card-2)',
      }}
    >
      {pending ? 'Approving…' : 'Approve'}
    </button>
  )
}
