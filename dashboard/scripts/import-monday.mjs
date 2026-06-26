// One-shot Monday.com import.
//
// Pulls the four boards Daniel uses (Property Pipeline, Contacts,
// Buyers/Investors/Developers, Properties) plus the Pipeline subitems board
// and writes them to the monday_* mirror tables in Supabase. Idempotent:
// upserts on monday_item_id so re-running just refreshes.
//
// USAGE:
//   node scripts/import-monday.mjs            # full import
//   node scripts/import-monday.mjs --dry-run  # fetch only, no writes
//   node scripts/import-monday.mjs --board=pipeline   # single board
//
// REQUIRES env vars (in .env.local at the dashboard repo root):
//   MONDAY_API_TOKEN              from monday.com -> profile -> Developers -> My access tokens
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY     bypasses RLS for the bulk write
//
// The script loads .env.local automatically. No `source` needed.

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ----------------------------------------------------------------------------
// env loader (no extra dep)
// ----------------------------------------------------------------------------
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnv()

const MONDAY_TOKEN  = process.env.MONDAY_API_TOKEN
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!MONDAY_TOKEN)  { console.error('Missing MONDAY_API_TOKEN');                   process.exit(1) }
if (!SUPABASE_URL)  { console.error('Missing NEXT_PUBLIC_SUPABASE_URL');           process.exit(1) }
if (!SUPABASE_KEY)  { console.error('Missing SUPABASE_SERVICE_ROLE_KEY');          process.exit(1) }

// ----------------------------------------------------------------------------
// boards
// ----------------------------------------------------------------------------
const BOARDS = {
  pipeline:   { id: 2076186563, table: 'monday_pipeline_items' },
  contacts:   { id: 2060096425, table: 'monday_contacts' },
  leads:      { id: 2060874428, table: 'monday_leads' },
  properties: { id: 2067629054, table: 'monday_properties' },
  referrals:  { id: 2061163472, table: 'monday_referrals' },
}

const SUBITEM_BOARDS = [
  { parentBoardId: 2076186563, subitemBoardId: 2076186568 }, // Pipeline subitems
  { parentBoardId: 2067629054, subitemBoardId: 2067629057 }, // Properties subitems
  { parentBoardId: 2060096425, subitemBoardId: 2060789799 }, // Contacts subitems
  { parentBoardId: 2060874428, subitemBoardId: 2060874688 }, // Leads subitems
  { parentBoardId: 2061163472, subitemBoardId: 2061163475 }, // Referrals subitems
]

const RELATION_COLUMN_TYPES = new Set(['board_relation', 'board-relation', 'dependency'])

// ----------------------------------------------------------------------------
// monday client
// ----------------------------------------------------------------------------
async function monday(query, variables = {}) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: MONDAY_TOKEN,
      'API-Version': '2024-10',
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(`Monday API error: ${JSON.stringify(json.errors)}`)
  if (json.error_message) throw new Error(`Monday error: ${json.error_message}`)
  return json.data
}

const COLUMNS_QUERY = `
  query ($ids: [ID!]) {
    boards(ids: $ids) {
      id
      columns { id title type settings_str }
    }
  }
`

async function fetchBoardColumns(boardIds) {
  const data = await monday(COLUMNS_QUERY, { ids: boardIds.map(String) })
  const rows = []
  for (const board of data.boards ?? []) {
    board.columns.forEach((c, idx) => {
      let settings = {}
      try { settings = c.settings_str ? JSON.parse(c.settings_str) : {} } catch {}
      rows.push({
        board_id:    String(board.id),
        column_id:   c.id,
        title:       c.title,
        column_type: c.type,
        position:    idx,
        settings,
      })
    })
  }
  return rows
}

const ITEMS_PAGE_QUERY = `
  query ($boardId: ID!, $cursor: String) {
    boards(ids: [$boardId]) {
      id
      items_page(limit: 500, cursor: $cursor) {
        cursor
        items {
          id
          name
          created_at
          updated_at
          group { id title }
          column_values {
            id
            type
            text
            value
            ... on BoardRelationValue { display_value linked_item_ids }
            ... on MirrorValue { display_value }
            ... on DependencyValue { display_value linked_item_ids }
          }
        }
      }
    }
  }
`

