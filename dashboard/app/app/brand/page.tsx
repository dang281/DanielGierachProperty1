const PALETTE = [
  { name: 'Charcoal',     hex: '#0a0806', label: 'Primary background',          text: '#f0ece4' },
  { name: 'Cream',        hex: '#f0ece4', label: 'Primary text on dark',         text: '#0a0806' },
  { name: 'Gold',         hex: '#f5d07a', label: 'Accents, CTAs, highlights',    text: '#0a0806' },
  { name: 'Cream-dim',    hex: 'rgba(240,236,228,0.6)', label: 'Secondary text on dark', text: '#0a0806', solid: '#b8b0a5' },
  { name: 'White',        hex: '#ffffff', label: 'Clean light backgrounds',       text: '#0a0806' },
]

const VOICE_DO = [
  'Australian English — colour, authorise, organised',
  'Suburb-specific — "streets north of Wynnum Road", not "Morningside property"',
  'Data-led — cite the source by name (CoreLogic, REIQ, ABS)',
  'Professional and straight-talking — the most informed person in the room',
  'One dominant idea per post — let it breathe',
]

const VOICE_DONT = [
  'Em dashes — use a comma or rewrite',
  '"In today\'s dynamic market", "dream home", "exciting opportunity"',
  'Price predictions without citing a named institutional source',
  'Competitor agent or agency names',
  'Generic stock suburban photos (cul-de-sacs, anonymous houses)',
  'Instagram content — paused until further notice',
]

const POST_TYPES = [
  {
    type: 'News-reactive',
    when: 'Within 24h of any announcement — RBA, ABS, legislation, APRA',
    bg: '#0a0806',
    accent: '#f5d07a',
    layout: 'Dark background · Gold headline stat · Cream bullets · Source line · Daniel footer',
    size: '1080×1080px',
    canva: { id: 'DAHGjv8sW3w', url: 'https://www.canva.com/d/GPqiM2gkn-aMsWW' },
  },
  {
    type: 'Suburb spotlight',
    when: 'Anytime — evergreen, schedule Tue–Thu LinkedIn / Wed–Sat Facebook',
    bg: '#f0ece4',
    accent: '#0a0806',
    layout: 'Light or dark background · Suburb name large in serif · Key data in gold · 2–3 sentence context · Photo optional',
    size: '1080×1080px',
    canva: null,
  },
  {
    type: 'LinkedIn poll',
    when: 'Weekly — schedule for the day most relevant to the topic, not always Monday',
    bg: '#ffffff',
    accent: '#0a66c2',
    layout: 'Minimal design · Large question text · 4 balanced options · Daniel branding in footer',
    size: '1200×627px',
    canva: null,
  },
]

const VISUAL_BRIEF_FIELDS = [
  { field: 'Format',        example: '1080×1080px square, dark background (#0a0806)' },
  { field: 'Style',         example: 'News-reactive / Suburb spotlight / Poll' },
  { field: 'Headline text', example: 'Exact text for the dominant element — stat, quote, or question' },
  { field: 'Body text',     example: 'Exact bullet points or sentences to appear on the graphic' },
  { field: 'Footer',        example: 'Daniel Gierach · Ray White Bulimba · danielgierach.com' },
  { field: 'Source line',   example: 'Source: CoreLogic, April 2026 — or "N/A"' },
  { field: 'Image',         example: 'Describe any photo, or "Text only — no photo needed"' },
  { field: 'Canva brand kit', example: 'kAGjS7yZLr8' },
]

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)] whitespace-nowrap">
        {label}
      </h2>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

