import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, queryMany, execute, testConnection } from '@/lib/db'

function slugify(input: string) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

function formatFormationRow(row: any) {
  // MySQL row -> API response
  return {
    id_formation: String(row.id_formation),
    titre: row.titre,
    sous_titre: row.sous_titre || null,
    description_courte: row.description_courte || null,
    description_complete: row.description_complete,
    langue: row.langue,
    categorie: row.categorie,
    sous_categorie: row.sous_categorie || null,
    objectifs_apprentissage: row.objectifs_apprentissage || null,
    duree_totale_heures: row.duree_totale_heures != null ? Number(row.duree_totale_heures) : 0,
    nombre_modules: row.nombre_modules != null ? Number(row.nombre_modules) : 0,
    nombre_lecons: row.nombre_lecons != null ? Number(row.nombre_lecons) : 0,
    certificat_fin_formation: !!row.certificat_fin_formation,
    niveau_requis: row.niveau_requis,
    prerequis: row.prerequis || null,
    public_cible: row.public_cible || null,
    prix_usd: row.prix_usd != null ? Number(row.prix_usd) : 0,
    prix_eur: row.prix_eur != null ? Number(row.prix_eur) : 0,
    prix_dzd: row.prix_dzd != null ? Number(row.prix_dzd) : 0,
    prix_afr: row.prix_afr != null ? Number(row.prix_afr) : 0,
    type_acces: row.type_acces,
    garantie_remboursement_jours: row.garantie_remboursement_jours != null ? Number(row.garantie_remboursement_jours) : 0,
    image_couverture_url: row.image_couverture_url || null,
    video_presentation_url: row.video_presentation_url || null,
    mots_cles: row.mots_cles || null,
    url_slug: row.url_slug,
    lien_paiement: row.lien_paiement || null,
    statut: row.statut,
    date_creation: row.date_creation,
    date_mise_a_jour: row.date_mise_a_jour,
    note_moyenne: row.note_moyenne != null ? Number(row.note_moyenne) : null,
    nombre_avis: row.nombre_avis != null ? Number(row.nombre_avis) : 0,
  }
}

function formatFormationEntity(entity: any) {
  // Prisma entity -> API response
  return {
    id_formation: entity.id_formation,
    titre: entity.titre,
    sous_titre: entity.sous_titre ?? null,
    description_courte: entity.description_courte ?? null,
    description_complete: entity.description_complete,
    langue: entity.langue,
    categorie: entity.categorie,
    sous_categorie: entity.sous_categorie ?? null,
    objectifs_apprentissage: entity.objectifs_apprentissage ?? null,
    duree_totale_heures: Number(entity.duree_totale_heures ?? 0),
    nombre_modules: entity.nombre_modules ?? 0,
    nombre_lecons: entity.nombre_lecons ?? 0,
    certificat_fin_formation: !!entity.certificat_fin_formation,
    niveau_requis: entity.niveau_requis,
    prerequis: entity.prerequis ?? null,
    public_cible: entity.public_cible ?? null,
    prix_usd: Number(entity.prix_usd ?? 0),
    prix_eur: Number(entity.prix_eur ?? 0),
    prix_dzd: Number(entity.prix_dzd ?? 0),
    prix_afr: Number(entity.prix_afr ?? 0),
    type_acces: entity.type_acces,
    garantie_remboursement_jours: entity.garantie_remboursement_jours ?? 0,
    image_couverture_url: entity.image_couverture_url ?? null,
    video_presentation_url: entity.video_presentation_url ?? null,
    mots_cles: entity.mots_cles ?? null,
    url_slug: entity.url_slug,
    lien_paiement: entity.lien_paiement ?? null,
    statut: entity.statut,
    date_creation: entity.date_creation as any,
    date_mise_a_jour: entity.date_mise_a_jour as any,
    note_moyenne: entity.note_moyenne != null ? Number(entity.note_moyenne) : null,
    nombre_avis: entity.nombre_avis ?? 0,
  }
}

