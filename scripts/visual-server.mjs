#!/usr/bin/env node
/**
 * visual-server.mjs
 *
 * Local HTTP server that generates LinkedIn post visuals via the Puppeteer
 * screenshot pipeline and uploads them to Supabase Storage.
 *
 * Run once:
 *   node scripts/visual-server.mjs
 *
 * The dashboard at dashboard.danielgierach.com will call this server from the
 * browser. localhost is exempt from HTTPS mixed-content rules, so this works
 * even though the dashboard is served over HTTPS.
 *
 * Endpoints:
 *   GET  /ping      — health check, returns { ok: true }
 *   POST /generate  — generate a visual for a post
 *
 * POST /generate body:
 *   {
 *     postId: string,        — content_items.id to update
 *     type: 'market' | 'article' | 'authority',
 *     params: {              — CLI args (minus --type, --out, --postId)
 *       label?: string,
 *       headline: string,
 *       body?: string,       — market type
 *       excerpt?: string,    — article type
 *       slug?: string,       — article type
 *       keyword?: string,    — authority type
 *       p1t?: string, p1b?: string,  — authority numbered rows
 *       p2t?: string, p2b?: string,
 *       p3t?: string, p3b?: string,
 *       p4t?: string, p4b?: string,
 *       p5t?: string, p5b?: string,
 *       date: string,        — YYYY-MM-DD
 *     }
 *   }
 */

import { createServer } from 'node:http'
import { spawn }        from 'node:child_process'
import { readFile, unlink, mkdtemp } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir }       from 'node:os'
import { readFileSync } from 'node:fs'

// ── Config ─────────────────────────────────────────────────────────────────────

const PORT         = 3033
const REPO         = resolve(import.meta.dirname, '..')
const SCRIPT       = join(REPO, 'scripts', 'screenshot-linkedin.mjs')
const SUPABASE_URL = 'https://hmwulvvwsksuyqozuxvw.supabase.co'
const STORAGE_BUCKET = 'social-images'

// Load the service role key from the project .env file
function loadEnvKey() {
  try {
    const raw = readFileSync(join(REPO, '.env'), 'utf-8')
    const m = raw.match(/^SUPABASE_KEY=(.+)$/m)
    return m?.[1]?.trim() ?? null
  } catch { return null }
}
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? loadEnvKey()

// ── Allowed origins ─────────────────────────────────────────────────────────────

const ALLOWED = new Set([
  'https://dashboard.danielgierach.com',
  'http://localhost:3000',
  'http://localhost:3001',
])

function corsHeaders(origin) {
  const allow = ALLOWED.has(origin) ? origin : 'https://dashboard.danielgierach.com'
  return {
    'Access-Control-Allow-Origin':  allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { reject(new Error('Invalid JSON')) }
    })
    req.on('error', reject)
  })
}

function respond(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...extra })
  res.end(JSON.stringify(body))
}

// ── Generate visual ─────────────────────────────────────────────────────────────

async function generateVisual({ postId, type, params }) {
  if (!SUPABASE_KEY) throw new Error('SUPABASE_KEY not set — add it to .env')

  // Build temp output path
  const tmpDir = await mkdtemp(join(tmpdir(), 'dg-visual-'))
  const outFile = join(tmpDir, `${postId}.png`)

  // Build CLI arg list
  const argv = [SCRIPT, '--type', type, '--out', outFile]
  for (const [key, val] of Object.entries(params)) {
    if (val) argv.push(`--${key}`, String(val))
  }

  console.log(`  › node ${argv.slice(1).join(' ')}`)

  // Run Puppeteer script
  await new Promise((ok, fail) => {
    const child = spawn('node', argv, { cwd: REPO, stdio: 'inherit' })
    child.on('close', code =>
      code === 0 ? ok() : fail(new Error(`Puppeteer exited with code ${code}`))
    )
    child.on('error', fail)
  })

  // Read PNG
  const buffer = await readFile(outFile)
  await unlink(outFile).catch(() => {})

  // Upload to Supabase Storage
  const storageKey = `generated/${postId}-${Date.now()}.png`
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storageKey}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: buffer,
    }
  )
  if (!uploadRes.ok) {
    const txt = await uploadRes.text()
    throw new Error(`Storage upload failed: ${txt}`)
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storageKey}`

  // Update content_items record
  const patchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/content_items?id=eq.${postId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ visual_thumbnail: publicUrl, visual_status: 'draft' }),
    }
  )
  if (!patchRes.ok) {
    const txt = await patchRes.text()
    throw new Error(`DB patch failed: ${txt}`)
  }

  return publicUrl
}

// ── Server ──────────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? ''
  const cors   = corsHeaders(origin)

  // Preflight
  if (req.method === 'OPTIONS') {
    respond(res, 204, '', cors)
    return
  }

  // GET /ping
  if (req.method === 'GET' && req.url === '/ping') {
    respond(res, 200, { ok: true }, cors)
    return
  }

  // POST /generate
  if (req.method === 'POST' && req.url === '/generate') {
    let body
    try {
      body = await readBody(req)
    } catch (e) {
      respond(res, 400, { error: 'Invalid JSON body' }, cors)
      return
    }

    const { postId, type, params } = body
    if (!postId || !type || !params) {
      respond(res, 400, { error: 'Missing postId, type, or params' }, cors)
      return
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] Generating visual — ${type} — ${postId}`)

    try {
      const url = await generateVisual({ postId, type, params })
      console.log(`  ✓ Done → ${url}`)
      respond(res, 200, { ok: true, url }, cors)
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`)
      respond(res, 500, { error: e.message }, cors)
    }
    return
  }

  respond(res, 404, { error: 'Not found' }, cors)
})

server.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════╗`)
  console.log(`║  Visual Server running on port ${PORT}       ║`)
  console.log(`║  POST http://localhost:${PORT}/generate      ║`)
  console.log(`║  GET  http://localhost:${PORT}/ping          ║`)
  console.log(`╚═══════════════════════════════════════════╝\n`)
  if (!SUPABASE_KEY) {
    console.warn('⚠  SUPABASE_KEY not found in .env — uploads will fail\n')
  } else {
    console.log(`✓  Supabase key loaded\n`)
  }
})
