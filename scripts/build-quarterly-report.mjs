#!/usr/bin/env node
// One-shot Quarterly Report builder: dashboard PDF -> live report data.
//
//   node scripts/build-quarterly-report.mjs "Seven Hills"
//   node scripts/build-quarterly-report.mjs --all        (every 'uploaded' row)
//   node scripts/build-quarterly-report.mjs --all --no-rea   (skip REA capture)
//
// For each suburb row in the dashboard's quarterly_reports table it:
//  1. downloads the Pricefinder PDF from the private bucket,
//  2. parses sales via scripts/quarterly-report-parse.mjs (geocoded, cached),
//  3. extracts every sale photo from the PDF into public/img/reports/<slug>/,
//  4. captures verified realestate.com.au links (headed local browser),
//  5. builds the homes map from the pipeline's Quarterly Update? = YES rows
//     (addresses + coords + type only, never names),
//  6. writes meta + homes into src/data/reports/<slug>.json,
//  7. marks the dashboard row published with the live URL.
//
// Deterministic end to end: no AI involved, safe to run from cron/launchd.
// Requires: poppler (pdftotext/pdfimages), the dashboard .env.local for
// Supabase service credentials, and a display for the headed REA browser.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DASH_ENV = path.join(os.homedir(), 'dg-dashboard/.env.local');
const SITE_URL = 'https://danielgierach.com';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const SKIP_REA = args.includes('--no-rea');
const suburbArg = args.filter((a) => !a.startsWith('--'))[0];
if (!ALL && !suburbArg) {
  console.error('usage: build-quarterly-report.mjs <Suburb> | --all [--no-rea]');
  process.exit(1);
}

// ── Dashboard Supabase (service role) ───────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(DASH_ENV, 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const slugify = (s) => s.trim().toLowerCase().replace(new RegExp('[^a-z0-9]+', 'g'), '-').replace(new RegExp('^-|-$', 'g'), '');
const norm = (s) => s.toLowerCase().replace(new RegExp('[^a-z0-9/]', 'g'), '');
const homeSlug = (address) => {
  const m = address.split(',')[0].trim().match(new RegExp('^([\\dA-Za-z]+(?:/[\\dA-Za-z]+)?)\\s+(\\S+)'));
  return m ? `${m[1].toLowerCase().replace(new RegExp('/', 'g'), '-')}-${m[2].toLowerCase().replace(new RegExp('[^a-z0-9]', 'g'), '')}` : null;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtLong = (dmy) => {
  const [d, m, y] = dmy.split('/');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

// ── Geocode helper (same cache as the parser) ───────────────────────────────
const CACHE_PATH = path.join(ROOT, 'src/data/reports/geocode-cache.json');
const geocodeCache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};
async function geocode(address) {
  const key = address.toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'danielgierach.com quarterly reports (daniel.gierach@raywhite.com)' } });
  const data = res.ok ? await res.json() : [];
  const hit = data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
  if (hit) {
    geocodeCache[key] = hit;
    writeFileSync(CACHE_PATH, JSON.stringify(geocodeCache, null, 1));
  }
  await new Promise((r) => setTimeout(r, 1100));
  return hit;
}

