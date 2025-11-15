import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { smtp2goService } from '@/lib/services/smtp2go-service'

// POST - Envoyer un email de test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { to, templateSlug, templateData, subject, htmlContent } = body

    if (!to) {
      return NextResponse.json(
        { error: 'Adresse email destinataire requise' },
        { status: 400 }
      )
    }

    let success = false

    if (templateSlug) {
      // Envoyer avec un template
      success = await smtp2goService.sendTemplateEmail(
        templateSlug,
        to,
        templateData || {}
      )
    } else if (subject && htmlContent) {
      // Envoyer un email personnalisé
      success = await smtp2goService.sendEmail({
        to,
        subject,
        htmlContent
      })
    } else {
      return NextResponse.json(
        { error: 'Template ou contenu personnalisé requis' },
        { status: 400 }
      )
    }

    if (success) {
      return NextResponse.json({ 
        message: 'Email de test envoyé avec succès',
        success: true 
      })
    } else {
      return NextResponse.json(
        { error: 'Échec de l\'envoi de l\'email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}