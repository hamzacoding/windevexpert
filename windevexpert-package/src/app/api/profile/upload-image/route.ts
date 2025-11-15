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

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier (images uniquement)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 2MB pour les photos de profil)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale: 2MB.' },
        { status: 400 }
      )
    }

    // Créer le nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `profile-${session.user.id}-${timestamp}.${extension}`

    // Créer le dossier s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convertir le fichier en buffer et l'enregistrer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)

    // URL publique du fichier
    const fileUrl = `/uploads/profiles/${fileName}`

    // Mettre à jour le profil utilisateur avec la nouvelle photo
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: fileUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      user: updatedUser,
      imageUrl: fileUrl
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo de profil' },
      { status: 500 }
    )
  }
}

// GET - Récupérer l'URL de la photo de profil actuelle
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        profileImage: true
      }
    })

    return NextResponse.json({
      profileImage: user?.profileImage || null
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la photo de profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la photo de profil' },
      { status: 500 }
    )
  }
}