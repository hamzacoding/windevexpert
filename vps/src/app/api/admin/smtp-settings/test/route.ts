import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

// POST - Tester la connexion SMTP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { testEmail, smtpSettings } = body

    let settings
    
    if (smtpSettings) {
      // Utiliser les paramètres fournis dans la requête (pour tester avant sauvegarde)
      settings = smtpSettings
      
      // Si le mot de passe est vide, essayer de le récupérer depuis la base
      if (!settings.password || settings.password.trim() === '') {
        const dbSettings = await prisma.sMTPSettings.findFirst({
          where: { 
            isActive: true,
            isDefault: true
          },
          select: {
            password: true
          }
        })
        
        if (dbSettings && dbSettings.password) {
          settings.password = dbSettings.password
        }
      }
    } else {
      // Récupérer les paramètres SMTP actifs depuis la base
      const dbSettings = await prisma.sMTPSettings.findFirst({
        where: { 
          isActive: true,
          isDefault: true
        }
      })

      if (!dbSettings) {
        return NextResponse.json(
          { error: 'Aucune configuration SMTP trouvée' },
          { status: 404 }
        )
      }

      // Le mot de passe est stocké en clair dans la base (pas de chiffrement pour l'instant)
      settings = {
        ...dbSettings,
        password: dbSettings.password // Utiliser directement le mot de passe
      }
    }

    // Debug logging (sans exposer le mot de passe)
    console.log('SMTP Settings Debug:', {
      host: settings.host,
      port: settings.port,
      username: settings.username,
      hasPassword: !!settings.password,
      passwordLength: settings.password?.length || 0
    })

    // Validation des identifiants
    if (!settings.username || !settings.password) {
      return NextResponse.json(
        { 
          error: 'Identifiants SMTP manquants',
          errorType: 'validation',
          suggestions: [
            'Vérifiez que le nom d\'utilisateur est renseigné',
            'Vérifiez que le mot de passe est renseigné',
            'Sauvegardez d\'abord vos paramètres SMTP avant de tester'
          ]
        },
        { status: 400 }
      )
    }

    // Configuration intelligente du transporteur basée sur le port
    const isSSLPort = settings.port === 465
    const isSTARTTLSPort = settings.port === 587 || settings.port === 25
    
    const transportConfig: any = {
      host: settings.host,
      port: settings.port,
      secure: isSSLPort, // true seulement pour le port 465
      auth: {
        user: settings.username,
        pass: settings.password,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      logger: false,
      debug: false
    }

    // Configuration TLS spécifique selon le port
    if (isSSLPort) {
      // Port 465 - SSL direct
      transportConfig.secure = true
      transportConfig.tls = {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    } else if (isSTARTTLSPort) {
      // Ports 587/25 - STARTTLS
      transportConfig.secure = false
      transportConfig.requireTLS = true
      transportConfig.tls = {
        rejectUnauthorized: false,
        ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
        minVersion: 'TLSv1.2'
      }
    } else {
      // Autres ports - configuration flexible
      transportConfig.secure = settings.secure
      transportConfig.ignoreTLS = false
      transportConfig.tls = {
        rejectUnauthorized: false,
        ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      }
    }

    const transporter = nodemailer.createTransport(transportConfig)

    // Tester la connexion
    await transporter.verify()

    // Si un email de test est fourni, envoyer un email de test
    if (testEmail) {
      const mailOptions = {
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: testEmail,
        subject: 'Test de configuration SMTP - WindevExpert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Test de configuration SMTP</h2>
            <p>Ce message confirme que votre configuration SMTP fonctionne correctement.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Détails de la configuration :</h3>
              <ul>
                <li><strong>Serveur :</strong> ${settings.host}</li>
                <li><strong>Port :</strong> ${settings.port}</li>
                <li><strong>Sécurisé :</strong> ${settings.secure ? 'Oui' : 'Non'}</li>
                <li><strong>Utilisateur :</strong> ${settings.username}</li>
                <li><strong>Email d'expéditeur :</strong> ${settings.fromEmail}</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              Email envoyé le ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        `,
        text: `Test de configuration SMTP\n\nCe message confirme que votre configuration SMTP fonctionne correctement.\n\nDétails:\n- Serveur: ${settings.host}\n- Port: ${settings.port}\n- Sécurisé: ${settings.secure ? 'Oui' : 'Non'}\n- Utilisateur: ${settings.username}\n- Email d'expéditeur: ${settings.fromEmail}\n\nEmail envoyé le ${new Date().toLocaleString('fr-FR')}`
      }

      await transporter.sendMail(mailOptions)
      
      return NextResponse.json({ 
        success: true,
        message: 'Connexion SMTP réussie et email de test envoyé',
        testEmailSent: true
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Connexion SMTP réussie',
      testEmailSent: false
    })

  } catch (error) {
    console.error('Erreur lors du test SMTP:', error)
    
    let errorMessage = 'Erreur de connexion SMTP'
    let errorType = 'connection'
    let suggestions: string[] = []

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      
      // Erreurs d'authentification
      if (errorMsg.includes('535') || errorMsg.includes('authentication') || errorMsg.includes('login')) {
        errorType = 'authentication'
        errorMessage = 'Erreur d\'authentification SMTP (535)'
        suggestions = [
          'Vérifiez votre nom d\'utilisateur et mot de passe',
          'Pour Gmail, utilisez un mot de passe d\'application',
          'Vérifiez que l\'authentification 2FA est configurée si nécessaire',
          'Assurez-vous que l\'accès aux applications moins sécurisées est activé'
        ]
      }
      // Erreurs de connexion
      else if (errorMsg.includes('econnrefused') || errorMsg.includes('timeout')) {
        errorType = 'connection'
        errorMessage = 'Impossible de se connecter au serveur SMTP'
        suggestions = [
          'Vérifiez l\'adresse du serveur SMTP',
          'Vérifiez le port utilisé',
          'Vérifiez votre connexion internet',
          'Le serveur SMTP pourrait être temporairement indisponible'
        ]
      }
      // Erreurs SSL/TLS
      else if (errorMsg.includes('ssl') || errorMsg.includes('tls') || errorMsg.includes('certificate')) {
        errorType = 'ssl'
        errorMessage = 'Erreur de sécurité SSL/TLS'
        suggestions = [
          'Vérifiez les paramètres de sécurité (SSL/TLS)',
          'Pour le port 465, utilisez SSL (secure=true)',
          'Pour le port 587, utilisez STARTTLS (secure=false)',
          'Vérifiez que le serveur supporte TLS v1.2+'
        ]
      }
      // Autres erreurs
      else {
        errorMessage = error.message
        suggestions = [
          'Vérifiez tous les paramètres de configuration',
          'Consultez la documentation de votre fournisseur SMTP'
        ]
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        errorType,
        suggestions,
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 400 }
    )
  }
}