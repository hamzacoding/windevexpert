import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { queryOne, queryMany, execute } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { cartId, userId, sessionId } = await request.json()

    // Get payment settings from database
    const paymentSettings = await queryOne(
      'SELECT stripeEnabled, stripeSecretKey, stripeTestMode FROM PaymentSettings WHERE isActive = 1 LIMIT 1'
    )

    if (!paymentSettings?.stripeEnabled || !paymentSettings?.stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré ou activé' },
        { status: 400 }
      )
    }

    // Check if we're using dummy test keys (for development/testing)
    const isDummyKey = paymentSettings.stripeSecretKey.includes('1234567890') || 
                      paymentSettings.stripeSecretKey.length < 50

    let stripe: Stripe | null = null
    
    if (!isDummyKey) {
      // Initialize Stripe with real keys
      stripe = new Stripe(paymentSettings.stripeSecretKey, {
        apiVersion: '2024-06-20',
      })
    }

    // Get cart data
    const cart = await queryOne(
      `SELECT c.id, c.userId, c.sessionId 
       FROM Cart c 
       WHERE c.id = ? OR c.userId = ? OR c.sessionId = ?`,
      [cartId, userId, sessionId]
    )

    if (!cart) {
      return NextResponse.json(
        { error: 'Panier vide ou introuvable' },
        { status: 400 }
      )
    }

    // Get cart items with products
    const cartItems = await queryMany(
      `SELECT ci.id, ci.quantity, ci.productId,
              p.id as product_id, p.name as product_name, p.description as product_description,
              p.price as product_price, p.logo as product_logo
       FROM CartItem ci
       JOIN Product p ON ci.productId = p.id
       WHERE ci.cartId = ?`,
      [cart.id]
    )

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide ou introuvable' },
        { status: 400 }
      )
    }

    // Calculate total in EUR (cents for Stripe)
    const totalEUR = cartItems.reduce((sum, item) => {
      return sum + (item.product_price * item.quantity)
    }, 0)

    const totalCents = Math.round(totalEUR * 100) // Convert to cents

    // Create line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product_name,
          description: item.product_description || undefined,
          images: item.product_logo ? [item.product_logo] : undefined,
        },
        unit_amount: Math.round(item.product_price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session or simulate it
    let checkoutSession: any

    if (isDummyKey) {
      // Simulation mode for testing with dummy keys
      console.log('🧪 Mode simulation Stripe activé (clés de test factices)')
      checkoutSession = {
        id: `cs_test_simulation_${Date.now()}`,
        url: `${process.env.NEXTAUTH_URL}/payment/simulation?session_id=cs_test_simulation_${Date.now()}`,
        payment_status: 'unpaid',
        metadata: {
          cartId: cart.id,
          userId: userId || '',
          sessionId: sessionId || ''
        }
      }
    } else {
      // Real Stripe checkout session
      checkoutSession = await stripe!.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
        metadata: {
          cartId: cart.id,
          userId: userId || '',
          sessionId: sessionId || ''
        },
        customer_email: session?.user?.email || undefined,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC']
        }
      })
    }

    // Create order record
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const orderId = await execute(
      `INSERT INTO \`Order\` (orderNumber, userId, totalAmount, currency, status, paymentStatus, paymentMethod, paymentId, createdAt, updatedAt)
       VALUES (?, ?, ?, 'EUR', 'PENDING', 'PENDING', 'STRIPE', ?, NOW(), NOW())`,
      [orderNumber, userId, totalEUR, checkoutSession.id]
    )

    // Create order items
    for (const item of cartItems) {
      await execute(
        `INSERT INTO OrderItem (orderId, productId, quantity, price, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [orderId.insertId, item.productId, item.quantity, item.product_price]
      )
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      orderId: orderId.insertId
    })

  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}