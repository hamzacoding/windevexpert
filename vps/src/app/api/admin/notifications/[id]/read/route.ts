import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const notificationId = id

    // Extraire le type et l'ID réel de la notification
    const [type, realId] = notificationId.split('-')

    // Marquer comme lu selon le type
    switch (type) {
      case 'quote':
        await prisma.quoteRequest.update({
          where: { id: realId },
          data: { 
            adminViewed: true,
            adminViewedAt: new Date()
          }
        })
        break
      
      case 'order':
        await prisma.order.update({
          where: { id: realId },
          data: { 
            adminViewed: true,
            adminViewedAt: new Date()
          }
        }).catch(() => {
          // Si les champs n'existent pas, on ignore silencieusement
        })
        break
      
      case 'message':
        await prisma.contactMessage.update({
          where: { id: realId },
          data: { 
            status: 'READ',
            readAt: new Date()
          }
        }).catch(() => {
          // Si la table n'existe pas, on ignore silencieusement
        })
        break
      
      default:
        return NextResponse.json({ error: 'Type de notification invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}