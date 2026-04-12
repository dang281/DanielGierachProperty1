#!/usr/bin/env node
/**
 * Syncs content/social/*.md files into Supabase content_items table.
 * Upserts by title — inserts new records and updates existing ones.
 *
 * Usage: node sync-social-to-supabase.mjs
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Load .env from repo root so the script works from git hooks too
const envPath = new URL('./.env', import.meta.url).pathname
if (existsSync(envPath)) {
  const envText = await readFile(envPath, 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const SUPABASE_URL  = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const SUPABASE_KEY  = process.env.SUPABASE_KEY
const SOCIAL_DIR    = new URL('./content/social/', import.meta.url).pathname

if (!SUPABASE_KEY) {
  console.error('SUPABASE_KEY not set — aborting sync')
  process.exit(1)
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

// --- Helpers -----------------------------------------------------------------

function field(md, key) {
  const m = md.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`, 'i'))
  return m ? m[1].trim() : null
}

function section(md, heading) {
  const m = md.match(new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))
  return m ? m[1].trim() : null
}

function parsePlatform(raw) {
  if (!raw) return null
  const r = raw.toLowerCase()
  if (r.includes('linkedin'))  return 'linkedin'
  if (r.includes('facebook'))  return 'facebook'
  if (r.includes('instagram')) return 'instagram'
  return null
}

function parsePillar(raw) {
  if (!raw) return null
  const r = raw.toLowerCase()
  if (r.includes('seller'))    return 'seller'
  if (r.includes('authority')) return 'authority'
  if (r.includes('suburb'))    return 'suburb'
  if (r.includes('proof'))     return 'proof'
  if (r.includes('buyer'))     return 'buyer'
  return null
}

function parseStatus(raw) {
  if (!raw) return 'ready'
  const r = raw.toLowerCase()
  if (r.includes('posted'))    return 'posted'
  if (r.includes('scheduled')) return 'scheduled'
  if (r.includes('idea'))      return 'idea'
  if (r.includes('rejected'))  return 'rejected'
  return 'ready'
}

function parseVisualStatus(raw) {
  if (!raw) return 'needed'
  const r = raw.toLowerCase()
  if (r.includes('approved'))  return 'approved'
  if (r.includes('revision'))  return 'needs_revision'
  if (r.includes('draft'))     return 'draft'
  return 'needed'
}

function parseScheduledTime(raw) {
  if (!raw) return null
  // Strip timezone suffix e.g. "08:30 AEST" → "08:30"
  const m = raw.match(/(\d{1,2}:\d{2})/)
  return m ? m[1] : null
}

function parseTitle(md, filename) {
  const m = md.match(/^#\s+(.+)/m)
  if (m) return m[1].trim()
  // Fall back to filename without date prefix
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '').replace(/-/g, ' ')
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: HEADERS,
    ...options,
  })
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, data: text } }
}

// --- Main --------------------------------------------------------------------

async function main() {
  // Fetch existing records (id + title) to decide insert vs update
  const existing = await supabaseFetch('/rest/v1/content_items?select=id,title&limit=1000')
  if (!existing.ok || !Array.isArray(existing.data)) {
    console.error(`Failed to fetch existing records: ${existing.status} — ${JSON.stringify(existing.data)}`)
    process.exit(1)
  }
  const existingMap = new Map(existing.data.map(r => [r.title, r.id]))

  const files = (await readdir(SOCIAL_DIR))
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`Found ${files.length} markdown files, ${existingMap.size} already in Supabase\n`)

  let inserted = 0, updated = 0, skipped = 0, errored = 0

  for (const file of files) {
    const md    = await readFile(join(SOCIAL_DIR, file), 'utf8')
    const title = parseTitle(md, file)

    const platform     = parsePlatform(field(md, 'Platform'))
    if (!platform) {
      console.log(`  SKIP  ${file} — no recognisable platform`)
      skipped++
      continue
    }

    const caption      = section(md, 'Caption')
    const visualBrief  = section(md, 'Visual Brief')
    const notes        = section(md, 'Notes for Daniel')
    const hashtags     = section(md, 'Hashtags')

    const row = {
      title,
      platform,
      content_type:   field(md, 'Format') ?? 'Post',
      caption:        [caption, hashtags].filter(Boolean).join('\n\n') || null,
      status:         parseStatus(field(md, 'Status')),
      content_pillar: parsePillar(field(md, 'Content Pillar')),
      scheduled_date: field(md, 'Publish date') ?? null,
      scheduled_time: parseScheduledTime(field(md, 'Scheduled time')),
      notes:          notes ?? null,
      visual_brief:   visualBrief ?? null,
      visual_status:  parseVisualStatus(field(md, 'Visual status')),
      canva_url:      field(md, 'Canva URL') ?? null,
    }

    const existingId = existingMap.get(title)
    let res
    if (existingId) {
      // Update existing record
      res = await supabaseFetch(`/rest/v1/content_items?id=eq.${existingId}`, {
        method: 'PATCH',
        body: JSON.stringify(row),
      })
      if (res.ok) { console.log(`  UPDATE ${file}`); updated++ }
      else { console.log(`  ERROR  ${file} — ${res.status}: ${JSON.stringify(res.data)}`); errored++ }
    } else {
      // Insert new record
      res = await supabaseFetch('/rest/v1/content_items', {
        method: 'POST',
        body: JSON.stringify(row),
      })
      if (res.ok) { console.log(`  INSERT ${file}`); inserted++ }
      else { console.log(`  ERROR  ${file} — ${res.status}: ${JSON.stringify(res.data)}`); errored++ }
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${errored} errors`)
}

main().catch(console.error)
