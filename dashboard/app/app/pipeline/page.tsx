import { createClient } from '@/lib/supabase/server'
import PipelineView from './PipelineView'
import type { PipelineRow, AppointmentRow } from './types'

export default async function PipelinePage() {
  const supabase = await createClient()

  const [{ data: pipelineRaw, error: pErr }, { data: apptsRaw, error: aErr }, { data: latestRun }] = await Promise.all([
    supabase
      .from('v_pipeline')
      .select('*')
      .order('updated_at_monday', { ascending: false }),
    supabase
      .from('v_subitem_appointments')
      .select('*')
      .order('date_booked_for', { ascending: true }),
    supabase
      .from('monday_import_runs')
      .select('finished_at, status, pipeline_count')
      .eq('status', 'success')
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (pErr || aErr) {
    return (
      <div className="px-6 py-10 text-[var(--color-cream)] font-sans">
        <h1 className="text-2xl font-serif mb-3">Pipeline</h1>
        <p className="text-[var(--color-cream-dim)] mb-4">
          Could not read the pipeline view. Apply the migrations and run the import first.
        </p>
        <pre className="text-xs bg-[var(--color-card)] p-4 rounded-lg overflow-auto">
{`cd /Users/danielgierach/DanielGierachProperty/dashboard
supabase migration repair --status applied 20260622000001
supabase db push
node scripts/import-monday.mjs`}
        </pre>
        <p className="mt-4 text-[var(--color-cream-x)] text-xs">
          Error: {(pErr ?? aErr)?.message}
        </p>
      </div>
    )
  }

  const pipeline = (pipelineRaw ?? []) as PipelineRow[]
  const appointments = (apptsRaw ?? []) as AppointmentRow[]

  return (
    <PipelineView
      pipeline={pipeline}
      appointments={appointments}
      lastImportAt={latestRun?.finished_at ?? null}
    />
  )
}
