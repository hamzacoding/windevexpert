import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProductStats, getProductCategories } from '@/lib/services/products-service'

// GET - Récupérer les statistiques des produits
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les statistiques et les catégories
    const [stats, categories] = await Promise.all([
      getProductStats(),
      getProductCategories()
    ])

    return NextResponse.json({
      ...stats,
      categories
    })
  } catch (error) {
    console.error('Erreur API GET /admin/products/stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}