import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tout le contenu des pages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const pageSlug = searchParams.get('pageSlug')
    const skip = (page - 1) * limit

    const where = pageSlug ? { pageSlug } : {}

    const [contents, total] = await Promise.all([
      prisma.pageContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.pageContent.count({ where })
    ])

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau contenu de page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { pageSlug, sectionKey, title, content, isActive } = body

    // Validation
    if (!pageSlug || !sectionKey || !title || !content) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier l'unicité de la combinaison pageSlug + sectionKey
    const existingContent = await prisma.pageContent.findUnique({
      where: {
        pageSlug_sectionKey: {
          pageSlug,
          sectionKey
        }
      }
    })

    if (existingContent) {
      return NextResponse.json(
        { error: 'Cette section existe déjà pour cette page' },
        { status: 400 }
      )
    }

    const pageContent = await prisma.pageContent.create({
      data: {
        pageSlug,
        sectionKey,
        title,
        content,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(pageContent, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}