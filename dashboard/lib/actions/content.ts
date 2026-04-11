'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ContentItem, ContentItemUpdate, Status } from '@/types/content'

export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('scheduled_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as ContentItem[]
}

export async function getContentItem(id: string): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as ContentItem
}

export async function updateStatus(id: string, status: Status) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ status })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
}

export async function updateItem(id: string, updates: ContentItemUpdate) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
  revalidatePath(`/app/content/${id}`)
}

export async function createItem(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  revalidatePath('/app')
  return data as ContentItem
}

export async function saveVisualFeedback(id: string, feedback: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visual_feedback: feedback, visual_status: 'needs_revision' })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function approveVisual(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visual_status: 'approved', visual_feedback: null })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function saveCanvaUrl(id: string, canva_url: string, visual_thumbnail?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ canva_url, visual_thumbnail: visual_thumbnail ?? null, visual_status: 'draft' })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath(`/app/content/${id}`)
}

export async function deleteItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/app')
  revalidatePath('/app/calendar')
}
