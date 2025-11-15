import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface VerificationEmailData {
  userName: string
  verificationUrl: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"WindevExpert" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      console.log('Email sent: %s', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async sendVerificationEmail(to: string, data: VerificationEmailData): Promise<boolean> {
    const subject = 'Vérifiez votre adresse email - WindevExpert'
    const html = this.getVerificationEmailTemplate(data)
    const text = this.getVerificationEmailText(data)

    return this.sendEmail({ to, subject, html, text })
  }

  private getVerificationEmailTemplate(data: VerificationEmailData): string {
    const logoSvg = `
      <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(5, 5)">
          <circle cx="15" cy="15" r="13" fill="url(#gradient1)" stroke="url(#gradient2)" stroke-width="1.5"/>
          <path d="M15 6 L24 15 L15 24 L6 15 Z" fill="white" opacity="0.9"/>
          <circle cx="15" cy="15" r="3" fill="url(#gradient2)"/>
          <path d="M15 9 L15 12" stroke="url(#gradient2)" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M15 18 L15 21" stroke="url(#gradient2)" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 15 L12 15" stroke="url(#gradient2)" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M18 15 L21 15" stroke="url(#gradient2)" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <text x="40" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="url(#gradient2)">
          Windev
        </text>
        <text x="40" y="30" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="url(#gradient3)">
          Expert
        </text>
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    `

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification d'email - WindevExpert</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f1f5f9;
          }
          .logo {
            margin-bottom: 20px;
          }
          .title {
            color: #1e293b;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #475569;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 25px;
            line-height: 1.7;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }
          .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .alternative-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #64748b;
          }
          .alternative-link a {
            color: #3b82f6;
            word-break: break-all;
            text-decoration: none;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 14px;
          }
          .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
          }
          .security-note p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              ${logoSvg}
            </div>
            <h1 class="title">Vérification d'email</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Bonjour ${data.userName},</p>
            
            <p class="message">
              Bienvenue sur <strong>WindevExpert</strong> ! Nous sommes ravis de vous compter parmi nous.
            </p>
            
            <p class="message">
              Pour finaliser votre inscription et activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
            </p>
            
            <div class="button-container">
              <a href="${data.verificationUrl}" class="verify-button">
                ✓ Vérifier mon email
              </a>
            </div>
            
            <div class="alternative-link">
              <p><strong>Le bouton ne fonctionne pas ?</strong></p>
              <p>Copiez et collez ce lien dans votre navigateur :</p>
              <a href="${data.verificationUrl}">${data.verificationUrl}</a>
            </div>
            
            <div class="security-note">
              <p>
                <strong>🔒 Note de sécurité :</strong> Ce lien de vérification expirera dans 24 heures pour votre sécurité.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>
              Cet email a été envoyé par WindevExpert.<br>
              Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
            </p>
            <p style="margin-top: 15px;">
              © ${new Date().getFullYear()} WindevExpert. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getVerificationEmailText(data: VerificationEmailData): string {
    return `
Bonjour ${data.userName},

Bienvenue sur WindevExpert ! Nous sommes ravis de vous compter parmi nous.

Pour finaliser votre inscription et activer votre compte, veuillez vérifier votre adresse email en visitant le lien suivant :

${data.verificationUrl}

Ce lien de vérification expirera dans 24 heures pour votre sécurité.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe WindevExpert

© ${new Date().getFullYear()} WindevExpert. Tous droits réservés.
    `
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const subject = 'Bienvenue sur WindevExpert !'
    const html = this.getWelcomeEmailTemplate(userName)
    const text = this.getWelcomeEmailText(userName)

    return this.sendEmail({ to, subject, html, text })
  }

  private getWelcomeEmailTemplate(userName: string): string {
    // Template de bienvenue après vérification
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue - WindevExpert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #3b82f6; text-align: center;">Bienvenue ${userName} !</h1>
          <p>Votre compte a été activé avec succès. Vous pouvez maintenant profiter de tous nos services.</p>
          <p>Cordialement,<br>L'équipe WindevExpert</p>
        </div>
      </body>
      </html>
    `
  }

  private getWelcomeEmailText(userName: string): string {
    return `
Bienvenue ${userName} !

Votre compte a été activé avec succès. Vous pouvez maintenant profiter de tous nos services.

Cordialement,
L'équipe WindevExpert
    `
  }
}

export const emailService = new EmailService()