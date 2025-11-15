import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un contenu spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const content = await prisma.pageContent.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un contenu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, sectionKey, pageSlug, isActive } = body

    // Vérifier que le contenu existe
    const existingContent = await prisma.pageContent.findUnique({
      where: { id }
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier l'unicité de la combinaison pageSlug + sectionKey si modifiée
    if ((pageSlug && pageSlug !== existingContent.pageSlug) || 
        (sectionKey && sectionKey !== existingContent.sectionKey)) {
      const duplicateContent = await prisma.pageContent.findFirst({
        where: {
          pageSlug: pageSlug || existingContent.pageSlug,
          sectionKey: sectionKey || existingContent.sectionKey,
          id: { not: id }
        }
      })

      if (duplicateContent) {
        return NextResponse.json(
          { error: 'Cette combinaison page/section existe déjà' },
          { status: 400 }
        )
      }
    }

    const updatedContent = await prisma.pageContent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(sectionKey && { sectionKey }),
        ...(pageSlug && { pageSlug }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un contenu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const content = await prisma.pageContent.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      )
    }

    await prisma.pageContent.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Contenu supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}