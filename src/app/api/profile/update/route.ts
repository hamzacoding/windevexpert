import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schéma de validation pour les données de profil
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').optional(),
  lastName: z.string().min(1, 'Le nom est requis').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  wilayaId: z.string().optional(),
  communeId: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation des données
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validation spécifique pour l'Algérie
    if (data.country === 'DZ' || data.country === 'Algeria') {
      // Si une wilaya est fournie, vérifier qu'elle existe
      if (data.wilayaId) {
        const wilaya = await prisma.wilaya.findUnique({
          where: { id: data.wilayaId }
        })

        if (!wilaya) {
          return NextResponse.json(
            { error: 'Wilaya invalide' },
            { status: 400 }
          )
        }

        // Si une commune est fournie, vérifier qu'elle appartient à la wilaya
        if (data.communeId) {
          const commune = await prisma.commune.findFirst({
            where: {
              id: data.communeId,
              wilayaId: data.wilayaId
            }
          })

          if (!commune) {
            return NextResponse.json(
              { error: 'Commune invalide pour cette wilaya' },
              { status: 400 }
            )
          }
        }
      } else {
        // Si aucune wilaya n'est fournie, supprimer aussi la commune
        data.communeId = undefined
      }
    } else {
      // Si ce n'est pas l'Algérie, supprimer les références aux wilayas/communes
      data.wilayaId = undefined
      data.communeId = undefined
    }

    // Préparer les données de mise à jour (seulement les champs fournis)
    const updateData: any = {}
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName
    if (data.lastName !== undefined) updateData.lastName = data.lastName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.address !== undefined) updateData.address = data.address
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode
    if (data.city !== undefined) updateData.city = data.city
    if (data.country !== undefined) updateData.country = data.country
    if (data.wilayaId !== undefined) updateData.wilayaId = data.wilayaId
    if (data.communeId !== undefined) updateData.communeId = data.communeId

    // Mettre à jour le profil utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        wilaya: true,
        commune: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        postalCode: updatedUser.postalCode,
        city: updatedUser.city,
        country: updatedUser.country,
        wilayaId: updatedUser.wilayaId,
        communeId: updatedUser.communeId,
        wilaya: updatedUser.wilaya,
        commune: updatedUser.commune,
        profileImage: updatedUser.profileImage
      }
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les informations de profil complètes
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
      include: {
        wilaya: true,
        commune: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        postalCode: user.postalCode,
        city: user.city,
        country: user.country,
        wilayaId: user.wilayaId,
        communeId: user.communeId,
        wilaya: user.wilaya,
        commune: user.commune,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}