import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminStats } from '@/lib/services/admin-service'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les statistiques
    const stats = await getAdminStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur API stats admin:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}