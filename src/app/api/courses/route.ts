export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany, testConnection } from '@/lib/db'
import { detectCountryCode, buildPrixAffiche } from '@/lib/geo'
import { getCache, setCache } from '@/lib/cache'

// Normalise une URL publique pour les images (corrige les backslashes, supprime /public, assure un leading slash)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construire les filtres
    // Filtres (Formations)
    const whereFormation: any = {
      statut: 'PUBLIE'
    }

    if (category && category !== 'all') {
      // Filtre sur la catégorie de la formation
      whereFormation.categorie = category as any
    }

    if (level && level !== 'all') {
      // Convertir niveaux anglais -> français si nécessaire
      const mapLevel: Record<string, string> = {
        BEGINNER: 'DEBUTANT',
        INTERMEDIATE: 'INTERMEDIAIRE',
        ADVANCED: 'AVANCE'
      }
      const wanted = (level || '').toUpperCase()
      whereFormation.niveau_requis = (mapLevel[wanted] || wanted) as any
    }

    // Prix par pays
    const countryCode = detectCountryCode(request)

    // Fallback MySQL uniquement
    // Si la base est indisponible (dev sans MySQL par ex.),
    // renvoyer une liste vide (200) pour ne pas casser le frontend.
    const canConnect = await testConnection()
    if (!canConnect) {
      return NextResponse.json({
        courses: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: process.env.NODE_ENV !== 'production' ? 'Base de données indisponible en développement; retour vide.' : undefined
      })
    }
    const whereClauses: string[] = ['f.statut = \"PUBLIE\"']
    const params: any[] = []
    if (category && category !== 'all') {
      whereClauses.push('f.categorie = ?')
      params.push(category)
    }
    if (level && level !== 'all') {
      const mapLevel: Record<string, string> = {
        BEGINNER: 'DEBUTANT',
        INTERMEDIATE: 'INTERMEDIAIRE',
        ADVANCED: 'AVANCE'
      }
      const wanted = (level || '').toUpperCase()
      whereClauses.push('f.niveau_requis = ?')
      params.push(mapLevel[wanted] || wanted)
    }
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

    try {
      const totalRow = await queryOne<any>(
        `SELECT COUNT(*) as total 
         FROM Formations f 
         ${whereSql}`,
        params
      )
      const total = totalRow?.total || 0
      const offset = skip
      const listParams = [...params, limit, offset]

      const rows = await queryMany<any>(
        `SELECT 
           f.id_formation,
           f.titre,
           f.description_courte,
           f.description_complete,
           f.duree_totale_heures,
           f.niveau_requis,
           f.categorie,
           f.prix_eur,
           f.prix_dzd,
           f.mots_cles,
           f.image_couverture_url,
           f.note_moyenne,
           f.url_slug
         FROM Formations f
         ${whereSql}
         ORDER BY f.date_creation DESC
         LIMIT ? OFFSET ?`,
        listParams
      )

      const formattedCourses = rows.map((r: any) => {
        // Features depuis mots_cles
        let features: string[] = []
        if (r.mots_cles) {
          try {
            const parsed = JSON.parse(r.mots_cles)
            if (Array.isArray(parsed)) features = parsed
            else if (typeof parsed === 'string') features = parsed.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            features = String(r.mots_cles).split(',').map((s) => s.trim()).filter(Boolean)
          }
        }

        const prixAffiche = buildPrixAffiche(countryCode, {
          priceUSD: null,
          priceEUR: r.prix_eur != null ? Number(r.prix_eur) : null,
          priceDZD: r.prix_dzd != null ? Number(r.prix_dzd) : null,
          priceAFR: null,
        })

        const mapLevelFrToEn: Record<string, string> = {
          DEBUTANT: 'BEGINNER',
          INTERMEDIAIRE: 'INTERMEDIATE',
          AVANCE: 'ADVANCED'
        }

        return {
          id: String(r.id_formation),
          slug: r.url_slug || null,
          title: r.titre,
          description: r.description_courte || r.description_complete,
          duration: `${Number(r.duree_totale_heures || 0)} heures`,
          level: mapLevelFrToEn[r.niveau_requis] || r.niveau_requis,
          category: r.categorie,
          priceEuro: r.prix_eur != null ? Number(r.prix_eur) : null,
          priceDA: r.prix_dzd != null ? Number(r.prix_dzd) : null,
          students: 0,
          rating: r.note_moyenne != null ? Number(r.note_moyenne) : 4.5,
          features,
          image: normalizePublicUrl(r.image_couverture_url),
          ...prixAffiche
        }
      })

      const res = NextResponse.json({
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
      try { setCache(`courses_list_${countryCode}_${page}_${limit}_${category || 'all'}_${level || 'all'}`, { courses: formattedCourses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 60_000) } catch {}
      try { res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' }) } catch {}
      return res
    } catch (mysqlErr) {
      console.error('Erreur fallback MySQL /api/courses:', mysqlErr)
      return NextResponse.json({
        courses: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      })
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
}
