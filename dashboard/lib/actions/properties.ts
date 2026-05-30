'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address + ', Australia')
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&countrycodes=au&limit=1`,
      { headers: { 'User-Agent': 'DanielGierachPropertyDashboard/1.0' } }
    )
    const results = await res.json()
    if (results?.[0]) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
    }
  } catch {}
  return null
}

export async function addPropertyAlert(formData: FormData) {
  const address  = (formData.get('address')  as string).trim()
  const suburb   = (formData.get('suburb')   as string).trim()
  const price    = (formData.get('price')    as string).trim() || null
  const type     = (formData.get('type')     as string) || 'sale'
  const reaLink  = (formData.get('rea_link') as string).trim() || null

  const coords = await geocodeAddress(address)

  const supabase = await createClient()
  await supabase.from('property_alerts').insert({
    listing_address: address,
    listing_suburb:  suburb,
    listing_price:   price,
    listing_type:    type,
    rea_link:        reaLink,
    lat:             coords?.lat ?? null,
    lng:             coords?.lng ?? null,
    actioned:        false,
  })

  revalidatePath('/app/properties')
}

export async function logContactCall(id: string) {
  const today = new Date().toISOString().split('T')[0]
  const supabase = await createClient()
  await supabase
    .from('tracked_properties')
    .update({ last_contact_date: today, callback_date: null })
    .eq('id', id)
  revalidatePath('/app/properties')
}

export async function setCallback(id: string, days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const callbackDate = date.toISOString().split('T')[0]
  const supabase = await createClient()
  await supabase
    .from('tracked_properties')
    .update({ callback_date: callbackDate })
    .eq('id', id)
  revalidatePath('/app/properties')
}
