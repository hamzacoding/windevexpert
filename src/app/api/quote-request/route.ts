import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { smtpService } from '@/lib/services/smtp-service'

const quoteRequestSchema = z.object({
  // Informations personnelles
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  company: z.string().optional(),
  position: z.string().optional(),
  
  // Projet
  projectType: z.enum(['website', 'webapp', 'mobile', 'ecommerce', 'formation', 'consulting', 'maintenance', 'other']),
  projectTitle: z.string().min(5),
  projectDescription: z.string().min(50),
  
  // Services demandés
  services: z.array(z.string()).min(1),
  
  // Fonctionnalités
  features: z.array(z.string()).optional(),
  
  // Budget et délais
  budget: z.enum(['<5000', '5000-15000', '15000-30000', '30000-50000', '>50000']),
  timeline: z.enum(['urgent', '1-3months', '3-6months', '6-12months', 'flexible']),
  
  // Informations supplémentaires
  hasExistingWebsite: z.boolean().optional(),
  existingWebsiteUrl: z.string().optional(),
  targetAudience: z.string().optional(),
  competitors: z.string().optional(),
  additionalInfo: z.string().optional(),
  
  // Préférences de contact
  preferredContactMethod: z.enum(['email', 'phone', 'both']),
  preferredContactTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  
  // Consentements
  acceptTerms: z.boolean().refine(val => val === true),
  acceptMarketing: z.boolean().optional(),
})

// Fonction pour générer un numéro de devis unique
function generateQuoteNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `DV${year}${month}${day}${random}`
}

// Fonction pour formater les services sélectionnés
function formatServices(services: string[]): string {
  const serviceLabels: { [key: string]: string } = {
    'web-development': 'Développement Web',
    'web-design': 'Design Web',
    'ecommerce': 'E-commerce',
    'mobile-app': 'Application Mobile',
    'web-app': 'Application Web',
    'database': 'Base de Données',
    'cloud': 'Cloud & Hébergement',
    'seo': 'SEO & Marketing',
    'analytics': 'Analytics',
    'security': 'Sécurité',
    'formation': 'Formation',
    'maintenance': 'Maintenance',
  }
  
  return services.map(service => serviceLabels[service] || service).join(', ')
}

// Fonction pour formater le budget
function formatBudget(budget: string): string {
  const budgetLabels: { [key: string]: string } = {
    '<5000': 'Moins de 5 000€',
    '5000-15000': '5 000€ - 15 000€',
    '15000-30000': '15 000€ - 30 000€',
    '30000-50000': '30 000€ - 50 000€',
    '>50000': 'Plus de 50 000€',
  }
  
  return budgetLabels[budget] || budget
}

// Fonction pour formater le délai
function formatTimeline(timeline: string): string {
  const timelineLabels: { [key: string]: string } = {
    'urgent': 'Urgent (moins d\'1 mois)',
    '1-3months': '1-3 mois',
    '3-6months': '3-6 mois',
    '6-12months': '6-12 mois',
    'flexible': 'Flexible',
  }
  
  return timelineLabels[timeline] || timeline
}