// GET - liste des formations (pagination + recherche)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isDev = process.env.NODE_ENV !== 'production'
    const isAdmin = session?.user?.role === 'ADMIN'

    if (!isDev) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
      }
      if (!isAdmin) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const statut = searchParams.get('statut') || ''

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const where: any = {}
        if (search) {
          where.OR = [
            { titre: { contains: search, mode: 'insensitive' } },
            { description_complete: { contains: search, mode: 'insensitive' } },
            { url_slug: { contains: search, mode: 'insensitive' } },
          ]
        }
        if (statut && statut !== 'all') {
          where.statut = statut
        }

        const total = await prisma.formation.count({ where })
        const rows = await prisma.formation.findMany({
          where,
          orderBy: { date_creation: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        })

        return NextResponse.json({
          formations: rows.map(formatFormationEntity),
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    // Fallback MySQL
    // Si la base n'est pas joignable (dev sans MySQL, config manquante, etc.),
    // on renvoie une liste vide plutôt qu'un 500 pour ne pas casser le frontend.
    const canConnect = await testConnection()
    if (!canConnect) {
      return NextResponse.json({
        formations: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        pagination: { page, limit, total: 0, totalPages: 0 },
        // Petit message utile en dev uniquement
        message: isDev ? 'Base de données indisponible en développement; retour vide.' : undefined
      })
    }

    const whereClauses: string[] = []
    const params: any[] = []
    if (search) {
      whereClauses.push('(titre LIKE ? OR description_complete LIKE ? OR url_slug LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (statut && statut !== 'all') {
      whereClauses.push('statut = ?')
      params.push(statut)
    }
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    try {
      const totalRow = await queryOne(`SELECT COUNT(*) as total FROM Formations ${whereSql}`, params)
      const total = totalRow?.total || 0
      const offset = (page - 1) * limit
      const listParams = [...params, limit, offset]
      const rows = await queryMany(
        `SELECT * FROM Formations ${whereSql} ORDER BY date_creation DESC LIMIT ? OFFSET ?`,
        listParams
      )

      return NextResponse.json({
        formations: rows.map(formatFormationRow),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      })
    } catch (mysqlErr) {
      console.error('Erreur fallback MySQL pour /admin/formations:', mysqlErr)
      // En cas d'erreur SQL, retourner vide pour éviter un 500 côté frontend.
      return NextResponse.json({
        formations: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        pagination: { page, limit, total: 0, totalPages: 0 }
      })
    }
  } catch (error) {
    console.error('Erreur API GET /admin/formations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
}

// POST - créer une formation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isDev = process.env.NODE_ENV !== 'production'
    const isAdmin = session?.user?.role === 'ADMIN'

    if (!isDev) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
      }
      if (!isAdmin) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    }

    const body = await request.json()
    const {
      id_formation,
      titre,
      sous_titre,
      description_courte,
      description_complete,
      langue,
      categorie,
      sous_categorie,
      objectifs_apprentissage,
      duree_totale_heures,
      nombre_modules,
      nombre_lecons,
      certificat_fin_formation,
      niveau_requis,
      prerequis,
      public_cible,
      prix_usd,
      prix_eur,
      prix_dzd,
      prix_afr,
      type_acces,
      garantie_remboursement_jours,
      image_couverture_url,
      video_presentation_url,
      mots_cles,
      url_slug,
      lien_paiement,
      statut,
    } = body || {}

    const missing: string[] = []
    if (!titre) missing.push('titre')
    if (!description_complete) missing.push('description_complete')
    if (!langue) missing.push('langue')
    if (!categorie) missing.push('categorie')
    if (!niveau_requis) missing.push('niveau_requis')
    if (!type_acces) missing.push('type_acces')
    if (prix_usd === undefined) missing.push('prix_usd')
    if (prix_eur === undefined) missing.push('prix_eur')
    if (prix_dzd === undefined) missing.push('prix_dzd')
    if (prix_afr === undefined) missing.push('prix_afr')
    if (missing.length) {
      return NextResponse.json({ error: 'Données manquantes', missing }, { status: 400 })
    }

    const generatedId = id_formation || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const baseSlug = url_slug ? slugify(url_slug) : slugify(titre)

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const exists = await prisma.formation.findUnique({ where: { url_slug: baseSlug } })
        if (exists) {
          return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 })
        }

        const created = await prisma.formation.create({
          data: {
            id_formation: generatedId,
            titre,
            sous_titre,
            description_courte,
            description_complete,
            langue,
            categorie,
            sous_categorie,
            objectifs_apprentissage,
            duree_totale_heures: duree_totale_heures ?? 0,
            nombre_modules: nombre_modules ?? 0,
            nombre_lecons: nombre_lecons ?? 0,
            certificat_fin_formation: !!certificat_fin_formation,
            niveau_requis,
            prerequis,
            public_cible,
            prix_usd,
            prix_eur,
            prix_dzd,
            prix_afr,
            type_acces,
            garantie_remboursement_jours: garantie_remboursement_jours ?? 0,
            image_couverture_url,
            video_presentation_url,
            mots_cles,
            url_slug: baseSlug,
            lien_paiement,
            statut: statut || 'BROUILLON',
          }
        })

        return NextResponse.json(formatFormationEntity(created), { status: 201 })
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    // Fallback MySQL
    await execute(
      `INSERT INTO Formations (
        id_formation, titre, sous_titre, description_courte, description_complete, langue, categorie, sous_categorie,
        objectifs_apprentissage, duree_totale_heures, nombre_modules, nombre_lecons, certificat_fin_formation,
        niveau_requis, prerequis, public_cible,
        prix_usd, prix_eur, prix_dzd, prix_afr,
        type_acces, garantie_remboursement_jours,
        image_couverture_url, video_presentation_url, mots_cles, url_slug, lien_paiement, statut,
        date_creation, date_mise_a_jour, note_moyenne, nombre_avis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
      [
        generatedId, titre, sous_titre, description_courte, description_complete, langue, categorie, sous_categorie,
        objectifs_apprentissage, duree_totale_heures ?? 0, nombre_modules ?? 0, nombre_lecons ?? 0, !!certificat_fin_formation,
        niveau_requis, prerequis, public_cible,
        prix_usd, prix_eur, prix_dzd, prix_afr,
        type_acces, garantie_remboursement_jours ?? 0,
        image_couverture_url, video_presentation_url, mots_cles, baseSlug, lien_paiement, statut || 'BROUILLON',
        null, 0
      ]
    )

    const row = await queryOne(`SELECT * FROM Formations WHERE id_formation = ?`, [generatedId])
    return NextResponse.json(formatFormationRow(row), { status: 201 })
  } catch (error) {
    console.error('Erreur API POST /admin/formations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la formation' },
      { status: 500 }
    )
  }
}