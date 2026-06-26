export type BuyerStatus = 'active' | 'bought' | 'archived'

export type BuyerBrief = {
  id: string
  name: string
  phone: string | null
  email: string | null
  monday_link: string | null
  suburbs: string[]
  property_types: string[]
  price_min: number | null
  price_max: number | null
  beds_min: number
  baths_min: number
  car_min: number
  extras: string | null
  notes: string | null
  status: BuyerStatus
  created_at: string
  updated_at: string
}

export const PROPERTY_TYPES = ['house', 'unit', 'townhouse', 'land'] as const
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  unit: 'Unit / Apartment',
  townhouse: 'Townhouse',
  land: 'Land',
}

export const STATUS_LABELS: Record<BuyerStatus, string> = {
  active: 'Active',
  bought: 'Bought',
  archived: 'Archived',
}

export const STATUS_COLOURS: Record<BuyerStatus, string> = {
  active: '#c4912a',
  bought: '#22c55e',
  archived: '#a8a29e',
}