async function fetchAllItems(boardId) {
  const items = []
  let cursor = null
  let pageNum = 0
  do {
    pageNum++
    const data = await monday(ITEMS_PAGE_QUERY, { boardId: String(boardId), cursor })
    const board = data.boards?.[0]
    if (!board) throw new Error(`Board ${boardId} not accessible`)
    const page = board.items_page
    items.push(...page.items)
    cursor = page.cursor
    process.stdout.write(`\r    page ${pageNum}, ${items.length} items so far`)
  } while (cursor)
  process.stdout.write('\n')
  return items
}

// ----------------------------------------------------------------------------
// transform
// ----------------------------------------------------------------------------
function rawJsonbFromColumns(columnValues) {
  const out = {}
  for (const cv of columnValues) {
    const entry = { type: cv.type, text: cv.text, value: cv.value }
    if (cv.display_value !== undefined && cv.display_value !== null) {
      entry.display_value = cv.display_value
      // For board_relation and mirror columns Monday returns text:null but
      // populates display_value with the joined linked-item names. Mirror that
      // back into text so the UI's generic text rendering still works.
      if (!entry.text) entry.text = cv.display_value
    }
    if (Array.isArray(cv.linked_item_ids)) {
      entry.linked_item_ids = cv.linked_item_ids.map(String)
    }
    out[cv.id] = entry
  }
  return out
}

function toMirrorRow(item) {
  return {
    monday_item_id:     String(item.id),
    name:               item.name,
    monday_group_id:    item.group?.id ?? null,
    monday_group_title: item.group?.title ?? null,
    raw:                rawJsonbFromColumns(item.column_values),
    created_at_monday:  item.created_at,
    updated_at_monday:  item.updated_at,
  }
}

function toSubitemRow(item, parentMondayItemId, parentBoardId) {
  return {
    monday_item_id:        String(item.id),
    parent_monday_item_id: String(parentMondayItemId),
    parent_board_id:       String(parentBoardId),
    name:                  item.name,
    raw:                   rawJsonbFromColumns(item.column_values),
    created_at_monday:     item.created_at,
    updated_at_monday:     item.updated_at,
  }
}

function extractLinks(item, sourceBoardId) {
  const links = []
  for (const cv of item.column_values) {
    if (!RELATION_COLUMN_TYPES.has(cv.type)) continue
    // Prefer the typed linked_item_ids returned by the BoardRelationValue /
    // DependencyValue fragments; fall back to parsing the legacy value JSON
    // (older API shape) for safety.
    let ids = []
    if (Array.isArray(cv.linked_item_ids) && cv.linked_item_ids.length > 0) {
      ids = cv.linked_item_ids.map(String)
    } else if (cv.value) {
      try {
        const parsed = JSON.parse(cv.value)
        ids =
          parsed.linkedPulseIds?.map(p => String(p.linkedPulseId)) ??
          (parsed.linkedItemIds ?? []).map(String) ??
          []
      } catch {}
    }
    for (const targetId of ids) {
      links.push({
        source_monday_item_id: String(item.id),
        source_board_id:       String(sourceBoardId),
        source_column_id:      cv.id,
        target_monday_item_id: String(targetId),
        target_board_id:       null,
      })
    }
  }
  return links
}

// ----------------------------------------------------------------------------
// supabase upsert
// ----------------------------------------------------------------------------
async function upsert(supabase, table, rows, conflict) {
  if (rows.length === 0) return
  const BATCH = 500
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const { error } = await supabase.from(table).upsert(slice, { onConflict: conflict })
    if (error) throw new Error(`Upsert into ${table} failed: ${error.message}`)
  }
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const boardArg = args.find(a => a.startsWith('--board='))?.split('=')[1]

const summary = {}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

