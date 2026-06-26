import { createClient } from '@/lib/supabase/server'
import PropertiesView from './PropertiesView'
import type { BuyerBrief } from '@/types/buyers'

function rowToBuyer(r: Record<string, unknown>): BuyerBrief {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: (r.phone as string) ?? null,
    email: (r.email as string) ?? null,
    monday_link: (r.monday_link as string) ?? null,
    suburbs: Array.isArray(r.suburbs) ? (r.suburbs as string[]) : [],
    property_types: Array.isArray(r.property_types) ? (r.property_types as string[]) : [],
    price_min: (r.price_min as number) ?? null,
    price_max: (r.price_max as number) ?? null,
    beds_min: (r.beds_min as number) ?? 0,
    baths_min: (r.baths_min as number) ?? 0,
    car_min: (r.car_min as number) ?? 0,
    extras: (r.extras as string) ?? null,
    notes: (r.notes as string) ?? null,
    status: r.status as BuyerBrief['status'],
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }
}

export default async function PropertiesPage() {
  const supabase = await createClient()

  const [{ data: properties }, { data: alerts }, { data: buyersRaw }] = await Promise.all([
    supabase
      .from('tracked_properties')
      .select('*')
      .order('monday_group', { ascending: true }),
    supabase
      .from('property_alerts')
      .select('*')
      .eq('actioned', false)
      .order('detected_at', { ascending: false }),
    supabase
      .from('buyer_briefs')
      .select('*')
      .eq('status', 'active'),
  ])

  const buyers = (buyersRaw ?? []).map(rowToBuyer)

  return (
    <PropertiesView
      properties={properties ?? []}
      alerts={alerts ?? []}
      buyers={buyers}
    />
  )
}
