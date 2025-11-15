import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { resolveBaseUrl } from '@/lib/base-url'

// Zod schema to validate incoming request for Chargily checkout creation
const chargilyCheckoutSchema = z.object({
  formationId: z.string(),
  // Chargily works in DZD; accept currency for future-proofing but default to DZD
  currency: z.enum(['DZD', 'EUR']).default('DZD'),
  // Allow custom success/failure URLs; default to dashboard pages
  successUrl: z.string().url().optional(),
  failureUrl: z.string().url().optional(),
  // Chargily mode: 'EDAHABIA' or 'CIB' (defaults to 'EDAHABIA')
  mode: z.enum(['EDAHABIA', 'CIB']).optional(),
})

function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { formationId, currency, successUrl, failureUrl, mode } = chargilyCheckoutSchema.parse(body)

    const baseUrl = resolveBaseUrl(request)
    const webhookEndpoint = `${baseUrl}/api/webhooks/chargily`

    // Find user
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Find formation (Course) and get pricing
    const formation = await prisma.course.findUnique({ where: { id: formationId } })
    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Only DZD is supported by Chargily; require priceDA
    const amountDZD = formation.priceDA
    if (!amountDZD || amountDZD <= 0) {
      return NextResponse.json({ error: 'Prix DZD indisponible pour cette formation' }, { status: 400 })
    }

    // Check existing unpaid invoice for this formation (by productName = formation.title)
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: user.id,
        productName: formation.title,
        status: { in: ['UNPAID', 'PROOF_UPLOADED'] }
      }
    })

    if (existingInvoice) {
      // Reuse existing invoice to keep consistency
      const success = successUrl ?? `${baseUrl}/dashboard/payment/success?invoice=${existingInvoice.id}&formation=${formation.id}`
      const failure = failureUrl ?? `${baseUrl}/dashboard/payment/failure?invoice=${existingInvoice.id}&formation=${formation.id}`

      // Build Chargily payload with existing invoice id
      const payload = buildChargilyPayload({
        invoiceId: existingInvoice.id,
        amountDZD,
        user,
        formation,
        successUrl: success,
        failureUrl: failure,
        webhookEndpoint,
        mode: mode ?? 'EDAHABIA'
      })

      const apiResult = await callChargily(payload)
      if (!apiResult.ok) {
        return NextResponse.json({ error: apiResult.error, details: apiResult.details }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        invoice: { id: existingInvoice.id, invoiceNumber: existingInvoice.invoiceNumber },
        chargily: { checkout_url: apiResult.checkout_url, checkout_id: apiResult.checkout_id },
      })
    }

    const invoiceNumber = generateInvoiceNumber()

    // Create a new invoice using unified generator and root schema fields
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: user.id,
        productId: formation.id,
        productName: formation.title,
        productPrice: amountDZD,
        currency: 'DZD',
        // PaymentMethod enum in Prisma does not include 'CIB' currently;
        // use 'SLICKPAY' as the generic card payment method and track provider in notes
        paymentMethod: 'SLICKPAY',
        totalAmount: amountDZD,
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        // Store tracking JSON in notes for richer analytics and unified interface
        notes: JSON.stringify({
          provider: 'CHARGILY',
          mode: mode ?? 'EDAHABIA',
          createdAt: new Date().toISOString(),
        })
      }
    })

    const success = (successUrl ?? `${baseUrl}/dashboard/payment/success?invoice=${invoice.id}&formation=${formation.id}`)
    const failure = (failureUrl ?? `${baseUrl}/dashboard/payment/failure?invoice=${invoice.id}&formation=${formation.id}`)

    // Build Chargily request payload
    const payload = buildChargilyPayload({
      invoiceId: invoice.id,
      amountDZD,
      user,
      formation,
      successUrl: success,
      failureUrl: failure,
      webhookEndpoint,
      mode: mode ?? 'EDAHABIA'
    })

    const apiResult = await callChargily(payload)
    if (!apiResult.ok) {
      return NextResponse.json({ error: apiResult.error, details: apiResult.details }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invoice: { id: invoice.id, invoiceNumber: invoice.invoiceNumber },
      chargily: { checkout_url: apiResult.checkout_url, checkout_id: apiResult.checkout_id },
    })

  } catch (error) {
    console.error('Erreur création checkout Chargily:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// Helper: Build Chargily payload object
function buildChargilyPayload({
  invoiceId,
  amountDZD,
  user,
  formation,
  successUrl,
  failureUrl,
  webhookEndpoint,
  mode,
}: {
  invoiceId: string
  amountDZD: number
  user: { name: string | null; email: string }
  formation: { id: string; title: string }
  successUrl: string
  failureUrl: string
  webhookEndpoint: string
  mode: 'EDAHABIA' | 'CIB'
}) {
  return {
    mode, // 'EDAHABIA' or 'CIB'
    amount: amountDZD,
    currency: 'dzd',
    order_id: invoiceId,
    client: {
      name: user.name ?? 'Client',
      email: user.email,
    },
    success_url: successUrl,
    failure_url: failureUrl,
    webhook_endpoint: webhookEndpoint,
    description: `Paiement pour la formation: ${formation.title}`,
    metadata: {
      invoice_id: invoiceId,
      user_id: user.email,
      formation_id: formation.id,
    },
  }
}

// Helper: Call Chargily API securely
async function callChargily(payload: any): Promise<{ ok: boolean; checkout_url?: string; checkout_id?: string; error?: string; details?: any }> {
  const apiKey = process.env.CHARGILY_API_KEY
  // Use env for secrets to maintain security; avoid storing in DB until schema updated
  const secretKey = process.env.CHARGILY_SECRET_KEY // used in webhook signature verification
  const testMode = (process.env.CHARGILY_TEST_MODE ?? 'true').toLowerCase() === 'true'

  if (!apiKey) {
    return { ok: false, error: 'Configuration Chargily manquante (CHARGILY_API_KEY)' }
  }

  const apiUrl = testMode
    ? 'https://pay.chargily.com/test/api/v2/checkouts'
    : 'https://pay.chargily.com/api/v2/checkouts'

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let details: any = undefined
    try { details = await res.json() } catch {}
    console.error('Erreur API Chargily:', details ?? res.statusText)
    return { ok: false, error: 'Erreur lors de la création du checkout Chargily', details }
  }

  const data = await res.json()
  return { ok: true, checkout_url: data.checkout_url, checkout_id: data.id ?? data.checkout_id }
}