let runId = null
if (!dryRun) {
  const { data: run, error: runErr } = await supabase
    .from('monday_import_runs')
    .insert({ status: 'running' })
    .select('id')
    .single()
  if (runErr) {
    console.error('Failed to create import run row:', runErr.message)
    process.exit(1)
  }
  runId = run.id
  console.log(`Run id: ${runId}\n`)
}

try {
  const boardKeys = boardArg ? [boardArg] : Object.keys(BOARDS)
  const allLinks = []

  console.log('Fetching board columns...')
  const columnRows = await fetchBoardColumns(boardKeys.map(k => BOARDS[k].id))
  summary.columns = columnRows.length
  if (!dryRun) {
    await upsert(supabase, 'monday_board_columns', columnRows, 'board_id,column_id')
    console.log(`    wrote ${columnRows.length} column metadata rows`)
  } else {
    console.log(`    [dry-run] would write ${columnRows.length} column metadata rows`)
  }

  for (const key of boardKeys) {
    const board = BOARDS[key]
    if (!board) throw new Error(`Unknown board key: ${key}`)
    console.log(`Fetching ${key} (board ${board.id})...`)
    const items = await fetchAllItems(board.id)
    summary[key] = items.length

    const rows = items.map(toMirrorRow)
    if (!dryRun) {
      await upsert(supabase, board.table, rows, 'monday_item_id')
      console.log(`    wrote ${rows.length} rows to ${board.table}`)
    } else {
      console.log(`    [dry-run] would write ${rows.length} rows to ${board.table}`)
    }

    for (const item of items) {
      allLinks.push(...extractLinks(item, board.id))
    }
  }

  if (!boardArg || boardArg === 'subitems') {
    console.log('Fetching subitems...')
    const subitemRows = []
    for (const { parentBoardId, subitemBoardId } of SUBITEM_BOARDS) {
      try {
        const subitems = await fetchAllItems(subitemBoardId)
        for (const s of subitems) {
          // The parent linking goes through a special column; Monday wraps the
          // parent in name like "Subitems of #parent-name". Since we already
          // have the parent_id via the subtasks column on parent rows, the
          // most reliable mapping is fetching subitems separately from each
          // parent. But the items_page bulk-fetch above is faster and works
          // because the linked_pulses_ids column on subitems carries it.
          // For now: record parent_board_id and let a follow-up enrich the
          // parent_monday_item_id from monday_links / subtasks columns.
          subitemRows.push(toSubitemRow(s, 'UNKNOWN', parentBoardId))
        }
        console.log(`    ${subitems.length} subitems from board ${subitemBoardId}`)
      } catch (e) {
        console.warn(`    skipped subitem board ${subitemBoardId}: ${e.message}`)
      }
    }
    summary.subitems = subitemRows.length
    if (!dryRun) {
      await upsert(supabase, 'monday_subitems', subitemRows, 'monday_item_id')
      console.log(`    wrote ${subitemRows.length} rows to monday_subitems`)
    }
  }

  summary.links = allLinks.length
  if (!dryRun && allLinks.length > 0) {
    await upsert(supabase, 'monday_links', allLinks, 'source_monday_item_id,source_column_id,target_monday_item_id')
    console.log(`Wrote ${allLinks.length} board-relation links`)
  }

  if (runId) {
    await supabase
      .from('monday_import_runs')
      .update({
        finished_at:      new Date().toISOString(),
        status:           'success',
        pipeline_count:   summary.pipeline   ?? null,
        contacts_count:   summary.contacts   ?? null,
        leads_count:      summary.leads      ?? null,
        properties_count: summary.properties ?? null,
        subitems_count:   summary.subitems   ?? null,
        links_count:      summary.links      ?? null,
      })
      .eq('id', runId)
  }

  console.log('\nDone.')
  console.log(JSON.stringify(summary, null, 2))
} catch (e) {
  console.error('\nImport failed:', e.message)
  if (runId) {
    await supabase
      .from('monday_import_runs')
      .update({
        finished_at:   new Date().toISOString(),
        status:        'failed',
        error_message: e.message,
      })
      .eq('id', runId)
  }
  process.exit(1)
}
