import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { smtpService } from '@/lib/services/smtp-service'

const updateQuoteSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
  adminNotes: z.string().optional(),
  estimatedPrice: z.number().positive().optional(),
  response: z.object({
    subject: z.string().min(1),
    message: z.string().min(1),
    estimatedPrice: z.number().positive().optional(),
    proposedTimeline: z.string().optional()
  }).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
      select: {
        id: true,
        quoteNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        position: true,
        projectType: true,
        projectTitle: true,
        projectDescription: true,
        services: true,
        features: true,
        budget: true,
        timeline: true,
        hasExistingWebsite: true,
        existingWebsiteUrl: true,
        targetAudience: true,
        competitors: true,
        additionalInfo: true,
        preferredContactMethod: true,
        preferredContactTime: true,
        acceptTerms: true,
        acceptMarketing: true,
        status: true,
        adminNotes: true,
        estimatedPrice: true,
        quoteSentAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Demande de devis non trouvée' },
        { status: 404 }
      )
    }

    // Transformation des données JSON
    const formattedQuote = {
      ...quote,
      services: JSON.parse(quote.services || '[]'),
      features: quote.features ? JSON.parse(quote.features) : [],
      fullName: `${quote.firstName} ${quote.lastName}`
    }

    return NextResponse.json(formattedQuote)

  } catch (error) {
    console.error('Erreur lors de la récupération de la demande de devis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateQuoteSchema.parse(body)

    // Vérification que la demande existe
    const { id } = await params

    const existingQuote = await prisma.quoteRequest.findUnique({
      where: { id }
    })

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Demande de devis non trouvée' },
        { status: 404 }
      )
    }

    // Préparation des données de mise à jour
    const updateData: any = {}
    
    if (validatedData.status) {
      updateData.status = validatedData.status
      
      // Si le statut passe à QUOTED, on met à jour quoteSentAt
      if (validatedData.status === 'QUOTED') {
        updateData.quoteSentAt = new Date()
      }
    }
    
    if (validatedData.adminNotes !== undefined) {
      updateData.adminNotes = validatedData.adminNotes
    }
    
    if (validatedData.estimatedPrice !== undefined) {
      updateData.estimatedPrice = validatedData.estimatedPrice
    }

    // Mise à jour de la demande
    const updatedQuote = await prisma.quoteRequest.update({
      where: { id },
      data: updateData
    })

    // Envoi d'email de réponse si demandé
    if (validatedData.response) {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">WindevExpert</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Réponse à votre demande de devis</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${existingQuote.firstName},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Nous avons bien reçu votre demande de devis pour le projet "${existingQuote.projectTitle}" 
                (Référence: ${existingQuote.quoteNumber}).
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${validatedData.response.message.replace(/\n/g, '<br>')}
              </div>
              
              ${validatedData.response.estimatedPrice ? `
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1976d2; margin: 0 0 10px 0;">Estimation budgétaire</h3>
                  <p style="font-size: 24px; font-weight: bold; color: #1976d2; margin: 0;">
                    ${validatedData.response.estimatedPrice.toLocaleString('fr-FR')} €
                  </p>
                </div>
              ` : ''}
              
              ${validatedData.response.proposedTimeline ? `
                <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #7b1fa2; margin: 0 0 10px 0;">Délai proposé</h3>
                  <p style="color: #7b1fa2; margin: 0; font-weight: 500;">
                    ${validatedData.response.proposedTimeline}
                  </p>
                </div>
              ` : ''}
              
              <div style="margin: 30px 0; padding: 20px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #666;">
                  <strong>Prochaines étapes :</strong><br>
                  N'hésitez pas à nous contacter pour discuter de votre projet plus en détail. 
                  Nous sommes disponibles par email ou téléphone selon vos préférences.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:contact@windevexpert.com" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 25px; font-weight: 500;">
                  Répondre à ce message
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                WindevExpert - Votre partenaire technologique<br>
                Email: contact@windevexpert.com | Téléphone: +33 1 23 45 67 89
              </p>
            </div>
          </div>
        `

        await smtpService.sendEmail({
          to: existingQuote.email,
          subject: validatedData.response.subject,
          html: emailContent
        })

        // Mise à jour du statut si pas déjà fait
        if (!validatedData.status) {
          await prisma.quoteRequest.update({
            where: { id },
            data: { 
              status: 'QUOTED',
              quoteSentAt: new Date()
            }
          })
        }

      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError)
        // On continue même si l'email échoue
      }
    }

    return NextResponse.json({
      message: 'Demande de devis mise à jour avec succès',
      quote: updatedQuote
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande de devis:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Suppression de la demande
    await prisma.quoteRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Demande de devis supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la demande de devis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}