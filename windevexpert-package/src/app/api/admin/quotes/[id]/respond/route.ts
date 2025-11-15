import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
// Lazy init Resend inside the handler to avoid build-time failures
const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const { subject, message, estimatedPrice, estimatedTimeline, updateStatus } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Le sujet et le message sont requis' },
        { status: 400 }
      )
    }

    const { id } = await params

    // Récupérer la demande de devis
    const quote = await prisma.quoteRequest.findUnique({
      where: { id }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Demande de devis non trouvée' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      status: updateStatus || 'QUOTED',
      quoteSentAt: new Date(),
      updatedAt: new Date()
    }

    if (estimatedPrice) {
      updateData.estimatedPrice = estimatedPrice
    }

    if (estimatedTimeline) {
      updateData.adminNotes = quote.adminNotes 
        ? `${quote.adminNotes}\n\nDélai estimé: ${estimatedTimeline}`
        : `Délai estimé: ${estimatedTimeline}`
    }

    // Mettre à jour la demande de devis
    const updatedQuote = await prisma.quoteRequest.update({
      where: { id },
      data: updateData
    })

    // Envoyer l'email de réponse
    try {
      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY manquant; envoi email ignoré pour la build')
      } else {
        const resend = new Resend(RESEND_API_KEY)
        await resend.emails.send({
        from: 'WinDevExpert <noreply@windevexpert.com>',
        to: [quote.email],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
              }
              .content {
                white-space: pre-wrap;
                margin-bottom: 30px;
              }
              .quote-info {
                background-color: #f1f5f9;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .quote-info h3 {
                margin: 0 0 10px 0;
                color: #1e293b;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 14px;
              }
              .contact-info {
                margin-top: 20px;
                padding: 15px;
                background-color: #eff6ff;
                border-radius: 6px;
              }
              h1, h2, h3 {
                color: #1e293b;
              }
              h2 {
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 5px;
              }
              .button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">WinDevExpert</div>
                <p>Votre partenaire pour vos projets digitaux</p>
              </div>
              
              <div class="quote-info">
                <h3>Référence de votre demande</h3>
                <p><strong>Numéro :</strong> ${quote.quoteNumber}</p>
                <p><strong>Projet :</strong> ${quote.projectTitle}</p>
                <p><strong>Date de demande :</strong> ${new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              
              <div class="content">${message}</div>
              
              <div class="contact-info">
                <h3>Nous contacter</h3>
                <p>
                  <strong>Email :</strong> contact@windevexpert.com<br>
                  <strong>Téléphone :</strong> +33 1 23 45 67 89<br>
                  <strong>Site web :</strong> <a href="https://windevexpert.com">windevexpert.com</a>
                </p>
              </div>
              
              <div class="footer">
                <p>
                  Cet email a été envoyé par WinDevExpert en réponse à votre demande de devis.<br>
                  Si vous avez des questions, n'hésitez pas à nous contacter.
                </p>
                <p>
                  <small>
                    WinDevExpert - Expert en développement web et applications<br>
                    © ${new Date().getFullYear()} Tous droits réservés
                  </small>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `${subject}\n\n${message}\n\nRéférence: ${quote.quoteNumber}\nProjet: ${quote.projectTitle}\n\nCordialement,\nL'équipe WinDevExpert`
        })

        console.log(`Email de réponse envoyé pour la demande ${quote.quoteNumber}`)
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // On continue même si l'email échoue, la demande est mise à jour
    }

    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès',
      quote: updatedQuote
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}