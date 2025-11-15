import type { NextRequest } from 'next/server'

export function resolveBaseUrl(req?: NextRequest): string {
  const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, '')
  }
  if (req) {
    // Utiliser l'origine de la requête (utile en dev ou proxys)
    try {
      const origin = req.nextUrl.origin
      if (origin && /^https?:\/\//i.test(origin)) {
        return origin.replace(/\/$/, '')
      }
    } catch {}
  }
  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
}