export default function BrandPage() {
  return (
    <div className="flex flex-col gap-10 max-w-5xl">

      {/* Identity */}
      <div>
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ background: '#0a0806', border: '1px solid rgba(245,208,122,0.2)' }}
        >
          <p className="text-[10px] font-sans tracking-[0.22em] uppercase mb-2" style={{ color: '#f5d07a' }}>
            Ray White Bulimba
          </p>
          <h1 className="font-serif text-4xl font-normal mb-3" style={{ color: '#f0ece4', letterSpacing: '-0.02em' }}>
            Daniel Gierach
          </h1>
          <p className="text-sm font-sans mb-1" style={{ color: 'rgba(240,236,228,0.6)' }}>
            Licensed Real Estate Agent · Brisbane Inner East
          </p>
          <p className="text-sm font-sans" style={{ color: 'rgba(240,236,228,0.6)' }}>
            0412 523 821 · daniel.gierach@raywhite.com · danielgierach.com
          </p>
          <div className="mt-6 pt-6 border-t border-[rgba(245,208,122,0.15)]">
            <p className="text-sm font-sans leading-relaxed" style={{ color: 'rgba(240,236,228,0.7)', maxWidth: '52ch' }}>
              Professional, honest, data-led, local. The agent who genuinely knows Brisbane's inner east — not just the postcodes, but the streets, the school catchments, the price nuances between one side of a suburb and the other.
            </p>
          </div>
        </div>
      </div>

      {/* Colour palette */}
      <div>
        <SectionHeader label="Colour Palette" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PALETTE.map(c => (
            <div key={c.name} className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border-w)]">
              <div
                className="h-20 flex items-end p-2.5"
                style={{ background: c.solid ?? c.hex }}
              >
                <code className="text-[10px] font-mono" style={{ color: c.text }}>
                  {c.hex}
                </code>
              </div>
              <div className="p-2.5 bg-[var(--color-card)]">
                <p className="text-xs font-sans font-semibold text-[var(--color-cream)] leading-tight">{c.name}</p>
                <p className="text-[10px] font-sans text-[var(--color-cream-x)] leading-tight mt-0.5">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <SectionHeader label="Typography" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-6 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--color-cream-x)] mb-3">Headings — Serif</p>
            <p className="font-serif text-3xl text-[var(--color-cream)] leading-tight mb-2">What to Expect When Selling in Morningside</p>
            <p className="font-serif text-lg text-[var(--color-cream-dim)]">Who is buying in Morningside</p>
            <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-3">Cormorant Garamond / Playfair Display · Regular or Light at large sizes</p>
          </div>
          <div className="rounded-xl p-6 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--color-cream-x)] mb-3">Body — Sans-serif</p>
            <p className="font-sans text-sm text-[var(--color-cream)] leading-relaxed mb-3">
              Morningside has emerged as one of Brisbane's most active inner-east markets. Here's what sellers need to know before they list.
            </p>
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-3xl font-bold" style={{ color: '#f5d07a' }}>$1.2M</span>
              <span className="font-sans text-xs text-[var(--color-cream-x)]">Median — Q1 2026</span>
            </div>
            <p className="text-[10px] font-sans text-[var(--color-cream-x)] mt-3">Inter / DM Sans · Stats: bold, oversized, let the number breathe</p>
          </div>
        </div>
      </div>

      {/* Voice */}
      <div>
        <SectionHeader label="Voice and Tone" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>Do</p>
            <ul className="flex flex-col gap-2">
              {VOICE_DO.map(item => (
                <li key={item} className="flex items-start gap-2 text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-5 bg-[var(--color-card)] border border-[var(--color-border-w)]">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>Never</p>
            <ul className="flex flex-col gap-2">
              {VOICE_DONT.map(item => (
                <li key={item} className="flex items-start gap-2 text-xs font-sans text-[var(--color-cream-dim)] leading-relaxed">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }}>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Post types */}
      <div>
        <SectionHeader label="Social Post Types" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {POST_TYPES.map(p => (
            <div key={p.type} className="rounded-xl overflow-hidden border border-[var(--color-border-w)] flex flex-col">
              {/* Mini preview */}
              <div
                className="h-28 flex flex-col items-center justify-center px-4 gap-1.5"
                style={{ background: p.bg }}
              >
                <div className="w-16 h-2 rounded-full" style={{ background: p.accent, opacity: 0.9 }} />
                <div className="w-24 h-1.5 rounded-full" style={{ background: p.accent, opacity: 0.4 }} />
                <div className="w-20 h-1.5 rounded-full" style={{ background: p.accent, opacity: 0.4 }} />
                <div className="w-10 h-1 rounded-full mt-1" style={{ background: p.accent, opacity: 0.2 }} />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1 bg-[var(--color-card)]">
                <p className="text-xs font-sans font-semibold text-[var(--color-cream)]">{p.type}</p>
                <p className="text-[10px] font-sans text-[var(--color-cream-x)] leading-relaxed flex-1">{p.when}</p>
                <p className="text-[10px] font-sans text-[var(--color-cream-dim)] leading-relaxed">{p.layout}</p>
                <p className="text-[10px] font-sans text-[var(--color-cream-x)]">{p.size}</p>
                {p.canva && (
                  <a
                    href={p.canva.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-sans font-semibold mt-1"
                    style={{ color: '#818cf8' }}
                  >
                    Open template in Canva ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual brief format */}
      <div>
        <SectionHeader label="Visual Brief Format" />
        <div className="rounded-xl border border-[var(--color-border-w)] bg-[var(--color-card)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border-w)]">
            <p className="text-xs font-sans text-[var(--color-cream-dim)]">
              Every content file the Social Media Agent produces must include this section so visuals can be created without back-and-forth.
            </p>
          </div>
          <div className="divide-y divide-[var(--color-border-w)]">
            {VISUAL_BRIEF_FIELDS.map(({ field, example }) => (
              <div key={field} className="grid grid-cols-[160px_1fr] px-5 py-3 gap-4 items-start">
                <p className="text-[11px] font-sans font-semibold text-[var(--color-cream)]">{field}</p>
                <p className="text-[11px] font-sans text-[var(--color-cream-dim)] leading-relaxed">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canva resources */}
      <div>
        <SectionHeader label="Canva Resources" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Brand Kit', value: 'kAGjS7yZLr8', url: null, note: 'Use for all AI-generated designs' },
            { label: 'News-reactive template', value: 'DAHGjv8sW3w', url: 'https://www.canva.com/d/GPqiM2gkn-aMsWW', note: 'Duplicate — never publish over master' },
          ].map(r => (
            <div key={r.label} className="rounded-xl p-4 bg-[var(--color-card)] border border-[var(--color-border-w)] flex flex-col gap-1.5">
              <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--color-cream-x)]">{r.label}</p>
              <code className="text-sm font-mono text-[var(--color-cream)]">{r.value}</code>
              <p className="text-[10px] font-sans text-[var(--color-cream-x)]">{r.note}</p>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="text-[10px] font-sans font-semibold mt-1" style={{ color: '#818cf8' }}>
                  Open in Canva ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
