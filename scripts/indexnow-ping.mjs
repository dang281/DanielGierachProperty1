#!/usr/bin/env node
// Ping IndexNow (Bing / Yandex / Naver / Seznam) with every URL in the built sitemap.
// Runs after `astro build` via the postbuild npm script.
// Soft-fails: any network or parsing error logs and exits 0 so a flaky IndexNow
// endpoint never blocks a Vercel deploy.

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const HOST  = 'danielgierach.com'
const KEY   = 'c3adfb72720d62762f3d78b6c26b4a93'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

function readSitemapUrls() {
  const sitemapPath = resolve(process.cwd(), 'dist/sitemap-0.xml')
  if (!existsSync(sitemapPath)) {
    console.log('[indexnow] dist/sitemap-0.xml not found, skipping ping')
    return []
  }
  const xml = readFileSync(sitemapPath, 'utf8')
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? []
  return matches
    .map(m => m.replace(/<\/?loc>/g, '').trim())
    .filter(u => u.startsWith(`https://${HOST}`))
}

async function ping(urls) {
  // IndexNow accepts up to 10,000 URLs per request. Our sitemap is ~1k.
  // If we ever exceed 10k, chunk here.
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })
  return res
}

async function main() {
  if (process.env.SKIP_INDEXNOW === '1') {
    console.log('[indexnow] SKIP_INDEXNOW=1, skipping')
    return
  }
  const urls = readSitemapUrls()
  if (!urls.length) return
  console.log(`[indexnow] pinging ${urls.length} URL(s)`)
  try {
    const res = await ping(urls)
    if (res.ok || res.status === 202) {
      console.log(`[indexnow] ok ${res.status}`)
    } else {
      console.log(`[indexnow] non-ok ${res.status} ${await res.text().catch(() => '')}`)
    }
  } catch (err) {
    console.log(`[indexnow] error ${err?.message ?? err}`)
  }
}

main()
