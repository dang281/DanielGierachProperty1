// Growth page display constants — no 'use server', safe to import anywhere

export const PRIORITY_LABEL: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }

export const PRIORITY_STYLE: Record<number, { text: string; bg: string; border: string }> = {
  1: { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  2: { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  3: { text: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
}

export const CATEGORY_LABEL: Record<string, string> = {
  'lead-gen':    'Leads',
  'website':     'Website',
  'content':     'Listings',
  'positioning': 'Positioning',
  'seo':         'SEO',
}

export const CATEGORY_STYLE: Record<string, { text: string; bg: string }> = {
  'lead-gen':    { text: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  'content':     { text: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  'positioning': { text: '#c4912a', bg: 'rgba(196,145,42,0.12)' },
  'seo':         { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'website':     { text: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
}

export const STATUS_LABEL: Record<string, string> = {
  'open':        'Testing',
  'in_progress': 'Validated',
  'done':        'Validated',
  'dismissed':   'Stalled',
}

export const STATUS_STYLE: Record<string, { text: string; bg: string }> = {
  'open':        { text: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  'in_progress': { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'done':        { text: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'dismissed':   { text: '#f97316', bg: 'rgba(249,115,22,0.12)' },
}
