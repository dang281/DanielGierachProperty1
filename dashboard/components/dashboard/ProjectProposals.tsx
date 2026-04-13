'use client'

import { useTransition, useState } from 'react'
import { approveProposal, amendProposal, dismissProposal } from '@/lib/actions/paperclip'
import type { Issue, Agent } from '@/types/paperclip'
import { PROPOSAL_LABEL_ID } from '@/types/paperclip'

type Filter = 'all' | 'social' | 'seo' | 'other'

const FILTERS: { key: Filter; label: string; colour: string }[] = [
  { key: 'all',    label: 'All',    colour: '#818cf8' },
  { key: 'social', label: 'Social', colour: '#f472b6' },
  { key: 'seo',    label: 'SEO',    colour: '#34d399' },
  { key: 'other',  label: 'Other',  colour: '#94a3b8' },
]

function getFilter(title: string): Filter {
  const t = title.toLowerCase()
  if (t.startsWith('social:') || t.includes('social')) return 'social'
  if (t.startsWith('seo:')    || t.includes('seo'))    return 'seo'
  return 'other'
}

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
  const cost = (tokens / 1_000_000) * 6
  return cost < 0.01 ? '<$0.01' : `~$${cost.toFixed(2)}`
}

function parseEstimatedTokens(description: string | null): number | null {
  if (!description) return null
  const match = description.match(/estimated\s+tokens?[:\s~]*([0-9,_]+)/i)
  if (!match) return null
  return parseInt(match[1].replace(/[,_]/g, ''), 10)
}

type CardMode = 'idle' | 'amending' | 'dismissing' | 'amended'

function ProposalCard({ issue, agentMap }: { issue: Issue; agentMap: Record<string, Agent> }) {
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<CardMode>('idle')
  const [inputText, setInputText] = useState('')

  const agent   = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null
  const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
  const estTokens = parseEstimatedTokens(issue.description)

  const fullDesc = issue.description
    ?.replace(/\*?\*?estimated\s+tokens?[^\n]*/gi, '')
    ?.trim() ?? ''
  const isTruncated = fullDesc.length > 220

  function reset() { setMode('idle'); setInputText('') }

  const sharedTextareaStyle = {
    background: mode === 'amending' ? 'rgba(129,140,248,0.05)' : 'rgba(239,68,68,0.05)',
    border: `1px solid ${mode === 'amending' ? 'rgba(129,140,248,0.25)' : 'rgba(239,68,68,0.25)'}`,
    color: 'var(--color-cream)',
  }

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

        {agent && (
          <p className="text-[10px] font-sans text-[var(--color-cream-x)]">
            Proposed by {agent.name}
          </p>
        )}
      </div>

      {/* Action area */}
      <div className="border-t border-[var(--color-border-w)]">
        {mode === 'amended' ? (
          /* Confirmation banner */
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ background: 'rgba(129,140,248,0.07)' }}
          >
            <span className="text-base flex-shrink-0 mt-0.5">✓</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-semibold" style={{ color: '#a5b4fc' }}>
                Notes sent to CEO
              </p>
              <p className="text-[11px] font-sans text-[var(--color-cream-dim)] mt-0.5 leading-relaxed">
                Your feedback has been posted to this proposal. The CEO agent will read it on its next run, revise the proposal, and resubmit for your approval.
              </p>
            </div>
          </div>
        ) : mode === 'idle' ? (
          /* Three-way action bar */
          <div className="grid grid-cols-3">
            <button
              disabled={isPending}
              onClick={() => setMode('dismissing')}
              className="py-3 text-xs font-semibold font-sans text-[var(--color-cream-x)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.07)] transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
            >
              Dismiss
            </button>
            <button
              disabled={isPending}
              onClick={() => setMode('amending')}
              className="py-3 text-xs font-semibold font-sans transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
              style={{ color: '#818cf8' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(129,140,248,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              Amend
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
        ) : (
          /* Amend / Dismiss input */
          <div className="flex flex-col gap-2 p-3">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-wide" style={{ color: mode === 'amending' ? '#818cf8' : '#f87171' }}>
              {mode === 'amending' ? 'What needs changing? CEO will revise and resubmit.' : 'Why are you dismissing this? CEO agent will learn.'}
            </p>
            <textarea
              autoFocus
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={mode === 'amending' ? 'e.g. Focus on Murarrie not Newstead, wrong target suburb for us' : 'e.g. Already covered by DANA-35, timing is off'}
              rows={2}
              className="w-full text-xs font-sans rounded-lg px-3 py-2 resize-none outline-none"
              style={sharedTextareaStyle}
              onKeyDown={e => { if (e.key === 'Escape') reset() }}
            />
            <div className="flex gap-2">
              <button
                disabled={isPending}
                onClick={() => {
                  if (mode === 'amending') {
                    startTransition(async () => {
                      await amendProposal(issue.id, inputText)
                      setInputText('')
                      setMode('amended')
                    })
                  } else {
                    startTransition(() => dismissProposal(issue.id, inputText))
                  }
                }}
                className="flex-1 py-1.5 text-xs font-semibold font-sans rounded-lg transition-colors disabled:opacity-40"
                style={mode === 'amending'
                  ? { background: 'rgba(129,140,248,0.12)', color: '#818cf8' }
                  : { background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
              >
                {isPending ? 'Saving…' : mode === 'amending' ? 'Send to CEO' : 'Confirm dismiss'}
              </button>
              <button
                disabled={isPending}
                onClick={reset}
                className="px-3 py-1.5 text-xs font-semibold font-sans rounded-lg disabled:opacity-40"
                style={{ background: 'rgba(28,25,23,0.06)', color: 'var(--color-cream-x)' }}
              >
                Cancel
              </button>
            </div>
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
  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  const proposals = issues.filter(i =>
    i.labelIds.includes(PROPOSAL_LABEL_ID) && i.status !== 'cancelled' && i.status !== 'done'
  )

  if (proposals.length === 0) return null

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

  const counts: Record<Filter, number> = {
    all:    proposals.length,
    social: proposals.filter(i => getFilter(i.title) === 'social').length,
    seo:    proposals.filter(i => getFilter(i.title) === 'seo').length,
    other:  proposals.filter(i => getFilter(i.title) === 'other').length,
  }

  const visible = activeFilter === 'all'
    ? proposals
    : proposals.filter(i => getFilter(i.title) === activeFilter)

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6366f1' }} />
          <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: '#818cf8' }}>
            Project Proposals
          </h2>
        </div>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
        <span className="text-[11px] font-sans flex-shrink-0" style={{ color: '#818cf8' }}>
          {proposals.length} awaiting approval
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTERS.map(f => {
          const active = activeFilter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all"
              style={active
                ? { background: f.colour + '20', color: f.colour, border: `1px solid ${f.colour}50` }
                : { background: 'var(--color-card)', color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}
            >
              {f.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums"
                style={active
                  ? { background: f.colour + '30', color: f.colour }
                  : { background: 'rgba(28,25,23,0.08)', color: 'var(--color-cream-x)' }}
              >
                {counts[f.key]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {visible.map(issue => (
          <ProposalCard key={issue.id} issue={issue} agentMap={agentMap} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm font-sans text-[var(--color-cream-x)] text-center py-8">
          No {activeFilter} proposals pending.
        </p>
      )}
    </section>
  )
}
