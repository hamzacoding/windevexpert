import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { EmailTemplateType, EmailStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

interface EmailData {
  to: string | string[]
  subject: string
  htmlContent: string
  textContent?: string
  templateData?: Record<string, any>
}

interface SMTPConfig {
  host: string
  port: number
  secure: boolean // true pour 465, false pour autres ports
  auth: {
    user: string
    pass: string
  }
  tls?: {
    rejectUnauthorized: boolean
  }
}

interface DatabaseSMTPSettings {
  id: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
  isActive: boolean
  isDefault: boolean
}

export class SMTPService {
  private transporter: nodemailer.Transporter | null = null
  private fromEmail: string
  private fromName: string
  private isConfigured: boolean
  private currentSettings: DatabaseSMTPSettings | null = null

  constructor() {
    // Valeurs par défaut
    this.fromEmail = 'noreply@windevexpert.com'
    this.fromName = 'WindevExpert'
    this.isConfigured = false
    // Ne pas initialiser depuis la base ou l'environnement au chargement du module
    // L'initialisation sera effectuée à la demande pour éviter les erreurs de build
  }

  // Initialisation paresseuse: tente DB puis fallback env, une seule fois
  private async ensureInitialized() {
    if (this.isConfigured) return
    try {
      await this.initializeFromDatabase()
    } catch (e) {
      // Fallback silencieux vers l'environnement si la base n'est pas accessible
      this.initializeFromEnvironment()
    }
  }

  private async initializeFromDatabase() {
    try {
      // Récupérer les paramètres SMTP depuis la base de données
      const settings = await prisma.sMTPSettings.findFirst({
        where: {
          isActive: true,
          isDefault: true
        }
      })

      if (settings) {
        await this.configureFromSettings(settings)
      } else {
        // Fallback vers les variables d'environnement si aucune configuration en base
        this.initializeFromEnvironment()
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres SMTP depuis la base:', error)
      // Fallback vers les variables d'environnement
      this.initializeFromEnvironment()
    }
  }

  private initializeFromEnvironment() {
    try {
      const smtpConfig: SMTPConfig = {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      }

      // Configuration intelligente SSL/TLS basée sur le port
      const isSSLPort = smtpConfig.port === 465
      const isSTARTTLSPort = smtpConfig.port === 587 || smtpConfig.port === 25
      
      // Configuration de base
      smtpConfig.connectionTimeout = 60000
      smtpConfig.greetingTimeout = 30000
      smtpConfig.socketTimeout = 60000
      smtpConfig.logger = false
      smtpConfig.debug = false

      // Configuration TLS spécifique selon le port
      if (isSSLPort) {
        // Port 465 - SSL direct
        smtpConfig.secure = true
        smtpConfig.tls = {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      } else if (isSTARTTLSPort) {
        // Ports 587/25 - STARTTLS
        smtpConfig.secure = false
        smtpConfig.requireTLS = true
        smtpConfig.tls = {
          rejectUnauthorized: false,
          ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
          minVersion: 'TLSv1.2'
        }
      } else {
        // Autres ports - configuration flexible
        smtpConfig.ignoreTLS = false
        smtpConfig.tls = {
          rejectUnauthorized: false,
          ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
        }
      }

      // Vérifier que la configuration est complète
      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.warn('⚠️ Configuration SMTP incomplète - Mode développement activé')
        this.isConfigured = false
        return
      }

      this.transporter = nodemailer.createTransport(smtpConfig)
      this.fromEmail = process.env.EMAIL_FROM || 'noreply@windevexpert.com'
      this.fromName = process.env.EMAIL_FROM_NAME || 'WindevExpert'
      this.isConfigured = true

      // Vérifier la connexion SMTP
      this.verifyConnection()
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service SMTP depuis l\'environnement:', error)
      this.isConfigured = false
    }
  }

  private async configureFromSettings(settings: DatabaseSMTPSettings) {
    try {
      // Déchiffrer le mot de passe (il est stocké chiffré en base)
      const decryptedPassword = settings.password // Le mot de passe est déjà en clair dans l'API

      const smtpConfig: SMTPConfig = {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: {
          user: settings.username,
          pass: decryptedPassword
        }
      }

      // Configuration intelligente SSL/TLS basée sur le port
      const isSSLPort = smtpConfig.port === 465
      const isSTARTTLSPort = smtpConfig.port === 587 || smtpConfig.port === 25
      
      // Configuration de base
      smtpConfig.connectionTimeout = 60000
      smtpConfig.greetingTimeout = 30000
      smtpConfig.socketTimeout = 60000
      smtpConfig.logger = false
      smtpConfig.debug = false

      // Configuration TLS spécifique selon le port
      if (isSSLPort) {
        // Port 465 - SSL direct
        smtpConfig.secure = true
        smtpConfig.tls = {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      } else if (isSTARTTLSPort) {
        // Ports 587/25 - STARTTLS
        smtpConfig.secure = false
        smtpConfig.requireTLS = true
        smtpConfig.tls = {
          rejectUnauthorized: false,
          ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
          minVersion: 'TLSv1.2'
        }
      } else {
        // Autres ports - configuration flexible
        smtpConfig.ignoreTLS = false
        smtpConfig.tls = {
          rejectUnauthorized: false,
          ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
        }
      }

      this.transporter = nodemailer.createTransport(smtpConfig)
      this.fromEmail = settings.fromEmail
      this.fromName = settings.fromName
      this.currentSettings = settings
      this.isConfigured = true

      console.log('✅ Configuration SMTP chargée depuis la base de données')
      
      // Vérifier la connexion SMTP
      await this.verifyConnection()
    } catch (error) {
      console.error('❌ Erreur lors de la configuration SMTP depuis la base:', error)
      this.isConfigured = false
    }
  }

  // Méthode pour recharger la configuration depuis la base
  async reloadConfiguration() {
    await this.initializeFromDatabase()
  }

  // Méthode pour configurer avec des paramètres spécifiques (utilisée par l'API de test)
  async configureWithSettings(settings: DatabaseSMTPSettings) {
    await this.configureFromSettings(settings)
  }

  private async verifyConnection() {
    if (!this.transporter) {
      console.warn('⚠️ Aucun transporter configuré')
      this.isConfigured = false
      return
    }

    try {
      await this.transporter.verify()
      console.log('✅ Connexion SMTP vérifiée avec succès')
    } catch (error) {
      console.error('❌ Erreur de vérification SMTP:', error)
      this.isConfigured = false
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Initialiser à la demande
      await this.ensureInitialized()

      // En mode développement ou si SMTP n'est pas configuré
      if (!this.isConfigured || process.env.NODE_ENV === 'development') {
        console.log('🔧 Mode développement - Simulation d\'envoi d\'email:')
        console.log('📧 De:', `${this.fromName} <${this.fromEmail}>`)
        console.log('📬 À:', Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to)
        console.log('📝 Sujet:', emailData.subject)
        console.log('📄 Contenu HTML:', emailData.htmlContent.substring(0, 200) + '...')
        
        if (emailData.textContent) {
          console.log('📄 Contenu texte:', emailData.textContent.substring(0, 200) + '...')
        }
        
        console.log('✅ Email simulé envoyé avec succès')
        
        // Enregistrer dans les logs même en mode développement
        await this.logEmail(emailData, 'SENT', null)
        return true
      }

      // Préparer l'email
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent || this.htmlToText(emailData.htmlContent)
      }

      // Vérifier que le transporter est configuré
      if (!this.transporter) {
        throw new Error('Transporter SMTP non configuré')
      }

      // Envoyer l'email
      const result = await this.transporter.sendMail(mailOptions)
      
      console.log('✅ Email envoyé avec succès:', result.messageId)
      
      // Enregistrer dans les logs
      await this.logEmail(emailData, 'SENT', null)
      
      return true
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
      
      // Enregistrer l'erreur dans les logs
      await this.logEmail(emailData, 'FAILED', error instanceof Error ? error.message : 'Erreur inconnue')
      
      return false
    }
  }

  async sendTemplatedEmail(
    to: string | string[],
    templateType: EmailTemplateType,
    templateData: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      // Initialiser à la demande
      await this.ensureInitialized()

      // Récupérer le template depuis la base de données
      const template = await prisma.emailTemplate.findFirst({
        where: {
          type: templateType,
          isActive: true
        }
      })

      if (!template) {
        console.error(`❌ Template email non trouvé: ${templateType}`)
        return false
      }

      // Remplacer les variables dans le template
      let subject = template.subject
      let htmlContent = template.htmlContent
      let textContent = template.textContent || ''

      // Remplacer les variables {{variable}} par les valeurs
      Object.entries(templateData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value))
        textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value))
      })

      // Envoyer l'email
      return await this.sendEmail({
        to,
        subject,
        htmlContent,
        textContent: textContent || undefined,
        templateData
      })
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email templated:', error)
      return false
    }
  }

  private async logEmail(
    emailData: EmailData,
    status: EmailStatus,
    errorMessage: string | null
  ): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
          subject: emailData.subject,
          status,
          errorMessage,
          sentAt: status === 'SENT' ? new Date() : null
        }
      })
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du log email:', error)
    }
  }

  private htmlToText(html: string): string {
    // Conversion basique HTML vers texte
    return html
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  // Méthode pour tester la configuration
  async testConnection(): Promise<boolean> {
    await this.ensureInitialized()
    if (!this.isConfigured || !this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('❌ Test de connexion SMTP échoué:', error)
      return false
    }
  }

  // Getter pour vérifier si le service est configuré
  get configured(): boolean {
    return this.isConfigured
  }
}

// Instance singleton
export const smtpService = new SMTPService()