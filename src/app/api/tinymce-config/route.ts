import { NextResponse } from 'next/server'
import AppSettingsService from '@/lib/services/app-settings-service'

export const runtime = 'nodejs'

// GET - Récupérer la configuration TinyMCE (API publique)
export async function GET() {
  try {
    const settings = await AppSettingsService.getSettings()
    const apiKey = settings.tinymceApiKey

    // Construire l'URL du script TinyMCE
    let scriptSrc = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js'
    
    if (apiKey && apiKey.trim()) {
      // Utiliser TinyMCE 8 comme dans votre exemple
      scriptSrc = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/8/tinymce.min.js`
    }
    
    return NextResponse.json({
      success: true,
      scriptSrc,
      hasApiKey: !!(apiKey && apiKey.trim())
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la config TinyMCE:', error)
    
    // En cas d'erreur, retourner la version gratuite
    return NextResponse.json({
      success: true,
      scriptSrc: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js',
      hasApiKey: false
    })
  }
}