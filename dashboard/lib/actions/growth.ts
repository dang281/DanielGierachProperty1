'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GrowthOpportunity {
  id: string
  title: string
  category: string | null        // 'lead-gen' | 'website' | 'content' | 'positioning' | 'seo'
  why_it_matters: string
  expected_impact: string
  next_action: string
  priority: number               // 1=high, 2=medium, 3=low
  status: string                 // 'open' | 'in_progress' | 'done' | 'dismissed'
  week_generated: string | null
  created_at: string
}

export interface GrowthAgentReport {
  id: string
  agent_name: string
  week_start: string
  posts_created: number
  posts_published: number
  posts_scheduled: number
  posts_rejected: number
  key_themes: string[] | null
  what_worked: string | null
  what_didnt_work: string | null
  next_week_focus: string | null
  created_at: string
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getOpportunities(): Promise<GrowthOpportunity[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .not('status', 'eq', 'dismissed')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) return []
    return (data ?? []) as GrowthOpportunity[]
  } catch {
    return []
  }
}

export async function getLatestAgentReport(): Promise<GrowthAgentReport | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('agent_reports')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(1)
      .single()
    if (error) return null
    return data as GrowthAgentReport
  } catch {
    return null
  }
}

export async function updateOpportunityStatus(id: string, status: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('opportunities')
    .update({ status })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app/projects')
}
