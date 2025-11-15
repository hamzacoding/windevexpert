import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, queryMany, execute, pool } from '@/lib/db'

// GET - Récupérer toutes les formations avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification (contourné en développement)
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

    // Route obsolète: basculée vers Formations
    return NextResponse.json(
      { error: 'Route obsolète. Utilisez /api/admin/formations.' },
      { status: 410 }
    )

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }
    if (level && level !== 'all') {
      where.level = level
    }

    // Tenter Prisma si disponible, sinon fallback MySQL
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const total = await prisma.course.count({ where })

        const courses = await prisma.course.findMany({
          where,
          include: {
            category: true,
            lessons: {
              select: { id: true, title: true, order: true },
              orderBy: { order: 'asc' }
            },
            enrollments: {
              select: { id: true, user: { select: { name: true, email: true } } }
            },
            _count: {
              select: { lessons: true, enrollments: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })

        const totalPages = Math.ceil(total / limit)

        const formattedCourses = courses.map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription ?? null,
          level: course.level,
          duration: course.duration,
          language: course.language ?? null,
          isActive: course.isActive,
          price: course.price,
          priceDA: course.priceDA ?? null,
          priceUSD: null,
          priceEUR: course.price ?? null,
          priceDZD: course.priceDA ?? null,
          priceAFR: null,
          isFree: course.isFree,
          categoryId: course.categoryId,
          category: course.category ? { id: course.category.id, name: course.category.name } : null,
          logo: course.logo ?? null,
          features: course.features ?? null,
          lessons: course.lessons,
          enrollments: course.enrollments,
          createdAt: course.createdAt as any,
          updatedAt: course.updatedAt as any,
          _count: course._count
        }))

        return NextResponse.json({
          courses: formattedCourses,
          total,
          totalPages,
          currentPage: page,
          pagination: { page, limit, total, totalPages }
        })
      } catch (err) {
        console.warn('Prisma indisponible ou erreur de requête, fallback MySQL...', err)
        // continue vers fallback MySQL
      }
    }

    // Fallback MySQL – tables PascalCase pour correspondre au schéma
    const whereClauses: string[] = []
    const params: any[] = []
    if (search) {
      whereClauses.push('(c.title LIKE ? OR c.description LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (level && level !== 'all') {
      whereClauses.push('c.level = ?')
      params.push(level)
    }
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Total
    const totalRow = await queryOne(
      `SELECT COUNT(*) as total FROM Course c ${whereSql}`,
      params
    )
    const total = totalRow?.total || 0
    const totalPages = Math.ceil(total / limit)

    // Liste paginée avec joins et sous-comptes
    const offset = (page - 1) * limit
    const listParams = [...params, limit, offset]
    const rows = await queryMany(
      `SELECT 
        c.id,
        c.title,
        c.slug,
        c.description,
        c.shortDescription,
        c.logo,
        c.duration,
        c.level,
        c.language,
        c.isActive,
        c.price,
        c.priceDA,
        c.isFree,
        c.categoryId,
        c.features,
        c.createdAt,
        c.updatedAt,
        cat.id AS category_id,
        cat.name AS category_name,
        (SELECT COUNT(*) FROM Lesson l WHERE l.courseId = c.id) AS lessons_count,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.courseId = c.id) AS enrollments_count
      FROM Course c
      LEFT JOIN Category cat ON cat.id = c.categoryId
      ${whereSql}
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?`,
      listParams
    )

    const formattedCourses = rows.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      slug: r.slug,
      description: r.description,
      shortDescription: r.shortDescription ?? null,
      logo: r.logo || null,
      level: r.level,
      duration: Number(r.duration),
      language: r.language || null,
      isActive: !!r.isActive,
      price: Number(r.price),
      priceDA: r.priceDA != null ? Number(r.priceDA) : null,
      priceUSD: null,
      priceEUR: r.price != null ? Number(r.price) : null,
      priceDZD: r.priceDA != null ? Number(r.priceDA) : null,
      priceAFR: null,
      isFree: !!r.isFree,
      categoryId: String(r.categoryId),
      category: r.category_id ? { id: String(r.category_id), name: r.category_name || '' } : null,
      features: r.features || null,
      lessons: [],
      enrollments: [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: { lessons: Number(r.lessons_count || 0), enrollments: Number(r.enrollments_count || 0) }
    }))

    return NextResponse.json({
      courses: formattedCourses,
      total,
      totalPages,
      currentPage: page,
      pagination: { page, limit, total, totalPages }
    })
  } catch (error) {
    console.error('Erreur API GET /admin/courses:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle formation
export async function POST(request: NextRequest) {
  try {
    // Auth: bypass en développement pour tester facilement
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

    // Route obsolète: basculée vers Formations
    return NextResponse.json(
      { error: 'Route obsolète. Utilisez /api/admin/formations.' },
      { status: 410 }
    )

    const body = await request.json()
    const {
      title,
      description,
      duration,
      level,
      isActive = true,
      productData,
      lessons = [],
      // Nouveaux champs côté Course
      slug,
      shortDescription,
      logo,
      language,
      price,
      priceDA,
      priceUSD,
      priceEUR,
      priceDZD,
      priceAFR,
      isFree,
      categoryId,
      features,
      targetAudience,
      objectives,
      prerequisites
    } = body

    // Normalisation des valeurs reçues
    const normalizedDuration = (
      duration === undefined || duration === null || isNaN(Number(duration))
    ) ? 60 : Number(duration)

    const normalizedLevel = (level === 'BEGINNER' || level === 'INTERMEDIATE' || level === 'ADVANCED')
      ? level
      : 'BEGINNER'

    const priceNumber = productData ? Number(productData?.price) : (price !== undefined ? Number(price) : NaN)

    // Validation détaillée avec liste des champs manquants
    const missing: string[] = []
    if (!title) missing.push('title')
    if (!description) missing.push('description')
    // Validation basée sur les champs Course désormais
    const candidateCategoryId = productData?.categoryId ?? categoryId
    if (productData) {
      if (!productData.name && !title) missing.push('title')
      if (productData.price === undefined || productData.price === null || isNaN(priceNumber)) missing.push('price')
      if (!candidateCategoryId) missing.push('categoryId')
    } else {
      if (!title) missing.push('title')
      if (!description) missing.push('description')
      if (price === undefined || price === null || isNaN(Number(price))) missing.push('price')
      if (!categoryId) missing.push('categoryId')
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Données manquantes', missing }, { status: 400 })
    }

    const slugify = (input: string) => input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')

    // Génération d'un slug unique pour le cours
    const baseSlug = (slug && typeof slug === 'string' && slug.trim())
      ? slugify(slug)
      : (productData?.name ? slugify(productData.name) : slugify(title))

    const ensureUniqueSlug = async (slugBase: string) => {
      const existsPrisma = async (slug: string) => {
        try {
          const c = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
          return !!c?.id
        } catch {
          return false
        }
      }
      const existsSql = async (slug: string) => {
        const r = await queryOne<any>('SELECT id FROM Course WHERE slug = ? LIMIT 1', [slug])
        return !!r?.id
      }

      let candidate = slugBase
      let suffix = 2
      const maxTries = 30

      // Vérifie d’abord via Prisma si dispo, sinon via SQL
      // Utilise directement process.env pour éviter la TDZ sur hasPrismaEnv
      const usePrisma = !!process.env.DATABASE_URL
      const exists = usePrisma ? existsPrisma : existsSql

      while (await exists(candidate)) {
        if (suffix > maxTries) {
          candidate = `${slugBase}-${Date.now()}`
          break
        }
        candidate = `${slugBase}-${suffix}`
        suffix++
      }
      return candidate
    }

    const courseSlug = await ensureUniqueSlug(baseSlug)
    const featuresStr = productData ? (Array.isArray(productData.features)
      ? JSON.stringify(productData.features)
      : (typeof productData.features === 'string' ? productData.features : null))
      : (Array.isArray(features) ? JSON.stringify(features) : (typeof features === 'string' ? features : null))

    // Tenter Prisma d'abord si DATABASE_URL est défini
    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const course = await prisma.course.create({
          data: {
            title,
            slug: courseSlug,
            description,
            shortDescription: shortDescription ?? productData?.shortDescription ?? null,
            logo: logo ?? productData?.logo ?? null,
            duration: normalizedDuration,
            level: normalizedLevel,
            language: language ?? null,
            isActive,
            price: (priceEUR ?? priceNumber),
            priceDA: (priceDZD ?? productData?.priceDA ?? priceDA) ?? null,
            isFree: isFree ?? productData?.isFree ?? false,
            categoryId: candidateCategoryId,
            features: featuresStr || null,
            targetAudience: targetAudience ?? productData?.targetAudience ?? null,
            objectives: objectives ? (Array.isArray(objectives) ? JSON.stringify(objectives) : objectives) : null,
            prerequisites: prerequisites ?? null
          }
        })

        if (lessons.length > 0) {
          await prisma.lesson.createMany({
            data: lessons.map((lesson: any, index: number) => ({
              title: lesson.title,
              description: lesson.description || '',
              videoUrl: lesson.videoUrl || '',
              duration: lesson.duration || 0,
              order: lesson.order || index + 1,
              courseId: course.id
            }))
          })
        }

        const completeCourse = await prisma.course.findUnique({
          where: { id: course.id },
          include: {
            category: true,
            lessons: { orderBy: { order: 'asc' } },
            enrollments: { include: { user: { select: { name: true, email: true } } } }
          }
        })

        return NextResponse.json(completeCourse, { status: 201 })
      } catch (err) {
        console.warn('Prisma create échoué, fallback MySQL PascalCase...', err)
        // Continuer vers fallback MySQL
      }
    }

    // Fallback MySQL (PascalCase) avec vraie transaction via connexion
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const genId = () => (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const courseId = genId()
      const priceEURFinal = (priceEUR ?? priceNumber)
      const priceDZDFinal = (priceDZD ?? productData?.priceDA ?? priceDA) ?? null
      await conn.execute(
        `INSERT INTO Course (
          id, title, slug, description, shortDescription, logo, duration, level, language, isActive,
          price, priceDA, isFree, categoryId, features, targetAudience, objectives, prerequisites,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          courseId,
          title,
          courseSlug,
          description,
          (shortDescription ?? productData?.shortDescription ?? null),
          (logo ?? productData?.logo ?? null),
          normalizedDuration,
          normalizedLevel,
          (language ?? null),
          isActive,
          priceEURFinal,
          priceDZDFinal,
          (isFree ?? productData?.isFree ?? false),
          candidateCategoryId,
          featuresStr || null,
          (targetAudience ?? productData?.targetAudience ?? null),
          (objectives ? (Array.isArray(objectives) ? JSON.stringify(objectives) : objectives) : null),
          (prerequisites ?? null)
        ]
      )

      if (lessons.length > 0) {
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i]
          const lessonId = genId()
          await conn.execute(
            `INSERT INTO Lesson (id, title, description, videoUrl, duration, \`order\`, courseId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              lessonId,
              lesson.title,
              lesson.description || '',
              lesson.videoUrl || '',
              lesson.duration || 0,
              lesson.order || i + 1,
              courseId
            ]
          )
        }
      }

      await conn.commit()
      conn.release()

      const completeRow = await queryOne<any>(
        `SELECT 
          c.id,
          c.title,
          c.slug,
          c.description,
          c.shortDescription,
          c.logo,
          c.duration,
          c.level,
          c.language,
          c.isActive,
          c.price,
          c.priceDA,
          c.isFree,
          c.categoryId,
          c.features,
          c.targetAudience,
          c.objectives,
          c.prerequisites,
          c.createdAt,
          c.updatedAt,
          cat.id as category_id,
          cat.name as category_name
        FROM Course c
        LEFT JOIN Category cat ON c.categoryId = cat.id
        WHERE c.id = ?`,
        [courseId]
      )

      const lessonRows = await queryMany<any>(
        `SELECT id, title, description, videoUrl, duration, \`order\`
         FROM Lesson 
         WHERE courseId = ?
         ORDER BY \`order\` ASC`,
        [courseId]
      )

      const formattedCourse = {
        id: String(completeRow.id),
        title: completeRow.title,
        slug: completeRow.slug,
        description: completeRow.description,
        shortDescription: completeRow.shortDescription ?? null,
        logo: completeRow.logo || null,
        duration: Number(completeRow.duration),
        level: completeRow.level,
        language: completeRow.language || null,
        isActive: !!completeRow.isActive,
        price: Number(completeRow.price),
        priceDA: completeRow.priceDA !== null ? Number(completeRow.priceDA) : null,
        priceUSD: null,
        priceEUR: completeRow.price !== null ? Number(completeRow.price) : null,
        priceDZD: completeRow.priceDA !== null ? Number(completeRow.priceDA) : null,
        priceAFR: null,
        isFree: !!completeRow.isFree,
        categoryId: String(completeRow.categoryId),
        category: completeRow.category_id ? { id: String(completeRow.category_id), name: completeRow.category_name } : null,
        features: completeRow.features || null,
        targetAudience: completeRow.targetAudience || null,
        objectives: completeRow.objectives || null,
        prerequisites: completeRow.prerequisites || null,
        createdAt: completeRow.createdAt,
        updatedAt: completeRow.updatedAt,
        lessons: lessonRows.map((l: any) => ({
          id: String(l.id),
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          duration: Number(l.duration),
          order: Number(l.order)
        }))
      }

      return NextResponse.json(formattedCourse, { status: 201 })
    } catch (transactionError) {
      await conn.rollback()
      conn.release()
      throw transactionError
    }
  } catch (error) {
    console.error('Erreur API POST /admin/courses:', error)
    const isDevEnv = process.env.NODE_ENV !== 'production'
    const payload: any = { error: 'Erreur lors de la création de la formation' }
    if (isDevEnv) {
      payload.details = (error as any)?.message || String(error)
    }
    return NextResponse.json(payload, { status: 500 })
  }
}