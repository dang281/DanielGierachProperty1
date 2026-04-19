#!/usr/bin/env node
/**
 * Records both Meta ad animations as MP4 files using Puppeteer + ffmpeg.
 *
 * Produces per ad:
 *   ~/Downloads/[suburb]-meta-ad-1080x1920.mp4   — 9:16 portrait (Stories / Reels)
 *   ~/Downloads/[suburb]-meta-ad-1080x1080.mp4   — 1:1 square (Feed)
 *   ~/Downloads/[suburb]-meta-ad-1080x1350.mp4   — 4:5 (Carousel / Feed preferred)
 *
 * Requirements: ffmpeg must be on PATH.
 * Usage: node scripts/record-meta-ads.mjs
 * Or for a single ad: node scripts/record-meta-ads.mjs murarrie
 *                     node scripts/record-meta-ads.mjs seven-hills
 */

import puppeteer from 'puppeteer'
import { execSync, spawn } from 'child_process'
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import os from 'os'

const REPO_ROOT = new URL('../', import.meta.url).pathname

// ── Config ────────────────────────────────────────────────────────────────────

// Viewport matches the .frame dimensions in the HTML
// DPR 5.538 → 390×693 CSS = 2160×3839px physical (≈2160×3840, 4K)
const VIEWPORT = { width: 390, height: 693, deviceScaleFactor: 5.538 }

// How long to record in ms. Animation loop is ~21s; capture 22s to be safe.
const RECORD_MS = 22000

// ffmpeg encoding quality — CRF 10 = very high quality, bigger file
const CRF = 10

// CDP screencast quality — 100 = maximum JPEG quality, minimal compression
const SCREENCAST_QUALITY = 100

// Output frame rate — 60fps (Meta's max, smooth on all devices).
const OUTPUT_FPS = 60

// ── Ad definitions ────────────────────────────────────────────────────────────

const ADS = {
  murarrie: {
    html: join(REPO_ROOT, 'public/preview/meta-ad-murarrie-v2.html'),
    slug: 'murarrie',
  },
  'seven-hills': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills.html'),
    slug: 'seven-hills',
  },
  'murarrie-v3': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-murarrie-v3.html'),
    slug: 'murarrie-v3',
  },
  'seven-hills-v2': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v2.html'),
    slug: 'seven-hills-v2',
  },
  'seven-hills-v3': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v3.html'),
    slug: 'seven-hills-v3',
  },
  'seven-hills-v4': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v4.html'),
    slug: 'seven-hills-v4',
  },
  'seven-hills-v5': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v5.html'),
    slug: 'seven-hills-v5',
  },
  'seven-hills-v6': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v6.html'),
    slug: 'seven-hills-v6',
  },
  'seven-hills-v7': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v7.html'),
    slug: 'seven-hills-v7',
  },
  'seven-hills-v8': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v8.html'),
    slug: 'seven-hills-v8',
  },
  'murarrie-v4': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-murarrie-v4.html'),
    slug: 'murarrie-v4',
  },
  'murarrie-v5': {
    html: join(REPO_ROOT, 'public/preview/meta-ad-murarrie-v5.html'),
    slug: 'murarrie-v5',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkFfmpeg() {
  try { execSync('ffmpeg -version', { stdio: 'ignore' }) }
  catch { console.error('ffmpeg not found — install with: brew install ffmpeg'); process.exit(1) }
}

function framesToVideo(framesDir, outputPath, vfFilter, inputFps, trimSecs) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      // Use actual measured capture rate so animation timing is pixel-accurate
      '-framerate', String(inputFps),
      '-i', join(framesDir, 'frame-%05d.jpg'),
      '-vf', vfFilter,
      '-r', String(OUTPUT_FPS),
      '-t', String(trimSecs),
      '-c:v', 'libx264',
      '-crf', String(CRF),
      '-preset', 'slow',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outputPath,
    ]
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    proc.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}`))
    })
  })
}

async function recordAd({ html, slug }) {
  const tmpDir = join(os.tmpdir(), `meta-ad-${slug}-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })

  console.log(`\n── Recording ${slug} ──────────────────────────`)
  console.log(`  HTML: ${html}`)
  console.log(`  Frames dir: ${tmpDir}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--disable-lcd-text',
    ],
  })
  const page = await browser.newPage()
  await page.setViewport(VIEWPORT)

  // Load page and wait for fonts + animation to initialise
  await page.goto(`file://${html}`, { waitUntil: 'networkidle0' })

  // Strip the page chrome: hide the download button and force the body to show
  // only the .frame element with no extra layout space around it.
  await page.evaluate(() => {
    // Hide the "Record & Download" button — it must never appear in recordings
    const dlWrap = document.getElementById('dlWrap')
    if (dlWrap) dlWrap.style.display = 'none'

    // Override body layout so the .frame sits flush at (0,0) with no centering offset
    document.body.style.cssText = 'margin:0;padding:0;display:block;background:#0a0806;'

    // Ensure the frame fills the viewport exactly
    const frame = document.querySelector('.frame')
    if (frame) frame.style.cssText += ';position:fixed;top:0;left:0;'
  })

  await new Promise(r => setTimeout(r, 400))

  // ── Capture frames via CDP screencast ──────────────────────────────────────
  const cdp = await page.createCDPSession()
  const frames = []
  let frameIndex = 0

  await cdp.send('Page.startScreencast', {
    format:  'jpeg',
    quality: SCREENCAST_QUALITY,
    everyNthFrame: 1,
  })

  cdp.on('Page.screencastFrame', async event => {
    const filename = join(tmpDir, `frame-${String(frameIndex++).padStart(5, '0')}.jpg`)
    writeFileSync(filename, Buffer.from(event.data, 'base64'))
    frames.push(filename)
    await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {})
  })

  console.log(`  Recording for up to ${RECORD_MS / 1000}s (stops early if animation signals done)...`)

  const recordStart = Date.now()

  // Wait for either: animation signals done (data-recording-done="1") or max time
  await Promise.race([
    // Poll for the done signal — fires when CTA transition completes
    (async () => {
      while (true) {
        await new Promise(r => setTimeout(r, 100))
        try {
          const done = await page.evaluate(() => document.body.dataset.recordingDone === '1')
          if (done) {
            // Hold 500ms so the final frame is clearly visible, then stop
            await new Promise(r => setTimeout(r, 500))
            return
          }
        } catch { /* page may be closing */ return }
      }
    })(),
    new Promise(r => setTimeout(r, RECORD_MS)),
  ])

  const recordedMs = Date.now() - recordStart

  await cdp.send('Page.stopScreencast')
  await browser.close()

  console.log(`  Captured ${frames.length} frames`)
  if (frames.length === 0) {
    console.error('  ERROR: no frames captured')
    return
  }

  // Calculate actual capture rate from real frame count + actual elapsed time.
  // Using recordedMs (not RECORD_MS) keeps timing accurate when recording stops early.
  const inputFps  = Math.max(24, Math.round(frames.length / (recordedMs / 1000)))
  // Trim 1 second off the end so the video ends cleanly on the final frame
  const trimSecs  = Math.max(1, (recordedMs / 1000) - 1.0).toFixed(2)
  console.log(`  Duration: ${(recordedMs/1000).toFixed(1)}s · trimmed to ${trimSecs}s · Capture: ${inputFps} fps → output: ${OUTPUT_FPS} fps`)

  // ── Encode videos ──────────────────────────────────────────────────────────
  const downloads = os.homedir() + '/Downloads'
  const base      = join(downloads, `${slug}-meta-ad`)

  // 9:16 portrait 4K (2160×3840) — Stories & Reels
  console.log('  Encoding 9:16 4K — Stories & Reels...')
  const pathStories = `${base}-stories-and-reels.mp4`
  await framesToVideo(tmpDir, pathStories, 'scale=2160:3840', inputFps, trimSecs)
  console.log(`  ✓ ${pathStories}`)
  execSync(`open "${pathStories}"`)

  // 4:5 portrait 4K (2160×2700) — Feed Preferred
  // Scales full 9:16 ad to fit within 4:5 frame, pillared with brand charcoal
  console.log('  Encoding 4:5 4K — Feed Preferred...')
  const pathFeedPref = `${base}-feed-preferred.mp4`
  await framesToVideo(tmpDir, pathFeedPref,
    'scale=2160:2700:force_original_aspect_ratio=decrease,pad=2160:2700:(ow-iw)/2:(oh-ih)/2:color=0x0a0806',
    inputFps, trimSecs)
  console.log(`  ✓ ${pathFeedPref}`)
  execSync(`open "${pathFeedPref}"`)

  // 1:1 square 4K (2160×2160) — Feed Square / Carousel
  // Scales full 9:16 ad to fit within square frame, pillared with brand charcoal
  console.log('  Encoding 1:1 4K — Feed Square / Carousel...')
  const pathSquare = `${base}-feed-square-carousel.mp4`
  await framesToVideo(tmpDir, pathSquare,
    'scale=2160:2160:force_original_aspect_ratio=decrease,pad=2160:2160:(ow-iw)/2:(oh-ih)/2:color=0x0a0806',
    inputFps, trimSecs)
  console.log(`  ✓ ${pathSquare}`)
  execSync(`open "${pathSquare}"`)  // auto-open for immediate review

  // ── Cleanup temp frames ────────────────────────────────────────────────────
  for (const f of readdirSync(tmpDir)) unlinkSync(join(tmpDir, f))

  console.log(`  Done — files saved to ~/Downloads/`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

checkFfmpeg()

const target = process.argv[2] // optional: 'murarrie' or 'seven-hills'

if (target && !ADS[target]) {
  console.error(`Unknown ad: ${target}. Valid options: ${Object.keys(ADS).join(', ')}`)
  process.exit(1)
}

const toRecord = target ? [ADS[target]] : Object.values(ADS)

for (const ad of toRecord) {
  await recordAd(ad)
}

console.log('\nAll done.')
