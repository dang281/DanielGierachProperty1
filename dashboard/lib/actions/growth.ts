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

// ── Display helpers ───────────────────────────────────────────────────────────

export const PRIORITY_LABEL: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }

export const PRIORITY_STYLE: Record<number, { text: string; bg: string; border: string }> = {
  1: { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },   // amber — high
  2: { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },   // blue — medium
  3: { text: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' }, // grey — low
}

export const CATEGORY_LABEL: Record<string, string> = {
  'lead-gen':    'Leads',
  'website':     'Website',
  'content':     'Listings',
  'positioning': 'Positioning',
  'seo':         'SEO',
}

export const CATEGORY_STYLE: Record<string, { text: string; bg: string }> = {
  'lead-gen':    { text: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },   // teal
  'content':     { text: '#a855f7', bg: 'rgba(168,85,247,0.12)' },   // purple
  'positioning': { text: '#c4912a', bg: 'rgba(196,145,42,0.12)' },   // gold
  'seo':         { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },    // green
  'website':     { text: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },   // light blue
}

export const STATUS_LABEL: Record<string, string> = {
  'open':        'Testing',
  'in_progress': 'Validated',
  'done':        'Validated',
  'dismissed':   'Stalled',
}

export const STATUS_STYLE: Record<string, { text: string; bg: string }> = {
  'open':        { text: '#818cf8', bg: 'rgba(129,140,248,0.12)' },  // indigo — testing
  'in_progress': { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },   // green — validated
  'done':        { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },   // green — validated
  'dismissed':   { text: '#f97316', bg: 'rgba(249,115,22,0.12)' },  // orange — stalled
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
