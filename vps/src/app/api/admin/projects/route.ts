import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer la liste des projets avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('clientId') || ''

    // Calcul de l'offset pour la pagination
    const skip = (page - 1) * limit

    // Construction des filtres
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    // Récupération des projets avec comptage total
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          milestones: {
            select: {
              id: true,
              title: true,
              completed: true,
              dueDate: true
            },
            orderBy: { dueDate: 'asc' }
          },
          _count: {
            select: {
              messages: true,
              files: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      projects: projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress,
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
        budget: project.budget,
        client: project.client,
        milestones: project.milestones,
        messagesCount: project._count.messages,
        filesCount: project._count.files,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      })),
      totalCount,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau projet
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      clientId,
      startDate,
      endDate,
      budget,
      milestones = []
    } = body

    // Validation des données requises
    if (!title || !description || !clientId) {
      return NextResponse.json(
        { error: 'Titre, description et client sont requis' },
        { status: 400 }
      )
    }

    // Vérification que le client existe
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Création du projet avec transaction pour inclure les milestones
    const project = await prisma.$transaction(async (tx) => {
      // Créer le projet
      const newProject = await tx.project.create({
        data: {
          title,
          description,
          clientId,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          budget: budget ? parseFloat(budget) : null,
          status: 'PLANNING',
          progress: 0
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Créer les milestones si fournis
      if (milestones.length > 0) {
        await tx.milestone.createMany({
          data: milestones.map((milestone: any) => ({
            title: milestone.title,
            description: milestone.description || null,
            dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
            projectId: newProject.id,
            completed: false
          }))
        })
      }

      // Récupérer le projet avec les milestones créés
      return await tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          milestones: {
            orderBy: { dueDate: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      id: project!.id,
      title: project!.title,
      description: project!.description,
      status: project!.status,
      progress: project!.progress,
      startDate: project!.startDate?.toISOString(),
      endDate: project!.endDate?.toISOString(),
      budget: project!.budget,
      client: project!.client,
      milestones: project!.milestones,
      createdAt: project!.createdAt.toISOString(),
      updatedAt: project!.updatedAt.toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}