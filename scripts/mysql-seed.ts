import { PrismaClient, ProductType, EmailTemplateType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding MySQL...')

  // Créer l'utilisateur administrateur
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@windevexpert.com' },
    update: {},
    create: {
      email: 'admin@windevexpert.com',
      name: 'Administrateur',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    }
  })
  console.log('✅ Utilisateur admin créé/mis à jour')

  // Créer les catégories
  const categories = [
    {
      name: 'Développement Web',
      slug: 'developpement-web',
      description: 'Services et formations en développement web'
    },
    {
      name: 'Applications Mobiles',
      slug: 'applications-mobiles',
      description: 'Développement d\'applications mobiles iOS et Android'
    },
    {
      name: 'Consulting IT',
      slug: 'consulting-it',
      description: 'Services de conseil en informatique'
    },
    {
      name: 'Formation',
      slug: 'formation',
      description: 'Formations techniques et professionnelles'
    }
  ]

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData
    })
    console.log(`✅ Catégorie créée/mise à jour: ${categoryData.name}`)
  }

  // Créer quelques produits de test
  const webCategory = await prisma.category.findUnique({
    where: { slug: 'developpement-web' }
  })

  if (webCategory) {
    const products = [
      {
        name: 'Formation React Avancée',
        slug: 'formation-react-avancee',
        description: 'Maîtrisez React avec cette formation complète incluant Next.js, TypeScript et les meilleures pratiques.',
        price: 299.99,
        type: ProductType.SERVICE,
        categoryId: webCategory.id,
        features: JSON.stringify(['Projets pratiques', 'Support 24/7', 'Certificat', 'Accès à vie'])
      },
      {
        name: 'Développement Site E-commerce',
        slug: 'developpement-site-ecommerce',
        description: 'Service de développement de site e-commerce sur mesure avec Next.js et Stripe.',
        price: 2999.99,
        type: ProductType.SERVICE,
        categoryId: webCategory.id,
        features: JSON.stringify(['Design responsive', 'Paiement sécurisé', 'SEO optimisé', 'Panel admin'])
      },
      {
        name: 'Audit de Performance Web',
        slug: 'audit-performance-web',
        description: 'Audit complet de performance et optimisation de votre site web.',
        price: 499.99,
        type: ProductType.SERVICE,
        categoryId: webCategory.id,
        features: JSON.stringify(['Analyse complète', 'Rapport détaillé', 'Recommandations', 'Suivi 30 jours'])
      }
    ]

    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: productData,
        create: productData
      })
      console.log(`✅ Produit créé/mis à jour: ${productData.name}`)
    }
  }

  // Créer des paramètres SMTP par défaut
  await prisma.sMTPSettings.upsert({
    where: { id: 'default-smtp' },
    update: {},
    create: {
      id: 'default-smtp',
      host: 'localhost',
      port: 1025,
      secure: false,
      username: 'test@windevexpert.com',
      password: 'test123',
      fromEmail: 'noreply@windevexpert.com',
      fromName: 'WindevExpert Platform',
      isActive: true,
      isDefault: true
    }
  })
  console.log('✅ Paramètres SMTP par défaut créés')

  // Créer des paramètres d'application par défaut
  await prisma.appSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      siteName: 'WindevExpert Platform',
      siteDescription: 'Plateforme de formation et services WindevExpert - Développement web professionnel',
      maintenanceMode: false,
      tinymceApiKey: '6nttvh0omoqwmrzmitjepuyb3kpnwb1y9l50xlukhm0993ln'
    }
  })
  console.log('✅ Paramètres d\'application par défaut créés')

  // Créer quelques templates d'email de base
  const emailTemplates: Array<{
    name: string
    slug: string
    subject: string
    htmlContent: string
    textContent?: string
    type: EmailTemplateType
    isActive: boolean
  }> = [
    {
      name: 'Email de bienvenue',
      slug: 'welcome-email',
      subject: 'Bienvenue sur WindevExpert Platform !',
      htmlContent: `
        <h1>Bienvenue {{userName}} !</h1>
        <p>Nous sommes ravis de vous accueillir sur WindevExpert Platform.</p>
        <p>Vous pouvez maintenant accéder à tous nos services et formations.</p>
        <a href="{{siteUrl}}/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accéder au tableau de bord</a>
      `,
      textContent: 'Bienvenue {{userName}} ! Nous sommes ravis de vous accueillir sur WindevExpert Platform.',
      type: EmailTemplateType.WELCOME,
      isActive: true
    },
    {
      name: 'Vérification d\'email',
      slug: 'email-verification',
      subject: 'Vérifiez votre adresse email',
      htmlContent: `
        <h1>Vérification d'email</h1>
        <p>Bonjour {{userName}},</p>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="{{verificationUrl}}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
        <p>Ce lien expire dans 24 heures.</p>
      `,
      textContent: 'Bonjour {{userName}}, cliquez sur ce lien pour vérifier votre email: {{verificationUrl}}',
      type: EmailTemplateType.EMAIL_VERIFICATION,
      isActive: true
    }
  ]

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: template,
      create: template
    })
    console.log(`✅ Template email créé/mis à jour: ${template.name}`)
  }

  console.log('🎉 Seeding MySQL terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding MySQL:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })