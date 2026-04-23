#!/usr/bin/env node
/**
 * Records seven-hills-v8 Stories video at maximum resolution for Meta (2304×4096).
 * Meta's per-side limit is 4096px. At 9:16, that means 2304×4096.
 * DPR: 2304 / 390 = 5.908 (vs default 5.538 which gives 2160×3840).
 *
 * Output: ~/Downloads/seven-hills-v8-ultra-stories-and-reels.mp4
 */

import puppeteer from 'puppeteer'
import { execSync, spawn } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import os from 'os'

const REPO_ROOT    = new URL('../', import.meta.url).pathname
const HTML         = join(REPO_ROOT, 'public/preview/meta-ad-seven-hills-v8.html')
const OUTPUT_FILE  = join(os.homedir(), 'Downloads', 'seven-hills-v8-4k-stories-and-reels.mp4')

// 2160×3840 — 4K portrait for Stories
const VIEWPORT     = { width: 390, height: 693, deviceScaleFactor: 5.538 }
const CRF          = 10
const OUTPUT_FPS   = 60
const RECORD_MS    = 22000

function framesToVideo(framesDir, outputPath, inputFps, trimSecs) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', String(inputFps),
      '-i', join(framesDir, 'frame-%05d.png'),
      '-vf', 'scale=2160:3840:flags=lanczos',
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

async function main() {
  console.log('── Seven Hills v8 — Ultra Stories (2304×4096) ──')
  console.log(`  Output: ${OUTPUT_FILE}`)

  const tmpDir = join(os.tmpdir(), `seven-hills-ultra-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=full',   // full hinting = sharp text edges
      '--force-color-profile=srgb',   // accurate colour, no subpixel shift
    ],
  })
  const page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.goto(`file://${HTML}`, { waitUntil: 'networkidle0' })

  await page.evaluate(() => {
    const dlWrap = document.getElementById('dlWrap')
    if (dlWrap) dlWrap.style.display = 'none'
    document.body.style.cssText = 'margin:0;padding:0;display:block;background:#0a0806;'
    const frame = document.querySelector('.frame')
    if (frame) frame.style.cssText += ';position:fixed;top:0;left:0;'
  })

  await new Promise(r => setTimeout(r, 400))

  const cdp = await page.createCDPSession()
  const frames = []
  let frameIndex = 0

  // PNG = lossless — eliminates JPEG compression artefacts during transitions
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })

  cdp.on('Page.screencastFrame', async event => {
    const filename = join(tmpDir, `frame-${String(frameIndex++).padStart(5, '0')}.png`)
    writeFileSync(filename, Buffer.from(event.data, 'base64'))
    frames.push(filename)
    await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {})
  })

  console.log('  Recording…')
  const recordStart = Date.now()

  await Promise.race([
    (async () => {
      while (true) {
        await new Promise(r => setTimeout(r, 100))
        try {
          const done = await page.evaluate(() => document.body.dataset.recordingDone === '1')
          if (done) { await new Promise(r => setTimeout(r, 500)); return }
        } catch { return }
      }
    })(),
    new Promise(r => setTimeout(r, RECORD_MS)),
  ])

  const recordedMs = Date.now() - recordStart
  await cdp.send('Page.stopScreencast')
  await browser.close()

  console.log(`  Captured ${frames.length} frames in ${(recordedMs / 1000).toFixed(1)}s`)

  const inputFps = Math.max(24, Math.round(frames.length / (recordedMs / 1000)))
  const trimSecs = Math.max(1, (recordedMs / 1000) - 1.0).toFixed(2)

  console.log('  Encoding 2304×4096 — please wait…')
  await framesToVideo(tmpDir, OUTPUT_FILE, inputFps, trimSecs)
  console.log(`  ✓ Done: ${OUTPUT_FILE}`)

  execSync(`open "${OUTPUT_FILE}"`)
}

main().catch(e => { console.error(e); process.exit(1) })
