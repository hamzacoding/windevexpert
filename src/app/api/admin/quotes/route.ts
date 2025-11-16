import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { projectTitle: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [quotes, totalCount] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          quoteNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          projectTitle: true,
          projectDescription: true,
          projectType: true,
          budget: true,
          timeline: true,
          status: true,
          estimatedPrice: true,
          adminNotes: true,
          quoteSentAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.quoteRequest.count({ where })
    ])

    const formattedQuotes = quotes.map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      firstName: q.firstName,
      lastName: q.lastName,
      fullName: `${q.firstName} ${q.lastName}`.trim(),
      email: q.email,
      phone: q.phone,
      company: q.company || undefined,
      projectTitle: q.projectTitle,
      projectDescription: q.projectDescription,
      projectType: q.projectType || 'other',
      budget: q.budget,
      timeline: q.timeline,
      status: q.status,
      estimatedPrice: q.estimatedPrice || undefined,
      quoteSentAt: q.quoteSentAt || undefined,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }))

    const statusCounts = formattedQuotes.reduce((acc: Record<string, number>, q: any) => {
      acc[q.status] = (acc[q.status] || 0) + 1
      return acc
    }, {})

    const totalPagesCalc = Math.ceil(totalCount / limit)
    return NextResponse.json({
      quotes: formattedQuotes,
      pagination: {
        currentPage: page,
        totalPages: totalPagesCalc,
        totalCount,
        hasNext: page < totalPagesCalc,
        hasPrev: page > 1
      },
      stats: statusCounts
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de devis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
