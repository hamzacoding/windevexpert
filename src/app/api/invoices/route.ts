import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createInvoiceSchema = z.object({
  formationId: z.string(),
  paymentMethod: z.enum(['CCP', 'BANK_TRANSFER']),
  currency: z.enum(['DZD', 'EUR']),
  amount: z.number().positive()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createInvoiceSchema.parse(body)

    // Vérifier que la formation existe (schéma actuel: pas de relation Product)
    const formation = await prisma.course.findUnique({
      where: { id: validatedData.formationId }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas déjà une facture impayée pour cette formation
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id,
        productName: formation.title,
        status: {
          in: ['UNPAID', 'PROOF_UPLOADED']
        }
      }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Une facture est déjà en cours pour cette formation' },
        { status: 400 }
      )
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: session.user.id,
        productName: formation.title,
        productPrice: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        currency: validatedData.currency,
        totalAmount: validatedData.amount,
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Créer une notification pour l'admin si c'est un paiement manuel
    if (['CCP', 'BANK_TRANSFER'].includes(validatedData.paymentMethod)) {
      await prisma.adminNotification.create({
        data: {
          type: 'INVOICE_CREATED',
          message: `Nouvelle facture ${invoiceNumber} créée pour la formation "${formation.title}"`,
          priority: 'MEDIUM',
          invoiceId: invoice.id,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        paymentMethod: invoice.paymentMethod,
        status: invoice.status,
        productName: invoice.productName
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = {
      userId: session.user.id
    }

    if (status) {
      whereClause.status = status
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        paymentProofs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ invoices })

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}