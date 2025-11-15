import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { VerificationTokenService } from '@/lib/verification-token'

const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requis'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyTokenSchema.parse(body)

    // Vérifier la validité du token
    const isValid = await VerificationTokenService.verifyToken(token, 'PASSWORD_RESET')

    if (!isValid) {
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Token valide' },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}