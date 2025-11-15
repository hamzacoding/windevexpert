import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, execute } from '@/lib/db'

function formatFormationRow(row: any) {
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

function normalizeOptionalString(val: any) {
  if (val === undefined || val === null) return null
  const s = String(val).trim()
  return s === '' ? null : s
}

function normalizeLienPaiement(val: any) {
  const s = normalizeOptionalString(val)
  if (!s) return null
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol)) return null
    return u.toString()
  } catch {
    return null
  }
}

// GET - récupérer une formation par id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const formation = await prisma.formation.findUnique({ where: { id_formation: id } })
        if (!formation) {
          return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 })
        }
        return NextResponse.json(formatFormationEntity(formation))
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    const row = await queryOne(`SELECT * FROM Formations WHERE id_formation = ?`, [id])
    if (!row) {
      return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 })
    }
    return NextResponse.json(formatFormationRow(row))
  } catch (error) {
    console.error('Erreur API GET /admin/formations/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - mise à jour d'une formation
export async function PUT(
  request: NextRequest,
  { params: routeParams }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await routeParams
    const data = await request.json()
    const {
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
    } = data || {}

    const normalizedLien = normalizeLienPaiement(lien_paiement)

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const updated = await prisma.formation.update({
          where: { id_formation: id },
          data: {
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
            lien_paiement: normalizedLien,
            statut,
          }
        })
        return NextResponse.json(formatFormationEntity(updated))
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    // Fallback MySQL
    // Détecter si la colonne lien_paiement existe (environnements MySQL hétérogènes)
    const lienCol = await queryOne("SHOW COLUMNS FROM Formations LIKE 'lien_paiement'")
    const hasLienCol = !!lienCol

    const sqlUpdate = hasLienCol
      ? `UPDATE Formations SET 
        titre = ?, sous_titre = ?, description_courte = ?, description_complete = ?, langue = ?, categorie = ?, sous_categorie = ?,
        objectifs_apprentissage = ?, duree_totale_heures = ?, nombre_modules = ?, nombre_lecons = ?, certificat_fin_formation = ?,
        niveau_requis = ?, prerequis = ?, public_cible = ?,
        prix_usd = ?, prix_eur = ?, prix_dzd = ?, prix_afr = ?,
        type_acces = ?, garantie_remboursement_jours = ?,
        image_couverture_url = ?, video_presentation_url = ?, mots_cles = ?, url_slug = ?, lien_paiement = ?, statut = ?,
        date_mise_a_jour = NOW()
      WHERE id_formation = ?`
      : `UPDATE Formations SET 
        titre = ?, sous_titre = ?, description_courte = ?, description_complete = ?, langue = ?, categorie = ?, sous_categorie = ?,
        objectifs_apprentissage = ?, duree_totale_heures = ?, nombre_modules = ?, nombre_lecons = ?, certificat_fin_formation = ?,
        niveau_requis = ?, prerequis = ?, public_cible = ?,
        prix_usd = ?, prix_eur = ?, prix_dzd = ?, prix_afr = ?,
        type_acces = ?, garantie_remboursement_jours = ?,
        image_couverture_url = ?, video_presentation_url = ?, mots_cles = ?, url_slug = ?, statut = ?,
        date_mise_a_jour = NOW()
      WHERE id_formation = ?`

    const sqlParams = hasLienCol
      ? [
        titre, normalizeOptionalString(sous_titre), normalizeOptionalString(description_courte), String(description_complete || '').trim(), langue, categorie, normalizeOptionalString(sous_categorie),
        normalizeOptionalString(objectifs_apprentissage), duree_totale_heures, nombre_modules, nombre_lecons, !!certificat_fin_formation,
        niveau_requis, normalizeOptionalString(prerequis), normalizeOptionalString(public_cible),
        prix_usd, prix_eur, prix_dzd, prix_afr,
        type_acces, garantie_remboursement_jours,
        normalizeOptionalString(image_couverture_url), normalizeOptionalString(video_presentation_url), normalizeOptionalString(mots_cles), url_slug, normalizedLien, statut,
        id
      ]
      : [
        titre, normalizeOptionalString(sous_titre), normalizeOptionalString(description_courte), String(description_complete || '').trim(), langue, categorie, normalizeOptionalString(sous_categorie),
        normalizeOptionalString(objectifs_apprentissage), duree_totale_heures, nombre_modules, nombre_lecons, !!certificat_fin_formation,
        niveau_requis, normalizeOptionalString(prerequis), normalizeOptionalString(public_cible),
        prix_usd, prix_eur, prix_dzd, prix_afr,
        type_acces, garantie_remboursement_jours,
        normalizeOptionalString(image_couverture_url), normalizeOptionalString(video_presentation_url), normalizeOptionalString(mots_cles), url_slug, statut,
        id
      ]

    await execute(sqlUpdate, sqlParams)
    
    const row = await queryOne(`SELECT * FROM Formations WHERE id_formation = ?`, [id])
    return NextResponse.json(formatFormationRow(row))
  } catch (error) {
    console.error('Erreur API PUT /admin/formations/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - suppression d'une formation
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        await prisma.formation.delete({ where: { id_formation: id } })
        return NextResponse.json({ success: true })
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    await execute(`DELETE FROM Formations WHERE id_formation = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur API DELETE /admin/formations/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - mise à jour partielle (ex: statut, image)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const payload = await request.json()

    // Ne garder que les champs autorisés à être modifiés partiellement
    const allowedKeys = new Set([
      'statut',
      'image_couverture_url',
      'video_presentation_url',
      'mots_cles',
      'url_slug',
      'lien_paiement'
    ])
    const updates: Record<string, any> = {}
    Object.entries(payload || {}).forEach(([key, val]) => {
      if (allowedKeys.has(key)) {
        if (key === 'lien_paiement') {
          updates[key] = normalizeLienPaiement(val)
        } else if (key === 'image_couverture_url' || key === 'video_presentation_url' || key === 'mots_cles') {
          updates[key] = normalizeOptionalString(val)
        } else {
          updates[key] = val
        }
      }
    })

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ valide fourni' }, { status: 400 })
    }

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const updated = await prisma.formation.update({
          where: { id_formation: id },
          data: updates
        })
        return NextResponse.json(formatFormationEntity(updated))
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    // Fallback MySQL: construire dynamiquement la requête UPDATE
    // Si la colonne lien_paiement n'existe pas dans MySQL, l'exclure des updates pour éviter ER_BAD_FIELD_ERROR
    const lienColPatch = await queryOne("SHOW COLUMNS FROM Formations LIKE 'lien_paiement'")
    if (!lienColPatch) {
      delete updates['lien_paiement']
    }
    const setClauses: string[] = []
    const values: any[] = []
    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`)
      values.push(val)
    }
    // Mettre à jour la date de mise à jour
    setClauses.push(`date_mise_a_jour = NOW()`)

    const sql = `UPDATE Formations SET ${setClauses.join(', ')} WHERE id_formation = ?`
    values.push(id)
    await execute(sql, values)

    const row = await queryOne(`SELECT * FROM Formations WHERE id_formation = ?`, [id])
    return NextResponse.json(formatFormationRow(row))
  } catch (error) {
    console.error('Erreur API PATCH /admin/formations/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}