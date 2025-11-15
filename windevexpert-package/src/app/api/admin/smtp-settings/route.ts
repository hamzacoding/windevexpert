import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schéma de validation pour les paramètres SMTP
const smtpSettingsSchema = z.object({
  host: z.string().min(1, 'Le serveur SMTP est requis'),
  port: z.number().int().min(1).max(65535, 'Port invalide'),
  secure: z.boolean(),
  username: z.string().min(1, 'Le nom d\'utilisateur est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  fromEmail: z.string().email('Email invalide'),
  fromName: z.string().min(1, 'Le nom d\'expéditeur est requis'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false)
})

// Schéma pour les mises à jour (mot de passe optionnel)
const smtpUpdateSchema = z.object({
  host: z.string().min(1, 'Le serveur SMTP est requis').optional(),
  port: z.number().int().min(1).max(65535, 'Port invalide').optional(),
  secure: z.boolean().optional(),
  username: z.string().min(1, 'Le nom d\'utilisateur est requis').optional(),
  password: z.string().optional(), // Mot de passe optionnel pour les mises à jour
  fromEmail: z.string().email('Email invalide').optional(),
  fromName: z.string().min(1, 'Le nom d\'expéditeur est requis').optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional()
})

// GET - Récupérer les paramètres SMTP
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const settings = await prisma.sMTPSettings.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        password: true, // Récupérer le mot de passe pour vérifier s'il existe
        fromEmail: true,
        fromName: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Transformer les données pour indiquer si un mot de passe existe sans le révéler
    const settingsWithPasswordInfo = settings.map(setting => ({
      ...setting,
      password: '', // Ne jamais retourner le mot de passe
      hasPassword: !!setting.password && setting.password.length > 0 // Indiquer si un mot de passe existe
    }))

    return NextResponse.json({ settings: settingsWithPasswordInfo })
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres SMTP:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer de nouveaux paramètres SMTP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = smtpSettingsSchema.parse(body)

    // Note: Pour la production, il faudrait chiffrer le mot de passe avec une méthode réversible
    // Pour l'instant, nous stockons le mot de passe en clair (non recommandé en production)

    // Si c'est la configuration par défaut, désactiver les autres
    if (validatedData.isDefault) {
      await prisma.sMTPSettings.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const settings = await prisma.sMTPSettings.create({
      data: {
        ...validatedData
      },
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      message: 'Paramètres SMTP créés avec succès',
      settings 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création des paramètres SMTP:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres SMTP
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis pour la mise à jour' },
        { status: 400 }
      )
    }

    // Valider les données avec le schéma de mise à jour
    const validatedData = smtpUpdateSchema.parse(updateData)
    
    // Debug logging pour voir ce qui est reçu
    console.log('PUT SMTP Settings - Received data:', {
      hasPassword: !!validatedData.password,
      passwordLength: validatedData.password?.length || 0,
      username: validatedData.username
    })
    
    // Si le mot de passe est vide ou undefined, ne pas le mettre à jour (conserver l'existant)
    if (!validatedData.password || validatedData.password.trim() === '') {
      delete validatedData.password
      console.log('PUT SMTP Settings - Password field removed (keeping existing password)')
    }
    
    console.log('PUT SMTP Settings - Data to save:', {
      hasPassword: !!validatedData.password,
      passwordLength: validatedData.password?.length || 0,
      dataKeys: Object.keys(validatedData)
    })

    // Note: Le mot de passe est stocké en clair pour permettre la connexion SMTP
    // En production, il faudrait utiliser un chiffrement réversible

    // Si c'est la configuration par défaut, désactiver les autres
    if (validatedData.isDefault) {
      await prisma.sMTPSettings.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const settings = await prisma.sMTPSettings.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        fromEmail: true,
        fromName: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('PUT SMTP Settings - Update completed successfully for ID:', id)

    return NextResponse.json({ 
      message: 'Paramètres SMTP mis à jour avec succès',
      settings 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la mise à jour des paramètres SMTP:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}