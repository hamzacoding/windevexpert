import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, queryMany } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const user = await queryOne<any>(
      'SELECT role FROM `User` WHERE email = ?',
      [session.user.email]
    )

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Récupérer les nouvelles demandes de devis (dernières 24h)
    let newQuotes: any[] = []
    // Priorité au schéma PascalCase (correspond au script create-tables-mysql.sql)
    try {
      newQuotes = await queryMany<any>(
        `SELECT id, projectTitle, firstName, lastName, email, createdAt, projectType
         FROM QuoteRequest 
         WHERE createdAt >= ? AND status = 'PENDING'
         ORDER BY createdAt DESC
         LIMIT 10`,
        [last24Hours]
      )
    } catch (_) {
      // Fallback silencieux vers snake_case si environnement legacy
      try {
        newQuotes = await queryMany<any>(
          `SELECT id, project_title AS projectTitle, first_name AS firstName, last_name AS lastName, email, created_at AS createdAt, project_type AS projectType
           FROM quoterequest 
           WHERE created_at >= ? AND status = 'PENDING'
           ORDER BY created_at DESC
           LIMIT 10`,
          [last24Hours]
        )
      } catch (err2) {
        console.warn('Quotes non disponibles pour notifications:', err2)
        newQuotes = []
      }
    }

    // Récupérer les nouvelles commandes (dernières 24h)
    let newOrders: any[] = []
    try {
      newOrders = await queryMany<any>(
        `SELECT o.id, o.total, o.createdAt AS createdAt, u.name, u.email
           FROM \`Order\` o
           JOIN \`User\` u ON o.userId = u.id
           WHERE o.createdAt >= ? AND o.status = 'PENDING'
           ORDER BY o.createdAt DESC
         LIMIT 10`,
        [last24Hours]
      )
    } catch (err1) {
      try {
        // Fallback snake_case si nécessaire
        newOrders = await queryMany<any>(
          `SELECT o.id, o.total, o.created_at AS created_at, u.name, u.email
             FROM \`order\` o
             JOIN user u ON o.user_id = u.id
             WHERE o.created_at >= ? AND o.status = 'PENDING'
             ORDER BY o.created_at DESC
           LIMIT 10`,
          [last24Hours]
        )
      } catch (err2) {
        console.warn('Orders non disponibles pour notifications:', err2)
        newOrders = []
      }
    }

    // Récupérer les messages de contact récents (dernières 24h)
    // Note: La table ContactMessage n'existe pas encore dans le schéma
    const newMessages: any[] = []

    // Construire les notifications
    const notifications = [
      ...newQuotes.map(quote => ({
        id: `quote-${quote.id}`,
        type: 'quote' as const,
        title: 'Nouvelle demande de devis',
        message: `${(quote.first_name || quote.firstName) ?? ''} ${(quote.last_name || quote.lastName) ?? ''} a demandé un devis pour "${(quote.project_title || quote.projectTitle) ?? ''}"`,
        link: `/nimda/quotes/${quote.id}`,
        createdAt: (() => {
          const d = quote.created_at || quote.createdAt
          return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
        })(),
        read: false
      })),
      ...newOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'Nouvelle commande',
        message: `${order.name} a passé une commande de ${order.total}€`,
        link: `/nimda/orders/${order.id}`,
        createdAt: (() => {
          const d = order.created_at || order.createdAt
          return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
        })(),
        read: false
      })),
      ...newMessages.map(message => ({
        id: `message-${message.id}`,
        type: 'message' as const,
        title: 'Nouveau message de contact',
        message: `${message.name}: ${message.subject}`,
        link: `/nimda/messages/${message.id}`,
        createdAt: message.createdAt.toISOString(),
        read: false
      }))
    ]

    // Trier par date de création (plus récent en premier)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Statistiques
    const stats = {
      newQuotes: newQuotes.length,
      newOrders: newOrders.length,
      newMessages: newMessages.length,
      total: newQuotes.length + newOrders.length + newMessages.length
    }

    return NextResponse.json({
      notifications,
      stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}