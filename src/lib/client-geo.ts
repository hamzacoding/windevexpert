import eurozone from '@/config/geo/eurozone.json'
import africa from '@/config/geo/africa.json'

type DisplayPrice = { valeur: number; devise: 'USD' | 'EUR' | 'DZD' }

export function detectClientCountryCode(): string {
  try {
    const m = document.cookie.match(/(?:^|; )country_code=([^;]+)/)
    if (m && m[1]) return decodeURIComponent(m[1]).slice(0,2).toUpperCase()
  } catch {}
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz.toLowerCase() === 'africa/algiers') return 'DZ'
    const langs = (navigator.languages || [navigator.language]).filter(Boolean)
    const found = langs.find(l => /-dz$/i.test(l))
    if (found) return 'DZ'
  } catch {}
  return 'FR'
}

export function determineDisplayPrice(
  countryCode: string,
  product: {
    priceUSD?: number | null
    priceEUR?: number | null
    priceDZD?: number | null
    priceAFR?: number | null
    price?: number | null
    priceDA?: number | null
  }
): DisplayPrice {
  const cc = (countryCode || 'FR').toUpperCase()
  const isDZ = cc === 'DZ'
  const isAfrica = !isDZ && africa.includes(cc)
  const isEuro = eurozone.includes(cc)

  const eur = product.priceEUR ?? product.price ?? null
  const dzd = product.priceDZD ?? product.priceDA ?? null
  const usd = product.priceUSD ?? null
  const afr = product.priceAFR ?? usd ?? null

  if (isDZ && dzd != null) return { valeur: Number(dzd), devise: 'DZD' }
  if (isAfrica && afr != null) return { valeur: Number(afr), devise: 'USD' }
  if (isEuro && eur != null) return { valeur: Number(eur), devise: 'EUR' }
  const world = usd ?? eur ?? dzd ?? 0
  return { valeur: Number(world), devise: usd != null ? 'USD' : eur != null ? 'EUR' : 'DZD' }
}
