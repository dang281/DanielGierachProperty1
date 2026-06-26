import { createClient } from '@/lib/supabase/server'

type ImportRun = {
  id: string
  started_at: string
  finished_at: string | null
  status: string
  pipeline_count: number | null
  contacts_count: number | null
  leads_count: number | null
  properties_count: number | null
  subitems_count: number | null
  links_count: number | null
  error_message: string | null
}

const TABLES = [
  { name: 'monday_pipeline_items', label: 'Property Pipeline' },
  { name: 'monday_contacts',       label: 'Contacts' },
  { name: 'monday_leads',          label: 'Buyers / Investors / Developers' },
  { name: 'monday_properties',     label: 'Properties' },
  { name: 'monday_subitems',       label: 'Subitems' },
  { name: 'monday_links',          label: 'Board relations' },
]

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default async function ImportPage() {
  const supabase = await createClient()

  const counts: Record<string, number | null> = {}
  await Promise.all(
    TABLES.map(async t => {
      const { count, error } = await supabase.from(t.name).select('*', { count: 'exact', head: true })
      counts[t.name] = error ? null : (count ?? 0)
    })
  )

  const { data: runsRaw } = await supabase
    .from('monday_import_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10)

  const runs = (runsRaw ?? []) as ImportRun[]
  const latest = runs[0]

  return (
    <div className="px-6 py-6 text-[var(--color-cream)] font-sans space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-serif">Monday Import</h1>
        <p className="text-[var(--color-cream-dim)] text-sm">
          One-shot import of the four Monday boards into Supabase mirror tables. Idempotent: re-run any time to refresh.
        </p>
      </header>

      {/* Counts */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TABLES.map(t => (
          <div key={t.name} className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-card-2)]">
            <div className="text-xs text-[var(--color-cream-dim)] uppercase tracking-wide">{t.label}</div>
            <div className="text-2xl font-serif mt-1">
              {counts[t.name] === null ? '' : counts[t.name]?.toLocaleString('en-AU')}
            </div>
            <div className="text-xs text-[var(--color-cream-x)] mt-1">{t.name}</div>
          </div>
        ))}
      </section>

      {/* Latest run */}
      {latest && (
        <section className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-card-2)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-cream-dim)]">Latest run</div>
              <div className="text-sm">{formatDate(latest.started_at)}</div>
            </div>
            <StatusBadge status={latest.status} />
          </div>
          {latest.error_message && (
            <pre className="text-xs bg-[#ef4444]/10 text-[#ef4444] p-2 rounded overflow-auto mb-3">{latest.error_message}</pre>
          )}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <Stat label="Pipeline"   value={latest.pipeline_count} />
            <Stat label="Contacts"   value={latest.contacts_count} />
            <Stat label="Leads"      value={latest.leads_count} />
            <Stat label="Properties" value={latest.properties_count} />
            <Stat label="Subitems"   value={latest.subitems_count} />
            <Stat label="Links"      value={latest.links_count} />
          </div>
        </section>
      )}

      {/* How to run */}
      <section className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-card-2)]">
        <h2 className="text-sm uppercase tracking-wide text-[var(--color-cream-dim)] mb-2">Run the import</h2>
        <p className="text-xs text-[var(--color-cream-dim)] mb-3">
          The import runs as a CLI script (Monday token stays on your machine). Make sure
          {' '}<code className="bg-[var(--color-card-2)] px-1 rounded">MONDAY_API_TOKEN</code>{' '}
          is set in <code className="bg-[var(--color-card-2)] px-1 rounded">.env.local</code>.
        </p>
        <pre className="text-xs bg-[var(--color-card-2)] p-3 rounded overflow-auto">
{`cd /Users/danielgierach/DanielGierachProperty/dashboard

# Preview only (no writes)
node scripts/import-monday.mjs --dry-run

# Full import
node scripts/import-monday.mjs

# Single board (pipeline | contacts | leads | properties)
node scripts/import-monday.mjs --board=pipeline`}
        </pre>
      </section>

      {/* History */}
      {runs.length > 1 && (
        <section>
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-cream-dim)] mb-2">History</h2>
          <ul className="divide-y divide-[var(--color-card-2)] border border-[var(--color-card-2)] rounded-lg overflow-hidden">
            {runs.map(r => (
              <li key={r.id} className="px-4 py-2 flex items-center justify-between text-xs bg-[var(--color-card)]">
                <div>
                  <div>{formatDate(r.started_at)}</div>
                  {r.finished_at && (
                    <div className="text-[var(--color-cream-x)]">finished {formatDate(r.finished_at)}</div>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: '#22c55e',
    running: '#3b82f6',
    failed:  '#ef4444',
    dry_run: '#94a3b8',
  }
  const color = map[status] ?? '#94a3b8'
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{ borderColor: color, color }}
    >
      {status}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-[var(--color-cream-dim)]">{label}</div>
      <div className="font-medium">{value ?? ''}</div>
    </div>
  )
}
