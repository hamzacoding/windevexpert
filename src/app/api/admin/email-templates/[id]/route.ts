import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un template spécifique
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
    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un template
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
    const { name, slug, subject, htmlContent, textContent, type, isActive } = body

    // Vérifier que le template existe
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier l'unicité du slug si modifié
    if (slug && slug !== existingTemplate.slug) {
      const slugExists = await prisma.emailTemplate.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ce slug existe déjà' },
          { status: 400 }
        )
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(subject && { subject }),
        ...(htmlContent && { htmlContent }),
        ...(textContent !== undefined && { textContent }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un template
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
    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    await prisma.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Template supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}