import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Marquer toutes les demandes de devis récentes comme vues
    await prisma.quoteRequest.updateMany({
      where: {
        createdAt: {
          gte: last24Hours
        },
        status: 'PENDING',
        adminViewed: false
      },
      data: {
        adminViewed: true,
        adminViewedAt: now
      }
    })

    // Marquer toutes les commandes récentes comme vues
    await prisma.order.updateMany({
      where: {
        createdAt: {
          gte: last24Hours
        },
        status: 'PENDING'
      },
      data: {
        adminViewed: true,
        adminViewedAt: now
      }
    }).catch(() => {
      // Si les champs n'existent pas, on ignore silencieusement
    })

    // Marquer tous les messages récents comme lus
    await prisma.contactMessage.updateMany({
      where: {
        createdAt: {
          gte: last24Hours
        },
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        readAt: now
      }
    }).catch(() => {
      // Si la table n'existe pas, on ignore silencieusement
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}