// ── Photo extraction (per the locked recipe) ────────────────────────────────
function extractPhotos(pdfPath, suburb, slug) {
  const outDir = path.join(ROOT, 'public/img/reports', slug);
  mkdirSync(outDir, { recursive: true });
  const text = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const pages = text.split('\f');
  const headRe = new RegExp('^\\s{4,}([\\dA-Z/ ]+?), ' + suburb.toUpperCase().replace(new RegExp('[^A-Z\' ]', 'g'), '') + ', QLD', 'm');
  const headReAll = new RegExp(headRe.source, 'gm');
  const tmp = path.join(os.tmpdir(), `qr-photos-${slug}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  let saved = 0;
  const issues = [];
  pages.forEach((page, idx) => {
    const pageNo = idx + 1;
    const heads = [...page.matchAll(headReAll)].map((m) => m[1].trim());
    if (!heads.length) return;
    const list = execFileSync('pdfimages', ['-list', '-f', String(pageNo), '-l', String(pageNo), pdfPath], { encoding: 'utf8' });
    const photos = [];
    for (const line of list.split('\n').slice(2)) {
      const p = line.trim().split(new RegExp('\\s+'));
      if (p.length < 6 || p[2] === 'smask') continue;
      const w = Number(p[3]), h = Number(p[4]);
      if (w >= 100 && h >= 100 && !(w === 180 && h === 180) && w <= 700 && h <= 700) photos.push(Number(p[1]));
    }
    if (photos.length !== heads.length) {
      issues.push(`page ${pageNo}: ${heads.length} sales vs ${photos.length} photos, skipped`);
      return;
    }
    execFileSync('pdfimages', ['-all', '-p', '-f', String(pageNo), '-l', String(pageNo), pdfPath, path.join(tmp, 'pg')]);
    heads.forEach((addr, i) => {
      const s = homeSlug(addr);
      if (!s) return;
      const prefix = path.join(tmp, `pg-${String(pageNo).padStart(3, '0')}-${String(photos[i]).padStart(3, '0')}`);
      const match = readdirSync(tmp).find((f) => path.join(tmp, f).startsWith(prefix));
      if (!match) return;
      const src = path.join(tmp, match);
      const dest = path.join(outDir, `${s}.jpg`);
      if (match.endsWith('.jpg')) copyFileSync(src, dest);
      else spawnSync('sips', ['-s', 'format', 'jpeg', src, '--out', dest]);
      saved++;
    });
  });
  rmSync(tmp, { recursive: true, force: true });
  return { saved, issues };
}

// ── Homes map from the pipeline's quarterly contacts ────────────────────────
async function buildHomes(suburb) {
  const { data } = await sb.from('monday_pipeline_items').select('name, raw');
  const homes = {};
  for (const row of data ?? []) {
    if (row.raw?.color_quarterly_upd?.text !== 'YES') continue;
    const address = (row.raw?.property_address?.text || row.name || '').trim();
    if (!address.toLowerCase().includes(suburb.toLowerCase())) continue;
    const short = address.split(',')[0].trim();
    const key = homeSlug(short);
    if (!key) continue;
    const type = row.raw?.color_mkvv33b4?.text || '';
    const geo = await geocode(`${short}, ${suburb} QLD, Australia`);
    homes[key] = {
      a: short,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
      u: type ? type !== 'House' : new RegExp('^\\d+[a-zA-Z]?\\s*/').test(short),
    };
  }
  return homes;
}

// ── Build one suburb ────────────────────────────────────────────────────────
async function buildSuburb(row) {
  const suburb = row.suburb;
  const quarter = row.quarter; // e.g. '2026-Mid-Winter'
  const season = quarter.split('-').slice(1).join('-'); // 'Mid-Winter'
  const slug = `${slugify(suburb)}-${slugify(quarter)}`;
  console.log(`\n═══ ${suburb} → ${slug} ═══`);

  // 1. Download the PDF
  const { data: signed, error: signErr } = await sb.storage.from('quarterly-reports').createSignedUrl(row.pdf_path, 3600);
  if (signErr || !signed?.signedUrl) throw new Error(`no signed URL for ${row.pdf_path}: ${signErr?.message}`);
  const pdfPath = path.join(os.tmpdir(), `${slug}.pdf`);
  const res = await fetch(signed.signedUrl);
  if (!res.ok) throw new Error(`PDF download failed: ${res.status}`);
  writeFileSync(pdfPath, Buffer.from(await res.arrayBuffer()));
  console.log(`  PDF ${(readFileSync(pdfPath).length / 1024 / 1024).toFixed(1)}MB`);

  // 2. Parse + geocode sales
  execFileSync('node', [path.join(ROOT, 'scripts/quarterly-report-parse.mjs'), pdfPath, slug], { stdio: 'inherit' });
  const jsonPath = path.join(ROOT, 'src/data/reports', `${slug}.json`);
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const postcode = report.summary?.postcode ?? '';
  if (!postcode) throw new Error('no postcode in parse summary');
  // Wrong export type (e.g. "Full Report" instead of "Image Report") parses
  // to zero sales; never publish a hollow report.
  if ((report.sales?.length ?? 0) < 3) {
    throw new Error(`only ${report.sales?.length ?? 0} sales parsed (summary says ${report.summary?.records}). Is this the "Sales Search Report - Image Report" export?`);
  }

  // 3. Photos
  const photo = extractPhotos(pdfPath, suburb, slug);
  console.log(`  photos: ${photo.saved} saved${photo.issues.length ? ' | ' + photo.issues.join('; ') : ''}`);

  // 4. REA links (headed browser; skippable)
  if (!SKIP_REA) {
    const rea = spawnSync('node', [path.join(ROOT, 'scripts/rea-link-capture.mjs'), slug, suburb, postcode], { encoding: 'utf8' });
    const tail = (rea.stdout || '').trim().split('\n').pop();
    console.log(`  rea: ${tail}`);
  }

  // 5. Homes map
  const homes = await buildHomes(suburb);
  console.log(`  homes: ${Object.keys(homes).length} quarterly contacts`);

  // 6. Meta + write
  const fresh = JSON.parse(readFileSync(jsonPath, 'utf8')); // rea capture rewrites it
  const fromL = fresh.summary?.from ? fmtLong(fresh.summary.from) : '';
  const toL = fresh.summary?.to ? fmtLong(fresh.summary.to) : '';
  fresh.meta = {
    slug,
    suburb,
    postcode,
    seasonTitle: `${season} Report`,
    periodLabel: fromL && toL ? `${fromL.split(' ').slice(1).join(' ')} to ${toL.split(' ').slice(1).join(' ')}` : quarter,
    periodSentence: fromL && toL ? `between ${fromL} and ${toL}` : `for ${quarter}`,
    pulledDate: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
    quarter,
  };
  fresh.homes = homes;
  writeFileSync(jsonPath, JSON.stringify(fresh, null, 1));

  // 7. Mark published
  const reportUrl = `${SITE_URL}/reports/${slug}`;
  const { error: pubErr } = await sb.from('quarterly_reports')
    .update({ status: 'published', slug, report_url: reportUrl, published_at: new Date().toISOString() })
    .eq('id', row.id);
  if (pubErr) console.log(`  ! publish flag failed: ${pubErr.message}`);
  console.log(`  ✓ ${reportUrl}`);
  return slug;
}

// ── Main ────────────────────────────────────────────────────────────────────
const { data: rows, error } = await sb.from('quarterly_reports').select('*').order('suburb');
if (error) throw error;
const targets = (rows ?? []).filter((r) =>
  ALL ? r.status === 'uploaded' && r.pdf_path : r.suburb.toLowerCase() === suburbArg.toLowerCase()
);
if (!targets.length) {
  console.log('nothing to build');
  process.exit(0);
}
console.log(`building ${targets.length} suburb(s): ${targets.map((t) => t.suburb).join(', ')}`);
const done = [];
for (const row of targets) {
  try {
    done.push(await buildSuburb(row));
  } catch (e) {
    console.error(`✗ ${row.suburb} failed: ${e.message}`);
  }
}
console.log(`\nbuilt ${done.length}/${targets.length}. Now: npm run build, verify, commit and push.`);
