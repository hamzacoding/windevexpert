import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-chargily-signature')

    const secret = process.env.CHARGILY_SECRET_KEY
    if (!secret) {
      console.error('CHARGILY_SECRET_KEY manquant')
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    // Verify webhook signature when provided
    if (signature) {
      const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
      if (signature !== expected) {
        console.error('Signature webhook invalide')
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
      }
    }

    let data: any
    try {
      data = JSON.parse(bodyText)
    } catch (e) {
      console.error('Webhook payload JSON invalide')
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
    }

    const type = data?.type
    const checkout = data?.data

    if (!checkout) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const orderId: string | undefined = checkout.order_id || checkout.metadata?.invoice_id
    if (!orderId) {
      console.error('ID de facture manquant dans le webhook')
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    if (type === 'checkout.paid') {
      // Récupérer la facture avant mise à jour pour utiliser userId et productName
      const invoiceRecord = await prisma.invoice.findUnique({ where: { id: orderId } })

      await prisma.invoice.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          // keep tracking in notes for unified analytics
          notes: appendNotesTracking(invoiceRecord, {
            event: 'checkout.paid',
            provider: 'CHARGILY',
            timestamp: new Date().toISOString(),
            checkout_id: checkout.id ?? checkout.checkout_id,
          })
        }
      })

      // Déverrouiller la formation (création d'un enrollment)
      try {
        const formationIdFromMeta: string | undefined = checkout?.metadata?.formation_id || checkout?.metadata?.formationId
        let targetCourseId: string | undefined = formationIdFromMeta

        // Si pas dans les métadonnées, essayer de retrouver via le nom produit
        if (!targetCourseId && invoiceRecord?.productName) {
          const course = await prisma.course.findFirst({ where: { title: invoiceRecord.productName } })
          targetCourseId = course?.id
        }

        if (targetCourseId && invoiceRecord?.userId) {
          const existing = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: invoiceRecord.userId, courseId: targetCourseId } }
          })

          if (!existing) {
            await prisma.enrollment.create({
              data: {
                userId: invoiceRecord.userId,
                courseId: targetCourseId,
                status: 'ACTIVE'
              }
            })
          }
        }
      } catch (err) {
        console.error('Erreur lors du déverrouillage de la formation:', err)
      }

      // Notify admin (use SYSTEM_ALERT to align schema)
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'Paiement confirmé',
          message: `Paiement réussi via Chargily (invoice: ${orderId})`,
          priority: 'MEDIUM',
          invoiceId: orderId,
        }
      })
    } else if (type === 'checkout.failed') {
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'Échec du paiement',
          message: `Échec du paiement via Chargily (invoice: ${orderId})`,
          priority: 'HIGH',
          invoiceId: orderId,
        }
      })

      // Keep invoice status as UNPAID for retry; add tracking
      await prisma.invoice.update({
        where: { id: orderId },
        data: {
          notes: appendNotesTracking(await prisma.invoice.findUnique({ where: { id: orderId } }), {
            event: 'checkout.failed',
            provider: 'CHARGILY',
            timestamp: new Date().toISOString(),
          })
        }
      })
    } else if (type === 'checkout.expired') {
      await prisma.invoice.update({ where: { id: orderId }, data: { status: 'CANCELLED' } })
      await prisma.adminNotification.create({
        data: {
          type: 'SYSTEM_ALERT',
          title: 'Lien de paiement expiré',
          message: `Le lien Chargily a expiré (invoice: ${orderId})`,
          priority: 'MEDIUM',
          invoiceId: orderId,
        }
      })
    } else {
      // Unhandled event; track it
      await prisma.invoice.update({
        where: { id: orderId },
        data: {
          notes: appendNotesTracking(await prisma.invoice.findUnique({ where: { id: orderId } }), {
            event: type ?? 'unknown',
            provider: 'CHARGILY',
            timestamp: new Date().toISOString(),
          })
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur webhook Chargily:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

function appendNotesTracking(invoice: any, entry: Record<string, any>) {
  try {
    const existing = invoice?.notes ? JSON.parse(invoice.notes) : {}
    const history = Array.isArray(existing.history) ? existing.history : []
    const newNotes = { ...existing, history: [...history, entry] }
    return JSON.stringify(newNotes)
  } catch {
    return JSON.stringify({ history: [entry] })
  }
}