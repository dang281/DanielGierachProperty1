#!/usr/bin/env node
/**
 * Syncs content/social/*.md files into Supabase content_items table.
 * Upserts by title — inserts new records and updates existing ones.
 *
 * Usage: node sync-social-to-supabase.mjs
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

// Load .env from repo root so the script works from git hooks too
const envPath = new URL('./.env', import.meta.url).pathname
if (existsSync(envPath)) {
  const envText = await readFile(envPath, 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const SUPABASE_URL    = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const SUPABASE_KEY    = process.env.SUPABASE_KEY
const SOCIAL_DIR      = new URL('./content/social/', import.meta.url).pathname
const REPO_ROOT       = new URL('./', import.meta.url).pathname
const STORAGE_BUCKET  = 'social-images'
const STORAGE_BASE    = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`

// Upload a local PNG to Supabase Storage and return its public URL.
// Returns null if the file doesn't exist or upload fails.
async function uploadImage(localPath) {
  const absPath = join(REPO_ROOT, localPath)
  if (!existsSync(absPath)) return null
  const filename = localPath.split('/').pop()
  const bytes = readFileSync(absPath)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: bytes,
  })
  if (!res.ok) {
    const txt = await res.text()
    console.warn(`  WARN  image upload failed for ${filename}: ${txt}`)
    return null
  }
  return `${STORAGE_BASE}/${filename}`
}

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
  if (r.includes('archived'))  return 'archived'
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
  const existing = await supabaseFetch('/rest/v1/content_items?select=id,title&limit=2000')
  if (!existing.ok || !Array.isArray(existing.data)) {
    console.error(`Failed to fetch existing records: ${existing.status} — ${JSON.stringify(existing.data)}`)
    process.exit(1)
  }

  // Deduplicate: if multiple records share a title, keep the first and delete the rest
  const seenTitles = new Map()  // title -> id to keep
  const toDelete = []
  for (const r of existing.data) {
    if (seenTitles.has(r.title)) {
      toDelete.push(r.id)
    } else {
      seenTitles.set(r.title, r.id)
    }
  }
  if (toDelete.length > 0) {
    console.log(`  DEDUP  Removing ${toDelete.length} duplicate record(s)...`)
    for (const id of toDelete) {
      await supabaseFetch(`/rest/v1/content_items?id=eq.${id}`, { method: 'DELETE' })
    }
  }

  const existingMap = seenTitles

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
    const articleIntro = section(md, 'Article Intro')

    // Extract poll options → store as JSON array in platform_variants
    const pollOptionsSection = section(md, 'Poll [Oo]ptions?') ?? section(md, 'Poll options') ?? section(md, 'Poll Options')
    const pollOptions = pollOptionsSection
      ? pollOptionsSection.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
      : null

    // If there's a local **Image:** PNG, upload it to Supabase Storage.
    // The returned public URL overwrites any Canva Thumbnail for this post.
    const localImagePath = field(md, 'Image')
    let visualThumbnail  = field(md, 'Canva Thumbnail') ?? null
    if (localImagePath && localImagePath.endsWith('.png')) {
      const uploaded = await uploadImage(localImagePath)
      if (uploaded) visualThumbnail = uploaded
    }

    const row = {
      title,
      platform,
      content_type:      field(md, 'Format') ?? 'Post',
      caption:           [caption, hashtags].filter(Boolean).join('\n\n') || null,
      status:            parseStatus(field(md, 'Status')),
      content_pillar:    parsePillar(field(md, 'Content Pillar')),
      scheduled_date:    field(md, 'Publish date') ?? null,
      scheduled_time:    parseScheduledTime(field(md, 'Scheduled time')),
      notes:             notes ?? null,
      objective:         articleIntro ?? null,
      visual_brief:      visualBrief ?? null,
      visual_status:     parseVisualStatus(field(md, 'Visual status')),
      canva_url:         field(md, 'Canva URL') ?? null,
      visual_thumbnail:  visualThumbnail,
      platform_variants: pollOptions || null,
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
