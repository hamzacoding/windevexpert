import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, queryMany, execute } from '@/lib/db'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

export async function GET(request: NextRequest) {
  try {
    // Authentification (contournée en développement)
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

    // Tenter Prisma si disponible, sinon fallback MySQL (tables PascalCase)
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            _count: { select: { products: true } }
          }
        })

        return NextResponse.json({
          categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            parentId: c.parentId,
            productCount: c._count.products
          }))
        })
      } catch (err) {
        console.warn('Prisma indisponible pour /admin/categories, fallback MySQL...', err)
        // continuer vers fallback
      }
    }

    // Fallback MySQL (tables PascalCase)
    const categories = await queryMany<any>(
      `SELECT c.id, c.name, c.slug, c.description, c.parentId,
              COUNT(p.id) AS productCount
       FROM Category c
       LEFT JOIN Product p ON p.categoryId = c.id
       GROUP BY c.id, c.name, c.slug, c.description, c.parentId
       ORDER BY c.name ASC`
    )

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    // Authentification (contournée en développement)
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
    const { name, slug: rawSlug, description, parentId } = body || {}

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nom de catégorie requis (2 caractères min.)' },
        { status: 400 }
      )
    }

    const slug = rawSlug && typeof rawSlug === 'string' ? slugify(rawSlug) : slugify(name)

    // Tenter Prisma si disponible
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const existing = await prisma.category.findUnique({ where: { slug } })
        if (existing) {
          return NextResponse.json(
            { error: 'Une catégorie avec ce slug existe déjà' },
            { status: 409 }
          )
        }

        const category = await prisma.category.create({
          data: {
            name,
            slug,
            description: description || null,
            parentId: parentId || null
          },
          select: { id: true, name: true, slug: true, description: true, parentId: true }
        })

        return NextResponse.json({ category }, { status: 201 })
      } catch (err) {
        console.warn('Prisma indisponible pour création de catégorie, fallback MySQL...', err)
        // continuer vers fallback
      }
    }

    // Fallback MySQL (tables PascalCase)
    // Vérifier l'unicité du slug
    const exists = await queryOne(
      'SELECT id FROM Category WHERE slug = ? LIMIT 1',
      [slug]
    )
    if (exists?.id) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce slug existe déjà' },
        { status: 409 }
      )
    }

    const id = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    await execute(
      `INSERT INTO Category (id, name, slug, description, parentId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, name, slug, description || null, parentId || null]
    )

    const category = await queryOne(
      'SELECT id, name, slug, description, parentId FROM Category WHERE id = ?',
      [id]
    )

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}