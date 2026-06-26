'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BuyerStatus } from '@/types/buyers'

function parseList(s: string | null): string[] {
  if (!s) return []
  return s.split(/[,\n]/).map(x => x.trim()).filter(Boolean)
}

function parseNumberOrNull(s: string | null): number | null {
  if (!s) return null
  const cleaned = s.replace(/[\s,$]/g, '')
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

function parseIntOrZero(s: string | null): number {
  if (!s) return 0
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : 0
}

function getFields(formData: FormData) {
  const name = (formData.get('name') as string ?? '').trim()
  const phone = (formData.get('phone') as string ?? '').trim() || null
  const email = (formData.get('email') as string ?? '').trim() || null
  const monday_link = (formData.get('monday_link') as string ?? '').trim() || null
  const suburbs = parseList(formData.get('suburbs') as string)
  const property_types = formData.getAll('property_types').map(String).filter(Boolean)
  const price_min = parseNumberOrNull(formData.get('price_min') as string)
  const price_max = parseNumberOrNull(formData.get('price_max') as string)
  const beds_min = parseIntOrZero(formData.get('beds_min') as string)
  const baths_min = parseIntOrZero(formData.get('baths_min') as string)
  const car_min = parseIntOrZero(formData.get('car_min') as string)
  const extras = (formData.get('extras') as string ?? '').trim() || null
  const notes = (formData.get('notes') as string ?? '').trim() || null
  return { name, phone, email, monday_link, suburbs, property_types, price_min, price_max, beds_min, baths_min, car_min, extras, notes }
}

export async function createBuyer(formData: FormData) {
  const fields = getFields(formData)
  if (!fields.name) return { error: 'Name is required' }

  const supabase = await createClient()
  const { error } = await supabase.from('buyer_briefs').insert(fields)
  if (error) return { error: error.message }

  revalidatePath('/app/properties/buyers')
  revalidatePath('/app/properties')
  return { ok: true }
}

export async function updateBuyer(id: string, formData: FormData) {
  const fields = getFields(formData)
  if (!fields.name) return { error: 'Name is required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('buyer_briefs')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/app/properties/buyers')
  revalidatePath('/app/properties')
  return { ok: true }
}

export async function setBuyerStatus(id: string, status: BuyerStatus) {
  const supabase = await createClient()
  await supabase
    .from('buyer_briefs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/app/properties/buyers')
  revalidatePath('/app/properties')
}

export async function deleteBuyer(id: string) {
  const supabase = await createClient()
  await supabase.from('buyer_briefs').delete().eq('id', id)
  revalidatePath('/app/properties/buyers')
  revalidatePath('/app/properties')
}
