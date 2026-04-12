#!/usr/bin/env node
/**
 * Syncs content/intel/*.md files into Supabase market_intel table.
 * Called by post-commit hook.
 *
 * Intel file format (content/intel/YYYY-MM-DD-title-slug.md):
 *   # Title
 *   **Category:** market|planning|infrastructure|development|policy|data
 *   **Relevance:** 1-10
 *   **Post worthy:** yes|no
 *   **Suburbs:** Suburb1, Suburb2
 *   **Source:** https://...
 *   **Published date:** YYYY-MM-DD
 *
 *   Summary paragraph(s)
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const SUPABASE_URL = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY
const INTEL_DIR    = new URL('./content/intel/', import.meta.url).pathname

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

function field(md, key) {
  const m = md.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'))
  return m ? m[1].trim() : null
}

function parseTitle(md) {
  const m = md.match(/^#\s+(.+)/m)
  return m ? m[1].trim() : null
}

function parseSummary(md) {
  // Everything after the frontmatter fields block
  const m = md.match(/\n\n([\s\S]+)$/)
  return m ? m[1].trim().slice(0, 800) : null
}

function parseSuburbs(raw) {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, { headers: HEADERS, ...options })
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, data: text } }
}

async function main() {
  let files
  try {
    files = (await readdir(INTEL_DIR)).filter(f => f.endsWith('.md')).sort()
  } catch {
    console.log('No content/intel/ directory yet — skipping intel sync')
    return
  }

  if (files.length === 0) { console.log('No intel files found'); return }

  // Fetch existing titles to skip duplicates
  const existing = await supabaseFetch('/rest/v1/market_intel?select=title&limit=500')
  const existingTitles = new Set((existing.data ?? []).map(r => r.title))

  console.log(`Found ${files.length} intel file(s), ${existingTitles.size} already in Supabase\n`)
  let inserted = 0, skipped = 0, errored = 0

  for (const file of files) {
    const md    = await readFile(join(INTEL_DIR, file), 'utf8')
    const title = parseTitle(md)
    if (!title) { console.log(`  SKIP  ${file} — no title`); skipped++; continue }
    if (existingTitles.has(title)) { console.log(`  SKIP  ${file} — already synced`); skipped++; continue }

    const postWorthyRaw = field(md, 'Post worthy') ?? 'no'
    const row = {
      title,
      summary:         parseSummary(md) ?? '',
      source_url:      field(md, 'Source'),
      category:        field(md, 'Category'),
      relevance_score: parseInt(field(md, 'Relevance') ?? '5'),
      post_worthy:     postWorthyRaw.toLowerCase().startsWith('y'),
      suburbs:         parseSuburbs(field(md, 'Suburbs')),
      published_date:  field(md, 'Published date'),
    }

    const res = await supabaseFetch('/rest/v1/market_intel', {
      method: 'POST',
      body: JSON.stringify(row),
    })

    if (res.ok) { console.log(`  INSERT ${file}`); inserted++ }
    else { console.log(`  ERROR  ${file} — ${res.status}: ${JSON.stringify(res.data)}`); errored++ }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${errored} errors`)
}

main().catch(console.error)
