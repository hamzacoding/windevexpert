import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { z } from 'zod'
import { VerificationTokenService } from '@/lib/verification-token'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Vérifier le token
    const tokenData = await VerificationTokenService.verifyToken(token, 'PASSWORD_RESET')
    
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await queryOne(
      'SELECT id, email FROM User WHERE email = ?',
      [tokenData.identifier]
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe
    await execute(
      'UPDATE User SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    )

    // Supprimer le token utilisé
    await VerificationTokenService.deleteToken(token)

    return NextResponse.json(
      { message: 'Mot de passe réinitialisé avec succès' },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}