'use client'

import { useState } from 'react'

const SUPABASE = 'https://hmwulvvwsksuyqozuxvw.supabase.co/storage/v1/object/public/social-images'

const TEMPLATES = [
  {
    id: 'authority',
    day: 'TUESDAY',
    time: '07:30',
    platform: 'LinkedIn',
    name: 'Market / Authority Post',
    description: 'A numbered list of 5 points on a single theme. Works for buyer checklists, seller tips, market observations, or any topic where a structured breakdown adds authority.',
    size: '1080 × 1350 px',
    generator: 'Puppeteer — screenshot-linkedin.mjs',
    example: `${SUPABASE}/2026-04-21-linkedin-market.png`,
    exampleAlt: 'Example: Five things to do before you walk into an auction',
    pillars: ['buyer', 'seller', 'authority'],
    visualNote: 'Dark background · Gold numbered list · Fraunces / Inter / JetBrains Mono · DG footer circle',
    command: `node scripts/screenshot-linkedin.mjs \\
  --type authority \\
  --label "BUYER'S CHECKLIST" \\
  --headline "Five things to do before you walk into an auction." \\
  --keyword "auction" \\
  --p1t "Check the flood overlay." \\
  --p1b "Brisbane City Council publishes flood maps for free." \\
  --p2t "Read the contract, then re-read." \\
  --p2b "Special conditions are where money quietly disappears." \\
  --p3t "Get pre-approved, not pre-qualified." \\
  --p3b "Pre-qualified is a guess. Pre-approved is a commitment." \\
  --p4t "Inspect twice: alone, then with a builder." \\
  --p4b "Your first visit is emotional. The second is forensic." \\
  --p5t "Write your ceiling on paper." \\
  --p5b "Auction rooms are designed to push past your number." \\
  --date "YYYY-MM-DD" \\
  --out content/social/images/YYYY-MM-DD-linkedin-market.png`,
    labelOptions: [
      'MARKET UPDATE',
      'SELLER INSIGHT',
      'BUYER\'S CHECKLIST',
      'INNER EAST',
      'AUTHORITY',
      'RATE WATCH',
    ],
  },
  {
    id: 'poll',
    day: 'WEDNESDAY',
    time: '07:30',
    platform: 'LinkedIn',
    name: 'Poll',
    description: 'A short question with 4 options. Drives engagement and signals that Daniel is curious about how his audience thinks. Keep the setup concise and the question genuinely interesting.',
    size: 'No image needed',
    generator: 'Text only — no Puppeteer command',
    example: null,
    exampleAlt: null,
    pillars: ['seller', 'buyer', 'authority'],
    visualNote: 'LinkedIn\'s native poll UI — no image required',
    command: null,
    labelOptions: null,
  },
  {
    id: 'article',
    day: 'THURSDAY',
    time: '07:30',
    platform: 'LinkedIn',
    name: 'Article Feature',
    description: 'Links to an article on danielgierach.com/insights. The caption gives one strong reason to click through. The cover image is generated from the article\'s details using the article-cover template.',
    size: '1200 × 627 px (article cover)',
    generator: 'Puppeteer — screenshot-linkedin.mjs',
    example: `${SUPABASE}/2026-04-16-article-cover.png`,
    exampleAlt: 'Example: How to Read a Building and Pest Report',
    pillars: ['buyer', 'seller'],
    visualNote: 'Dark background · Issue number · Fraunces headline · DG byline · danielgierach.com',
    command: `node scripts/screenshot-linkedin.mjs \\
  --type article-cover \\
  --issue "01" \\
  --headline "How to Read a Building and Pest Report" \\
  --tagline "What matters, and what doesn't." \\
  --readtime "5 MIN READ" \\
  --date "YYYY-MM-DD" \\
  --out content/social/images/YYYY-MM-DD-article-cover.png`,
    labelOptions: null,
  },
  {
    id: 'facebook',
    day: 'AS ASSIGNED',
    time: '08:30',
    platform: 'Facebook',
    name: 'Suburb Spotlight',
    description: 'A data-led snapshot of one suburb in the inner east. Median price, growth, days on market, lifestyle notes, and what buyers are competing for. Warmer tone than LinkedIn — still professional and specific.',
    size: '1080 × 1080 px',
    generator: 'Canva — brand kit kAGjS7yZLr8',
    example: null,
    exampleAlt: null,
    pillars: ['suburb'],
    visualNote: 'Suburb name large in header · 2–3 data stats · CTA: danielgierach.com · Brand kit kAGjS7yZLr8',
    command: null,
    labelOptions: null,
  },
]

const DAY_COLOR: Record<string, string> = {
  TUESDAY:      '#8b5cf6',
  WEDNESDAY:    '#8b5cf6',
  THURSDAY:     '#8b5cf6',
  'AS ASSIGNED':'#c4912a',
}

const PLATFORM_COLOR: Record<string, string> = {
  LinkedIn: '#0a66c2',
  Facebook: '#1877f2',
}

