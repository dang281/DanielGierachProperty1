'use client'

import { useTransition, useState } from 'react'
import { approveProposal, amendProposal, dismissProposal } from '@/lib/actions/paperclip'
import type { Issue, Agent } from '@/types/paperclip'

const PRIORITY_COLOUR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280',
}

type RowMode = 'idle' | 'amending' | 'dismissing'

function ProposalRow({ issue, agentMap }: { issue: Issue; agentMap: Record<string, Agent> }) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<RowMode>('idle')
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)

  const pColour = issue.priority ? PRIORITY_COLOUR[issue.priority] : '#6b7280'
  const agent = issue.assigneeAgentId ? agentMap[issue.assigneeAgentId] : null

  const desc = issue.description?.replace(/\*?\*?estimated\s+tokens?[^\n]*/gi, '').trim() ?? ''

  function reset() { setMode('idle'); setText('') }

  return (
    <div
      className="border border-[var(--color-border-w)] bg-[var(--color-card)] rounded-xl overflow-hidden"
      style={{ borderLeft: '3px solid #6366f1' }}
    >
      {/* Main row */}
      <div className="flex items-center gap-0 min-h-[44px]">
        {/* Meta */}
        <div className="px-3 flex items-center gap-2 flex-shrink-0">
          <code className="text-[10px] font-mono text-[var(--color-cream-x)]">{issue.identifier}</code>
          {issue.priority && (
            <span
              className="text-[9px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded hidden sm:inline"
              style={{ color: pColour, background: pColour + '20' }}
            >
              {issue.priority}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 py-3 pr-3">
          <p className="text-sm font-sans font-semibold text-[var(--color-cream)] leading-snug truncate">
            {issue.title}
          </p>
          {agent && (
            <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-0.5">
              {agent.name}
            </p>
          )}
        </div>

        {/* Expand desc toggle */}
        {desc && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="px-3 py-3 text-[10px] font-sans text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] transition-colors flex-shrink-0"
          >
            {expanded ? '↑' : '↓'}
          </button>
        )}

        {/* Actions */}
        {mode === 'idle' && (
          <div className="flex items-stretch border-l border-[var(--color-border-w)] flex-shrink-0">
            <button
              disabled={isPending}
              onClick={() => setMode('dismissing')}
              className="px-3 py-3 text-[11px] font-sans text-[var(--color-cream-x)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.07)] transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
            >
              Dismiss
            </button>
            <button
              disabled={isPending}
              onClick={() => setMode('amending')}
              className="px-3 py-3 text-[11px] font-sans font-semibold transition-colors disabled:opacity-40 border-r border-[var(--color-border-w)]"
              style={{ color: '#818cf8' }}
            >
              Amend
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => approveProposal(issue.id))}
              className="px-3 py-3 text-[11px] font-sans font-semibold transition-colors disabled:opacity-40"
              style={{ color: '#22c55e' }}
            >
              {isPending ? '…' : 'Approve'}
            </button>
          </div>
        )}
      </div>

      {/* Expanded description */}
      {expanded && desc && (
        <div className="px-4 pb-3 border-t border-[var(--color-border-w)]">
          <p className="text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed whitespace-pre-wrap pt-2">
            {desc}
          </p>
        </div>
      )}

      {/* Amend / Dismiss input */}
      {mode !== 'idle' && (
        <div className="px-4 pb-3 border-t border-[var(--color-border-w)] flex flex-col gap-2 pt-2">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-wide" style={{ color: mode === 'amending' ? '#818cf8' : '#f87171' }}>
            {mode === 'amending' ? 'What needs changing?' : 'Why dismiss?'}
          </p>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={mode === 'amending' ? 'e.g. Focus on Murarrie, not Newstead' : 'e.g. Already covered by DANA-35'}
            rows={2}
            className="w-full text-xs font-sans rounded-lg px-3 py-2 resize-none outline-none"
            style={{
              background: mode === 'amending' ? 'rgba(129,140,248,0.05)' : 'rgba(239,68,68,0.05)',
              border: `1px solid ${mode === 'amending' ? 'rgba(129,140,248,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: 'var(--color-cream)',
            }}
            onKeyDown={e => { if (e.key === 'Escape') reset() }}
          />
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => {
                if (mode === 'amending') {
                  startTransition(async () => { await amendProposal(issue.id, text); reset() })
                } else {
                  startTransition(() => dismissProposal(issue.id, text))
                }
              }}
              className="flex-1 py-1.5 text-xs font-semibold font-sans rounded-lg disabled:opacity-40"
              style={mode === 'amending'
                ? { background: 'rgba(129,140,248,0.12)', color: '#818cf8' }
                : { background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            >
              {isPending ? 'Saving…' : mode === 'amending' ? 'Send to CEO' : 'Confirm dismiss'}
            </button>
            <button disabled={isPending} onClick={reset}
              className="px-3 py-1.5 text-xs font-semibold font-sans rounded-lg disabled:opacity-40"
              style={{ background: 'rgba(28,25,23,0.06)', color: 'var(--color-cream-x)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompactProposals({ issues, agents }: { issues: Issue[]; agents: Agent[] }) {
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))
  return (
    <div className="flex flex-col gap-1 mt-2">
      {issues.map(issue => (
        <ProposalRow key={issue.id} issue={issue} agentMap={agentMap} />
      ))}
    </div>
  )
}
