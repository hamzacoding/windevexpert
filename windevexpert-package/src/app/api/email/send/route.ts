import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { smtp2goService } from '@/lib/services/smtp2go-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // En mode développement, on peut tester sans authentification
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // Vérification de l'authentification pour les utilisateurs normaux
    // Les admins peuvent envoyer des emails sans restriction
    if (!isDevelopment && !session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, template, data, htmlContent, textContent } = body

    if (!to) {
      return NextResponse.json(
        { error: 'Adresse email destinataire requise' },
        { status: 400 }
      )
    }

    let success = false

    if (template) {
      // Envoyer avec un template
      if (!data) {
        return NextResponse.json(
          { error: 'Données du template requises' },
          { status: 400 }
        )
      }
      
      success = await smtp2goService.sendTemplateEmail(
        template,
        to,
        data
      )
    } else if (subject && htmlContent) {
      // Envoyer un email personnalisé
      success = await smtp2goService.sendEmail({
        to,
        subject,
        htmlContent,
        textContent
      })
    } else {
      return NextResponse.json(
        { error: 'Template ou contenu personnalisé requis' },
        { status: 400 }
      )
    }

    if (success) {
      return NextResponse.json({ 
        message: 'Email envoyé avec succès',
        success: true 
      })
    } else {
      return NextResponse.json(
        { error: 'Échec de l\'envoi de l\'email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}