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

function has(suburb: string, issues: Issue[], patterns: RegExp[]): boolean {
  const s    = suburb.toLowerCase()
  const slug = s.replace(/\s+/g, '-')
  return issues.some(i => {
    const t = i.title.toLowerCase()
    return (t.includes(s) || t.includes(slug)) && patterns.some(p => p.test(t))
  })
}

function Dot({ filled, colour }: { filled: boolean; colour: string }) {
  return (
    <div className="flex items-center justify-center w-5">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: filled ? colour : 'rgba(255,255,255,0.12)' }}
      />
    </div>
  )
}

export default function SuburbCoverage({ issues }: { issues: Issue[] }) {
  const done = issues.filter(i => i.status === 'done')

  const rows = ALL_SUBURBS.map(suburb => ({
    suburb,
    hasPage:    has(suburb, done, PAGE_PAT),
    hasArticle: has(suburb, done, ARTICLE_PAT),
    hasSocial:  has(suburb, done, SOCIAL_PAT),
  }))

  const full    = rows.filter(r => r.hasPage && r.hasArticle && r.hasSocial).length
  const partial = rows.filter(r => (r.hasPage || r.hasArticle || r.hasSocial) && !(r.hasPage && r.hasArticle && r.hasSocial)).length

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
            <span className="text-[var(--color-cream-x)]">Partial</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <span className="text-[var(--color-cream-x)]">Missing</span>
          </span>
          <span className="font-semibold" style={{ color: '#22c55e' }}>
            {full}/{rows.length} full coverage
          </span>
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
                  <div key={h} className="w-5 text-center">
                    <span className="text-[9px] font-sans uppercase tracking-wide text-[var(--color-cream-x)]">
                      {h.slice(0, 3)}
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
                const isPartial = (r.hasPage || r.hasArticle || r.hasSocial) && !(r.hasPage && r.hasArticle && r.hasSocial)
                const isFull    = r.hasPage && r.hasArticle && r.hasSocial
                return (
                  <div
                    key={r.suburb}
                    className="flex items-center py-1 border-b border-[var(--color-border-w)] last:border-0"
                  >
                    <span
                      className="flex-1 text-xs font-sans capitalize"
                      style={{
                        color: isFull ? '#22c55e' : isPartial ? '#f97316' : 'var(--color-cream-dim)',
                      }}
                    >
                      {r.suburb.replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <div className="flex">
                      <Dot filled={r.hasPage}    colour="#22c55e" />
                      <Dot filled={r.hasArticle} colour="#22c55e" />
                      <Dot filled={r.hasSocial}  colour="#22c55e" />
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
