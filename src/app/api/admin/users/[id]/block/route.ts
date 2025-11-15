import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()
    const { id } = await params
    const userId = id

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher le blocage d'un administrateur
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Impossible de bloquer un administrateur' },
        { status: 400 }
      )
    }

    // Bloquer l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
        blockedReason: reason || 'Aucune raison spécifiée'
      }
    })

    return NextResponse.json({
      message: 'Utilisateur bloqué avec succès',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isBlocked: updatedUser.isBlocked,
        blockedAt: updatedUser.blockedAt,
        blockedReason: updatedUser.blockedReason
      }
    })

  } catch (error) {
    console.error('Erreur lors du blocage de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}