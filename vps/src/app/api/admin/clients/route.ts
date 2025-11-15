import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryMany } from '@/lib/db'

// GET - Récupérer la liste des clients
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
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Construction des filtres
    let whereClause = 'WHERE u.role = ?'
    const params: any[] = ['CLIENT']

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // Récupération des clients
    const clients = await queryMany<any>(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        u.created_at,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT o.id) as order_count
      FROM user u
      LEFT JOIN project p ON u.id = p.client_id
       LEFT JOIN \`order\` o ON u.id = o.user_id
      ${whereClause}
      GROUP BY u.id, u.name, u.email, u.image, u.created_at
      ORDER BY u.name ASC
      LIMIT ?`,
      [...params, limit]
    )

    return NextResponse.json({
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        image: client.image,
        createdAt: client.created_at,
        _count: {
          projects: client.project_count || 0,
          orders: client.order_count || 0
        }
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}