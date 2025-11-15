import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requis'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyEmailSchema.parse(body)

    // Rechercher l'utilisateur avec ce token de vérification
    const user = await queryOne(
      'SELECT id, email, emailVerified FROM User WHERE emailVerificationToken = ?',
      [token]
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Token de vérification invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email déjà vérifié' },
        { status: 200 }
      )
    }

    // Marquer l'email comme vérifié et supprimer le token
    await execute(
      'UPDATE User SET emailVerified = NOW(), emailVerificationToken = NULL WHERE id = ?',
      [user.id]
    )

    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Verify email error:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}