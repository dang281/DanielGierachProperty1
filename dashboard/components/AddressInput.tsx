'use client'

import { useEffect, useRef } from 'react'
import { useGoogleMapsPlaces } from '@/lib/google-maps'

type Props = {
  value: string
  onChange: (v: string) => void
  onSelect?: (v: string) => void
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  className?: string
  placeholder?: string
}

export default function AddressInput({
  value, onChange, onSelect, onBlur, onKeyDown, autoFocus, className, placeholder,
}: Props) {
  const ready = useGoogleMapsPlaces()
  const inputRef = useRef<HTMLInputElement>(null)
  const acRef    = useRef<unknown>(null)

  useEffect(() => {
    if (!ready || !inputRef.current) return
    if (acRef.current) return
    const g = (window as unknown as { google: { maps: { places: { Autocomplete: new (...args: unknown[]) => unknown } } } }).google
    const ac = new g.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'au' },
      types: ['geocode'],
      fields: ['formatted_address', 'name', 'address_components'],
    }) as unknown as { addListener: (ev: string, fn: () => void) => void; getPlace: () => { formatted_address?: string; name?: string } }
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      const addr = place?.formatted_address ?? place?.name ?? ''
      if (addr) {
        onChange(addr)
        onSelect?.(addr)
      }
    })
    acRef.current = ac
  }, [ready, onChange, onSelect])

  return (
    <input
      ref={inputRef}
      autoFocus={autoFocus}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder ?? (ready ? 'Start typing an address…' : 'Loading places…')}
      className={className}
      autoComplete="off"
    />
  )
}
