import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrders, createOrder } from '@/lib/services/orders-service'
import { EmailWorkflowService } from '@/lib/services/email-workflow-service'
import { queryOne } from '@/lib/db'

// GET /api/admin/orders - Récupérer les commandes avec pagination et filtres
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

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const paymentStatus = searchParams.get('paymentStatus') || undefined
    const userId = searchParams.get('userId') || undefined

    // Validation des paramètres
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Paramètres de pagination invalides' },
        { status: 400 }
      )
    }

    // Récupération des commandes
    const ordersData = await getOrders(page, limit, search, status, paymentStatus, userId)

    return NextResponse.json(ordersData)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/orders - Créer une nouvelle commande
export async function POST(request: NextRequest) {
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

    // Récupération et validation des données
    const body = await request.json()
    const { userId, productId, amount, paymentMethod, notes } = body

    // Validation des champs requis
    if (!userId || !productId || !amount) {
      return NextResponse.json(
        { error: 'Les champs userId, productId et amount sont requis' },
        { status: 400 }
      )
    }

    // Validation du montant
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être un nombre positif' },
        { status: 400 }
      )
    }

    // Validation des types de données
    if (typeof userId !== 'string' || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'userId et productId doivent être des chaînes de caractères' },
        { status: 400 }
      )
    }

    // Validation optionnelle des autres champs
    if (paymentMethod && typeof paymentMethod !== 'string') {
      return NextResponse.json(
        { error: 'paymentMethod doit être une chaîne de caractères' },
        { status: 400 }
      )
    }

    if (notes && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'notes doit être une chaîne de caractères' },
        { status: 400 }
      )
    }

    // Création de la commande
    const order = await createOrder({
      userId,
      productId,
      amount,
      paymentMethod,
      notes
    })

    // Récupérer les informations de l'utilisateur et du produit pour les emails
    const [user, product] = await Promise.all([
      queryOne<any>('SELECT email, name FROM user WHERE id = ?', [userId]),
      queryOne<any>('SELECT title, price FROM product WHERE id = ?', [productId])
    ])

    if (user && product) {
      // Envoyer l'email de confirmation au client
      try {
        await EmailWorkflowService.sendOrderConfirmationEmail(user.email, {
          userName: user.name || 'Client',
          orderNumber: order.id,
          productName: product.title,
          amount: order.amount,
          orderDate: order.created_at.toLocaleDateString('fr-FR')
        })
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError)
        // Ne pas faire échouer la création de commande si l'email échoue
      }

      // Envoyer la notification à l'admin
      try {
        await EmailWorkflowService.sendNewOrderNotificationToAdmin({
          orderNumber: order.id,
          customerName: user.name || 'Client',
          customerEmail: user.email,
          productName: product.title,
          amount: order.amount,
          orderDate: order.created_at.toLocaleDateString('fr-FR')
        })
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de la notification admin:', emailError)
        // Ne pas faire échouer la création de commande si l'email échoue
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('Utilisateur non trouvé')) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }
      if (error.message.includes('Produit non trouvé')) {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}