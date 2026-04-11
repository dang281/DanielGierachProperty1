import type { Issue } from '@/types/paperclip'

const ALL_SUBURBS = [
  'annerley','ascot','balmoral','belmont','brisbane cbd','bulimba',
  'camp hill','cannon hill','carina heights','carina','carindale','coorparoo',
  'dutton park','east brisbane','fortitude valley','greenslopes','hamilton',
  'hawthorne','hemmant','holland park west','holland park','kangaroo point',
  'morningside','mount gravatt east','mount gravatt','murarrie','new farm',
  'norman park','paddington','seven hills','stones corner','tarragindi',
  'teneriffe','tingalpa','upper mount gravatt','west end','woolloongabba',
]

const PAGE_PAT    = [/suburb|landing page|seo.*page|page.*seo/]
const ARTICLE_PAT = [/insight|article|selling.*guide|guide.*selling|selling in/]
const SOCIAL_PAT  = [/social|instagram|facebook|linkedin|spotlight/]

// Returns the 'best' status for a suburb + content type combo, or null if nothing exists
function bestStatus(suburb: string, issues: Issue[], patterns: RegExp[]): 'done' | 'in_progress' | 'needs_review' | 'todo' | null {
  const s    = suburb.toLowerCase()
  const slug = s.replace(/\s+/g, '-')
  const matches = issues.filter(i => {
    if (i.status === 'cancelled') return false
    const t = i.title.toLowerCase()
    return (t.includes(s) || t.includes(slug)) && patterns.some(p => p.test(t))
  })
  if (matches.length === 0) return null
  // Return the highest-priority status
  if (matches.some(i => i.status === 'done'))         return 'done'
  if (matches.some(i => i.status === 'needs_review')) return 'needs_review'
  if (matches.some(i => i.status === 'in_progress'))  return 'in_progress'
  return 'todo'
}

type CoverageStatus = 'done' | 'in_progress' | 'needs_review' | 'todo' | null

function dotColor(status: CoverageStatus): string {
  if (status === 'done')                                  return '#22c55e'
  if (status === 'in_progress' || status === 'needs_review') return '#f97316'
  if (status === 'todo')                                  return '#9ca3af'
  return 'rgba(28,25,23,0.12)'  // missing — visible on light bg
}

function Dot({ status }: { status: CoverageStatus }) {
  return (
    <div className="flex items-center justify-center w-12">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: dotColor(status) }}
      />
    </div>
  )
}

export default function SuburbCoverage({ issues }: { issues: Issue[] }) {
  const active = issues.filter(i => i.status !== 'cancelled')

  const rows = ALL_SUBURBS.map(suburb => ({
    suburb,
    page:    bestStatus(suburb, active, PAGE_PAT),
    article: bestStatus(suburb, active, ARTICLE_PAT),
    social:  bestStatus(suburb, active, SOCIAL_PAT),
  }))

  const full    = rows.filter(r => r.page === 'done' && r.article === 'done' && r.social === 'done').length
  const partial = rows.filter(r =>
    (r.page || r.article || r.social) &&
    !(r.page === 'done' && r.article === 'done' && r.social === 'done')
  ).length

  const half = Math.ceil(rows.length / 2)
  const col1 = rows.slice(0, half)
  const col2 = rows.slice(half)

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)]">
          Suburb Coverage
        </h2>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
        <div className="flex items-center gap-4 text-[10px] font-sans flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#22c55e' }} />
            <span className="text-[var(--color-cream-x)]">Done</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f97316' }} />
            <span className="text-[var(--color-cream-x)]">In Progress</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#9ca3af' }} />
            <span className="text-[var(--color-cream-x)]">Planned</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(28,25,23,0.12)' }} />
            <span className="text-[var(--color-cream-x)]">Missing</span>
          </span>
          <span className="font-semibold" style={{ color: '#22c55e' }}>
            {full}/{rows.length} full coverage
          </span>
          {partial > 0 && (
            <span className="font-semibold" style={{ color: '#f97316' }}>
              {partial} in progress
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] p-4">
        {/* Column headers */}
        <div className="grid grid-cols-2 gap-8 mb-2">
          {[col1, col2].map((_, ci) => (
            <div key={ci} className="flex items-center">
              <span className="flex-1 text-[10px] font-sans text-[var(--color-cream-x)]" />
              <div className="flex gap-0">
                {['Page', 'Article', 'Social'].map(h => (
                  <div key={h} className="w-12 text-center">
                    <span className="text-[9px] font-sans uppercase tracking-wide text-[var(--color-cream-x)]">
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-8">
          {[col1, col2].map((col, ci) => (
            <div key={ci} className="flex flex-col">
              {col.map(r => {
                const isFull    = r.page === 'done' && r.article === 'done' && r.social === 'done'
                const isPartial = !isFull && (r.page || r.article || r.social)
                return (
                  <div
                    key={r.suburb}
                    className="flex items-center py-1 border-b border-[var(--color-border-w)] last:border-0"
                  >
                    <span
                      className="flex-1 text-xs font-sans capitalize"
                      style={{
                        color: isFull ? '#22c55e' : isPartial ? 'var(--color-cream)' : 'var(--color-cream-dim)',
                      }}
                    >
                      {r.suburb.replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <div className="flex">
                      <Dot status={r.page}    />
                      <Dot status={r.article} />
                      <Dot status={r.social}  />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
