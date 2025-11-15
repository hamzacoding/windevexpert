import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const simulated = searchParams.get('simulated')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      )
    }

    // Get payment settings to check if we're in simulation mode
    const paymentSettings = await prisma.paymentSettings.findFirst()
    const isDummyKey = paymentSettings?.stripeSecretKey?.includes('1234567890') || 
                      (paymentSettings?.stripeSecretKey?.length || 0) < 50
    const isSimulationSessionId = sessionId.startsWith('cs_test_simulation_')

    // Handle simulation mode
    if (isDummyKey || simulated === 'true' || isSimulationSessionId) {
      // In simulation mode, find the order directly without calling Stripe
      const order = await prisma.order.findFirst({
        where: {
          paymentId: sessionId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Commande non trouvée' },
          { status: 404 }
        )
      }

      // In simulation mode, assume payment is successful
      return NextResponse.json({
        success: true,
        simulation: true,
        order: {
          id: order.id,
          status: order.status,
          paymentStatus: 'PAID',
          totalAmount: order.totalAmount,
          currency: order.currency,
          items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.price,
              downloadUrl: item.product.downloadUrl
            }
          }))
        },
        session: {
          id: sessionId,
          payment_status: 'paid',
          customer_email: 'simulation@test.com'
        }
      })
    }

    // Real Stripe mode
    if (!paymentSettings?.stripeSecretKey) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(paymentSettings.stripeSecretKey, {
      apiVersion: '2024-06-20',
    })

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session Stripe non trouvée' },
        { status: 404 }
      )
    }

    // Find the order in our database
    const order = await prisma.order.findFirst({
      where: {
        paymentId: sessionId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        currency: order.currency,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            downloadUrl: item.product.downloadUrl
          }
        }))
      },
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    )
  }
}