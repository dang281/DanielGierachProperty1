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

// Agent IDs — used for inbox notifications
const SOCIAL_AGENT_ID = '41425987-fc69-4182-ab3b-e793be89cc8d'

export async function notifyAgentOfStatusChange(
  postTitle: string,
  newStatus: string,
  notes?: string | null,
): Promise<boolean> {
  const statusLabel: Record<string, string> = {
    scheduled: 'approved for scheduling',
    posted:    'marked as posted',
    rejected:  'rejected',
    ready:     'sent back for review',
    idea:      'moved back to idea',
  }
  const label = statusLabel[newStatus] ?? newStatus

  const body = [
    `Daniel has ${label}: "${postTitle}"`,
    notes ? `\nDaniel's note: ${notes}` : '',
    `\nAction required: acknowledge and update your records. If rejected or sent back, read the review request in the dashboard and amend accordingly.`,
  ].join('')

  try {
    const res = await fetch(`${API}/api/companies/${COMPANY}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      `Post ${label}: "${postTitle}"`,
        body,
        assigneeId: SOCIAL_AGENT_ID,
        status:     'todo',
        priority:   'high',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendChangeRequestToAgent(
  postId: string,
  postTitle: string,
  feedback: string,
): Promise<{ success: boolean; identifier?: string }> {
  const body = [
    `Daniel has requested changes to: "${postTitle}"`,
    `\nChange request: ${feedback.trim()}`,
    `\nAction required: open the post in the dashboard at /app/content/${postId}, read the full change request, and amend the post accordingly. Reply in this issue when done.`,
  ].join('')

  try {
    const res = await fetch(`${API}/api/companies/${COMPANY}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      `Change request: "${postTitle}"`,
        body,
        assigneeId: SOCIAL_AGENT_ID,
        status:     'todo',
        priority:   'high',
      }),
    })
    if (!res.ok) return { success: false }
    const data = await res.json()
    return { success: true, identifier: data.identifier }
  } catch {
    return { success: false }
  }
}

export async function requestFactCheck(
  postId: string,
  postTitle: string,
): Promise<{ success: boolean; identifier?: string }> {
  const body = [
    `Daniel has requested a fact-check on: "${postTitle}"`,
    `\nAction required: open the post at /app/content/${postId}, re-verify all statistics, claims, dates, and time-sensitive information in the caption and notes.`,
    `\nIf any stats have changed: update the caption and add a ⚠️ VERIFY note so Daniel can re-approve. Set Status back to "Ready for Review" when done.`,
    `\nIf everything checks out: add a brief confirmation note and leave Status as-is.`,
  ].join('')

  try {
    const res = await fetch(`${API}/api/companies/${COMPANY}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      `Fact-check requested: "${postTitle}"`,
        body,
        assigneeId: SOCIAL_AGENT_ID,
        status:     'todo',
        priority:   'high',
      }),
    })
    if (!res.ok) return { success: false }
    const data = await res.json()
    return { success: true, identifier: data.identifier }
  } catch {
    return { success: false }
  }
}

export async function requestNewPostForDate(
  dateStr: string,
  postTypeLabel: string,
): Promise<{ success: boolean; identifier?: string }> {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow]
  const body = [
    `Daniel has requested a new ${postTypeLabel} post for ${dayName} ${dateStr}.`,
    `\nAction required: write a new LinkedIn ${postTypeLabel} post following all brand guidelines.`,
    `\nSchedule it for ${dateStr} at 07:30.`,
    `\nDo not reuse an existing post — this must be fresh content.`,
    `\nMark status as "Needs Review" when done so Daniel can approve it.`,
  ].join('')

  try {
    const res = await fetch(`${API}/api/companies/${COMPANY}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      `Write new ${postTypeLabel} post for ${dateStr}`,
        body,
        assigneeId: SOCIAL_AGENT_ID,
        status:     'todo',
        priority:   'high',
      }),
    })
    if (!res.ok) return { success: false }
    const data = await res.json()
    return { success: true, identifier: data.identifier }
  } catch {
    return { success: false }
  }
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