export default function TemplatesPage() {
  return (
    <div className="space-y-10 pb-16 max-w-6xl">

      {/* Header */}
      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--color-gold)' }}>
          Post Templates
        </p>
        <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
          Content Templates
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-cream-x)' }}>
          Four post types, each with a fixed format. Every image is generated by running the command below in the repo root.
        </p>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 gap-8">
        {TEMPLATES.map(t => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      {/* Quick reference */}
      <div>
        <SectionRule label="Quick Reference" />
        <div className="rounded-xl overflow-hidden border border-[var(--color-border-w)]">
          <div className="grid grid-cols-[100px_120px_120px_1fr_160px] text-[10px] font-sans font-bold tracking-wider uppercase px-5 py-2.5 border-b border-[var(--color-border-w)]" style={{ color: 'var(--color-cream-x)' }}>
            <span>Day</span>
            <span>Platform</span>
            <span>Time</span>
            <span>Post Type</span>
            <span>Visual</span>
          </div>
          {TEMPLATES.map((t, i) => (
            <div
              key={t.id}
              className={`grid grid-cols-[100px_120px_120px_1fr_160px] px-5 py-3 text-xs font-sans items-center ${i < TEMPLATES.length - 1 ? 'border-b border-[var(--color-border-w)]' : ''}`}
              style={{ background: i % 2 === 0 ? 'var(--color-card)' : 'transparent' }}
            >
              <span className="font-semibold" style={{ color: DAY_COLOR[t.day] ?? 'var(--color-cream-dim)' }}>{t.day}</span>
              <span style={{ color: PLATFORM_COLOR[t.platform] ?? 'var(--color-cream-dim)' }}>{t.platform}</span>
              <span style={{ color: 'var(--color-cream-dim)' }}>{t.time}</span>
              <span style={{ color: 'var(--color-cream)' }}>{t.name}</span>
              <span style={{ color: 'var(--color-cream-x)' }}>{t.size}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)] whitespace-nowrap">
        {label}
      </h2>
      <div className="flex-1 border-t border-[var(--color-border-w)]" />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-[10px] font-sans font-semibold px-2.5 py-1 rounded transition-colors"
      style={{
        background: copied ? 'rgba(245,208,122,0.18)' : 'rgba(245,208,122,0.08)',
        color: copied ? 'var(--color-gold)' : 'var(--color-cream-x)',
        border: '1px solid rgba(245,208,122,0.2)',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function TemplateCard({ template: t }: { template: typeof TEMPLATES[number] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-border-w)]" style={{ background: 'var(--color-card)' }}>

      {/* Card header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-w)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-[9px] font-sans font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: `${DAY_COLOR[t.day] ?? '#c4912a'}18`, color: DAY_COLOR[t.day] ?? '#c4912a' }}
          >
            {t.day}
          </span>
          <span
            className="text-[9px] font-sans font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: `${PLATFORM_COLOR[t.platform]}18`, color: PLATFORM_COLOR[t.platform] }}
          >
            {t.platform}
          </span>
          <span className="text-[11px] font-sans text-[var(--color-cream-x)]">{t.time}</span>
        </div>
        <h2 className="text-base font-serif font-normal truncate" style={{ color: 'var(--color-cream)' }}>
          {t.name}
        </h2>
      </div>

      {/* Body: image + details */}
      <div className="flex flex-col lg:flex-row gap-0">

        {/* Image preview */}
        {t.example ? (
          <div
            className="lg:w-72 flex-shrink-0 flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-[var(--color-border-w)]"
            style={{ background: '#0a0806', minHeight: 200 }}
          >
            <img
              src={t.example}
              alt={t.exampleAlt ?? ''}
              className="w-full max-w-[220px] rounded-lg shadow-xl object-cover"
              style={{ border: '1px solid rgba(245,208,122,0.15)' }}
            />
          </div>
        ) : (
          <div
            className="lg:w-72 flex-shrink-0 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-[var(--color-border-w)] gap-3"
            style={{ background: '#0a0806', minHeight: 200 }}
          >
            <span className="text-3xl opacity-30">
              {t.id === 'poll' ? '📊' : '📷'}
            </span>
            <p className="text-[11px] font-sans text-center leading-relaxed" style={{ color: 'rgba(240,236,228,0.35)' }}>
              {t.id === 'poll'
                ? 'No image — LinkedIn native poll'
                : 'Canva design — no generated example'}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="flex-1 p-6 flex flex-col gap-5">

          {/* Description */}
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--color-cream-dim)' }}>
            {t.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {t.pillars.map(p => (
              <span
                key={p}
                className="text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,208,122,0.08)', color: 'var(--color-gold)', border: '1px solid rgba(245,208,122,0.15)' }}
              >
                {p}
              </span>
            ))}
            <span className="text-[9px] font-sans tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,236,228,0.05)', color: 'var(--color-cream-x)', border: '1px solid var(--color-border-w)' }}>
              {t.size}
            </span>
          </div>

          {/* Visual note */}
          <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(245,208,122,0.05)', border: '1px solid rgba(245,208,122,0.12)' }}>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-gold)' }}>Visual</p>
            <p className="text-[11px] font-sans leading-relaxed" style={{ color: 'var(--color-cream-x)' }}>{t.visualNote}</p>
          </div>

          {/* Label options (authority only) */}
          {t.labelOptions && (
            <div>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-cream-x)' }}>--label options</p>
              <div className="flex flex-wrap gap-1.5">
                {t.labelOptions.map(l => (
                  <code key={l} className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(240,236,228,0.06)', color: 'var(--color-cream-dim)', border: '1px solid var(--color-border-w)' }}>
                    {l}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Command */}
          {t.command && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-sans font-semibold uppercase tracking-widest" style={{ color: 'var(--color-cream-x)' }}>
                  Generate command
                </p>
                <CopyButton text={t.command} />
              </div>
              <pre
                className="text-[11px] font-mono leading-relaxed rounded-lg p-4 overflow-x-auto"
                style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--color-cream-dim)', border: '1px solid var(--color-border-w)' }}
              >
                {t.command}
              </pre>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
