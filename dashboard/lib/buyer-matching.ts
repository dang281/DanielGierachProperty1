import type { BuyerBrief } from '@/types/buyers'

export type EnrichedListing = {
  id: string
  listing_address: string
  listing_suburb: string
  listing_price: string | null
  listing_type: string
  listing_description?: string | null
  listing_beds?: number | null
  listing_baths?: number | null
  listing_car?: number | null
  listing_price_numeric?: number | null
  listing_type_normalized?: string | null
}

export type MatchReason =
  | { kind: 'beds'; value: number }
  | { kind: 'baths'; value: number }
  | { kind: 'car'; value: number }
  | { kind: 'extras'; hits: string[] }

export type Match = {
  buyer: BuyerBrief
  score: number
  reasons: MatchReason[]
}

const norm = (s: string) => s.trim().toLowerCase()

function parsePriceFromString(price: string | null): number | null {
  if (!price) return null
  const cleaned = price.replace(/[\s,]/g, '')
  // Handle "$X.XM" style
  const millions = cleaned.match(/\$?(\d+(?:\.\d+)?)M\b/i)
  if (millions) return Math.round(parseFloat(millions[1]) * 1_000_000)
  // Handle "$XXX,XXX" style — find first 6–8 digit number
  const explicit = cleaned.match(/\$?(\d{6,8})/)
  if (explicit) return parseInt(explicit[1], 10)
  return null
}

function inferTypeFromAddress(address: string): string | null {
  // "1/35 Burrai Street" — leading number/number means unit/apartment
  if (/^\d+\/\d+/.test(address)) return 'unit'
  return null
}

function getListingPrice(listing: EnrichedListing): number | null {
  return listing.listing_price_numeric ?? parsePriceFromString(listing.listing_price)
}

function getListingType(listing: EnrichedListing): string | null {
  return listing.listing_type_normalized ?? inferTypeFromAddress(listing.listing_address)
}

export function matchBuyersToListing(
  listing: EnrichedListing,
  buyers: BuyerBrief[],
): Match[] {
  const listingSuburb = norm(listing.listing_suburb)
  const price = getListingPrice(listing)
  const type = getListingType(listing)

  const matches: Match[] = []

  for (const buyer of buyers) {
    if (buyer.status !== 'active') continue

    // ── Hard filters ───────────────────────────────────────────────
    if (buyer.suburbs.length > 0) {
      if (!buyer.suburbs.map(norm).includes(listingSuburb)) continue
    }
    if (price != null) {
      if (buyer.price_min != null && price < buyer.price_min) continue
      if (buyer.price_max != null && price > buyer.price_max) continue
    }
    if (type && buyer.property_types.length > 0) {
      if (!buyer.property_types.includes(type)) continue
    }

    // ── Scored bands ───────────────────────────────────────────────
    let score = 0
    let possible = 0
    const reasons: MatchReason[] = []

    if (buyer.beds_min > 0) {
      possible += 25
      if (listing.listing_beds != null && listing.listing_beds >= buyer.beds_min) {
        score += 25
        reasons.push({ kind: 'beds', value: listing.listing_beds })
      }
    }
    if (buyer.baths_min > 0) {
      possible += 20
      if (listing.listing_baths != null && listing.listing_baths >= buyer.baths_min) {
        score += 20
        reasons.push({ kind: 'baths', value: listing.listing_baths })
      }
    }
    if (buyer.car_min > 0) {
      possible += 15
      if (listing.listing_car != null && listing.listing_car >= buyer.car_min) {
        score += 15
        reasons.push({ kind: 'car', value: listing.listing_car })
      }
    }

    const extras = (buyer.extras ?? '')
      .split(/[,\n;]/)
      .map(k => k.trim().toLowerCase())
      .filter(Boolean)
    if (extras.length > 0 && listing.listing_description) {
      possible += 40
      const desc = listing.listing_description.toLowerCase()
      const hits = extras.filter(k => desc.includes(k))
      if (hits.length > 0) {
        score += Math.round(40 * (hits.length / extras.length))
        reasons.push({ kind: 'extras', hits })
      }
    }

    const pct = possible === 0 ? 100 : Math.round((score / possible) * 100)
    matches.push({ buyer, score: pct, reasons })
  }

  matches.sort((a, b) => b.score - a.score)
  return matches
}

export function matchAll(
  listings: EnrichedListing[],
  buyers: BuyerBrief[],
): Record<string, Match[]> {
  const out: Record<string, Match[]> = {}
  for (const listing of listings) {
    out[listing.id] = matchBuyersToListing(listing, buyers)
  }
  return out
}
