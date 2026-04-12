'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AgentReport, MarketIntel, Opportunity } from '@/types/reports'

// ── Agent Reports ─────────────────────────────────────────────────────────────

export async function getLatestAgentReport(): Promise<AgentReport | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('agent_reports')
      .select('*')
      .eq('agent_name', 'social-media')
      .order('week_start', { ascending: false })
      .limit(1)
      .single()
    if (error) return null
    return data as AgentReport
  } catch {
    return null
  }
}

export async function getAllAgentReports(weeks = 4): Promise<AgentReport[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('agent_reports')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(weeks * 3) // all agents for N weeks
    if (error) return []
    return (data ?? []) as AgentReport[]
  } catch {
    return []
  }
}

// ── Market Intel ──────────────────────────────────────────────────────────────

export async function getRecentMarketIntel(days = 7): Promise<MarketIntel[]> {
  try {
    const supabase = await createClient()
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('market_intel')
      .select('*')
      .gte('created_at', sinceStr)
      .order('relevance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) return []
    return (data ?? []) as MarketIntel[]
  } catch {
    return []
  }
}

// ── Opportunities ─────────────────────────────────────────────────────────────

export async function getOpenOpportunities(): Promise<Opportunity[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: true })
      .order('week_generated', { ascending: false })
      .limit(10)
    if (error) return []
    return (data ?? []) as Opportunity[]
  } catch {
    return []
  }
}

export async function updateOpportunityStatus(
  id: string,
  status: Opportunity['status'],
) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('opportunities')
      .update({ status })
      .eq('id', id)
    if (error) throw error
    revalidatePath('/app')
  } catch {
    // Graceful failure if table doesn't exist yet
  }
}
