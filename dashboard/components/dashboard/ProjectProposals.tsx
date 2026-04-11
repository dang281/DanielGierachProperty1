'use client'

import { useTransition } from 'react'
import { approveProposal, dismissProposal } from '@/lib/actions/paperclip'
import type { Issue, Agent } from '@/types/paperclip'
import { PROPOSAL_LABEL_ID } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#6b7280',
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tokens`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K tokens`
  return `${n} tokens`
}

function fmtUsd(tokens: number): string {
  // Approximate cost at ~$3/MTok input + $15/MTok output, averaged ~$6/MTok
  const cost = (tokens / 1_000_000) * 6
  return cost < 0.01 ? '<$0.01' : `~$${cost.toFixed(2)}`
}

function parseEstimatedTokens(description: string | null): number | null {
  if (!description) return null
  const match = description.match(/estimated\s+tokens?[:\s~]*([0-9,_]+)/i)
  if (!match) return null
  return parseInt(match[1].replace(/[,_]/g, ''), 10)
}

function ProposalCard({ issue, agentMap }: { issue: Issue; agentMap: Record<string, Agent> }) {
  const [isPending, startTransition] = useTransition()
  const agent      = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
  const pColour    = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
  const estTokens  = parseEstimatedTokens(issue.description)

  // Strip the token estimate line from the preview so it's not double-shown
  const descPreview = issue.description
    ?.replace(/\*?\*?estimated\s+tokens?[^\n]*/gi, '')
    ?.trim()
    ?.slice(0, 220)

  return (
    <div
      className="rounded-xl border bg-[var(--color-card)] flex flex-col overflow-hidden"
      style={{ borderColor: 'rgba(99,102,241,0.3)', borderLeft: '3px solid #6366f1' }}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[10px] font-mono text-[var(--color-cream-x)]">
              {issue.identifier}
            </code>
            {issue.priority && (
              <span
                className="text-[9px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ color: pColour, background: pColour + '20' }}
              >
                {issue.priority}
              </span>
            )}
          </div>

          {/* Token cost badge */}
          {estTokens != null && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span className="text-[10px] font-sans font-semibold" style={{ color: '#818cf8' }}>
                {fmtTokens(estTokens)}
              </span>
              <span className="text-[10px] font-sans text-[var(--color-cream-x)]">
                {fmtUsd(estTokens)}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-sans font-semibold text-[var(--color-cream)] leading-snug">
          {issue.title}
        </p>

        {/* Description preview */}
        {descPreview && (
          <p className="text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed line-clamp-4 flex-1">
            {descPreview}{descPreview.length >= 220 ? '…' : ''}
          </p>
        )}

        {/* Proposed by */}
        {agent && (
          <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
            Proposed by {agent.name}
          </p>
        )}
      </div>

      {/* Approve / Dismiss */}
      <div className="grid grid-cols-2 border-t border-[var(--color-border-w)]">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => dismissProposal(issue.id))}
          className="py-3 text-xs font-semibold font-sans text-[var(--color-cream-x)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.07)] transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
        >
          Dismiss
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => approveProposal(issue.id))}
          className="py-3 text-xs font-semibold font-sans transition-colors disabled:opacity-40"
          style={{ color: '#22c55e' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          Approve →
        </button>
      </div>
    </div>
  )
}

export default function ProjectProposals({
  issues,
  agents,
}: {
  issues: Issue[]
  agents: Agent[]
}) {
  const proposals = issues.filter(i =>
    i.labelIds.includes(PROPOSAL_LABEL_ID) && i.status !== 'cancelled' && i.status !== 'done'
  )

  if (proposals.length === 0) return null

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#6366f1' }}
          />
          <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#818cf8' }}>
            Project Proposals
          </h2>
        </div>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
        <span className="text-[11px] font-sans flex-shrink-0" style={{ color: '#818cf8' }}>
          {proposals.length} awaiting approval
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {proposals.map(issue => (
          <ProposalCard key={issue.id} issue={issue} agentMap={agentMap} />
        ))}
      </div>
    </section>
  )
}
