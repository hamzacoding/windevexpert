import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, execute } from '@/lib/db'

type LessonPayload = {
  id?: string
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  order?: number
}

// GET - récupérer les "leçons" d'une formation (stockées dans objectifs_apprentissage en JSON)
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

    let raw: string | null = null
    let count = 0

    if (hasPrismaEnv) {
      try {
        const formation = await prisma.formation.findUnique({
          where: { id_formation: id },
          select: { objectifs_apprentissage: true, nombre_lecons: true }
        })
        raw = formation?.objectifs_apprentissage ?? null
        count = formation?.nombre_lecons ?? 0
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    if (raw === null) {
      const row = await queryOne(`SELECT objectifs_apprentissage, nombre_lecons FROM Formations WHERE id_formation = ?`, [id])
      raw = row?.objectifs_apprentissage ?? null
      count = row?.nombre_lecons != null ? Number(row.nombre_lecons) : 0
    }

    let lessons: LessonPayload[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          lessons = parsed
        }
      } catch (_) {
        lessons = []
      }
    }

    return NextResponse.json({ lessons, count })
  } catch (error) {
    console.error('Erreur API GET /admin/formations/[id]/lessons:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - remplacer la liste des leçons (JSON) et mettre à jour nombre_lecons
export async function PUT(
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

    const body = await request.json()
    const lessons: LessonPayload[] = Array.isArray(body?.lessons) ? body.lessons : []
    const normalized = lessons.map((l, idx) => ({
      id: l.id || undefined,
      title: String(l.title || '').trim(),
      description: l.description || undefined,
      videoUrl: l.videoUrl || undefined,
      duration: typeof l.duration === 'number' ? l.duration : undefined,
      order: typeof l.order === 'number' ? l.order : idx + 1,
    }))
    const json = JSON.stringify(normalized)
    const count = normalized.length

    const { id } = await params
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const updated = await prisma.formation.update({
          where: { id_formation: id },
          data: {
            objectifs_apprentissage: json,
            nombre_lecons: count,
          },
          select: { objectifs_apprentissage: true, nombre_lecons: true }
        })
        return NextResponse.json({ lessons: normalized, count: updated.nombre_lecons })
      } catch (err) {
        console.warn('Prisma indisponible, fallback MySQL...', err)
      }
    }

    await execute(
      `UPDATE Formations SET objectifs_apprentissage = ?, nombre_lecons = ?, date_mise_a_jour = NOW() WHERE id_formation = ?`,
      [json, count, id]
    )
    return NextResponse.json({ lessons: normalized, count })
  } catch (error) {
    console.error('Erreur API PUT /admin/formations/[id]/lessons:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}