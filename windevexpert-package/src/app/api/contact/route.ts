import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FirestoreService } from '@/lib/firestore'

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactSchema.parse(body)
    
    // Save to Firestore
    const contactData = {
      ...validatedData,
      status: 'new',
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
    
    const contactId = await FirestoreService.createDocument('contacts', contactData)
    
    // Here you could also send an email notification
    // await sendEmailNotification(validatedData)
    
    return NextResponse.json(
      { 
        message: 'Message envoyé avec succès',
        contactId 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Contact API endpoint' },
    { status: 200 }
  )
}