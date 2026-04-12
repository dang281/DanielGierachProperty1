#!/usr/bin/env node
/**
 * Syncs content/opportunities/*.md files into Supabase opportunities table.
 * Called by post-commit hook.
 *
 * Opportunity file format (content/opportunities/YYYY-WXX.md):
 *   # Growth Opportunities — Week YYYY-WXX
 *   **Week start:** YYYY-MM-DD
 *
 *   ## 1. Opportunity Title
 *   **Category:** lead-gen|website|content|positioning|seo
 *   **Priority:** high|medium|low
 *   **Why it matters:** ...
 *   **Expected impact:** ...
 *   **Next action:** ...
 *
 *   ## 2. ...
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const SUPABASE_URL = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY
const OPP_DIR      = new URL('./content/opportunities/', import.meta.url).pathname

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=minimal',
}

function field(block, key) {
  const m = block.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'))
  return m ? m[1].trim() : null
}

function parsePriority(raw) {
  if (!raw) return 2
  const r = raw.toLowerCase()
  if (r.startsWith('h')) return 1
  if (r.startsWith('l')) return 3
  return 2
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
    files = (await readdir(OPP_DIR)).filter(f => f.endsWith('.md')).sort()
  } catch {
    console.log('No content/opportunities/ directory yet — skipping opportunity sync')
    return
  }

  if (files.length === 0) { console.log('No opportunity files found'); return }
  console.log(`Syncing ${files.length} opportunity file(s)…\n`)

  let upserted = 0, errored = 0

  for (const file of files) {
    const md        = await readFile(join(OPP_DIR, file), 'utf8')
    const weekStart = field(md, 'Week start')
    if (!weekStart) { console.log(`  SKIP  ${file} — missing Week start`); continue }

    // Split into per-opportunity blocks (## 1. Title, ## 2. Title, etc.)
    const blocks = md.split(/\n## \d+\.\s+/).slice(1)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      const title = lines[0].trim()
      if (!title) continue

      const row = {
        title,
        week_generated:  weekStart,
        category:        field(block, 'Category'),
        priority:        parsePriority(field(block, 'Priority')),
        why_it_matters:  field(block, 'Why it matters') ?? '',
        expected_impact: field(block, 'Expected impact') ?? '',
        next_action:     field(block, 'Next action') ?? '',
        status:          'open',
      }

      const res = await supabaseFetch('/rest/v1/opportunities', {
        method: 'POST',
        body: JSON.stringify(row),
      })

      if (res.ok) { console.log(`  UPSERT "${title}"`); upserted++ }
      else { console.log(`  ERROR  "${title}" — ${res.status}: ${JSON.stringify(res.data)}`); errored++ }
    }
  }

  console.log(`\nDone: ${upserted} upserted, ${errored} errors`)
}

main().catch(console.error)