// Fonction pour formater le type de projet
function formatProjectType(projectType: string): string {
  const projectTypeLabels: { [key: string]: string } = {
    'website': 'Site Web',
    'webapp': 'Application Web',
    'mobile': 'Application Mobile',
    'ecommerce': 'E-commerce',
    'formation': 'Formation',
    'consulting': 'Consulting',
    'maintenance': 'Maintenance',
    'other': 'Autre',
  }
  
  return projectTypeLabels[projectType] || projectType
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = quoteRequestSchema.parse(body)
    
    // Génération du numéro de devis
    const quoteNumber = generateQuoteNumber()
    
    // Sauvegarde en base de données
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        quoteNumber,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        position: validatedData.position,
        projectType: validatedData.projectType,
        projectTitle: validatedData.projectTitle,
        projectDescription: validatedData.projectDescription,
        services: JSON.stringify(validatedData.services),
        features: validatedData.features ? JSON.stringify(validatedData.features) : null,
        budget: validatedData.budget,
        timeline: validatedData.timeline,
        hasExistingWebsite: validatedData.hasExistingWebsite || false,
        existingWebsiteUrl: validatedData.existingWebsiteUrl,
        targetAudience: validatedData.targetAudience,
        competitors: validatedData.competitors,
        additionalInfo: validatedData.additionalInfo,
        preferredContactMethod: validatedData.preferredContactMethod,
        preferredContactTime: validatedData.preferredContactTime,
        acceptTerms: validatedData.acceptTerms,
        acceptMarketing: validatedData.acceptMarketing || false,
      },
    })

    // Préparation des données pour les emails
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Email de confirmation au client
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de votre demande de devis</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .services-list { background: #f1f5f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .highlight { background: #dbeafe; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Demande de devis reçue !</h1>
            <p>Merci pour votre confiance, ${validatedData.firstName}</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${validatedData.firstName} ${validatedData.lastName}</strong>,</p>
            
            <p>Nous avons bien reçu votre demande de devis et nous vous en remercions. Notre équipe va analyser votre projet en détail et vous contacter très prochainement.</p>
            
            <div class="quote-details">
              <h3>📋 Récapitulatif de votre demande</h3>
              <p><strong>Numéro de devis :</strong> <span class="highlight">${quoteNumber}</span></p>
              <p><strong>Date :</strong> ${currentDate}</p>
              <p><strong>Type de projet :</strong> ${formatProjectType(validatedData.projectType)}</p>
              <p><strong>Titre :</strong> ${validatedData.projectTitle}</p>
              
              <h4>Services demandés :</h4>
              <div class="services-list">
                ${formatServices(validatedData.services)}
              </div>
              
              <p><strong>Budget estimé :</strong> ${formatBudget(validatedData.budget)}</p>
              <p><strong>Délai souhaité :</strong> ${formatTimeline(validatedData.timeline)}</p>
              
              ${validatedData.company ? `<p><strong>Entreprise :</strong> ${validatedData.company}</p>` : ''}
              ${validatedData.hasExistingWebsite && validatedData.existingWebsiteUrl ? `<p><strong>Site existant :</strong> ${validatedData.existingWebsiteUrl}</p>` : ''}
            </div>
            
            <h3>🚀 Prochaines étapes</h3>
            <ol>
              <li><strong>Analyse</strong> - Notre équipe étudie votre projet (24h)</li>
              <li><strong>Contact</strong> - Nous vous contactons pour clarifier vos besoins</li>
              <li><strong>Devis</strong> - Préparation d'un devis détaillé et personnalisé</li>
              <li><strong>Présentation</strong> - Rendez-vous pour vous présenter notre proposition</li>
            </ol>
            
            <p><strong>⏰ Délai de réponse :</strong> Nous vous contacterons sous <strong>24 heures</strong> maximum.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="button">
                Visiter notre site
              </a>
            </div>
            
            <p>Si vous avez des questions urgentes, n'hésitez pas à nous contacter :</p>
            <ul>
              <li>📧 Email : contact@windevexpert.com</li>
              <li>📞 Téléphone : 01 23 45 67 89</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} WindevExpert. Tous droits réservés.</p>
            <p>Vous recevez cet email suite à votre demande de devis sur notre site.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Email de notification à l'admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle demande de devis - ${quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .client-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .project-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0; }
          .service-item { background: #e0f2fe; padding: 8px 12px; border-radius: 5px; font-size: 14px; }
          .contact-priority { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Nouvelle demande de devis</h1>
            <p>Devis #${quoteNumber}</p>
          </div>
          
          <div class="content">
            ${validatedData.timeline === 'urgent' ? `
              <div class="urgent">
                <h3>⚡ PROJET URGENT</h3>
                <p>Le client a indiqué que son projet est urgent (moins d'1 mois). Priorité élevée !</p>
              </div>
            ` : ''}
            
            <div class="client-info">
              <h3>👤 Informations client</h3>
              <p><strong>Nom :</strong> ${validatedData.firstName} ${validatedData.lastName}</p>
              <p><strong>Email :</strong> <a href="mailto:${validatedData.email}">${validatedData.email}</a></p>
              <p><strong>Téléphone :</strong> <a href="tel:${validatedData.phone}">${validatedData.phone}</a></p>
              ${validatedData.company ? `<p><strong>Entreprise :</strong> ${validatedData.company}</p>` : ''}
              ${validatedData.position ? `<p><strong>Poste :</strong> ${validatedData.position}</p>` : ''}
              
              <div class="contact-priority">
                <p><strong>Préférence de contact :</strong> ${validatedData.preferredContactMethod === 'email' ? '📧 Email' : validatedData.preferredContactMethod === 'phone' ? '📞 Téléphone' : '📧📞 Email et téléphone'}</p>
                <p><strong>Moment préféré :</strong> ${validatedData.preferredContactTime === 'morning' ? '🌅 Matin' : validatedData.preferredContactTime === 'afternoon' ? '☀️ Après-midi' : validatedData.preferredContactTime === 'evening' ? '🌆 Soir' : '⏰ N\'importe quand'}</p>
              </div>
            </div>
            
            <div class="project-info">
              <h3>🚀 Détails du projet</h3>
              <p><strong>Type :</strong> ${formatProjectType(validatedData.projectType)}</p>
              <p><strong>Titre :</strong> ${validatedData.projectTitle}</p>
              <p><strong>Budget :</strong> ${formatBudget(validatedData.budget)}</p>
              <p><strong>Délai :</strong> ${formatTimeline(validatedData.timeline)}</p>
              
              <h4>Description :</h4>
              <div style="background: #f1f5f9; padding: 15px; border-radius: 5px; font-style: italic;">
                ${validatedData.projectDescription}
              </div>
              
              <h4>Services demandés :</h4>
              <div class="services-grid">
                ${validatedData.services.map(service => `<div class="service-item">${formatServices([service])}</div>`).join('')}
              </div>
              
              ${validatedData.features && validatedData.features.length > 0 ? `
                <h4>Fonctionnalités souhaitées :</h4>
                <ul>
                  ${validatedData.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              ` : ''}
              
              ${validatedData.hasExistingWebsite && validatedData.existingWebsiteUrl ? `
                <p><strong>Site existant :</strong> <a href="${validatedData.existingWebsiteUrl}" target="_blank">${validatedData.existingWebsiteUrl}</a></p>
              ` : ''}
              
              ${validatedData.targetAudience ? `
                <h4>Public cible :</h4>
                <p>${validatedData.targetAudience}</p>
              ` : ''}
              
              ${validatedData.competitors ? `
                <h4>Concurrents/Références :</h4>
                <p>${validatedData.competitors}</p>
              ` : ''}
              
              ${validatedData.additionalInfo ? `
                <h4>Informations supplémentaires :</h4>
                <p>${validatedData.additionalInfo}</p>
              ` : ''}
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>📅 Action requise</h3>
              <p><strong>À faire :</strong> Contacter le client sous 24h pour discuter du projet</p>
              <p><strong>Date limite :</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</p>
            </div>
            
            <p><strong>Marketing accepté :</strong> ${validatedData.acceptMarketing ? '✅ Oui' : '❌ Non'}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Envoi des emails
    try {
      // Email au client
      await smtpService.sendEmail({
        to: validatedData.email,
        subject: `Confirmation de votre demande de devis #${quoteNumber}`,
        htmlContent: clientEmailHtml,
        textContent: `Bonjour ${validatedData.firstName},\n\nNous avons bien reçu votre demande de devis #${quoteNumber}.\n\nNotre équipe va analyser votre projet et vous contacter sous 24h.\n\nCordialement,\nL'équipe WindevExpert`,
      })

      // Email à l'admin
      await smtpService.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@windevexpert.com',
        subject: `🚨 Nouvelle demande de devis #${quoteNumber} - ${validatedData.firstName} ${validatedData.lastName}`,
        htmlContent: adminEmailHtml,
        textContent: `Nouvelle demande de devis reçue:\n\nNuméro: ${quoteNumber}\nClient: ${validatedData.firstName} ${validatedData.lastName}\nEmail: ${validatedData.email}\nTéléphone: ${validatedData.phone}\nProjet: ${validatedData.projectTitle}\nBudget: ${formatBudget(validatedData.budget)}\nDélai: ${formatTimeline(validatedData.timeline)}\n\nAction requise: Contacter le client sous 24h`,
      })

      console.log('Emails envoyés avec succès pour la demande de devis:', quoteNumber)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError)
      // On continue même si l'email échoue, la demande est sauvegardée
    }

    return NextResponse.json({
      success: true,
      message: 'Demande de devis envoyée avec succès',
      quoteNumber,
      id: quoteRequest.id,
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la demande de devis:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Données invalides', 
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur' 
      },
      { status: 500 }
    )
  }
}