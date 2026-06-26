export type PipelineRow = {
  monday_item_id: string
  name: string | null
  stage_raw: string | null
  stage: string | null
  phone: string | null
  email: string | null
  address: string | null
  follow_up_date: string | null
  event_date: string | null
  appraised: string | null
  buy_to_sell: string | null
  owner_type: string | null
  property_type: string | null
  nvml_status: string | null
  appraisal_range: string | null
  nurture_cloud_url: string | null
  price_finder_url: string | null
  contact_name_freeform: string | null
  quick_recap: string | null
  notes_combined: string | null
  notes_first: string | null
  notes_second: string | null
  notes_third: string | null
  notes_third_cont: string | null
  created_at_monday: string | null
  updated_at_monday: string | null
  imported_at: string | null
}

export type AppointmentRow = {
  monday_item_id: string
  parent_monday_item_id: string
  parent_board_id: string
  name: string | null
  status: string | null
  date_booked_for: string | null
  notes: string | null
  created_at_monday: string | null
  updated_at_monday: string | null
}

export const STAGE_ORDER = [
  'Hotstock',
  'Warmstock',
  'Happy to Chat',
  'Unsure Stock',
  'Not Picking Up',
  'Off-Market',
  'From Open Homes',
  'Unfiltered',
  'Scanned QR',
  'Past Buyers',
  'Not Interested',
  'Lost',
] as const

export const STAGE_COLORS: Record<string, string> = {
  'Hotstock':        '#ef4444',
  'Warmstock':       '#f97316',
  'Happy to Chat':   '#22c55e',
  'Unsure Stock':    '#eab308',
  'Not Picking Up':  '#94a3b8',
  'Off-Market':      '#c4912a',
  'From Open Homes': '#6366f1',
  'Unfiltered':      '#a855f7',
  'Scanned QR':      '#14b8a6',
  'Past Buyers':     '#3b82f6',
  'Not Interested':  '#64748b',
  'Lost':            '#475569',
}
