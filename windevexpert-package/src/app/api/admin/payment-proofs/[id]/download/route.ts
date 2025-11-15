import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

    // Récupérer la preuve de paiement
    const { id } = await params
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id }
    })

    if (!paymentProof) {
      return NextResponse.json({ error: 'Preuve de paiement non trouvée' }, { status: 404 })
    }

    try {
      // Lire le fichier
      const filePath = join(process.cwd(), 'uploads', 'payment-proofs', paymentProof.fileName)
      const fileBuffer = await readFile(filePath)

      // Déterminer le type MIME
      const extension = paymentProof.fileName.split('.').pop()?.toLowerCase()
      let mimeType = 'application/octet-stream'
      
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf'
          break
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg'
          break
        case 'png':
          mimeType = 'image/png'
          break
        case 'gif':
          mimeType = 'image/gif'
          break
        case 'webp':
          mimeType = 'image/webp'
          break
      }

      // Retourner le fichier
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${paymentProof.originalName}"`,
          'Cache-Control': 'private, no-cache'
        }
      })

    } catch (fileError) {
      console.error('Erreur lors de la lecture du fichier:', fileError)
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

  } catch (error) {
    console.error('Erreur lors du téléchargement de la preuve:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}