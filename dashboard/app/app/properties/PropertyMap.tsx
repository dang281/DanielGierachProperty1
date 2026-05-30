'use client'

import { useEffect, useRef, useState } from 'react'

export type TrackedProperty = {
  id: string
  owner_name: string
  address: string
  suburb: string
  postcode: string | null
  phone: string | null
  email: string | null
  last_contact_date: string | null
  notes: string | null
  active: boolean
  lat: number | null
  lng: number | null
  monday_group: string | null
}

export type PropertyAlert = {
  id: string
  listing_address: string
  listing_suburb: string
  listing_price: string | null
  listing_type: string
  rea_link: string | null
  lat: number | null
  lng: number | null
  actioned: boolean
  detected_at: string
}

type Props = {
  properties: TrackedProperty[]
  alerts: PropertyAlert[]
}

const LEGEND_ITEMS = [
  { key: 'Hotstock',              color: '#ef4444', label: 'Hotstock' },
  { key: 'Warmstock',             color: '#f97316', label: 'Warmstock' },
  { key: 'Happy to Chat',         color: '#22c55e', label: 'Happy to Chat' },
  { key: 'Unsure Stock',          color: '#eab308', label: 'Unsure Stock' },
  { key: 'Off-Market',            color: '#c4912a', label: 'Off-Market' },
  { key: 'From Open Homes',       color: '#6366f1', label: 'From Open Homes' },
  { key: 'Not Interested / Lost', color: '#64748b', label: 'Not Interested / Lost' },
  { key: 'Other',                 color: '#94a3b8', label: 'Other' },
]

const ALERT_ITEMS = [
  { key: 'sale',    color: '#f97316', label: 'Active listing' },
  { key: 'auction', color: '#ef4444', label: 'Auction' },
  { key: 'sold',    color: '#0d9488', label: 'Sold' },
]

const SCHOOL_ITEMS = [
  { key: 'school-primary',   color: '#0891b2', label: 'Private Primary' },
  { key: 'school-secondary', color: '#7c3aed', label: 'Private Secondary' },
]

type School = { name: string; type: 'primary' | 'secondary' | 'p12'; lat: number; lng: number }

const SCHOOLS: School[] = [
  // Primary
  { name: 'Our Lady of Lourdes',          type: 'primary',   lat: -27.48890, lng: 153.06710 },
  { name: "St Peter's School",            type: 'primary',   lat: -27.50131, lng: 153.07571 },
  { name: 'St Oliver Plunkett School',    type: 'primary',   lat: -27.47006, lng: 153.08466 },
  { name: "St Joseph's (Kangaroo Point)", type: 'primary',   lat: -27.48299, lng: 153.03284 },
  // Secondary
  { name: 'Anglican Church Grammar (Churchie)', type: 'secondary', lat: -27.48238, lng: 153.05089 },
  { name: 'Villanova College',            type: 'secondary', lat: -27.49586, lng: 153.05147 },
  { name: 'Loreto College',               type: 'secondary', lat: -27.50945, lng: 153.06314 },
  { name: 'Lourdes Hill College',         type: 'secondary', lat: -27.46929, lng: 153.05822 },
  { name: "Our Lady's College",           type: 'secondary', lat: -27.51610, lng: 153.03162 },
  { name: "St Laurence's College",        type: 'secondary', lat: -27.48719, lng: 153.02498 },
  // P-12 (appears on both layers)
  { name: 'Cannon Hill Anglican College', type: 'p12',       lat: -27.46044, lng: 153.08696 },
]

const ALL_KEYS = [
  ...LEGEND_ITEMS.map(i => i.key),
  ...ALERT_ITEMS.map(i => i.key),
  ...SCHOOL_ITEMS.map(i => i.key),
]

function groupKey(monday_group: string | null): string {
  if (!monday_group) return 'Other'
  if (monday_group.includes('Hotstock'))        return 'Hotstock'
  if (monday_group.includes('Warmstock'))       return 'Warmstock'
  if (monday_group.includes('Happy'))           return 'Happy to Chat'
  if (monday_group.includes('Unsure'))          return 'Unsure Stock'
  if (monday_group.includes('Off-Market'))      return 'Off-Market'
  if (monday_group.includes('From Open Homes')) return 'From Open Homes'
  if (monday_group.includes('Not interested') || monday_group.includes('Not Interested') || monday_group === 'Lost') return 'Not Interested / Lost'
  return 'Other'
}

function colorForKey(key: string): string {
  return LEGEND_ITEMS.find(i => i.key === key)?.color ?? '#94a3b8'
}

