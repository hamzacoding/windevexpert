import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { queryOne, execute } from '@/lib/db'
import { VerificationTokenService, TokenType } from '@/lib/verification-token'
import { EmailWorkflowService } from '@/lib/services/email-workflow-service'

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM User WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with emailVerified as null (inactive)
    const result = await execute(
      `INSERT INTO User (name, email, password, role, emailVerified, createdAt, updatedAt) 
       VALUES (?, ?, ?, 'CLIENT', NULL, NOW(), NOW())`,
      [name, email, hashedPassword]
    )

    // Get the created user
    const user = await queryOne(
      'SELECT id, name, email, role, createdAt, emailVerified FROM User WHERE id = ?',
      [result.insertId]
    )

    // Generate verification token
    const verificationToken = await VerificationTokenService.createVerificationToken(email, TokenType.EMAIL_VERIFICATION)
    
    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    try {
      await EmailWorkflowService.sendEmailVerificationEmail(email, {
        userName: name,
        verificationUrl
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError)
      // Don't fail the registration if email fails, just log it
    }

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès ! Veuillez vérifier votre email pour activer votre compte.',
        user: {
          ...user,
          requiresEmailVerification: true
        }
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}