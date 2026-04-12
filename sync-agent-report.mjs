#!/usr/bin/env node
/**
 * Syncs content/reports/*.md files into Supabase agent_reports table.
 * Called by post-commit hook alongside sync-social-to-supabase.mjs
 *
 * Report file format (content/reports/YYYY-WXX-social-report.md):
 *   **Agent:** social-media
 *   **Week start:** YYYY-MM-DD
 *   **Posts created:** N
 *   **Posts published:** N
 *   **Posts scheduled:** N
 *   **Posts rejected:** N
 *   ## Key themes\n- theme1\n- theme2
 *   ## What worked\n...
 *   ## What didn't work\n...
 *   ## Next week focus\n...
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const SUPABASE_URL = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY
const REPORTS_DIR  = new URL('./content/reports/', import.meta.url).pathname

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=minimal',
}

function field(md, key) {
  const m = md.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'))
  return m ? m[1].trim() : null
}

function section(md, heading) {
  const m = md.match(new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))
  return m ? m[1].trim() : null
}

function parseThemes(md) {
  const raw = section(md, 'Key themes')
  if (!raw) return []
  return raw.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean)
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
    files = (await readdir(REPORTS_DIR)).filter(f => f.endsWith('.md')).sort()
  } catch {
    console.log('No content/reports/ directory yet — skipping agent report sync')
    return
  }

  if (files.length === 0) { console.log('No report files found'); return }
  console.log(`Syncing ${files.length} report file(s)…\n`)

  let upserted = 0, errored = 0

  for (const file of files) {
    const md = await readFile(join(REPORTS_DIR, file), 'utf8')
    const agentName = field(md, 'Agent')
    const weekStart = field(md, 'Week start')
    if (!agentName || !weekStart) {
      console.log(`  SKIP  ${file} — missing Agent or Week start`)
      continue
    }

    const row = {
      agent_name:      agentName,
      week_start:      weekStart,
      posts_created:   parseInt(field(md, 'Posts created') ?? '0'),
      posts_published: parseInt(field(md, 'Posts published') ?? '0'),
      posts_scheduled: parseInt(field(md, 'Posts scheduled') ?? '0'),
      posts_rejected:  parseInt(field(md, 'Posts rejected') ?? '0'),
      key_themes:      parseThemes(md),
      what_worked:     section(md, 'What worked'),
      what_didnt_work: section(md, "What didn't work"),
      next_week_focus: section(md, 'Next week focus'),
    }

    const res = await supabaseFetch('/rest/v1/agent_reports', {
      method: 'POST',
      body: JSON.stringify(row),
    })

    if (res.ok) { console.log(`  UPSERT ${file}`); upserted++ }
    else { console.log(`  ERROR  ${file} — ${res.status}: ${JSON.stringify(res.data)}`); errored++ }
  }

  console.log(`\nDone: ${upserted} upserted, ${errored} errors`)
}

main().catch(console.error)
