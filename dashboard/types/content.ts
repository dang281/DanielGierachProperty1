export type Platform    = 'linkedin' | 'instagram' | 'facebook' | 'seo'
// 'idea' is the current DB value for "Needs Review" (pending rename to 'draft' via SQL migration)
export type Status      = 'idea' | 'draft' | 'scheduled' | 'posted' | 'rejected' | 'archived'
export type Pillar      = 'seller' | 'authority' | 'suburb' | 'proof' | 'buyer'
export type VisualStatus = 'needed' | 'draft' | 'needs_revision' | 'approved'

export interface ContentItem {
  id: string
  title: string
  platform: Platform
  content_type: string | null
  caption: string | null
  platform_variants: string[] | null
  objective: string | null
  target_audience: string | null
  expected_outcome: string | null
  cta: string | null
  destination_url: string | null
  status: Status
  content_pillar: Pillar | null
  score: number | null
  scheduled_date: string | null   // YYYY-MM-DD
  scheduled_time: string | null   // HH:MM
  notes: string | null
  // Visual fields
  visual_brief: string | null
  canva_url: string | null
  visual_thumbnail: string | null
  visual_feedback: string | null
  visual_status: VisualStatus
  created_at: string
  updated_at: string
}

export type ContentItemUpdate = Partial<Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>>

// Status display helpers
// Both 'idea' (current DB value) and 'draft' (future DB value) display as "Needs Review"
export const STATUS_LABEL: Record<Status, string> = {
  idea:      'Needs Review',
  draft:     'Needs Review',
  scheduled: 'Scheduled',
  posted:    'Posted',
  rejected:  'Rejected',
  archived:  'Archived',
}

export const STATUS_COLOUR: Record<Status, string> = {
  idea:      '#c4912a',
  draft:     '#c4912a',
  scheduled: '#22c55e',
  posted:    '#60a5fa',
  rejected:  '#ef4444',
  archived:  '#6b5a3e',
}

export const STATUS_BG: Record<Status, string> = {
  idea:      'rgba(196,145,42,0.15)',
  draft:     'rgba(196,145,42,0.15)',
  scheduled: 'rgba(34,197,94,0.12)',
  posted:    'rgba(59,130,246,0.12)',
  rejected:  'rgba(239,68,68,0.1)',
  archived:  'rgba(107,90,62,0.18)',
}

export const STATUS_BORDER: Record<Status, string> = {
  idea:      'rgba(196,145,42,0.35)',
  draft:     'rgba(196,145,42,0.35)',
  scheduled: 'rgba(34,197,94,0.3)',
  posted:    'rgba(59,130,246,0.25)',
  rejected:  'rgba(239,68,68,0.25)',
  archived:  'rgba(107,90,62,0.35)',
}

export const PLATFORM_COLOUR: Record<Platform, string> = {
  linkedin:  '#0a66c2',
  instagram: '#e1306c',
  facebook:  '#1877f2',
  seo:       '#10b981',
}

export const PILLAR_COLOUR: Record<Pillar, string> = {
  seller:    '#c4912a',
  authority: '#3b82f6',
  suburb:    '#22c55e',
  proof:     '#a855f7',
  buyer:     '#14b8a6',
}
