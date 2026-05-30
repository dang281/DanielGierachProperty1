import { createClient } from '@/lib/supabase/server'
import PropertiesView from './PropertiesView'

export default async function PropertiesPage() {
  const supabase = await createClient()

  const [{ data: properties }, { data: alerts }] = await Promise.all([
    supabase
      .from('tracked_properties')
      .select('*')
      .order('monday_group', { ascending: true }),
    supabase
      .from('property_alerts')
      .select('*')
      .eq('actioned', false)
      .order('detected_at', { ascending: false }),
  ])

  return (
    <PropertiesView
      properties={properties ?? []}
      alerts={alerts ?? []}
    />
  )
}
