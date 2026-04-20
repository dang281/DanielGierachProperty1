'use client'

import { useState } from 'react'

const SUPABASE = 'https://hmwulvvwsksuyqozuxvw.supabase.co/storage/v1/object/public/social-images'

type Platform = 'LinkedIn' | 'Facebook' | 'Website'

const TEMPLATES = [
  {
    id: 'market',
    day: 'TUESDAY',
    time: '07:30',
    platform: 'LinkedIn' as Platform,
    name: 'Market / Authority Post',
    description: 'A single insight or observation with a short body excerpt. Works for market data, buyer/seller tips, area observations, or any post where one clear idea is the focus.',
    size: '1080 × 1080 px',
    generator: 'Puppeteer — screenshot-linkedin.mjs',
    example: `${SUPABASE}/2026-04-28-linkedin-market.png`,
    exampleAlt: 'Example: What Inner East Buyers Actually Make Offers On',
    pillars: ['buyer', 'seller', 'authority'],
    visualNote: 'Dark background · Gold eyebrow label · Noto Serif headline · Gold italic keyword · Manrope body · DG footer',
    command: `node scripts/screenshot-linkedin.mjs \\
  --type market \\
  --label "BUYER INSIGHT" \\
  --headline "What Inner East Buyers Actually Make Offers On" \\
  --keyword "offers" \\
  --body "At open homes in the inner east, buyers almost always say the same things. What they actually offer on tells a different story." \\
  --date "YYYY-MM-DD" \\
  --out content/social/images/YYYY-MM-DD-linkedin-market.png`,
    labelOptions: [
      'MARKET UPDATE',
      'INNER EAST',
      'SELLER INSIGHT',
      'BUYER INSIGHT',
      'AUTHORITY',
      'RATE WATCH',
    ],
    fileFormat: null,
  },
  {
    id: 'poll',
    day: 'WEDNESDAY',
    time: '07:30',
    platform: 'LinkedIn' as Platform,
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
    fileFormat: null,
  },
  {
    id: 'article',
    day: 'THURSDAY',
    time: '07:30',
    platform: 'LinkedIn' as Platform,
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
    fileFormat: null,
  },
  {
    id: 'facebook',
    day: 'AS ASSIGNED',
    time: '08:30',
    platform: 'Facebook' as Platform,
    name: 'Suburb Spotlight',
    description: 'A data-led snapshot of one suburb in the inner east. Median price, growth, days on market, lifestyle notes, and what buyers are competing for. Warmer tone than LinkedIn — still professional and specific.',
    size: '1080 × 1080 px',
    generator: 'screenshot-linkedin.mjs — same pipeline as LinkedIn',
    example: null,
    exampleAlt: null,
    pillars: ['suburb'],
    visualNote: 'Suburb name large in header · 2–3 data stats · CTA: danielgierach.com',
    command: null,
    labelOptions: null,
    fileFormat: null,
  },
  {
    id: 'seo-article',
    day: 'AS SCHEDULED',
    time: '07:00',
    platform: 'Website' as Platform,
    name: 'Insights Article',
    description: 'A long-form, SEO-targeted article published to danielgierach.com/insights. Each article answers one specific question a Brisbane buyer or seller would search for. 800–1,400 words. No fluff. No padding.',
    size: 'danielgierach.com/insights/[slug]',
    generator: 'Written by SEO agent → staged in Astro repo → deployed on publish date',
    example: null,
    exampleAlt: null,
    pillars: ['buyer', 'seller', 'authority'],
    visualNote: 'No custom image needed — page uses site typography and layout. Deployed via Astro/Vercel.',
    command: null,
    labelOptions: null,
    fileFormat: `---
title: "How to Read a Building and Pest Report"
description: "What to look for, what's serious, and when to walk away."
publishDate: YYYY-MM-DD
slug: how-to-read-building-pest-report
type: insights
draft: true
---

## [Section heading — one clear idea per section]

[Paragraph. Short. Specific to Brisbane. No filler.]

## What to look for

[Numbered list only where sequence matters. Prose otherwise.]

## The bottom line

[One direct takeaway. Daniel's voice — calm, honest, precise.]`,
  },
  {
    id: 'seo-tool',
    day: 'AS SCHEDULED',
    time: '07:00',
    platform: 'Website' as Platform,
    name: 'Interactive Tool',
    description: 'A calculator or interactive page on danielgierach.com — stamp duty calculator, borrowing capacity guide, suburb comparison, etc. Tools rank for high-intent searches and generate repeat visits from buyers doing research.',
    size: 'danielgierach.com/tools/[slug]',
    generator: 'Built in Astro → deployed to Vercel → linked from relevant articles',
    example: null,
    exampleAlt: null,
    pillars: ['buyer', 'seller'],
    visualNote: 'Each tool has a title, one-line description, and a call to action linking to danielgierach.com. Indexed on launch date.',
    command: null,
    labelOptions: null,
    fileFormat: `---
title: "Queensland Stamp Duty Calculator 2026"
description: "Calculate transfer duty for your Brisbane property purchase."
publishDate: YYYY-MM-DD
slug: queensland-stamp-duty-calculator
type: tool
draft: true
---

## What this tool does

[One sentence. What the user inputs, what they get back.]

## How stamp duty is calculated in Queensland

[2–3 paragraphs. Plain language. Link to QLD Revenue Office.]

## First home buyer concessions

[Accurate rates. Source: QLD Revenue Office. VERIFY before publish.]`,
  },
]

