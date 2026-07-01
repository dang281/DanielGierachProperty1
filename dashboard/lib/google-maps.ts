'use client'

// Module-level singleton — load Google Maps Places once for the whole app.
// Calling useGoogleMapsPlaces() in any component returns true once the script
// is ready, then stays true forever.

let loadPromise: Promise<void> | null = null
let isReady = false

export function loadGoogleMapsPlaces(): Promise<void> {
  if (isReady) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('SSR')); return }
    if ((window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
      isReady = true
      resolve()
      return
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!key) { reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_KEY not set')); return }

    const existing = document.getElementById('google-maps-places-script') as HTMLScriptElement | null
    if (existing) {
      const poll = () => {
        if ((window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
          isReady = true; resolve()
        } else { setTimeout(poll, 100) }
      }
      poll()
      return
    }

    const s = document.createElement('script')
    s.id = 'google-maps-places-script'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`
    s.async = true
    s.defer = true
    s.onload = () => { isReady = true; resolve() }
    s.onerror = () => { loadPromise = null; reject(new Error('Maps script load failed')) }
    document.head.appendChild(s)
  })

  return loadPromise
}

import { useEffect, useState } from 'react'

export function useGoogleMapsPlaces(): boolean {
  const [ready, setReady] = useState(isReady)
  useEffect(() => {
    if (isReady) { setReady(true); return }
    let cancelled = false
    loadGoogleMapsPlaces()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(e => console.error('Maps load failed:', e))
    return () => { cancelled = true }
  }, [])
  return ready
}
