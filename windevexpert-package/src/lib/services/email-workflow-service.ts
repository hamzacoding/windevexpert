import { smtpService } from './smtp-service'
import { prisma } from '@/lib/prisma'

export interface UserData {
  id: string
  name: string
  email: string
}

export interface OrderData {
  id: string
  orderNumber: string
  serviceName: string
  amount: number
  date: Date
  user: UserData
}

export class EmailWorkflowService {
  /**
   * Envoie un email de bienvenue lors de l'inscription d'un utilisateur
   */
  static async sendWelcomeEmail(user: UserData): Promise<boolean> {
    try {
      const templateData = {
        userName: user.name,
        userEmail: user.email
      }

      const result = await smtpService.sendTemplatedEmail(
        user.email,
        'WELCOME_USER',
        templateData
      )

      console.log(`✅ Email de bienvenue envoyé à ${user.email}`)
      return result
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error)
      return false
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(user: UserData, resetUrl: string): Promise<boolean> {
    try {
      const templateData = {
        userName: user.name,
        userEmail: user.email,
        resetUrl
      }

      const result = await smtpService.sendTemplatedEmail(
        user.email,
        'PASSWORD_RESET',
        templateData
      )

      console.log(`✅ Email de réinitialisation envoyé à ${user.email}`)
      return result
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
      return false
    }
  }

  /**
   * Envoie un email de confirmation de commande au client
   */
  static async sendOrderConfirmationEmail(order: OrderData): Promise<boolean> {
    try {
      const templateData = {
        userName: order.user.name,
        userEmail: order.user.email,
        orderNumber: order.orderNumber,
        orderDate: order.date.toLocaleDateString('fr-FR'),
        serviceName: order.serviceName,
        orderAmount: new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(order.amount)
      }

      const result = await smtpService.sendTemplatedEmail(
        order.user.email,
        'ORDER_CONFIRMATION',
        templateData
      )

      console.log(`✅ Email de confirmation de commande envoyé à ${order.user.email}`)
      return result
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error)
      return false
    }
  }

  /**
   * Envoie une notification de nouvelle commande aux administrateurs
   */
  static async sendNewOrderNotificationToAdmins(order: OrderData): Promise<boolean> {
    try {
      // Récupérer tous les administrateurs
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true }
      })

      if (admins.length === 0) {
        console.log('⚠️ Aucun administrateur trouvé pour la notification')
        return false
      }

      const templateData = {
        userName: order.user.name,
        userEmail: order.user.email,
        orderNumber: order.orderNumber,
        orderDate: order.date.toLocaleDateString('fr-FR'),
        serviceName: order.serviceName,
        orderAmount: new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(order.amount)
      }

      // Envoyer l'email à tous les administrateurs
      const results = await Promise.all(
        admins.map(admin =>
          smtpService.sendTemplatedEmail(
            admin.email,
            'NEW_ORDER_ADMIN',
            templateData
          )
        )
      )

      const successCount = results.filter(result => result).length
      console.log(`✅ Notification de nouvelle commande envoyée à ${successCount}/${admins.length} administrateurs`)
      
      return successCount > 0
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications admin:', error)
      return false
    }
  }

  /**
   * Envoie un email de vérification d'adresse email
   */
  static async sendEmailVerificationEmail(user: UserData, verificationUrl: string): Promise<boolean> {
    try {
      // Pour l'instant, utilisons le template de bienvenue modifié
      // Plus tard, nous pourrons créer un template spécifique
      const templateData = {
        userName: user.name,
        userEmail: user.email,
        verificationUrl
      }

      const result = await smtpService.sendEmail({
        to: user.email,
        subject: 'Vérification de votre adresse email - WindevExpert',
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <img src="${process.env.NEXT_PUBLIC_SITE_URL}/windevexpert-logo-email.svg" alt="WindevExpert" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #333; margin-bottom: 20px;">Vérifiez votre adresse email</h1>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Bonjour ${user.name},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Merci de vous être inscrit sur WindevExpert ! Pour finaliser votre inscription, veuillez vérifier votre adresse email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Vérifier mon email
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        </div>
        `,
        textContent: `Vérifiez votre adresse email\n\nBonjour ${user.name},\n\nMerci de vous être inscrit sur WindevExpert ! Pour finaliser votre inscription, cliquez sur ce lien :\n${verificationUrl}\n\nCe lien est valide pendant 24 heures.`
      })

      console.log(`✅ Email de vérification envoyé à ${user.email}`)
      return result
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error)
      return false
    }
  }

  /**
   * Envoie un email personnalisé à un utilisateur
   */
  static async sendCustomEmail(
    userEmail: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      const result = await smtpService.sendEmail({
        to: userEmail,
        subject,
        htmlContent,
        textContent
      })

      console.log(`✅ Email personnalisé envoyé à ${userEmail}`)
      return result
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email personnalisé:', error)
      return false
    }
  }

  /**
   * Envoie un email en utilisant un template spécifique
   */
  static async sendTemplatedEmailToUser(
    userEmail: string,
    templateSlug: string,
    templateData: Record<string, any>
  ): Promise<boolean> {
    try {
      const result = await smtpService.sendTemplatedEmail(
        userEmail,
        templateSlug as any,
        templateData
      )

      console.log(`✅ Email template "${templateSlug}" envoyé à ${userEmail}`)
      return result
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi du template "${templateSlug}":`, error)
      return false
    }
  }
}