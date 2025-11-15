import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsersWithPagination } from '@/lib/services/admin-service'
import { queryOne, queryMany, execute } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    // Construire les filtres
    let whereClause = ''
    let params: any[] = []
    
    if (search || role) {
      whereClause = 'WHERE '
      const conditions: string[] = []
      
      if (search) {
        conditions.push('(name LIKE ? OR email LIKE ?)')
        params.push(`%${search}%`, `%${search}%`)
      }
      
      if (role && role !== 'ALL') {
        conditions.push('role = ?')
        params.push(role)
      }
      
      whereClause += conditions.join(' AND ')
    }

    // Récupérer les utilisateurs avec pagination
    const skip = (page - 1) * limit
    
    const [users, totalCountResult] = await Promise.all([
      queryMany(
        `SELECT id, name, email, role, createdAt, updatedAt 
         FROM User 
         ${whereClause}
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, skip]
      ),
      queryOne(
        `SELECT COUNT(*) as count FROM User ${whereClause}`,
        params
      )
    ])

    const totalCount = totalCountResult?.count || 0

    return NextResponse.json({
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Erreur API users GET:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, role } = body

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await queryOne(
      'SELECT id FROM User WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const userResult = await execute(
      'INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, email, hashedPassword, role || 'CLIENT']
    )

    const user = await queryOne(
      'SELECT id, name, email, role, createdAt, updatedAt FROM User WHERE id = ?',
      [userResult.insertId]
    )

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erreur API users POST:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}