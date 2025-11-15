import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AppSettingsService, { AppSettingsUpdate } from '@/lib/services/app-settings-service'
import { z } from 'zod'

// Schéma de validation pour les paramètres de l'application
const appSettingsSchema = z.object({
  tinymceApiKey: z.string().optional().nullable(),
  openaiApiKey: z.string().optional().nullable(),
  geminiApiKey: z.string().optional().nullable(),
  siteName: z.string().min(1, 'Le nom du site est requis').optional(),
  siteDescription: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional()
})

// GET - Récupérer les paramètres de l'application
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const settings = await AppSettingsService.getSettings()
    
    return NextResponse.json({
      success: true,
      settings: settings
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des paramètres' 
      },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres de l'application
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Valider les données avec le schéma Zod
    const validatedData = appSettingsSchema.parse(body)
    
    // Mettre à jour les paramètres via le service
    const updatedSettings = await AppSettingsService.updateSettings(validatedData)
    
    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour des paramètres' 
      },
      { status: 500 }
    )
  }
}