#!/usr/bin/env node
/**
 * Builds the suburb-map data file by:
 *   1. Querying the Overpass API for suburb boundaries (place=suburb relations)
 *      around Brisbane.
 *   2. Pulling the Brisbane River geometry.
 *   3. Projecting all lat/lng to SVG coordinate space.
 *   4. Writing src/data/suburb-map.ts with viewBox, river path, and per-suburb paths.
 *
 * Run: node scripts/build-suburb-map.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// "Featured" suburbs are the ones with actual page files at /suburbs/<slug>.
// Read them dynamically so we never go stale when new pages are added.
const PAGES_DIR = path.join(ROOT, 'src/pages/suburbs');
const FEATURED_SLUGS = new Set(
  fs.readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.astro') && f !== 'index.astro')
    .map(f => f.replace(/\.astro$/, ''))
);

// OSM names that don't slugify to the right URL on their own.
const NAME_TO_SLUG = {
  'Brisbane City': 'brisbane-cbd',
};

function slugify(name) {
  if (NAME_TO_SLUG[name]) return NAME_TO_SLUG[name];
  return name.toLowerCase().replace(/[\s']+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Brisbane LGA bbox. We pull every suburb-level relation in the box, then
// filter by point-in-polygon against the City of Brisbane boundary so
// Logan / Moreton Bay / Redlands suburbs don't leak in.
const BBOX = '-27.78,152.66,-27.18,153.32';

const overpassQuery = `
[out:json][timeout:180];
(
  rel["boundary"="administrative"](${BBOX});
  rel["place"="suburb"](${BBOX});
  rel["place"="neighbourhood"](${BBOX});
);
out geom;
`;

const lgaQuery = `
[out:json][timeout:120];
rel["boundary"="administrative"]["name"="City of Brisbane"]["admin_level"="6"];
out geom;
`;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

async function fetchOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'danielgierach-suburb-map-build/1.0',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass ${url} HTTP ${res.status}`);
        console.warn(`  ! ${url} → HTTP ${res.status}, trying next mirror`);
        continue;
      }
      return res.json();
    } catch (e) {
      lastErr = e;
      console.warn(`  ! ${url} → ${e.message}, trying next mirror`);
    }
  }
  throw lastErr ?? new Error('All Overpass mirrors failed');
}

async function fetchRiver() {
  // Brisbane River exists in OSM in two forms:
  //   1. waterway=river ways: thin centerline geometry (mostly upstream).
  //   2. natural=water polygons / multipolygon relations: the actual water
  //      body for the wide CBD / inner-city stretch.
  // We fetch both and return both as { lines: [...], polygons: [...] }.
  const q = `
[out:json][timeout:60];
(
  way["name"="Brisbane River"]["waterway"="river"](-27.7,152.6,-27.0,153.4);
  relation["name"="Brisbane River"](-27.7,152.6,-27.0,153.4);
  way["name"="Brisbane River"]["natural"="water"](-27.7,152.6,-27.0,153.4);
);
out geom;
`;
  const data = await fetchOverpass(q);
  const lines = [];
  const polygons = [];

  for (const el of data.elements) {
    if (el.type === 'way' && el.geometry) {
      const coords = el.geometry.map(p => [p.lon, p.lat]);
      const isClosed = coords.length > 2 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1];
      const tags = el.tags || {};
      if (isClosed && (tags.natural === 'water' || tags.water)) {
        polygons.push({ outer: [coords], inner: [] });
      } else if (tags.waterway === 'river') {
        lines.push(coords);
      }
    } else if (el.type === 'relation' && el.members) {
      const outerWays = el.members.filter(m => m.type === 'way' && m.role !== 'inner' && m.geometry);
      const innerWays = el.members.filter(m => m.type === 'way' && m.role === 'inner' && m.geometry);
      const outer = stitchRings(outerWays);
      const inner = stitchRings(innerWays);
      if (outer.length) polygons.push({ outer, inner });
    }
  }

  return { lines, polygons };
}

function relationToPolygons(rel) {
  if (!rel.members) return [];
  const ways = rel.members.filter(m => m.type === 'way' && m.role !== 'inner' && m.geometry);
  const innerWays = rel.members.filter(m => m.type === 'way' && m.role === 'inner' && m.geometry);

  const stitched = stitchRings(ways);
  const inner = stitchRings(innerWays);
  return { outer: stitched, inner };
}

function stitchRings(ways) {
  const segments = ways.map(w => w.geometry.map(p => [p.lon, p.lat]));
  const rings = [];
  const used = new Array(segments.length).fill(false);

  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    let ring = [...segments[i]];
    let extended = true;
    while (extended) {
      extended = false;
      for (let j = 0; j < segments.length; j++) {
        if (used[j]) continue;
        const seg = segments[j];
        const head = ring[0];
        const tail = ring[ring.length - 1];
        const segHead = seg[0];
        const segTail = seg[seg.length - 1];
        if (eq(tail, segHead)) { ring = ring.concat(seg.slice(1)); used[j] = true; extended = true; }
        else if (eq(tail, segTail)) { ring = ring.concat([...seg].reverse().slice(1)); used[j] = true; extended = true; }
        else if (eq(head, segTail)) { ring = seg.slice(0, -1).concat(ring); used[j] = true; extended = true; }
        else if (eq(head, segHead)) { ring = [...seg].reverse().slice(0, -1).concat(ring); used[j] = true; extended = true; }
      }
    }
    rings.push(ring);
  }
  return rings;
}

function eq(a, b) { return a[0] === b[0] && a[1] === b[1]; }

// Douglas-Peucker line simplification.
// Tolerance is in the same units as input coords. For Brisbane bbox,
// 0.0002 degrees ≈ 22m, so polygons stay recognisable but ~70% smaller.
function simplifyRing(ring, tolerance) {
  if (ring.length <= 4) return ring;
  // Make sure ring is closed
  const closed = eq(ring[0], ring[ring.length - 1]);
  const pts = closed ? ring.slice(0, -1) : ring;
  const keep = new Array(pts.length).fill(false);
  keep[0] = true;
  keep[pts.length - 1] = true;

  function perpDistSq(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    if (dx === 0 && dy === 0) return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    const cx = a[0] + t * dx, cy = a[1] + t * dy;
    return (p[0] - cx) ** 2 + (p[1] - cy) ** 2;
  }

  const stack = [[0, pts.length - 1]];
  const tolSq = tolerance * tolerance;
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxDist = 0, maxIdx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDistSq(pts[i], pts[s], pts[e]);
      if (d > maxDist) { maxDist = d; maxIdx = i; }
    }
    if (maxDist > tolSq) {
      keep[maxIdx] = true;
      stack.push([s, maxIdx]);
      stack.push([maxIdx, e]);
    }
  }

  const out = pts.filter((_, i) => keep[i]);
  if (closed) out.push(out[0]);
  return out;
}

// Equirectangular projection scaled to viewBox
function buildProjection(allCoords, width, height, padding = 20) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lon, lat] of allCoords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  // Account for latitude scale near Brisbane (~27S): lon needs to be scaled by cos(lat)
  const meanLat = (minLat + maxLat) / 2;
  const lonScale = Math.cos(meanLat * Math.PI / 180);
  const dataW = (maxLon - minLon) * lonScale;
  const dataH = (maxLat - minLat);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / dataW, innerH / dataH);
  const offsetX = (innerW - dataW * scale) / 2 + padding;
  const offsetY = (innerH - dataH * scale) / 2 + padding;
  return ([lon, lat]) => {
    const x = (lon - minLon) * lonScale * scale + offsetX;
    const y = (maxLat - lat) * scale + offsetY;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  };
}

function ringToPath(ring, project) {
  if (ring.length < 3) return '';
  const pts = ring.map(project);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i][0]} ${pts[i][1]}`;
  d += 'Z';
  return d;
}

function lineToPath(line, project) {
  if (line.length < 2) return '';
  const pts = line.map(project);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i][0]} ${pts[i][1]}`;
  return d;
}

function ringCentroid(ring) {
  let cx = 0, cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  return [cx / ring.length, cy / ring.length];
}

// Brisbane CBD centroid in lat/lon — used to bucket suburbs into N/S/E/W
const CBD_LON = 153.025;
const CBD_LAT = -27.470;

function regionOfCentroid([lon, lat]) {
  const dLon = lon - CBD_LON;
  // Southern hemisphere: more-negative latitude = further south.
  // dLat > 0 means the suburb is north of the CBD (less negative lat).
  const dLat = lat - CBD_LAT;
  if (Math.abs(dLat) >= Math.abs(dLon)) {
    return dLat > 0 ? 'north' : 'south';
  }
  return dLon > 0 ? 'east' : 'west';
}

// Ray-casting point-in-polygon. Polygon is an array of [lon, lat] points.
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

async function main() {
  console.log('Fetching Brisbane LGA boundary...');
  const lgaData = await fetchOverpass(lgaQuery);
  const lgaRel = lgaData.elements.find(e => e.type === 'relation');
  if (!lgaRel) throw new Error('Brisbane LGA boundary not found');
  const lgaRings = stitchRings(lgaRel.members.filter(m => m.type === 'way' && m.role !== 'inner' && m.geometry));
  const lgaOuter = lgaRings.sort((a, b) => b.length - a.length)[0]; // largest ring
  console.log(`  → LGA outer ring has ${lgaOuter.length} points`);

  console.log('Querying Overpass for all Brisbane suburbs...');
  const data = await fetchOverpass(overpassQuery);
  const allRelations = data.elements.filter(e => e.type === 'relation' && e.tags?.name);
  console.log(`  → got ${allRelations.length} relations`);

  const suburbs = [];
  const allCoords = [];
  const seen = new Set();

  // Skip wider boundaries (city, state, region etc.). Suburbs are typically
  // admin_level 8 or 10, or place=suburb / place=neighbourhood.
  function isSuburbScope(rel) {
    const lvl = rel.tags.admin_level;
    const place = rel.tags.place;
    const boundary = rel.tags.boundary;
    if (place === 'suburb' || place === 'neighbourhood') return true;
    if (boundary === 'administrative' && (lvl === '10' || lvl === '9' || lvl === '8')) return true;
    return false;
  }

  // Inner-metro Brisbane bounding box. Excludes far-western acreage suburbs
  // like Kholo, Mt Crosby, Brookfield, Pinjarra Hills, Anstead, Bellbowrie
  // and far-north / far-south LGA outliers. Matches the area locals think
  // of as "Brisbane" — roughly 20km radius from the CBD.
  const INNER_BBOX = { south: -27.62, north: -27.30, west: 152.92, east: 153.20 };
  function inInnerBrisbane([lon, lat]) {
    return lat >= INNER_BBOX.south && lat <= INNER_BBOX.north
        && lon >= INNER_BBOX.west && lon <= INNER_BBOX.east;
  }

  for (const rel of allRelations) {
    const name = rel.tags.name;
    if (!name) continue;
    if (!isSuburbScope(rel)) continue;
    if (seen.has(name)) continue;
    const { outer, inner } = relationToPolygons(rel);
    if (!outer.length) continue;

    // Drop suburbs whose centroid sits outside the Brisbane LGA polygon
    const centroid = ringCentroid(outer[0]);
    if (!pointInPolygon(centroid, lgaOuter)) continue;

    // Drop suburbs outside the inner-metro Brisbane area (acreage/rural fringes)
    if (!inInnerBrisbane(centroid)) continue;

    seen.add(name);
    const slug = slugify(name);
    const isFeatured = FEATURED_SLUGS.has(slug);

    // Simplify rings to keep file size sensible (~22m tolerance).
    const SIMPLIFY = 0.0002;
    const outerSimple = outer.map(r => simplifyRing(r, SIMPLIFY)).filter(r => r.length >= 4);
    const innerSimple = inner.map(r => simplifyRing(r, SIMPLIFY)).filter(r => r.length >= 4);
    if (!outerSimple.length) continue;

    const region = regionOfCentroid(centroid);

    suburbs.push({ name, slug, outer: outerSimple, inner: innerSimple, featured: isFeatured, region });
    for (const ring of outerSimple) for (const p of ring) allCoords.push(p);
  }
  console.log(`  → kept ${suburbs.length} polygon suburbs (${suburbs.filter(s => s.featured).length} featured)`);

  console.log('Fetching Brisbane River geometry...');
  let riverLines = [];
  let riverPolygons = [];
  try {
    const r = await fetchRiver();
    riverLines = r.lines;
    riverPolygons = r.polygons;
    console.log(`  → got ${riverLines.length} river lines, ${riverPolygons.length} river polygons`);
  } catch (e) {
    console.warn(`  ! river fetch failed: ${e.message}`);
  }

  // Drop geometry that has zero overlap with the rendered area (e.g.
  // far-upstream tributaries) so we don't render off-screen shapes.
  const PAD = 0.05;
  const pointInBox = ([lon, lat]) =>
    lon >= INNER_BBOX.west - PAD &&
    lon <= INNER_BBOX.east + PAD &&
    lat >= INNER_BBOX.south - PAD &&
    lat <= INNER_BBOX.north + PAD;
  riverLines = riverLines.filter(seg => seg.some(pointInBox));
  riverPolygons = riverPolygons.filter(poly =>
    poly.outer.some(ring => ring.some(pointInBox))
  );

  // Bounds calculated from SUBURBS only. River points outside the
  // suburb bbox would otherwise extend the projection range and squish
  // the inner map. River segments that project outside the viewBox get
  // clipped by SVG's overflow:hidden.
  const boundsCoords = [];
  for (const s of suburbs) for (const ring of s.outer) for (const p of ring) boundsCoords.push(p);

  const VIEW_W = 900, VIEW_H = 700;
  const project = buildProjection(boundsCoords, VIEW_W, VIEW_H);

  const out = {
    viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
    river: riverLines.map(seg => lineToPath(seg, project)).filter(Boolean),
    riverBody: riverPolygons.map(poly => {
      const outerPaths = poly.outer.map(r => ringToPath(r, project)).filter(Boolean);
      const innerPaths = poly.inner.map(r => ringToPath(r, project)).filter(Boolean);
      return [...outerPaths, ...innerPaths].join(' ');
    }).filter(Boolean),
    suburbs: suburbs
      .map(s => {
        const outerPaths = s.outer.map(r => ringToPath(r, project)).filter(Boolean);
        const innerPaths = s.inner.map(r => ringToPath(r, project)).filter(Boolean);
        const centroid = ringCentroid(s.outer[0].map(project));
        return {
          name: s.name,
          slug: s.slug,
          d: [...outerPaths, ...innerPaths].join(' '),
          labelX: Number(centroid[0].toFixed(1)),
          labelY: Number(centroid[1].toFixed(1)),
          featured: s.featured,
          region: s.region,
        };
      })
      // Sort featured first so they sit on top of the SVG stack visually
      .sort((a, b) => (a.featured ? 1 : 0) - (b.featured ? 1 : 0)),
  };

  const tsOut = `// Auto-generated by scripts/build-suburb-map.mjs — do not edit by hand.
// Run \`node scripts/build-suburb-map.mjs\` to refresh.
export type Region = 'north' | 'south' | 'east' | 'west';

export interface SuburbShape {
  name: string;
  slug: string;
  d: string;
  labelX: number;
  labelY: number;
  featured: boolean;
  region: Region;
}

export const SUBURB_MAP = {
  viewBox: ${JSON.stringify(out.viewBox)},
  river: ${JSON.stringify(out.river, null, 2)},
  riverBody: ${JSON.stringify(out.riverBody, null, 2)},
  suburbs: ${JSON.stringify(out.suburbs, null, 2)} as SuburbShape[],
};
`;

  const target = path.join(ROOT, 'src/data/suburb-map.ts');
  fs.writeFileSync(target, tsOut);
  console.log(`Wrote ${target} (${suburbs.length} suburbs, ${riverLines.length} river lines, ${riverPolygons.length} river polygons)`);
}

main().catch(err => { console.error(err); process.exit(1); });
