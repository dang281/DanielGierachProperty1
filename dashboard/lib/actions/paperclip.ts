'use server'

import type { Agent, Issue, HeartbeatRun, AgentTokenData } from '@/types/paperclip'

const API     = process.env.PAPERCLIP_API_URL    || 'http://127.0.0.1:3100'
const COMPANY = process.env.PAPERCLIP_COMPANY_ID || ''

async function pFetch(path: string) {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getAgents(): Promise<Agent[]> {
  const data = await pFetch(`/api/companies/${COMPANY}/agents`)
  return data ?? []
}

export async function getIssues(): Promise<Issue[]> {
  const data = await pFetch(`/api/companies/${COMPANY}/issues`)
  return data ?? []
}

export async function amendProposal(issueId: string, feedback: string): Promise<void> {
  // Post feedback comment — CEO reads this and revises the proposal accordingly
  await fetch(`${API}/api/issues/${issueId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: `Amendment requested by Daniel: ${feedback.trim()}` }),
  })
}

export async function approveProposal(issueId: string): Promise<void> {
  // Remove the proposal label — issue becomes a regular todo the agents will pick up
  await fetch(`${API}/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labelIds: [] }),
  })
}

export async function dismissProposal(issueId: string, reason?: string): Promise<void> {
  if (reason?.trim()) {
    await fetch(`${API}/api/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: `Dismissed by Daniel: ${reason.trim()}` }),
    })
  }
  await fetch(`${API}/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

export async function getAgentTokenData(agentIds: string[]): Promise<Record<string, AgentTokenData>> {
  const results = await Promise.all(
    agentIds.map(async id => {
      const runs: HeartbeatRun[] = (await pFetch(`/api/companies/${COMPANY}/heartbeat-runs?agentId=${id}`)) ?? []
      const totalIn     = runs.reduce((s, r) => s + (r.usageJson?.inputTokens ?? 0), 0)
      const totalOut    = runs.reduce((s, r) => s + (r.usageJson?.outputTokens ?? 0), 0)
      const totalCached = runs.reduce((s, r) => s + (r.usageJson?.cachedInputTokens ?? 0), 0)
      const totalCost   = runs.reduce((s, r) => s + (r.usageJson?.costUsd ?? 0), 0)
      const totalRuns   = runs.length
      const avgPerRun   = totalRuns > 0 ? Math.round((totalIn + totalOut) / totalRuns) : 0
      const avgCostPerRun = totalRuns > 0 ? totalCost / totalRuns : 0
      const recentRuns  = runs
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 3)
        .map(r => ({
          startedAt: r.startedAt,
          status:    r.status,
          costUsd:   r.usageJson?.costUsd ?? 0,
          summary:   r.resultJson?.result?.slice(0, 180) ?? '',
        }))
      return [id, { totalIn, totalOut, totalCached, totalCost, totalRuns, avgPerRun, avgCostPerRun, recentRuns }] as const
    })
  )
  return Object.fromEntries(results)
}
