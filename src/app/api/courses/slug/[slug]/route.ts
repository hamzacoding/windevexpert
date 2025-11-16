export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { detectCountryCode, buildPrixAffiche } from '@/lib/geo'
import { getCache, setCache } from '@/lib/cache'

function normalizePublicUrl(url: any): string {
  if (!url) return '/api/placeholder/400/250'
  let s = String(url)
  s = s.replace(/\\/g, '/')
  s = s.replace(/^\/?public\//, '/')
  if (!/^https?:\/\//i.test(s) && !s.startsWith('/')) {
    s = '/' + s
  }
  return s || '/api/placeholder/400/250'
}

function parseTextList(input: any): string[] {
  if (!input) return []
  const s = String(input).trim()
  if (!s) return []
  try {
    const parsed = JSON.parse(s)
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean)
  } catch {}
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cacheKey = `course_slug_${slug}`
    const cached = getCache<any>(cacheKey)
    if (cached) {
      const res = NextResponse.json(cached)
      try { res.cookies.set('country_code', detectCountryCode(request), { maxAge: 60 * 60, path: '/', sameSite: 'lax' }) } catch {}
      return res
    }

    const hasPrismaEnv = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')
    if (hasPrismaEnv) {
      try {
        const { prisma } = await import('@/lib/prisma')
        const formation = await prisma.formation.findUnique({ where: { url_slug: slug } })
        if (formation) {
          const formattedCourse = {
            id: String(formation.id_formation),
            slug: formation.url_slug,
            title: formation.titre,
            subtitle: formation.sous_titre ?? null,
            description: formation.description_courte ?? formation.description_complete ?? '',
            longDescription: formation.description_complete ?? formation.description_courte ?? '',
            duration: `${Math.floor(Number(formation.duree_totale_heures) || 0)} heures`,
            level: formation.niveau_requis || 'Tous niveaux',
            language: formation.langue || 'FRANCAIS',
            category: formation.categorie || 'Non catégorisé',
            subcategory: formation.sous_categorie ?? null,
            modulesCount: Number(formation.nombre_modules || 0),
            lessonsCount: Number(formation.nombre_lecons || 0),
            certificate: !!formation.certificat_fin_formation,
            accessType: formation.type_acces || 'ACCES_A_VIE',
            refundableDays: formation.garantie_remboursement_jours ?? 0,
            videoUrl: formation.video_presentation_url ?? null,
            targetAudience: formation.public_cible ?? null,
            features: parseTextList(formation.mots_cles),
            objectives: parseTextList(formation.objectifs_apprentissage),
            prerequisites: parseTextList(formation.prerequis),
            modules: [],
            priceEuro: formation.prix_eur != null ? Number(formation.prix_eur) : null,
            priceDA: formation.prix_dzd != null ? Number(formation.prix_dzd) : null,
            lien_paiement: formation.lien_paiement ?? null,
            studentsCount: Number((formation as any).nombre_avis || 0),
            rating: (formation as any).note_moyenne != null ? Number((formation as any).note_moyenne) : 4.5,
            image: normalizePublicUrl(formation.image_couverture_url)
          }
          const countryCode = detectCountryCode(request)
          const prixAffiche = buildPrixAffiche(countryCode, {
            priceUSD: formation.prix_usd != null ? Number(formation.prix_usd) : null,
            priceEUR: formation.prix_eur != null ? Number(formation.prix_eur) : null,
            priceDZD: formation.prix_dzd != null ? Number(formation.prix_dzd) : null,
            priceAFR: formation.prix_afr != null ? Number(formation.prix_afr) : null,
          })
          const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
          try { setCache(cacheKey, { ...formattedCourse, ...prixAffiche }, 60_000) } catch {}
          res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' })
          return res
        }
      } catch (err) {
        console.warn('Prisma indisponible pour /api/courses/slug/[slug], fallback MySQL...', err)
      }
    }

    const row = await queryOne<any>(
      `SELECT * FROM Formations WHERE url_slug = ?`,
      [slug]
    )
    if (!row) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    const features = parseTextList(row.mots_cles)
    const objectives = parseTextList(row.objectifs_apprentissage)
    const prerequisites = parseTextList(row.prerequis)
    const formattedCourse = {
      id: String(row.id_formation),
      slug: row.url_slug,
      title: row.titre,
      subtitle: row.sous_titre || null,
      description: row.description_courte || row.description_complete || '',
      longDescription: row.description_complete || row.description_courte || '',
      duration: `${Math.floor(Number(row.duree_totale_heures) || 0)} heures`,
      level: row.niveau_requis || 'Tous niveaux',
      language: row.langue || 'FRANCAIS',
      category: row.categorie || 'Non catégorisé',
      subcategory: row.sous_categorie || null,
      modulesCount: Number(row.nombre_modules || 0),
      lessonsCount: Number(row.nombre_lecons || 0),
      certificate: !!row.certificat_fin_formation,
      accessType: row.type_acces || 'ACCES_A_VIE',
      refundableDays: row.garantie_remboursement_jours != null ? Number(row.garantie_remboursement_jours) : 0,
      videoUrl: row.video_presentation_url || null,
      targetAudience: row.public_cible || null,
      features,
      objectives,
      prerequisites,
      modules: [],
      priceEuro: row.prix_eur != null ? Number(row.prix_eur) : null,
      priceDA: row.prix_dzd != null ? Number(row.prix_dzd) : null,
      lien_paiement: row.lien_paiement || null,
      studentsCount: Number(row.nombre_avis || 0),
      rating: row.note_moyenne != null ? Number(row.note_moyenne) : 4.5,
      image: normalizePublicUrl(row.image_couverture_url)
    }
    const countryCode = detectCountryCode(request)
    const prixAffiche = buildPrixAffiche(countryCode, {
      priceUSD: row.prix_usd != null ? Number(row.prix_usd) : null,
      priceEUR: row.prix_eur != null ? Number(row.prix_eur) : null,
      priceDZD: row.prix_dzd != null ? Number(row.prix_dzd) : null,
      priceAFR: row.prix_afr != null ? Number(row.prix_afr) : null,
    })
    const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
    try { setCache(cacheKey, { ...formattedCourse, ...prixAffiche }, 60_000) } catch {}
    try { res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' }) } catch {}
    return res

  } catch (error) {
    console.error('Erreur lors de la récupération de la formation par slug:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}