function daysAgo(iso: string): number {
  const d = new Date(iso).getTime()
  if (isNaN(d)) return 0
  return Math.max(0, Math.floor((Date.now() - d) / 86400000))
}

// Sold pins fade weekly and disappear at 4 weeks.
// Returns 1.0, 0.75, 0.5, 0.25, or 0 (hidden).
function soldFade(days: number): number {
  if (days >= 28) return 0
  if (days >= 21) return 0.25
  if (days >= 14) return 0.5
  if (days >= 7)  return 0.75
  return 1
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function PropertyMap({ properties, alerts }: Props) {
  const mapRef       = useRef<HTMLDivElement>(null)
  const leafletRef   = useRef<any>(null)
  const layersRef    = useRef<Record<string, any>>({})

  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ALL_KEYS.map(k => [k, true]))
  )

  function toggle(key: string) {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Map init (runs once) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !mapRef.current) return
      const container = mapRef.current as any
      if (container._leaflet_id) return

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const map = L.map(mapRef.current!, {
        center: [-27.485, 153.073],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 20,
      }).addTo(map)

      L.control.attribution({ prefix: false })
        .addAttribution('© <a href="https://carto.com">CARTO</a> · © OpenStreetMap')
        .addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      leafletRef.current = map
      setTimeout(() => { if (!cancelled) map.invalidateSize() }, 60)

      // Create one LayerGroup per legend key, all added to map by default
      const layers: Record<string, any> = {}
      for (const key of ALL_KEYS) {
        layers[key] = L.layerGroup().addTo(map)
      }
      layersRef.current = layers

      // ── Contact pins ────────────────────────────────────────────────────────
      for (const p of properties) {
        if (!p.lat || !p.lng) continue
        const key   = groupKey(p.monday_group)
        const color = colorForKey(key)
        const name  = p.owner_name || p.address.split(',')[0]

        const callBtn = p.phone
          ? `<a href="tel:${p.phone.replace(/\s/g, '')}" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:6px 12px;background:#c4912a;color:white;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
              ${p.phone}
            </a>`
          : ''

        L.circleMarker([p.lat, p.lng], {
          radius: 7, fillColor: color, color: '#ffffff', weight: 2, fillOpacity: 0.9,
        })
          .bindPopup(`
            <div style="font-family:system-ui;width:220px">
              <div style="font-weight:700;font-size:14px;color:#1c1917;margin-bottom:2px">${name}</div>
              <div style="font-size:12px;color:#78716c">${p.address}</div>
              ${(p.monday_group || p.notes) ? `<span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${color}18;color:${color}">${p.monday_group || p.notes}</span>` : ''}
              ${callBtn}
            </div>
          `, { maxWidth: 260, className: 'dg-popup' })
          .addTo(layers[key])
      }

      // ── School pins ─────────────────────────────────────────────────────────
      for (const s of SCHOOLS) {
        const isPrimary   = s.type === 'primary' || s.type === 'p12'
        const isSecondary = s.type === 'secondary' || s.type === 'p12'
        const typeLabel   = s.type === 'p12' ? 'P–12' : s.type === 'primary' ? 'Primary' : 'Secondary'

        const makeSchoolIcon = (color: string) => L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:6px;
            background:${color};
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.2);
            display:flex;align-items:center;justify-content:center;
            font-size:14px;
          ">🏫</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const popup = `
          <div style="font-family:system-ui;width:200px">
            <div style="font-weight:700;font-size:13px;color:#1c1917;margin-bottom:3px">${s.name}</div>
            <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;background:rgba(0,0,0,0.06);color:#44403c">${typeLabel} · Private</span>
          </div>`

        if (isPrimary) {
          L.marker([s.lat, s.lng], { icon: makeSchoolIcon('#0891b2') })
            .bindPopup(popup, { maxWidth: 220, className: 'dg-popup' })
            .addTo(layers['school-primary'])
        }
        if (isSecondary) {
          L.marker([s.lat, s.lng], { icon: makeSchoolIcon('#7c3aed') })
            .bindPopup(popup, { maxWidth: 220, className: 'dg-popup' })
            .addTo(layers['school-secondary'])
        }
      }

      // ── Alert pins ──────────────────────────────────────────────────────────
      for (const a of alerts.filter(a => !a.actioned && a.lat && a.lng)) {
        const lat      = a.lat!
        const lng      = a.lng!
        const isSold    = a.listing_type === 'sold'
        const isAuction = a.listing_type === 'auction'
        const alertKey  = isSold ? 'sold' : isAuction ? 'auction' : 'sale'
        const typeColor = isSold ? '#0d9488' : isAuction ? '#ef4444' : '#f97316'
        const typeLabel = isSold ? 'SOLD' : isAuction ? 'AUCTION' : 'FOR SALE'

        const soldDays = isSold ? daysAgo(a.detected_at) : 0
        const fade = isSold ? soldFade(soldDays) : 1
        if (isSold && fade === 0) continue  // 4+ weeks old: hide entirely

        const closeContacts = properties
          .filter(p => p.lat && p.lng)
          .map(p => ({ ...p, distM: haversineM(lat, lng, p.lat!, p.lng!) }))
          .filter(p => p.distM <= 500)
          .sort((x, y) => x.distM - y.distM)

        const soldTag = isSold
          ? `<div style="position:absolute;top:-7px;left:50%;transform:translateX(-50%);background:#0d9488;color:white;font-family:system-ui;font-size:9px;font-weight:800;letter-spacing:0.03em;padding:2px 5px;border-radius:8px;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.25);white-space:nowrap;line-height:1;opacity:${fade};">Sold ${soldDays}d ago</div>`
          : ''

        const alertIcon = L.divIcon({
          html: `<div style="position:relative;width:28px;height:28px;opacity:${fade};">
            ${isSold ? '' : `<div style="position:absolute;inset:0;border-radius:50%;background:${typeColor};opacity:0.25;animation:dgpulse 2s ease-out infinite;"></div>`}
            <div style="position:absolute;inset:4px;border-radius:50%;background:${typeColor};border:2.5px solid white;box-shadow:0 2px 8px ${typeColor}66;display:flex;align-items:center;justify-content:center;font-size:9px;">${isSold ? '✓' : '🏠'}</div>
            ${soldTag}
          </div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 14],
        })

        const nearbyRows = closeContacts.length
          ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f0ece4">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:${typeColor};font-weight:700;margin-bottom:6px">${closeContacts.length} contact${closeContacts.length !== 1 ? 's' : ''} within 500m</div>
              ${closeContacts.slice(0, 5).map(p => {
                const d  = Math.round(p.distM)
                const dc = d < 100 ? '#ef4444' : d < 250 ? '#f97316' : '#a8a29e'
                const n  = p.owner_name || p.address.split(',')[0]
                return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                  <div style="display:flex;align-items:center;gap:6px;min-width:0">
                    <span style="font-size:10px;font-weight:700;color:${dc};flex-shrink:0">${d}m</span>
                    <span style="font-size:12px;color:#1c1917;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n}</span>
                  </div>
                  ${p.phone ? `<a href="tel:${p.phone.replace(/\s/g,'')}" style="font-size:11px;color:#c4912a;font-weight:700;text-decoration:none;flex-shrink:0;margin-left:6px">Call</a>` : ''}
                </div>`
              }).join('')}
            </div>`
          : ''

        const reaBtn = a.rea_link
          ? `<a href="${a.rea_link}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;margin-top:8px;font-size:11px;color:${typeColor};font-weight:600;text-decoration:none;">View on REA →</a>`
          : ''

        const soldLine = isSold
          ? `<div style="margin-top:4px;font-size:11px;font-weight:700;color:${typeColor}">Sold ${soldDays === 0 ? 'today' : soldDays === 1 ? 'yesterday' : soldDays + ' days ago'}</div>`
          : ''

        L.marker([lat, lng], { icon: alertIcon })
          .bindPopup(`
            <div style="font-family:system-ui;width:240px">
              <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px;background:${typeColor}18;color:${typeColor};margin-bottom:6px">${typeLabel}</span>
              <div style="font-weight:700;font-size:14px;color:#1c1917;line-height:1.3">${a.listing_address}</div>
              <div style="font-size:12px;color:#78716c;margin-top:2px">${a.listing_suburb}${a.listing_price ? ` · ${a.listing_price}` : ''}</div>
              ${soldLine}${reaBtn}${nearbyRows}
            </div>
          `, { maxWidth: 280, className: 'dg-popup' })
          .addTo(layers[alertKey])
      }
    })

    return () => {
      cancelled = true
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }
      layersRef.current = {}
    }
  }, [])

  // ── Toggle layer visibility when state changes ──────────────────────────────
  useEffect(() => {
    const map = leafletRef.current
    if (!map) return
    for (const [key, lg] of Object.entries(layersRef.current)) {
      if (visible[key]) { if (!map.hasLayer(lg)) lg.addTo(map) }
      else              { if (map.hasLayer(lg))  map.removeLayer(lg) }
    }
  }, [visible])

  return (
    <>
      <style>{`
        @keyframes dgpulse {
          0%   { transform: scale(1); opacity: 0.25; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .dg-popup .leaflet-popup-content-wrapper {
          background: #ffffff; border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07);
          border: 1px solid rgba(28,25,23,0.07); padding: 0;
        }
        .dg-popup .leaflet-popup-content { margin: 14px 16px; }
        .dg-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .dg-popup .leaflet-popup-tip { background: #ffffff; box-shadow: none; }
        .dg-popup .leaflet-popup-close-button { color: rgba(28,25,23,0.35) !important; font-size: 18px !important; top: 8px !important; right: 10px !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important; }
        .leaflet-control-zoom a { background: #ffffff !important; color: #1c1917 !important; border-color: rgba(28,25,23,0.1) !important; font-size: 16px !important; width: 32px !important; height: 32px !important; line-height: 30px !important; }
        .leaflet-control-zoom a:hover { background: #f6f4ef !important; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution { font-size: 10px !important; background: rgba(255,255,255,0.7) !important; backdrop-filter: blur(4px) !important; }
      `}</style>

      {/* Interactive legend */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 800,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(28,25,23,0.09)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui',
        minWidth: 180,
      }}>
        <div style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: '#1c1917', marginBottom: 8 }}>
          Legend
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LEGEND_ITEMS.map(({ key, color, label }) => {
            const on = visible[key]
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                title={on ? `Hide ${label}` : `Show ${label}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: on ? 'transparent' : 'rgba(0,0,0,0.03)',
                  border: 'none', borderRadius: 6,
                  padding: '4px 6px', margin: '0 -6px',
                  cursor: 'pointer', textAlign: 'left', width: 'calc(100% + 12px)',
                  opacity: on ? 1 : 0.45,
                  transition: 'opacity 0.15s, background 0.15s',
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: on ? color : '#d4d4d4',
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }} />
                <span style={{ fontSize: 11, color: on ? '#1c1917' : '#a8a29e', transition: 'color 0.15s' }}>
                  {label}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: on ? color : '#d4d4d4', fontWeight: 700 }}>
                  {on ? '●' : '○'}
                </span>
              </button>
            )
          })}

          {/* Schools section */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid rgba(28,25,23,0.07)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em', color: '#a8a29e', fontWeight: 700, marginBottom: 2, paddingLeft: 6 }}>
              Schools
            </div>
            {SCHOOL_ITEMS.map(({ key, color, label }) => {
              const on = visible[key]
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  title={on ? `Hide ${label}` : `Show ${label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: on ? 'transparent' : 'rgba(0,0,0,0.03)',
                    border: 'none', borderRadius: 6,
                    padding: '4px 6px', margin: '0 -6px',
                    cursor: 'pointer', textAlign: 'left', width: 'calc(100% + 12px)',
                    opacity: on ? 1 : 0.45,
                    transition: 'opacity 0.15s, background 0.15s',
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: on ? color : '#d4d4d4',
                    border: '1.5px solid white',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8,
                    transition: 'background 0.15s',
                  }}>🏫</div>
                  <span style={{ fontSize: 11, color: on ? '#1c1917' : '#a8a29e', transition: 'color 0.15s' }}>
                    {label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: on ? color : '#d4d4d4', fontWeight: 700 }}>
                    {on ? '●' : '○'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Listings section */}
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid rgba(28,25,23,0.07)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ALERT_ITEMS.map(({ key, color, label }) => {
              const on = visible[key]
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  title={on ? `Hide ${label}` : `Show ${label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: on ? 'transparent' : 'rgba(0,0,0,0.03)',
                    border: 'none', borderRadius: 6,
                    padding: '4px 6px', margin: '0 -6px',
                    cursor: 'pointer', textAlign: 'left', width: 'calc(100% + 12px)',
                    opacity: on ? 1 : 0.45,
                    transition: 'opacity 0.15s, background 0.15s',
                  }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: on ? color : '#d4d4d4',
                    border: '2px solid white',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7,
                    transition: 'background 0.15s',
                  }}>🏠</div>
                  <span style={{ fontSize: 11, color: on ? color : '#a8a29e', fontWeight: 600, transition: 'color 0.15s' }}>
                    {label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: on ? color : '#d4d4d4', fontWeight: 700 }}>
                    {on ? '●' : '○'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
