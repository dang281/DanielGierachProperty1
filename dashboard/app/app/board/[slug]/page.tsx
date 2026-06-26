import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BoardTable from './BoardTable'
import type { BoardColumn, BoardItem } from './types'
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

const BOARDS: Record<string, { id: string; table: string; label: string }> = {
  pipeline:   { id: '2076186563', table: 'monday_pipeline_items', label: 'Properties' },
  contacts:   { id: '2060096425', table: 'monday_contacts',       label: 'Contacts' },
  leads:      { id: '2060874428', table: 'monday_leads',          label: 'Buyers / Investors' },
  properties: { id: '2067629054', table: 'monday_properties',     label: 'Active Listings' },
  referrals:  { id: '2061163472', table: 'monday_referrals',      label: 'Referrals' },
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const board = BOARDS[slug]
  if (!board) notFound()

  const supabase = await createClient()

  const isPipeline = slug === 'pipeline'

  const [{ data: cols, error: cErr }, { data: rows, error: rErr }, propsExtra, alertsExtra, buyersExtra] = await Promise.all([
    supabase
      .from('monday_board_columns')
      .select('column_id, title, column_type, position, settings')
      .eq('board_id', board.id)
      .order('position', { ascending: true }),
    supabase
      .from(board.table)
      .select('monday_item_id, name, monday_group_title, raw, updated_at_monday')
      .order('updated_at_monday', { ascending: false }),
    isPipeline
      ? supabase.from('tracked_properties').select('*').order('monday_group', { ascending: true })
      : Promise.resolve({ data: null }),
    isPipeline
      ? supabase.from('property_alerts').select('*').eq('actioned', false).order('detected_at', { ascending: false })
      : Promise.resolve({ data: null }),
    isPipeline
      ? supabase.from('buyer_briefs').select('*').eq('status', 'active')
      : Promise.resolve({ data: null }),
  ])

  if (cErr || rErr) {
    return (
      <div className="px-6 py-10 text-[var(--color-cream)] font-sans">
        <h1 className="text-2xl font-serif mb-3">{board.label}</h1>
        <p className="text-[var(--color-cream-dim)]">Could not load this board.</p>
        <pre className="text-xs bg-[var(--color-card)] p-3 rounded mt-3 overflow-auto">
          {(cErr ?? rErr)?.message}
        </pre>
      </div>
    )
  }

  const mapData = isPipeline
    ? {
        properties: (propsExtra?.data ?? []) as unknown[],
        alerts:     (alertsExtra?.data ?? []) as unknown[],
        buyers:     ((buyersExtra?.data ?? []) as Record<string, unknown>[]).map(rowToBuyer),
      }
    : null

  return (
    <BoardTable
      label={board.label}
      slug={slug}
      columns={(cols ?? []) as BoardColumn[]}
      items={(rows ?? []) as BoardItem[]}
      mapData={mapData}
    />
  )
}
