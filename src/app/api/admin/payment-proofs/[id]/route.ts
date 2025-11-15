import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const actionSchema = z.object({
  action: z.enum(['approve', 'reject'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = actionSchema.parse(body)

    // Récupérer la preuve de paiement
    const { id } = await params
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            user: true,
            formation: true
          }
        }
      }
    })

    if (!paymentProof) {
      return NextResponse.json({ error: 'Preuve de paiement non trouvée' }, { status: 404 })
    }

    if (paymentProof.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cette preuve a déjà été traitée' }, { status: 400 })
    }

    // Mettre à jour le statut de la preuve
    const newProofStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    
    await prisma.paymentProof.update({
      where: { id },
      data: { status: newProofStatus }
    })

    // Si approuvée, marquer la facture comme payée et donner accès à la formation
    if (action === 'approve') {
      // Mettre à jour la facture
      await prisma.invoice.update({
        where: { id: paymentProof.invoiceId },
        data: { status: 'PAID' }
      })

      // Donner accès à la formation
      const existingAccess = await prisma.userFormation.findUnique({
        where: {
          userId_formationId: {
            userId: paymentProof.invoice.userId,
            formationId: paymentProof.invoice.formationId
          }
        }
      })

      if (!existingAccess) {
        await prisma.userFormation.create({
          data: {
            userId: paymentProof.invoice.userId,
            formationId: paymentProof.invoice.formationId,
            accessGrantedAt: new Date()
          }
        })
      }

      // Créer une notification pour l'utilisateur
      await prisma.adminNotification.create({
        data: {
          type: 'PAYMENT_APPROVED',
          title: 'Paiement approuvé',
          message: `Votre paiement pour "${paymentProof.invoice.formation.title}" a été approuvé. Vous avez maintenant accès à la formation.`,
          userId: paymentProof.invoice.userId,
          priority: 'MEDIUM',
          relatedId: paymentProof.invoice.id
        }
      })
    } else {
      // Si rejetée, créer une notification pour l'utilisateur
      await prisma.adminNotification.create({
        data: {
          type: 'PAYMENT_REJECTED',
          title: 'Paiement rejeté',
          message: `Votre preuve de paiement pour "${paymentProof.invoice.formation.title}" a été rejetée. Veuillez contacter le support ou soumettre une nouvelle preuve.`,
          userId: paymentProof.invoice.userId,
          priority: 'HIGH',
          relatedId: paymentProof.invoice.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Paiement approuvé avec succès' : 'Paiement rejeté'
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la preuve:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// API pour télécharger/visualiser la preuve de paiement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'download' ou 'view'

    // Récupérer la preuve de paiement
    const { id } = await params
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id }
    })

    if (!paymentProof) {
      return NextResponse.json({ error: 'Preuve de paiement non trouvée' }, { status: 404 })
    }

    // Retourner les informations du fichier pour redirection
    return NextResponse.json({
      fileName: paymentProof.fileName,
      originalName: paymentProof.originalName,
      filePath: paymentProof.filePath,
      downloadUrl: `/uploads/payment-proofs/${paymentProof.fileName}`
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la preuve:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}