import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const invoiceId = formData.get('invoiceId') as string

    if (!file || !invoiceId) {
      return NextResponse.json(
        { error: 'Fichier et ID de facture requis' },
        { status: 400 }
      )
    }

    // Vérifier que la facture appartient à l'utilisateur
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: session.user.id
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale: 5MB.' },
        { status: 400 }
      )
    }

    // Créer le dossier de stockage s'il n'existe pas
    const uploadDir = join(process.cwd(), 'uploads', 'payment-proofs')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${invoice.invoiceNumber}-${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Supprimer l'ancienne preuve s'il y en a une
    const existingProof = await prisma.paymentProof.findFirst({
      where: {
        invoiceId: invoiceId
      }
    })

    if (existingProof) {
      await prisma.paymentProof.delete({
        where: {
          id: existingProof.id
        }
      })
    }

    // Créer l'enregistrement de la preuve de paiement
    const paymentProof = await prisma.paymentProof.create({
      data: {
        invoiceId: invoiceId,
        fileName: fileName,
        originalName: file.name,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING'
      }
    })

    // Mettre à jour le statut de la facture
    await prisma.invoice.update({
      where: {
        id: invoiceId
      },
      data: {
        status: 'PROOF_UPLOADED'
      }
    })

    // Créer une notification pour l'admin
    await prisma.adminNotification.create({
      data: {
        type: 'PAYMENT_PROOF_UPLOADED',
        title: 'Nouvelle preuve de paiement',
        message: `Une preuve de paiement a été téléchargée pour la facture ${invoice.invoiceNumber}`,
        priority: 'HIGH',
        relatedId: paymentProof.id
      }
    })

    return NextResponse.json({
      success: true,
      paymentProof: {
        id: paymentProof.id,
        fileName: paymentProof.fileName,
        status: paymentProof.status
      }
    })

  } catch (error) {
    console.error('Erreur lors du téléchargement de la preuve:', error)
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
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'ID de facture requis' },
        { status: 400 }
      )
    }

    // Vérifier que la facture appartient à l'utilisateur
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: session.user.id
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    const paymentProofs = await prisma.paymentProof.findMany({
      where: {
        invoiceId: invoiceId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ paymentProofs })

  } catch (error) {
    console.error('Erreur lors de la récupération des preuves:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}