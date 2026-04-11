export type Platform    = 'linkedin' | 'instagram' | 'facebook'
export type Status      = 'idea' | 'ready' | 'scheduled' | 'posted' | 'rejected'
export type Pillar      = 'seller' | 'authority' | 'suburb' | 'proof' | 'buyer'
export type VisualStatus = 'needed' | 'draft' | 'needs_revision' | 'approved'

export interface ContentItem {
  id: string
  title: string
  platform: Platform
  content_type: string | null
  caption: string | null
  platform_variants: Record<string, string> | null
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
  // Visual / Canva fields
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
export const STATUS_LABEL: Record<Status, string> = {
  idea:      'Idea',
  ready:     'Ready for Review',
  scheduled: 'Scheduled',
  posted:    'Posted',
  rejected:  'Rejected',
}

export const STATUS_COLOUR: Record<Status, string> = {
  idea:      '#9ca3af',
  ready:     '#a855f7',
  scheduled: '#22c55e',
  posted:    '#60a5fa',
  rejected:  '#ef4444',
}

export const STATUS_BG: Record<Status, string> = {
  idea:      'rgba(107,114,128,0.18)',
  ready:     'rgba(168,85,247,0.15)',
  scheduled: 'rgba(34,197,94,0.12)',
  posted:    'rgba(59,130,246,0.12)',
  rejected:  'rgba(239,68,68,0.1)',
}

export const STATUS_BORDER: Record<Status, string> = {
  idea:      'rgba(107,114,128,0.3)',
  ready:     'rgba(168,85,247,0.35)',
  scheduled: 'rgba(34,197,94,0.3)',
  posted:    'rgba(59,130,246,0.25)',
  rejected:  'rgba(239,68,68,0.25)',
}

export const PLATFORM_COLOUR: Record<Platform, string> = {
  linkedin:  '#0a66c2',
  instagram: '#e1306c',
  facebook:  '#1877f2',
}

export const PILLAR_COLOUR: Record<Pillar, string> = {
  seller:    '#c4912a',
  authority: '#3b82f6',
  suburb:    '#22c55e',
  proof:     '#a855f7',
  buyer:     '#14b8a6',
}
