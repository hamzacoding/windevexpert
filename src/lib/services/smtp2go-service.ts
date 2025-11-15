import { prisma } from '@/lib/prisma'
import { EmailTemplateType, EmailStatus } from '@prisma/client'

interface EmailData {
  to: string | string[]
  subject: string
  htmlContent: string
  textContent?: string
  templateData?: Record<string, any>
}

interface SMTP2GOResponse {
  request_id: string
  data: {
    succeeded: number
    failed: number
    failures: any[]
    email_id?: string
    error_code?: string
    error?: string
  }
}

export class SMTP2GOService {
  private apiKey: string
  private apiUrl: string
  private fromEmail: string
  private fromName: string
  private isDev: boolean

  constructor() {
    this.apiKey = process.env.SMTP2GO_API_KEY || 'demo-api-key'
    this.apiUrl = process.env.SMTP2GO_API_URL || 'https://api.smtp2go.com/v3'
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@windevexpert.com'
    this.fromName = process.env.EMAIL_FROM_NAME || 'WindevExpert'
    this.isDev = process.env.NODE_ENV !== 'production'

    // Ne pas interrompre le build si la config manque; journaliser seulement
    if (!this.apiKey || this.apiKey === 'demo-api-key') {
      const envMsg = this.isDev ? 'développement' : 'production'
      console.warn(`SMTP2GO non configuré (${envMsg}) – les envois seront simulés ou ignorés.`)
    }
  }

  /**
   * Envoie un email via SMTP2GO
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      
      // Simulation en dev si clé manquante
      if (this.isDev && (this.apiKey === 'demo-api-key' || !this.apiKey)) {
        console.log('🔧 Mode développement - Simulation d\'envoi d\'email:')
        console.log(`📧 De: ${this.fromEmail}`)
        console.log(`📬 À: ${recipients.join(', ')}`)
        console.log(`📝 Sujet: ${emailData.subject}`)
        console.log(`📄 Contenu HTML: ${emailData.htmlContent.substring(0, 100)}...`)
        
        // Log l'email simulé dans la base de données
        await this.logEmail({
          to: recipients.join(', '),
          subject: emailData.subject,
          status: EmailStatus.SENT,
          errorMessage: null,
          sentAt: new Date()
        })
        
        return true
      }

      // En production sans configuration, ne pas envoyer
      if (!this.isDev && (this.apiKey === 'demo-api-key' || !this.apiKey)) {
        console.warn('⚠️ SMTP2GO non configuré en production – envoi ignoré')
        await this.logEmail({
          to: recipients.join(', '),
          subject: emailData.subject,
          status: EmailStatus.FAILED,
          errorMessage: 'SMTP2GO non configuré',
          sentAt: null
        })
        return false
      }
      
      const payload = {
        sender: this.fromEmail,
        to: recipients,
        subject: emailData.subject,
        html_body: emailData.htmlContent,
        text_body: emailData.textContent || this.stripHtml(emailData.htmlContent)
      }

      const response = await fetch(`${this.apiUrl}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': this.apiKey,
          'accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result: SMTP2GOResponse = await response.json()

      // Log l'email dans la base de données
      await this.logEmail({
        to: recipients.join(', '),
        subject: emailData.subject,
        status: result.data.succeeded > 0 ? EmailStatus.SENT : EmailStatus.FAILED,
        errorMessage: result.data.error || null,
        sentAt: result.data.succeeded > 0 ? new Date() : null
      })

      if (result.data.succeeded > 0) {
        console.log(`Email envoyé avec succès. ID: ${result.data.email_id}`)
        return true
      } else {
        console.error('Erreur lors de l\'envoi de l\'email:', result.data.error)
        return false
      }
    } catch (error) {
      console.error('Erreur SMTP2GO:', error)
      
      // Log l'erreur
      await this.logEmail({
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        status: EmailStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
        sentAt: null
      })
      
      return false
    }
  }

  /**
   * Envoie un email en utilisant un template
   */
  async sendTemplateEmail(
    templateSlug: string,
    to: string | string[],
    templateData: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      // Simulation en dev si clé manquante
      if (this.isDev && (this.apiKey === 'demo-api-key' || !this.apiKey)) {
        const recipients = Array.isArray(to) ? to : [to]
        console.log('🔧 Mode développement - Simulation d\'envoi d\'email template:')
        console.log(`📧 Template: ${templateSlug}`)
        console.log(`📧 De: ${this.fromEmail}`)
        console.log(`📬 À: ${recipients.join(', ')}`)
        console.log(`📄 Données: ${JSON.stringify(templateData, null, 2)}`)
        
        // Log l'email simulé dans la base de données
        await this.logEmail({
          to: recipients.join(', '),
          subject: `Template ${templateSlug}`,
          status: EmailStatus.SENT,
          errorMessage: null,
          sentAt: new Date()
        })
        
        return true
      }

      // En production sans configuration, ne pas envoyer
      if (!this.isDev && (this.apiKey === 'demo-api-key' || !this.apiKey)) {
        const recipients = Array.isArray(to) ? to : [to]
        console.warn('⚠️ SMTP2GO non configuré en production – envoi ignoré')
        await this.logEmail({
          to: recipients.join(', '),
          subject: `Template ${templateSlug}`,
          status: EmailStatus.FAILED,
          errorMessage: 'SMTP2GO non configuré',
          sentAt: null
        })
        return false
      }

      const template = await prisma.emailTemplate.findUnique({
        where: { slug: templateSlug, isActive: true }
      })

      if (!template) {
        throw new Error(`Template email non trouvé: ${templateSlug}`)
      }

      // Remplace les variables dans le template
      const processedHtml = this.processTemplate(template.htmlContent, templateData)
      const processedSubject = this.processTemplate(template.subject, templateData)
      const processedText = template.textContent 
        ? this.processTemplate(template.textContent, templateData)
        : undefined

      return await this.sendEmail({
        to,
        subject: processedSubject,
        htmlContent: processedHtml,
        textContent: processedText,
        templateData
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi du template email:', error)
      return false
    }
  }

  /**
   * Traite un template en remplaçant les variables
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template

    // Remplace les variables {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, String(data[key] || ''))
    })

    // Ajoute des variables système
    const systemVars = {
      SITE_NAME: this.fromName,
      SITE_URL: process.env.APP_URL || 'http://localhost:3000',
      CURRENT_YEAR: new Date().getFullYear().toString(),
      LOGO_URL: `${process.env.APP_URL || 'http://localhost:3000'}/windevexpert-logo.svg`
    }

    Object.keys(systemVars).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, systemVars[key as keyof typeof systemVars])
    })

    return processed
  }

  /**
   * Supprime les balises HTML pour créer une version texte
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Log un email dans la base de données
   */
  private async logEmail(logData: {
    to: string
    subject: string
    status: EmailStatus
    errorMessage?: string | null
    sentAt?: Date | null
    templateId?: string
  }): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: logData
      })
    } catch (error) {
      console.error('Erreur lors du logging de l\'email:', error)
    }
  }

  /**
   * Crée un template HTML de base avec le logo
   */
  static createBaseTemplate(content: string, title: string = ''): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .logo {
            max-width: 200px;
            height: auto;
        }
        .content {
            margin: 30px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .btn:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" class="logo">
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; {{CURRENT_YEAR}} {{SITE_NAME}}. Tous droits réservés.</p>
            <p>
                <a href="{{SITE_URL}}" style="color: #3b82f6;">Visiter notre site</a> |
                <a href="{{SITE_URL}}/contact" style="color: #3b82f6;">Nous contacter</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }
}

// Instance singleton
export const smtp2goService = new SMTP2GOService()