const DAY_COLOR: Record<string, string> = {
  TUESDAY:        '#8b5cf6',
  WEDNESDAY:      '#8b5cf6',
  THURSDAY:       '#8b5cf6',
  'AS ASSIGNED':  '#c4912a',
  'AS SCHEDULED': '#10b981',
}

const PLATFORM_COLOR: Record<Platform, string> = {
  LinkedIn: '#0a66c2',
  Facebook: '#1877f2',
  Website:  '#10b981',
}

const PLATFORM_SUBTITLE: Record<Platform, string> = {
  LinkedIn: 'Three post types, each with a fixed format. Every image is generated by running the command below in the repo root.',
  Facebook: 'Facebook suburb spotlight — visual generated via the screenshot-linkedin.mjs pipeline.',
  Website:  'SEO content published to danielgierach.com — insights articles and interactive tools.',
}

export default function TemplatesPage() {
  const [platform, setPlatform] = useState<Platform>('LinkedIn')
  const visible = TEMPLATES.filter(t => t.platform === platform)

  return (
    <div className="space-y-10 pb-16 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--color-gold)' }}>
            Post Templates
          </p>
          <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
            Content Templates
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-cream-x)' }}>
            {PLATFORM_SUBTITLE[platform]}
          </p>
        </div>

        {/* Platform toggle */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border border-[var(--color-border-w)] self-start mt-1"
          style={{ background: 'var(--color-card)' }}
        >
          {(['LinkedIn', 'Facebook', 'Website'] as Platform[]).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="px-4 py-1.5 rounded-lg text-[12px] font-sans font-semibold transition-all"
              style={platform === p
                ? { background: PLATFORM_COLOR[p], color: '#fff' }
                : { color: 'var(--color-cream-x)', background: 'transparent' }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 gap-8">
        {visible.map(t => (
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
            <span>Visual / Size</span>
          </div>
          {visible.map((t, i) => (
            <div
              key={t.id}
              className={`grid grid-cols-[100px_120px_120px_1fr_160px] px-5 py-3 text-xs font-sans items-center ${i < visible.length - 1 ? 'border-b border-[var(--color-border-w)]' : ''}`}
              style={{ background: i % 2 === 0 ? 'var(--color-card)' : 'transparent' }}
            >
              <span className="font-semibold" style={{ color: DAY_COLOR[t.day] ?? 'var(--color-cream-dim)' }}>{t.day}</span>
              <span style={{ color: PLATFORM_COLOR[t.platform] }}>{t.platform}</span>
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
  const pc = PLATFORM_COLOR[t.platform]
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
            style={{ background: `${pc}18`, color: pc }}
          >
            {t.platform}
          </span>
          <span className="text-[11px] font-sans text-[var(--color-cream-x)]">{t.time}</span>
        </div>
        <h2 className="text-base font-serif font-normal truncate" style={{ color: 'var(--color-cream)' }}>
          {t.name}
        </h2>
      </div>

      {/* Body: preview + details */}
      <div className="flex flex-col lg:flex-row gap-0">

        {/* Preview pane */}
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
        ) : t.fileFormat ? (
          /* File format preview for website templates */
          <div
            className="lg:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--color-border-w)] overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.45)', minHeight: 200 }}
          >
            <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2"
              style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-[10px] font-mono ml-2" style={{ color: 'rgba(240,236,228,0.3)' }}>
                {t.id === 'seo-article' ? 'article.md' : 'tool.md'}
              </span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed p-4 overflow-x-hidden whitespace-pre-wrap"
              style={{ color: 'rgba(240,236,228,0.55)' }}>
              {t.fileFormat}
            </pre>
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
                : 'Visual generated via screenshot pipeline'}
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

          {/* Visual / deploy note */}
          <div className="rounded-lg px-4 py-3" style={{ background: `${pc}08`, border: `1px solid ${pc}22` }}>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: pc }}>
              {t.platform === 'Website' ? 'Deploy' : 'Visual'}
            </p>
            <p className="text-[11px] font-sans leading-relaxed" style={{ color: 'var(--color-cream-x)' }}>{t.visualNote}</p>
          </div>

          {/* Label options (market post only) */}
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

          {/* Puppeteer command */}
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
