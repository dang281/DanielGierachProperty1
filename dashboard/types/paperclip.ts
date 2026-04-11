export type AgentStatus = 'active' | 'paused' | 'error' | 'idle'

export interface Agent {
  id: string
  name: string
  role: string
  title: string | null
  icon: string | null
  status: AgentStatus
  capabilities: string | null
  lastHeartbeatAt: string | null
  spentMonthlyCents: number
  pauseReason: string | null
  pausedAt: string | null
}

export type IssueStatus = 'todo' | 'in_progress' | 'needs_review' | 'done' | 'cancelled'
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low' | null

export const PROPOSAL_LABEL_ID = '3ba3a995-0590-487a-899e-5302c2af1c3e'

export interface IssueLabel {
  id: string
  name: string
  color: string
}

export interface Issue {
  id: string
  identifier: string
  title: string
  description: string | null
  status: IssueStatus
  priority: IssuePriority
  assigneeAgentId: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  labels: IssueLabel[]
  labelIds: string[]
}

export interface HeartbeatRun {
  id: string
  agentId: string
  status: string
  startedAt: string
  finishedAt: string | null
  usageJson: {
    inputTokens: number
    outputTokens: number
    cachedInputTokens: number
    costUsd: number
  } | null
  resultJson: {
    result?: string
    total_cost_usd?: number
  } | null
}

export interface AgentTokenData {
  totalIn: number
  totalOut: number
  totalCached: number
  totalCost: number
  totalRuns: number
  avgPerRun: number
  avgCostPerRun: number
  recentRuns: {
    startedAt: string
    status: string
    costUsd: number
    summary: string
  }[]
}
