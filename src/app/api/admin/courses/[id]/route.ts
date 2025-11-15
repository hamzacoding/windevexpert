import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, queryMany, execute } from '@/lib/db'

// GET - Récupérer une formation spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth: bypass en développement
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
      { error: 'Route obsolète. Utilisez /api/admin/formations/[id].' },
      { status: 410 }
    )

    const { id } = await params

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const course = await prisma.course.findUnique({
          where: { id },
          include: {
            category: true,
            lessons: { orderBy: { order: 'asc' } },
            enrollments: { include: { user: { select: { name: true, email: true } } } }
          }
        })

        if (!course) {
          return NextResponse.json(
            { error: 'Formation non trouvée' },
            { status: 404 }
          )
        }
        return NextResponse.json(course)
      } catch (err) {
        console.warn('Prisma GET échoué, fallback MySQL...', err)
        // Continuer fallback MySQL
      }
    }

    const courseRow = await queryOne<any>(
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
        cat.name AS category_name
      FROM Course c
      LEFT JOIN Category cat ON cat.id = c.categoryId
      WHERE c.id = ?`,
      [id]
    )

    if (!courseRow) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    const lessons = await queryMany<any>(
      `SELECT id, title, description, videoUrl, duration, \`order\`
       FROM Lesson WHERE courseId = ? ORDER BY \`order\` ASC`,
      [id]
    )

    const formatted = {
      id: String(courseRow.id),
      title: courseRow.title,
      slug: courseRow.slug,
      description: courseRow.description,
      shortDescription: courseRow.shortDescription,
      logo: courseRow.logo,
      duration: Number(courseRow.duration),
      level: courseRow.level,
      language: courseRow.language,
      isActive: !!courseRow.isActive,
      price: Number(courseRow.price),
      priceDA: courseRow.priceDA !== null ? Number(courseRow.priceDA) : null,
      priceUSD: null,
      priceEUR: courseRow.price !== null ? Number(courseRow.price) : null,
      priceDZD: courseRow.priceDA !== null ? Number(courseRow.priceDA) : null,
      priceAFR: null,
      isFree: !!courseRow.isFree,
      categoryId: String(courseRow.categoryId),
      category: courseRow.categoryId ? { id: String(courseRow.categoryId), name: courseRow.category_name } : null,
      features: courseRow.features ? JSON.parse(courseRow.features) : null,
      targetAudience: courseRow.targetAudience,
      objectives: courseRow.objectives ? JSON.parse(courseRow.objectives) : null,
      prerequisites: courseRow.prerequisites,
      createdAt: courseRow.createdAt,
      updatedAt: courseRow.updatedAt,
      lessons: lessons.map((l: any) => ({
        id: String(l.id),
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl,
        duration: Number(l.duration),
        order: Number(l.order)
      }))
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erreur API GET /admin/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une formation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth: bypass en développement
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
      { error: 'Route obsolète. Utilisez /api/admin/formations/[id].' },
      { status: 410 }
    )

    const body = await request.json()
    const { 
      title,
      slug,
      description,
      shortDescription,
      logo,
      duration,
      level,
      language,
      isActive,
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
      prerequisites,
      // Backward-compat: allow productData payload to be merged
      productData,
      lessons = []
    } = body

    const { id } = await params

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const existingCourse = await prisma.course.findUnique({
          where: { id },
          include: { lessons: true }
        })
        if (!existingCourse) {
          return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
        }

        let finalDuration = duration
        if (lessons.length > 0) {
          finalDuration = lessons.reduce((total: number, l: any) => total + (l.duration || 0), 0)
        }
        if (!finalDuration || finalDuration <= 0) {
          finalDuration = existingCourse.duration > 0 ? existingCourse.duration : 60
        }

        await prisma.$transaction(async (tx) => {
          const mergedData: any = {
            title,
            slug,
            description,
            shortDescription,
            logo: logo ?? productData?.logo ?? null,
            duration: finalDuration,
            level,
            language,
            isActive,
            price: price ?? productData?.price,
            priceDA: (priceDA ?? productData?.priceDA) ?? null,
            isFree,
            categoryId: categoryId ?? productData?.categoryId,
            features: Array.isArray(features) ? JSON.stringify(features) : (features ?? (Array.isArray(productData?.features) ? JSON.stringify(productData?.features) : productData?.features ?? null)),
            targetAudience: targetAudience ?? productData?.targetAudience ?? null,
            objectives: Array.isArray(objectives) ? JSON.stringify(objectives) : (objectives ?? null),
            prerequisites
          }
          await tx.course.update({
            where: { id },
            data: mergedData
          })

          if (lessons.length > 0) {
            await tx.lesson.deleteMany({ where: { courseId: id } })
            await tx.lesson.createMany({
              data: lessons.map((l: any, idx: number) => ({
                title: l.title,
                description: l.description || '',
                videoUrl: l.videoUrl || '',
                duration: l.duration || 0,
                order: l.order || idx + 1,
                courseId: id
              }))
            })
          }
        })

        const complete = await prisma.course.findUnique({
          where: { id },
          include: {
            category: true,
            lessons: { orderBy: { order: 'asc' } },
            enrollments: { include: { user: { select: { name: true, email: true } } } }
          }
        })
        if (!complete) {
          return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
        }
        const formatted = {
          id: String(complete.id),
          title: complete.title,
          slug: complete.slug,
          description: complete.description,
          shortDescription: (complete as any).shortDescription ?? null,
          logo: (complete as any).logo ?? null,
          duration: Number(complete.duration || 0),
          level: (complete as any).level ?? null,
          language: (complete as any).language ?? null,
          isActive: !!(complete as any).isActive,
          price: Number((complete as any).price || 0),
          priceDA: (complete as any).priceDA !== null && (complete as any).priceDA !== undefined ? Number((complete as any).priceDA) : null,
          priceUSD: null,
          priceEUR: (complete as any).price !== null && (complete as any).price !== undefined ? Number((complete as any).price) : null,
          priceDZD: (complete as any).priceDA !== null && (complete as any).priceDA !== undefined ? Number((complete as any).priceDA) : null,
          priceAFR: null,
          isFree: !!(complete as any).isFree,
          categoryId: complete.categoryId ? String(complete.categoryId) : null,
          category: complete.category ? { id: String(complete.category.id), name: complete.category.name } : null,
          features: (complete as any).features ? JSON.parse((complete as any).features as any) : null,
          targetAudience: (complete as any).targetAudience ?? null,
          objectives: (complete as any).objectives ? JSON.parse((complete as any).objectives as any) : null,
          prerequisites: (complete as any).prerequisites ?? null,
          createdAt: (complete as any).createdAt,
          updatedAt: (complete as any).updatedAt,
          lessons: (complete.lessons || []).map((l: any, idx: number) => ({
            id: String(l.id),
            title: l.title,
            description: l.description || '',
            videoUrl: l.videoUrl || '',
            duration: Number(l.duration || 0),
            order: Number(l.order || idx + 1)
          }))
        }
        return NextResponse.json(formatted)
      } catch (err) {
        console.warn('Prisma PUT échoué, fallback MySQL...', err)
        // Continuer fallback MySQL
      }
    }

    // Fallback MySQL
    // Vérifier existence
    const existing = await queryOne<any>(`SELECT id, duration FROM Course WHERE id = ?`, [id])
    if (!existing) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    let finalDuration = duration
    if (lessons.length > 0) {
      finalDuration = lessons.reduce((t: number, l: any) => t + (l.duration || 0), 0)
    }
    if (!finalDuration || finalDuration <= 0) {
      finalDuration = existing.duration > 0 ? Number(existing.duration) : 60
    }

    await execute('START TRANSACTION')
    try {
      // Merge old productData into new Course fields for backward compatibility
      const mergedLogo = logo ?? productData?.logo ?? null
      const mergedPriceEUR = (priceEUR ?? price ?? productData?.price) ?? null
      const mergedPriceDZD = (priceDZD ?? priceDA ?? productData?.priceDA) ?? null
      const mergedPriceUSD = null
      const mergedPriceAFR = null
      const mergedCategoryId = categoryId ?? productData?.categoryId ?? null
      const mergedFeatures = Array.isArray(features)
        ? JSON.stringify(features)
        : (features ?? (Array.isArray(productData?.features) ? JSON.stringify(productData.features) : productData?.features ?? null))
      const mergedObjectives = Array.isArray(objectives) ? JSON.stringify(objectives) : (objectives ?? null)

      await execute(
        `UPDATE Course SET title = ?, slug = ?, description = ?, shortDescription = ?, logo = ?, duration = ?, level = ?, language = ?, isActive = ?, price = ?, priceDA = ?, isFree = ?, categoryId = ?, features = ?, targetAudience = ?, objectives = ?, prerequisites = ?, updatedAt = NOW() WHERE id = ?`,
        [
          title,
          slug,
          description,
          shortDescription ?? null,
          mergedLogo,
          finalDuration,
          level,
          language ?? null,
          isActive,
          mergedPriceEUR,
          mergedPriceDZD,
          isFree ?? false,
          mergedCategoryId,
          mergedFeatures,
          targetAudience ?? null,
          mergedObjectives,
          prerequisites ?? null,
          id
        ]
      )

      await execute(`DELETE FROM Lesson WHERE courseId = ?`, [id])
      if (lessons.length > 0) {
        const genId = () => (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`
        for (let i = 0; i < lessons.length; i++) {
          const l = lessons[i]
          const lessonId = genId()
          await execute(
            `INSERT INTO Lesson (id, title, description, videoUrl, duration, \`order\`, courseId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [lessonId, l.title, l.description || '', l.videoUrl || '', l.duration || 0, l.order || i + 1, id]
          )
        }
      }

      await execute('COMMIT')

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
          cat.name AS category_name
        FROM Course c
        LEFT JOIN Category cat ON cat.id = c.categoryId
        WHERE c.id = ?`,
        [id]
      )
      const lessonRows = await queryMany<any>(
        `SELECT id, title, description, videoUrl, duration, \`order\` FROM Lesson WHERE courseId = ? ORDER BY \`order\` ASC`,
        [id]
      )
      const formatted = {
        id: String(completeRow.id),
        title: completeRow.title,
        slug: completeRow.slug,
        description: completeRow.description,
        shortDescription: completeRow.shortDescription,
        logo: completeRow.logo,
        duration: Number(completeRow.duration),
        level: completeRow.level,
        language: completeRow.language,
        isActive: !!completeRow.isActive,
        price: Number(completeRow.price),
        priceDA: completeRow.priceDA !== null ? Number(completeRow.priceDA) : null,
        priceUSD: null,
        priceEUR: completeRow.price !== null ? Number(completeRow.price) : null,
        priceDZD: completeRow.priceDA !== null ? Number(completeRow.priceDA) : null,
        priceAFR: null,
        isFree: !!completeRow.isFree,
        categoryId: String(completeRow.categoryId),
        category: completeRow.categoryId ? { id: String(completeRow.categoryId), name: completeRow.category_name } : null,
        features: completeRow.features ? JSON.parse(completeRow.features) : null,
        targetAudience: completeRow.targetAudience,
        objectives: completeRow.objectives ? JSON.parse(completeRow.objectives) : null,
        prerequisites: completeRow.prerequisites,
        createdAt: completeRow.createdAt,
        updatedAt: completeRow.updatedAt,
        lessons: lessonRows.map((l: any) => ({ id: String(l.id), title: l.title, description: l.description, videoUrl: l.videoUrl, duration: Number(l.duration), order: Number(l.order) }))
      }
      return NextResponse.json(formatted)
    } catch (txErr) {
      await execute('ROLLBACK')
      throw txErr
    }
  } catch (error) {
    console.error('Erreur API PUT /admin/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la formation' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une formation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth: bypass en développement
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
      { error: 'Route obsolète. Utilisez /api/admin/formations/[id].' },
      { status: 410 }
    )

    const { id } = await params

    const hasPrismaEnv = !!process.env.DATABASE_URL
    if (hasPrismaEnv) {
      try {
        const existingCourse = await prisma.course.findUnique({
          where: { id },
          include: { enrollments: true }
        })
        if (!existingCourse) {
          return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
        }
        if (existingCourse.enrollments.length > 0) {
          return NextResponse.json({ error: 'Impossible de supprimer une formation avec des inscriptions actives' }, { status: 400 })
        }
        await prisma.$transaction(async (tx) => {
          await tx.lesson.deleteMany({ where: { courseId: id } })
          await tx.course.delete({ where: { id } })
        })
        return NextResponse.json({ message: 'Formation supprimée avec succès' })
      } catch (err) {
        console.warn('Prisma DELETE échoué, fallback MySQL...', err)
        // Continuer fallback MySQL
      }
    }

    // Fallback MySQL
    const enrollCountRow = await queryOne<any>(`SELECT COUNT(*) AS cnt FROM Enrollment WHERE courseId = ?`, [id])
    const enrollCount = Number(enrollCountRow?.cnt || 0)
    if (enrollCount > 0) {
      return NextResponse.json({ error: 'Impossible de supprimer une formation avec des inscriptions actives' }, { status: 400 })
    }
    await execute('START TRANSACTION')
    try {
      await execute(`DELETE FROM Lesson WHERE courseId = ?`, [id])
      await execute(`DELETE FROM Course WHERE id = ?`, [id])
      await execute('COMMIT')
      return NextResponse.json({ message: 'Formation supprimée avec succès' })
    } catch (txErr) {
      await execute('ROLLBACK')
      throw txErr
    }
  } catch (error) {
    console.error('Erreur API DELETE /admin/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    )
  }
}