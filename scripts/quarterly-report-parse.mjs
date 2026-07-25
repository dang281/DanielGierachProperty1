#!/usr/bin/env node
// Parse a Pricefinder "Sales Search Report - Image Report" PDF into the JSON
// a /reports/* page consumes, geocoding every sale for the map pins.
//
//   node scripts/quarterly-report-parse.mjs <pdf-path> <report-slug>
//   e.g. node scripts/quarterly-report-parse.mjs ~/Downloads/report.pdf morningside-2026-q3
//
// Output: src/data/reports/<report-slug>.json
// Geocodes hit Nominatim (OSM) at 1 req/sec and cache in
// src/data/reports/geocode-cache.json, so re-runs and overlapping suburbs
// are instant. Run pdftotext via poppler (brew install poppler).

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const [pdfPath, slug] = process.argv.slice(2)
if (!pdfPath || !slug) {
  console.error('usage: quarterly-report-parse.mjs <pdf-path> <report-slug>')
  process.exit(1)
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT_DIR = path.join(ROOT, 'src/data/reports')
const CACHE_PATH = path.join(OUT_DIR, 'geocode-cache.json')
mkdirSync(OUT_DIR, { recursive: true })

const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const lines = text.split('\n')

// ── Search summary (page 1) ─────────────────────────────────────────────────
const summary = {}
{
  const m = text.match(/Records:\s*(\d+)/)
  if (m) summary.records = Number(m[1])
  const grab = (label) => {
    const r = new RegExp(label + String.raw`\s+\$\s?([\d,]+)\s+(\d+)\s+([\d,]+)\s*m`)
    const mm = text.match(r)
    return mm ? { price: Number(mm[1].replace(/,/g, '')), days: Number(mm[2]), area: Number(mm[3].replace(/,/g, '')) } : null
  }
  summary.lowest = grab('Lowest')
  summary.highest = grab('Highest')
  summary.average = grab('Average')
  summary.median = grab('Median')
  const range = text.match(/Sale Date:\s*([\d/]+)\s*to\s*([\d/]+)/)
  if (range) { summary.from = range[1]; summary.to = range[2] }
  const loc = text.match(/Locality:\s*([A-Z' ]+)/)
  if (loc) summary.suburb = loc[1].trim()
  const pc = text.match(/Postcode:\s*(\d{4})/)
  if (pc) summary.postcode = pc[1]
}

// ── Sales entries ───────────────────────────────────────────────────────────
// Header line: "  4/47 KATES ST, MORNINGSIDE, QLD 4170   UBD Ref: ...  3  2  2"
const HEADER = /^\s{4,}(\d[\dA-Z/ ]*? [A-Z][A-Z' ]+?), ([A-Z' ]+), QLD(?:\s+\d{4})?\s+(?:UBD Ref:.*?)?(\d+|-)\s+(\d+|-)\s+(\d+|-)\s*$/

const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
const numOrNull = (v) => (v === '-' ? null : Number(v))

const sales = []
let cur = null
let curBlock = []

function finalize() {
  if (!cur) return
  const block = curBlock.join('\n')
  const f = (re) => { const m = block.match(re); return m ? m[1].trim() : null }
  const priceRaw = f(/Sale Price:\s*(.+?)\s*(?:\(|$)/m)
  const withheld = /withheld/i.test(priceRaw ?? '')
  const priceNum = withheld ? null : Number((priceRaw ?? '').replace(/[^\d]/g, '') || 0) || null
  const areaRaw = f(/Area:\s*([\d,]+)\s*m/)
  // Two-column layout: the type cell ends at the first run of 2+ spaces.
  cur.type = f(/Property Type:\s*(\S+(?: \S+)*?)(?:\s{2,}|\s*$)/m)
  cur.area = areaRaw ? Number(areaRaw.replace(/,/g, '')) : null
  cur.price = priceNum
  cur.priceWithheld = withheld
  cur.lastPrice = f(/Last Price:\s*(.+?)\s*(?:Chg %|$)/m)
  cur.saleDate = f(/Sale Date:\s*([\d/]+)/)
  const days = f(/Days to Sell:\s*(\d+)/)
  cur.daysToSell = days ? Number(days) : null
  cur.office = f(/Office Name:\s*(.+)$/m)
  cur.agent = f(/Agent Name:\s*(.+)$/m)
  // REA property-profile link (public page for the address; photos + history).
  const slugAddr = cur.address.toLowerCase()
    .replace(/\bstreet st\b/, 'st') // Pricefinder data quirk: "FOXTON STREET ST"
    .replace(/\//g, '-').replace(/[^a-z0-9- ]/g, '').trim().replace(/\s+/g, '-')
  cur.rea = `https://www.realestate.com.au/property/${slugAddr}-${cur.suburb.toLowerCase().replace(/\s+/g, '-')}-qld-${summary.postcode ?? ''}/`
  sales.push(cur)
  cur = null
  curBlock = []
}

for (const line of lines) {
  const h = line.match(HEADER)
  if (h) {
    finalize()
    cur = {
      // "FOXTON STREET ST" is a recurring Pricefinder data quirk.
      address: titleCase(h[1].replace(/\s+/g, ' ').replace(/\bSTREET ST\b/i, 'ST')),
      suburb: titleCase(h[2]),
      beds: numOrNull(h[3]),
      baths: numOrNull(h[4]),
      cars: numOrNull(h[5]),
    }
    continue
  }
  if (cur) curBlock.push(line)
}
finalize()

console.log(`parsed ${sales.length} sales (report says ${summary.records ?? '?'})`)

// ── Geocode (Nominatim, cached) ─────────────────────────────────────────────
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const sale of sales) {
  // Geocode the street address; strip unit prefixes ("4/47 Kates St" -> "47 Kates St").
  const streetAddr = sale.address.replace(/^\d+[a-zA-Z]?\//, '').replace(/\bStreet St\b/i, 'St')
  const key = `${streetAddr}, ${sale.suburb} QLD ${summary.postcode}`.toLowerCase()
  if (cache[key]) { sale.lat = cache[key].lat; sale.lng = cache[key].lng; continue }
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key + ', Australia')}&format=json&limit=1&countrycodes=au`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'danielgierach.com quarterly report builder', 'Accept-Language': 'en' } })
    const data = await res.json()
    if (data.length) {
      sale.lat = Number(data[0].lat)
      sale.lng = Number(data[0].lon)
      cache[key] = { lat: sale.lat, lng: sale.lng }
      console.log('geocoded:', streetAddr)
    } else {
      console.log('NO GEOCODE:', streetAddr)
    }
  } catch (e) {
    console.log('geocode error:', streetAddr, e.message)
  }
  await sleep(1100)
}
writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1))

const out = { slug, generatedAt: '2026', summary, sales }
const outPath = path.join(OUT_DIR, `${slug}.json`)
writeFileSync(outPath, JSON.stringify(out, null, 1))
console.log(`wrote ${outPath}: ${sales.length} sales, ${sales.filter((s) => s.lat).length} geocoded`)
