import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session

        // Update order status
        const order = await prisma.order.findFirst({
          where: {
            stripeSessionId: session.id
          }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              paidAt: new Date(),
              stripePaymentIntentId: session.payment_intent as string,
              customerEmail: session.customer_details?.email,
              customerName: session.customer_details?.name,
              billingAddress: session.customer_details?.address ? {
                line1: session.customer_details.address.line1,
                line2: session.customer_details.address.line2,
                city: session.customer_details.address.city,
                state: session.customer_details.address.state,
                postal_code: session.customer_details.address.postal_code,
                country: session.customer_details.address.country,
              } : undefined,
              shippingAddress: session.shipping_details?.address ? {
                line1: session.shipping_details.address.line1,
                line2: session.shipping_details.address.line2,
                city: session.shipping_details.address.city,
                state: session.shipping_details.address.state,
                postal_code: session.shipping_details.address.postal_code,
                country: session.shipping_details.address.country,
              } : undefined,
            }
          })

          // Clear the cart
          const cartId = session.metadata?.cartId
          if (cartId) {
            await prisma.cartItem.deleteMany({
              where: { cartId }
            })
            await prisma.cart.delete({
              where: { id: cartId }
            })
          }

          console.log('Order confirmed:', order.id)
        }
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session
        
        // Update order status to cancelled
        const expiredOrder = await prisma.order.findFirst({
          where: {
            stripeSessionId: expiredSession.id
          }
        })

        if (expiredOrder) {
          await prisma.order.update({
            where: { id: expiredOrder.id },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED'
            }
          })
          console.log('Order expired:', expiredOrder.id)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        
        // Find order by payment intent and update status
        const failedOrder = await prisma.order.findFirst({
          where: {
            stripePaymentIntentId: failedPayment.id
          }
        })

        if (failedOrder) {
          await prisma.order.update({
            where: { id: failedOrder.id },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED'
            }
          })
          console.log('Payment failed for order:', failedOrder.id)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}