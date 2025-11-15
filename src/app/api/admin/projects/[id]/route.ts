import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un projet spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Récupération du projet avec toutes ses relations
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        milestones: {
          orderBy: { dueDate: 'asc' }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Limiter les messages récents
        },
        files: {
          orderBy: { uploadedAt: 'desc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate?.toISOString(),
      endDate: project.endDate?.toISOString(),
      budget: project.budget,
      client: project.client,
      milestones: project.milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate?.toISOString(),
        completed: milestone.completed,
        createdAt: milestone.createdAt.toISOString(),
        updatedAt: milestone.updatedAt.toISOString()
      })),
      messages: project.messages.map(message => ({
        id: message.id,
        content: message.content,
        sender: message.sender,
        createdAt: message.createdAt.toISOString()
      })),
      files: project.files.map(file => ({
        id: file.id,
        filename: file.filename,
        url: file.url,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt.toISOString()
      })),
      reviews: project.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: review.user,
        createdAt: review.createdAt.toISOString()
      })),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un projet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      status,
      progress,
      startDate,
      endDate,
      budget,
      milestones = []
    } = body

    // Vérification que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { milestones: true }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Mise à jour avec transaction pour gérer les milestones
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Mettre à jour le projet
      const project = await tx.project.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(status && { status }),
          ...(progress !== undefined && { progress: parseInt(progress) }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
          updatedAt: new Date()
        }
      })

      // Gérer les milestones si fournis
      if (milestones.length > 0) {
        // Supprimer les anciens milestones
        await tx.milestone.deleteMany({
          where: { projectId: id }
        })

        // Créer les nouveaux milestones
        await tx.milestone.createMany({
          data: milestones.map((milestone: any) => ({
            title: milestone.title,
            description: milestone.description || null,
            dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
            completed: milestone.completed || false,
            projectId: id
          }))
        })
      }

      // Récupérer le projet mis à jour avec ses relations
      return await tx.project.findUnique({
        where: { id },
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
      id: updatedProject!.id,
      title: updatedProject!.title,
      description: updatedProject!.description,
      status: updatedProject!.status,
      progress: updatedProject!.progress,
      startDate: updatedProject!.startDate?.toISOString(),
      endDate: updatedProject!.endDate?.toISOString(),
      budget: updatedProject!.budget,
      client: updatedProject!.client,
      milestones: updatedProject!.milestones,
      createdAt: updatedProject!.createdAt.toISOString(),
      updatedAt: updatedProject!.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérification que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: true,
        messages: true,
        files: true,
        reviews: true
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Vérification des contraintes métier
    if (existingProject.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un projet en cours. Veuillez d\'abord changer son statut.' },
        { status: 400 }
      )
    }

    // Suppression avec transaction pour maintenir l'intégrité
    await prisma.$transaction(async (tx) => {
      // Supprimer les reviews
      await tx.review.deleteMany({
        where: { projectId: id }
      })

      // Supprimer les fichiers
      await tx.projectFile.deleteMany({
        where: { projectId: id }
      })

      // Supprimer les messages
      await tx.message.deleteMany({
        where: { projectId: id }
      })

      // Supprimer les milestones
      await tx.milestone.deleteMany({
        where: { projectId: id }
      })

      // Supprimer le projet
      await tx.project.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: 'Projet supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}