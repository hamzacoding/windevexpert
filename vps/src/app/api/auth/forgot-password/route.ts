import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { z } from 'zod'
import { VerificationTokenService } from '@/lib/verification-token'
import { EmailWorkflowService } from '@/lib/services/email-workflow-service'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Vérifier si l'utilisateur existe
    const user = await queryOne(
      'SELECT id, name, email FROM User WHERE email = ?',
      [email]
    )

    // Pour des raisons de sécurité, on renvoie toujours une réponse positive
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json(
        { message: 'Si un compte avec cet email existe, vous recevrez un lien de réinitialisation.' },
        { status: 200 }
      )
    }

    // Générer un token de réinitialisation
    const resetToken = await VerificationTokenService.createVerificationToken(email, 'PASSWORD_RESET')
    
    // Créer l'URL de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Envoyer l'email de réinitialisation
    const emailSent = await EmailWorkflowService.sendPasswordResetEmail(email, {
      userName: user.name || 'Utilisateur',
      resetUrl
    })

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email)
      return NextResponse.json(
        { message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Si un compte avec cet email existe, vous recevrez un lien de réinitialisation.' },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}