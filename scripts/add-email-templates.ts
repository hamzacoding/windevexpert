import { PrismaClient, EmailTemplateType } from '@prisma/client'

const prisma = new PrismaClient()

const defaultEmailTemplates = [
  {
    name: 'Bienvenue - Nouvel utilisateur',
    slug: 'welcome-user',
    subject: 'Bienvenue sur {{SITE_NAME}} !',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">Bienvenue {{userName}} !</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Nous sommes ravis de vous accueillir sur <strong>{{SITE_NAME}}</strong>, votre plateforme de développement WinDev.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos services :
          </p>
          
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>Formations WinDev personnalisées</li>
            <li>Support technique expert</li>
            <li>Ressources et documentation</li>
            <li>Communauté de développeurs</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accéder à mon espace
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse 
            <a href="mailto:support@windevexpert.com">support@windevexpert.com</a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
          <p>
            <a href="{{SITE_URL}}/unsubscribe?email={{userEmail}}" style="color: #999;">Se désabonner</a> | 
            <a href="{{SITE_URL}}/privacy" style="color: #999;">Politique de confidentialité</a>
          </p>
        </div>
      </div>
    `,
    textContent: `
Bienvenue {{userName}} !

Nous sommes ravis de vous accueillir sur {{SITE_NAME}}, votre plateforme de développement WinDev.

Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos services :
- Formations WinDev personnalisées
- Support technique expert
- Ressources et documentation
- Communauté de développeurs

Accédez à votre espace : {{SITE_URL}}/dashboard

Si vous avez des questions, contactez-nous : support@windevexpert.com

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.WELCOME,
    isActive: true
  },
  {
    name: 'Vérification d\'email',
    slug: 'email-verification',
    subject: 'Vérifiez votre adresse email - {{SITE_NAME}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">Vérifiez votre adresse email</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Merci de vous être inscrit sur {{SITE_NAME}} ! Pour finaliser votre inscription, veuillez vérifier votre adresse email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
        </div>
      </div>
    `,
    textContent: `
Vérifiez votre adresse email

Bonjour {{userName}},

Merci de vous être inscrit sur {{SITE_NAME}} ! Pour finaliser votre inscription, veuillez vérifier votre adresse email.

Cliquez sur ce lien : {{verificationUrl}}

Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.EMAIL_VERIFICATION,
    isActive: true
  },
  {
    name: 'Réinitialisation de mot de passe',
    slug: 'password-reset',
    subject: 'Réinitialisation de votre mot de passe - {{SITE_NAME}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">Réinitialisation de mot de passe</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Vous avez demandé la réinitialisation de votre mot de passe sur {{SITE_NAME}}.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px; margin-bottom: 15px;">
            Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Pour votre sécurité, ne partagez jamais ce lien avec personne.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
        </div>
      </div>
    `,
    textContent: `
Réinitialisation de mot de passe

Bonjour {{userName}},

Vous avez demandé la réinitialisation de votre mot de passe sur {{SITE_NAME}}.

Cliquez sur ce lien pour créer un nouveau mot de passe :
{{resetUrl}}

Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Pour votre sécurité, ne partagez jamais ce lien avec personne.

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.PASSWORD_RESET,
    isActive: true
  },
  {
    name: 'Confirmation de commande',
    slug: 'order-confirmation',
    subject: 'Confirmation de votre commande #{{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">Commande confirmée !</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Merci pour votre commande ! Nous avons bien reçu votre demande.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Détails de la commande</h3>
            <p style="margin: 5px 0;"><strong>Numéro :</strong> #{{orderNumber}}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> {{orderDate}}</p>
            <p style="margin: 5px 0;"><strong>Service :</strong> {{serviceName}}</p>
            <p style="margin: 5px 0;"><strong>Montant :</strong> {{orderAmount}}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Nous vous contacterons sous 24h pour organiser la suite de votre projet.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/dashboard/orders/{{orderNumber}}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir ma commande
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
        </div>
      </div>
    `,
    textContent: `
Commande confirmée !

Bonjour {{userName}},

Merci pour votre commande ! Nous avons bien reçu votre demande.

Détails de la commande :
- Numéro : #{{orderNumber}}
- Date : {{orderDate}}
- Service : {{serviceName}}
- Montant : {{orderAmount}}

Nous vous contacterons sous 24h pour organiser la suite de votre projet.

Voir votre commande : {{SITE_URL}}/dashboard/orders/{{orderNumber}}

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.ORDER_CONFIRMATION,
    isActive: true
  },
  {
    name: 'Inscription à une formation',
    slug: 'course-enrollment',
    subject: 'Inscription confirmée - {{courseName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">🎓 Inscription confirmée !</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Félicitations ! Votre inscription à la formation <strong>{{courseName}}</strong> a été confirmée.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Détails de la formation</h3>
            <p style="margin: 5px 0;"><strong>Formation :</strong> {{courseName}}</p>
            <p style="margin: 5px 0;"><strong>Date de début :</strong> {{startDate}}</p>
            <p style="margin: 5px 0;"><strong>Durée :</strong> {{duration}}</p>
            <p style="margin: 5px 0;"><strong>Formateur :</strong> {{instructorName}}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Vous recevrez bientôt les informations de connexion et le matériel de cours.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/dashboard/courses/{{courseId}}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accéder à ma formation
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
        </div>
      </div>
    `,
    textContent: `
Inscription confirmée !

Bonjour {{userName}},

Félicitations ! Votre inscription à la formation {{courseName}} a été confirmée.

Détails de la formation :
- Formation : {{courseName}}
- Date de début : {{startDate}}
- Durée : {{duration}}
- Formateur : {{instructorName}}

Vous recevrez bientôt les informations de connexion et le matériel de cours.

Accéder à votre formation : {{SITE_URL}}/dashboard/courses/{{courseId}}

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.COURSE_ENROLLMENT,
    isActive: true
  },
  {
    name: 'Formation terminée',
    slug: 'course-completion',
    subject: 'Félicitations ! Formation {{courseName}} terminée',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">🏆 Félicitations !</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bravo ! Vous avez terminé avec succès la formation <strong>{{courseName}}</strong>.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Résultats</h3>
            <p style="margin: 5px 0;"><strong>Formation :</strong> {{courseName}}</p>
            <p style="margin: 5px 0;"><strong>Date de fin :</strong> {{completionDate}}</p>
            <p style="margin: 5px 0;"><strong>Score final :</strong> {{finalScore}}%</p>
            <p style="margin: 5px 0;"><strong>Statut :</strong> ✅ Réussie</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Votre certificat de réussite est maintenant disponible dans votre espace personnel.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/dashboard/certificates/{{certificateId}}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Télécharger mon certificat
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
        </div>
      </div>
    `,
    textContent: `
Félicitations !

Bonjour {{userName}},

Bravo ! Vous avez terminé avec succès la formation {{courseName}}.

Résultats :
- Formation : {{courseName}}
- Date de fin : {{completionDate}}
- Score final : {{finalScore}}%
- Statut : Réussie

Votre certificat de réussite est maintenant disponible dans votre espace personnel.

Télécharger votre certificat : {{SITE_URL}}/dashboard/certificates/{{certificateId}}

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
    `,
    type: EmailTemplateType.COURSE_COMPLETION,
    isActive: true
  },
  {
    name: 'Newsletter mensuelle',
    slug: 'monthly-newsletter',
    subject: '📰 Newsletter {{SITE_NAME}} - {{monthYear}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin-bottom: 20px;">📰 Newsletter {{monthYear}}</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Bonjour {{userName}},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Découvrez les dernières actualités et nouveautés de {{SITE_NAME}} !
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">🆕 Nouveautés ce mois-ci</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>{{feature1}}</li>
              <li>{{feature2}}</li>
              <li>{{feature3}}</li>
            </ul>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📚 Formations à venir</h3>
            <p style="color: #666; line-height: 1.6;">{{upcomingCourses}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Voir toutes les nouveautés
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.</p>
          <p>
            <a href="{{SITE_URL}}/unsubscribe?email={{userEmail}}" style="color: #999;">Se désabonner</a>
          </p>
        </div>
      </div>
    `,
    textContent: `
Newsletter {{monthYear}}

Bonjour {{userName}},

Découvrez les dernières actualités et nouveautés de {{SITE_NAME}} !

Nouveautés ce mois-ci :
- {{feature1}}
- {{feature2}}
- {{feature3}}

Formations à venir :
{{upcomingCourses}}

Voir toutes les nouveautés : {{SITE_URL}}/dashboard

© {{currentYear}} {{SITE_NAME}}. Tous droits réservés.
Se désabonner : {{SITE_URL}}/unsubscribe?email={{userEmail}}
    `,
    type: EmailTemplateType.NEWSLETTER,
    isActive: true
  },
  {
    name: 'Notification admin - Nouvelle commande',
    slug: 'new-order-admin',
    subject: '🔔 Nouvelle commande reçue #{{orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px; background-color: #fff3cd; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #856404; margin-bottom: 20px;">🎉 Nouvelle commande reçue !</h1>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Détails de la commande</h3>
            <p style="margin: 5px 0;"><strong>Numéro :</strong> #{{orderNumber}}</p>
            <p style="margin: 5px 0;"><strong>Client :</strong> {{userName}} ({{userEmail}})</p>
            <p style="margin: 5px 0;"><strong>Service :</strong> {{serviceName}}</p>
            <p style="margin: 5px 0;"><strong>Montant :</strong> {{orderAmount}}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> {{orderDate}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{SITE_URL}}/nimda/orders/{{orderNumber}}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Gérer la commande
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: `
Nouvelle commande reçue !

Détails de la commande :
- Numéro : #{{orderNumber}}
- Client : {{userName}} ({{userEmail}})
- Service : {{serviceName}}
- Montant : {{orderAmount}}
- Date : {{orderDate}}

Gérer la commande : {{SITE_URL}}/nimda/orders/{{orderNumber}}
    `,
    type: EmailTemplateType.NOTIFICATION,
    isActive: true
  }
]

async function addEmailTemplates() {
  console.log('🌱 Ajout des templates d\'emails par défaut...')
  
  try {
    for (const template of defaultEmailTemplates) {
      const result = await prisma.emailTemplate.upsert({
        where: { slug: template.slug },
        update: template,
        create: template
      })
      console.log(`✅ Template "${template.name}" ajouté (ID: ${result.id})`)
    }
    
    console.log(`\n🎉 ${defaultEmailTemplates.length} templates d'emails ajoutés avec succès !`)
    
    // Afficher un résumé
    const totalTemplates = await prisma.emailTemplate.count()
    console.log(`📊 Total des templates en base : ${totalTemplates}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des templates:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
addEmailTemplates()