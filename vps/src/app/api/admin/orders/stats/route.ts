import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrderStats, getOrderStatuses, getPaymentStatuses } from '@/lib/services/orders-service'

// GET /api/admin/orders/stats - Récupérer les statistiques des commandes
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérification du rôle admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Droits administrateur requis.' },
        { status: 403 }
      )
    }

    // Récupération des statistiques et des options
    const [stats, orderStatuses, paymentStatuses] = await Promise.all([
      getOrderStats(),
      getOrderStatuses(),
      getPaymentStatuses()
    ])

    return NextResponse.json({
      stats,
      orderStatuses,
      paymentStatuses
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des commandes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}