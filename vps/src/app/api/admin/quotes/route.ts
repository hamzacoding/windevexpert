import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, queryMany } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construction des filtres
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (status && status !== 'all') {
      whereClause += ' AND qr.status = ?'
      params.push(status)
    }
    
    if (search) {
      whereClause += ` AND (
        qr.first_name LIKE ? OR 
        qr.last_name LIKE ? OR 
        qr.email LIKE ? OR 
        qr.company LIKE ? OR 
        qr.project_title LIKE ? OR 
        qr.quote_number LIKE ?
      )`
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam)
    }

    // Récupération des demandes de devis avec comptage total
    const totalResult = await queryOne<any>(
      `SELECT COUNT(*) as count FROM quoterequest qr ${whereClause}`,
      params
    )
    const totalCount = totalResult.count

    const quotes = await queryMany<any>(
      `SELECT 
        qr.id,
        qr.first_name,
        qr.last_name,
        qr.email,
        qr.phone,
        qr.company,
        qr.project_title,
        qr.project_description,
        qr.budget_range,
        qr.timeline,
        qr.status,
        qr.quote_number,
        qr.estimated_price,
        qr.admin_notes,
        qr.quote_sent_at,
        qr.created_at,
        qr.updated_at
      FROM quoterequest qr
      ${whereClause}
      ORDER BY qr.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    )

    // Transformation des données pour correspondre au format attendu
    const formattedQuotes = quotes.map((quote: any) => ({
      id: quote.id,
      quoteNumber: quote.quote_number,
      firstName: quote.first_name,
      lastName: quote.last_name,
      email: quote.email,
      phone: quote.phone,
      company: quote.company,
      projectTitle: quote.project_title,
      projectDescription: quote.project_description,
      budgetRange: quote.budget_range,
      timeline: quote.timeline,
      status: quote.status,
      estimatedPrice: quote.estimated_price,
      adminNotes: quote.admin_notes,
      quoteSentAt: quote.quote_sent_at,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at
    }))

    return NextResponse.json({
      quotes: formattedQuotes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de devis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}