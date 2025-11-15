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

    // Statistiques générales
    const totalQuotes = await prisma.quoteRequest.count()
    
    // Nouvelles demandes (dernières 24h)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const newQuotes = await prisma.quoteRequest.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    })

    // Demandes en attente
    const pendingQuotes = await prisma.quoteRequest.count({
      where: {
        status: 'PENDING'
      }
    })

    // Statistiques par statut
    const statusStats = await prisma.quoteRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    // Statistiques par mois (6 derniers mois)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await prisma.quoteRequest.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    })

    // Grouper par mois
    const monthlyData = monthlyStats.reduce((acc, quote) => {
      const month = quote.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, pending: 0, quoted: 0, accepted: 0 }
      }
      acc[month].total++
      if (quote.status === 'PENDING') acc[month].pending++
      if (quote.status === 'QUOTED') acc[month].quoted++
      if (quote.status === 'ACCEPTED') acc[month].accepted++
      return acc
    }, {} as Record<string, any>)

    // Statistiques par type de projet
    const projectTypeStats = await prisma.quoteRequest.groupBy({
      by: ['projectType'],
      _count: {
        projectType: true
      },
      orderBy: {
        _count: {
          projectType: 'desc'
        }
      }
    })

    // Budget moyen des projets acceptés
    const acceptedQuotes = await prisma.quoteRequest.findMany({
      where: {
        status: 'ACCEPTED',
        estimatedPrice: {
          not: null
        }
      },
      select: {
        estimatedPrice: true
      }
    })

    const averageBudget = acceptedQuotes.length > 0 
      ? acceptedQuotes.reduce((sum, quote) => sum + (quote.estimatedPrice || 0), 0) / acceptedQuotes.length
      : 0

    // Taux de conversion
    const quotedCount = statusCounts['QUOTED'] || 0
    const acceptedCount = statusCounts['ACCEPTED'] || 0
    const conversionRate = quotedCount > 0 ? (acceptedCount / quotedCount) * 100 : 0

    // Demandes récentes pour notifications
    const recentQuotes = await prisma.quoteRequest.findMany({
      where: {
        createdAt: {
          gte: yesterday
        }
      },
      select: {
        id: true,
        quoteNumber: true,
        firstName: true,
        lastName: true,
        projectTitle: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      overview: {
        totalQuotes,
        newQuotes,
        pendingQuotes,
        averageBudget: Math.round(averageBudget),
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      statusCounts,
      monthlyData,
      projectTypeStats: projectTypeStats.map(stat => ({
        type: stat.projectType,
        count: stat._count.projectType
      })),
      recentQuotes: recentQuotes.map(quote => ({
        ...quote,
        fullName: `${quote.firstName} ${quote.lastName}`
      })),
      notifications: {
        newQuotesCount: newQuotes,
        pendingQuotesCount: pendingQuotes
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}