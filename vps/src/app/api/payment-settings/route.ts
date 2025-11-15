import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.paymentSettings.findFirst({
      select: {
        id: true,
        ccpAccount: true,
        ccpAccountName: true,
        bankAccount: true,
        bankAccountName: true,
        bankName: true,
        slickPayEnabled: true,
        stripeEnabled: true,
        stripePublicKey: true,
        stripeTestMode: true,
        isActive: true,
        // On ne retourne pas les clés sensibles (stripeSecretKey, stripeWebhookSecret)
        createdAt: true,
        updatedAt: true
      }
    })

    if (!settings) {
      return NextResponse.json({
        ccpAccount: null,
        ccpAccountName: null,
        bankAccount: null,
        bankAccountName: null,
        bankName: null,
        slickPayEnabled: false,
        stripeEnabled: false,
        stripePublicKey: null,
        stripeTestMode: true,
        isActive: false
      })
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}