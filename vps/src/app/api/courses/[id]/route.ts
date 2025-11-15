export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'
import { detectCountryCode, buildPrixAffiche } from '@/lib/geo'

// Normalise une URL publique pour les images (corrige les backslashes, supprime /public, assure un leading slash)
function normalizePublicUrl(url: any): string {
  if (!url) return '/api/placeholder/400/250'
  let s = String(url)
  // Remplacer les backslashes Windows par des slashes web
  s = s.replace(/\\/g, '/')
  // Supprimer un éventuel préfixe 'public/'
  s = s.replace(/^\/?public\//, '/')
  // Assurer un leading slash si ce n'est pas une URL absolue
  if (!/^https?:\/\//i.test(s) && !s.startsWith('/')) {
    s = '/' + s
  }
  return s || '/api/placeholder/400/250'
}

// Parse util: transform JSON array or delimited text into string[]
function parseTextList(input: any): string[] {
  if (!input) return []
  const s = String(input).trim()
  if (!s) return []
  try {
    const parsed = JSON.parse(s)
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean)
  } catch (_) {
    // not JSON
  }
  // Split by newline or comma
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params

    const hasPrismaEnv = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')
    if (hasPrismaEnv) {
      try {
        const { prisma } = await import('@/lib/prisma')
        // Priorité: récupérer depuis Formations (nouveau modèle public)
        const formation = await prisma.formation.findUnique({ where: { id_formation: courseId } })
        if (formation) {
          const formattedCourse = {
            id: String(formation.id_formation),
            title: formation.titre,
            description: formation.description_courte ?? formation.description_complete ?? '',
            longDescription: formation.description_complete ?? formation.description_courte ?? '',
            duration: `${Math.floor(Number(formation.duree_totale_heures) || 0)} heures`,
            level: formation.niveau_requis || 'Tous niveaux',
            category: formation.categorie || 'Non catégorisé',
            priceEuro: formation.prix_eur != null ? Number(formation.prix_eur) : null,
            priceDA: formation.prix_dzd != null ? Number(formation.prix_dzd) : null,
            lien_paiement: (formation as any).lien_paiement || null,
            studentsCount: Number((formation as any).studentsCount || 0),
            rating: (formation as any).note_moyenne != null ? Number((formation as any).note_moyenne) : 4.5,
            features: [],
            objectives: [
              'Objectif 1',
              'Objectif 2',
              'Objectif 3'
            ],
            prerequisites: [
              'Prérequis 1',
              'Prérequis 2'
            ],
            modules: [],
            image: (formation as any).image_couverture_url || '/api/placeholder/400/250'
          }
          const countryCode = detectCountryCode(request)
          const prixAffiche = buildPrixAffiche(countryCode, {
            priceUSD: formation.prix_usd != null ? Number(formation.prix_usd) : null,
            priceEUR: formation.prix_eur != null ? Number(formation.prix_eur) : null,
            priceDZD: formation.prix_dzd != null ? Number(formation.prix_dzd) : null,
            priceAFR: formation.prix_afr != null ? Number(formation.prix_afr) : null,
          })
          const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
          res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' })
          return res
        }
        
        // Utiliser les champs de Course directement (sans Product)
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            category: true,
            lessons: { orderBy: { order: 'asc' } },
            _count: { select: { enrollments: true } }
          }
        })

        if (!course) {
          return NextResponse.json(
            { error: 'Formation non trouvée' },
            { status: 404 }
          )
        }

        const formattedCourse = {
          id: course.id,
          title: course.title,
          description: course.description,
          longDescription: course.description,
          duration: `${Math.floor(course.duration / 60)} heures`,
          level: course.level,
          category: (course as any).category?.name || 'Non catégorisé',
          priceEuro: (course as any).price ?? null,
          priceDA: (course as any).priceDA ?? null,
          studentsCount: course._count.enrollments,
          rating: 4.5,
          features: Array.isArray((course as any).features)
            ? ((course as any).features as string[])
            : ((course as any).features ? (() => { try { return JSON.parse((course as any).features) } catch { return [] } })() : []),
          objectives: [
            'Objectif 1',
            'Objectif 2',
            'Objectif 3'
          ],
          prerequisites: [
            'Prérequis 1',
            'Prérequis 2'
          ],
          modules: course.lessons.map((lesson) => ({
            title: lesson.title,
            duration: `${Math.floor((lesson.duration || 0) / 60)}h`,
            lessons: [lesson.description || 'Description du module']
          })),
          image: (course as any).logo || '/api/placeholder/400/250'
        }
        const countryCode = detectCountryCode(request)
        const prixAffiche = buildPrixAffiche(countryCode, {
          priceUSD: (course as any).priceUSD ?? null,
          priceEUR: (course as any).price ?? null,
          priceDZD: (course as any).priceDA ?? null,
          priceAFR: (course as any).priceAFR ?? null,
        })
        const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
        res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' })
        return res
      } catch (err) {
        console.warn('Prisma indisponible pour /api/courses/[id], fallback MySQL...', err)
        // Continuer vers fallback MySQL
      }
    }

    // Fallback MySQL: essayer d'abord Formations
    const formationRow = await queryOne<any>(
      `SELECT * FROM Formations WHERE id_formation = ?`,
      [courseId]
    )
    if (formationRow) {
      // Mapper niveaux pour compatibilité (laisser tel quel si FR)
      const features = parseTextList(formationRow.mots_cles)
      const objectives = parseTextList(formationRow.objectifs_apprentissage)
      const prerequisites = parseTextList(formationRow.prerequis)
      const formattedCourse = {
        id: String(formationRow.id_formation),
        slug: formationRow.url_slug,
        title: formationRow.titre,
        subtitle: formationRow.sous_titre || null,
        description: formationRow.description_courte || formationRow.description_complete || '',
        longDescription: formationRow.description_complete || formationRow.description_courte || '',
        duration: `${Math.floor(Number(formationRow.duree_totale_heures) || 0)} heures`,
        level: formationRow.niveau_requis || 'Tous niveaux',
        language: formationRow.langue || 'FRANCAIS',
        category: formationRow.categorie || 'Non catégorisé',
        subcategory: formationRow.sous_categorie || null,
        modulesCount: Number(formationRow.nombre_modules || 0),
        lessonsCount: Number(formationRow.nombre_lecons || 0),
        certificate: !!formationRow.certificat_fin_formation,
        accessType: formationRow.type_acces || 'ACCES_A_VIE',
        refundableDays: formationRow.garantie_remboursement_jours != null ? Number(formationRow.garantie_remboursement_jours) : 0,
        videoUrl: formationRow.video_presentation_url || null,
        targetAudience: formationRow.public_cible || null,
        features,
        objectives,
        prerequisites,
        modules: [],
        priceEuro: formationRow.prix_eur != null ? Number(formationRow.prix_eur) : null,
        priceDA: formationRow.prix_dzd != null ? Number(formationRow.prix_dzd) : null,
        lien_paiement: formationRow.lien_paiement || null,
        studentsCount: Number(formationRow.nombre_avis || 0),
        rating: formationRow.note_moyenne != null ? Number(formationRow.note_moyenne) : 4.5,
        image: normalizePublicUrl(formationRow.image_couverture_url)
      }
      const countryCode = detectCountryCode(request)
      const prixAffiche = buildPrixAffiche(countryCode, {
        priceUSD: formationRow.prix_usd != null ? Number(formationRow.prix_usd) : null,
        priceEUR: formationRow.prix_eur != null ? Number(formationRow.prix_eur) : null,
        priceDZD: formationRow.prix_dzd != null ? Number(formationRow.prix_dzd) : null,
        priceAFR: formationRow.prix_afr != null ? Number(formationRow.prix_afr) : null,
      })
      const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
      res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' })
      return res
    }

    // Fallback MySQL: Course legacy
    const row = await queryOne<any>(
      `SELECT 
         c.id,
         c.title,
         c.description,
         c.duration,
         c.level,
         c.price AS price_euro,
         c.priceDA AS price_da,
         c.features AS course_features,
         cat.name AS category_name,
         c.logo AS course_logo,
         (SELECT COUNT(*) FROM Enrollment e WHERE e.courseId = c.id) AS enrollments_count
       FROM Course c
       LEFT JOIN Category cat ON cat.id = c.categoryId
       WHERE c.id = ? AND c.isActive = 1`,
      [courseId]
    )

    if (!row) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    const lessonRows = await queryMany<any>(
      `SELECT id, title, description, duration, \`order\` 
       FROM Lesson 
       WHERE courseId = ? 
       ORDER BY \`order\` ASC`,
      [courseId]
    )

    let features: string[] = []
    if (row.course_features) {
      try {
        const parsed = JSON.parse(row.course_features)
        if (Array.isArray(parsed)) features = parsed
      } catch {
        features = []
      }
    }

    const formattedCourse = {
      id: String(row.id),
      title: row.title,
      description: row.description,
      longDescription: row.description,
      duration: `${Math.floor(Number(row.duration) / 60)} heures`,
      level: row.level,
      category: row.category_name || 'Non catégorisé',
      priceEuro: Number(row.price_euro),
      priceDA: row.price_da !== null ? Number(row.price_da) : null,
      studentsCount: Number(row.enrollments_count || 0),
      rating: 4.5,
      features,
      objectives: [
        'Objectif 1',
        'Objectif 2',
        'Objectif 3'
      ],
      prerequisites: [
        'Prérequis 1',
        'Prérequis 2'
      ],
      modules: lessonRows.map((l: any) => ({
        title: l.title,
        duration: `${Math.floor((Number(l.duration) || 0) / 60)}h`,
        lessons: [l.description || 'Description du module']
      })),
      image: row.course_logo || '/api/placeholder/400/250'
    }
    const countryCode = detectCountryCode(request)
    const prixAffiche = buildPrixAffiche(countryCode, {
      priceUSD: null,
      priceEUR: Number(row.price_euro),
      priceDZD: row.price_da !== null ? Number(row.price_da) : null,
      priceAFR: null,
    })
    const res = NextResponse.json({ ...formattedCourse, ...prixAffiche })
    res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' })
    return res

  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}