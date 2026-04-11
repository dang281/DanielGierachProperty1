'use client'

import { useTransition, useState } from 'react'
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
  const [expanded, setExpanded] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [dismissReason, setDismissReason] = useState('')
  const agent      = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
  const pColour    = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
  const estTokens  = parseEstimatedTokens(issue.description)

  // Strip the token estimate line so it's not double-shown
  const fullDesc = issue.description
    ?.replace(/\*?\*?estimated\s+tokens?[^\n]*/gi, '')
    ?.trim() ?? ''
  const isTruncated = fullDesc.length > 220
  const descPreview = isTruncated ? fullDesc.slice(0, 220) : fullDesc

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

        {/* Description */}
        {fullDesc && (
          <div className="flex flex-col gap-1 flex-1">
            <p
              className="text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed whitespace-pre-wrap"
              style={expanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {fullDesc}
            </p>
            {isTruncated && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[10px] font-sans font-semibold self-start transition-colors"
                style={{ color: '#818cf8' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}
              >
                {expanded ? 'Show less ↑' : 'Show more ↓'}
              </button>
            )}
          </div>
        )}

        {/* Proposed by */}
        {agent && (
          <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
            Proposed by {agent.name}
          </p>
        )}
      </div>

      {/* Approve / Dismiss */}
      <div className="border-t border-[var(--color-border-w)]">
        {dismissing ? (
          <div className="flex flex-col gap-2 p-3">
            <textarea
              autoFocus
              value={dismissReason}
              onChange={e => setDismissReason(e.target.value)}
              placeholder="Why are you dismissing this? The CEO agent will learn from it. (optional)"
              rows={2}
              className="w-full text-xs font-sans rounded-lg px-3 py-2 resize-none outline-none"
              style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--color-cream)',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  startTransition(() => dismissProposal(issue.id, dismissReason))
                }
                if (e.key === 'Escape') { setDismissing(false); setDismissReason('') }
              }}
            />
            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={() => startTransition(() => dismissProposal(issue.id, dismissReason))}
                className="flex-1 py-1.5 text-xs font-semibold font-sans rounded-lg transition-colors disabled:opacity-40"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
              >
                {isPending ? 'Dismissing…' : 'Confirm dismiss'}
              </button>
              <button
                disabled={isPending}
                onClick={() => { setDismissing(false); setDismissReason('') }}
                className="px-3 py-1.5 text-xs font-semibold font-sans rounded-lg transition-colors disabled:opacity-40"
                style={{ background: 'rgba(28,25,23,0.06)', color: 'var(--color-cream-x)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            <button
              disabled={isPending}
              onClick={() => setDismissing(true)}
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
        )}
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
