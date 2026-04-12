export interface AgentReport {
  id:              string
  agent_name:      'social-media' | 'seo' | 'ceo'
  week_start:      string        // YYYY-MM-DD
  posts_created:   number
  posts_published: number
  posts_scheduled: number
  posts_rejected:  number
  key_themes:      string[] | null
  what_worked:     string | null
  what_didnt_work: string | null
  next_week_focus: string | null
  created_at:      string
}

export interface MarketIntel {
  id:              string
  title:           string
  summary:         string
  source_url:      string | null
  category:        'planning' | 'infrastructure' | 'market' | 'development' | 'policy' | 'data' | null
  relevance_score: number        // 1–10
  post_worthy:     boolean
  suburbs:         string[] | null
  published_date:  string | null // YYYY-MM-DD
  created_at:      string
}

export interface Opportunity {
  id:              string
  title:           string
  category:        'lead-gen' | 'website' | 'content' | 'positioning' | 'seo' | null
  why_it_matters:  string
  expected_impact: string
  next_action:     string
  priority:        1 | 2 | 3    // 1 = high
  status:          'open' | 'in_progress' | 'done' | 'dismissed'
  week_generated:  string        // YYYY-MM-DD
  created_at:      string
}

export const CATEGORY_COLOUR: Record<string, string> = {
  'lead-gen':      '#22c55e',
  'website':       '#3b82f6',
  'content':       '#c4912a',
  'positioning':   '#a855f7',
  'seo':           '#14b8a6',
  'planning':      '#6366f1',
  'infrastructure':'#f97316',
  'market':        '#0a66c2',
  'development':   '#22c55e',
  'policy':        '#9ca3af',
  'data':          '#60a5fa',
}

export const CATEGORY_LABEL: Record<string, string> = {
  'lead-gen':      'Lead Gen',
  'website':       'Website',
  'content':       'Content',
  'positioning':   'Positioning',
  'seo':           'SEO',
  'planning':      'Planning',
  'infrastructure':'Infrastructure',
  'market':        'Market',
  'development':   'Development',
  'policy':        'Policy',
  'data':          'Data',
}

export const PRIORITY_LABEL: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }
export const PRIORITY_COLOUR: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#9ca3af',
}
