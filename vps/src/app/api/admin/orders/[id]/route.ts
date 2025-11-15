import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrderById, updateOrder, deleteOrder } from '@/lib/services/orders-service'
import { EmailWorkflowService } from '@/lib/services/email-workflow-service'
import { prisma } from '@/lib/prisma'

// GET /api/admin/orders/[id] - Récupérer une commande par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validation de l'ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      )
    }

    // Récupération de la commande
    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/orders/[id] - Mettre à jour une commande
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validation de l'ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      )
    }

    // Récupération et validation des données
    const body = await request.json()
    const { status, paymentStatus, paymentMethod, notes, amount } = body

    // Validation des statuts
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut de commande invalide' },
        { status: 400 }
      )
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Statut de paiement invalide' },
        { status: 400 }
      )
    }

    // Validation du montant
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Le montant doit être un nombre positif' },
        { status: 400 }
      )
    }

    // Validation des types de données
    if (paymentMethod !== undefined && typeof paymentMethod !== 'string') {
      return NextResponse.json(
        { error: 'paymentMethod doit être une chaîne de caractères' },
        { status: 400 }
      )
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'notes doit être une chaîne de caractères' },
        { status: 400 }
      )
    }

    // Vérification que la commande existe
    const existingOrder = await getOrderById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Mise à jour de la commande
    const updatedOrder = await updateOrder(id, {
      status,
      paymentStatus,
      paymentMethod,
      notes,
      amount
    })

    // Envoyer un email si le statut a changé
    if (status && status !== existingOrder.status) {
      try {
        // Récupérer les informations de l'utilisateur et du produit
        const [user, product] = await Promise.all([
          prisma.user.findUnique({
            where: { id: updatedOrder.userId },
            select: { email: true, name: true }
          }),
          prisma.product.findUnique({
            where: { id: updatedOrder.productId },
            select: { title: true }
          })
        ])

        if (user && product) {
          // Envoyer un email personnalisé selon le nouveau statut
          let subject = ''
          let content = ''

          switch (status) {
            case 'CONFIRMED':
              subject = 'Commande confirmée'
              content = `Bonjour ${user.name || 'Client'},\n\nVotre commande #${updatedOrder.id} pour "${product.title}" a été confirmée.\n\nMerci pour votre confiance !`
              break
            case 'PROCESSING':
              subject = 'Commande en cours de traitement'
              content = `Bonjour ${user.name || 'Client'},\n\nVotre commande #${updatedOrder.id} pour "${product.title}" est maintenant en cours de traitement.\n\nNous vous tiendrons informé de l'avancement.`
              break
            case 'SHIPPED':
              subject = 'Commande expédiée'
              content = `Bonjour ${user.name || 'Client'},\n\nBonne nouvelle ! Votre commande #${updatedOrder.id} pour "${product.title}" a été expédiée.\n\nVous devriez la recevoir sous peu.`
              break
            case 'DELIVERED':
              subject = 'Commande livrée'
              content = `Bonjour ${user.name || 'Client'},\n\nVotre commande #${updatedOrder.id} pour "${product.title}" a été livrée avec succès.\n\nNous espérons que vous êtes satisfait de votre achat !`
              break
            case 'CANCELLED':
              subject = 'Commande annulée'
              content = `Bonjour ${user.name || 'Client'},\n\nVotre commande #${updatedOrder.id} pour "${product.title}" a été annulée.\n\nSi vous avez des questions, n'hésitez pas à nous contacter.`
              break
          }

          if (subject && content) {
            await EmailWorkflowService.sendCustomEmail(
              user.email,
              subject,
              content
            )
          }
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de mise à jour de statut:', emailError)
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[id] - Supprimer une commande
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validation de l'ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de commande invalide' },
        { status: 400 }
      )
    }

    // Vérification que la commande existe
    const existingOrder = await getOrderById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Vérification que la commande peut être supprimée
    if (existingOrder.status === 'COMPLETED' && existingOrder.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une commande terminée et payée' },
        { status: 400 }
      )
    }

    // Suppression de la commande
    await deleteOrder(id)

    return NextResponse.json(
      { message: 'Commande supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}