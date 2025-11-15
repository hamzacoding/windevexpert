import { PrismaClient, ProductType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedPageContent } from '../src/lib/seeds/page-content'
import { seedEmailTemplates } from '../src/lib/seeds/email-templates'
import { seedCourses } from '../src/lib/seeds/courses'
import { seedProjects } from '../src/lib/seeds/projects'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer un utilisateur admin de test
  const adminEmail = 'admin@windevexpert.com'
  const adminPassword = 'Admin123!'

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ L\'utilisateur admin existe déjà')
  } else {

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // Créer l'utilisateur admin
  const admin = await prisma.user.create({
    data: {
      name: 'Administrateur WindevExpert',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    }
  })

    console.log('✅ Utilisateur admin créé avec succès:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Mot de passe: ${adminPassword}`)
    console.log(`   Rôle: ${admin.role}`)
  }

  // Créer quelques catégories de test
  const categories = [
    {
      name: 'Développement Web',
      slug: 'developpement-web',
      description: 'Formations et services de développement web'
    },
    {
      name: 'Applications Mobiles',
      slug: 'applications-mobiles',
      description: 'Développement d\'applications mobiles'
    },
    {
      name: 'Bases de Données',
      slug: 'bases-de-donnees',
      description: 'Conception et gestion de bases de données'
    }
  ]

  for (const categoryData of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ Catégorie créée: ${categoryData.name}`)
    }
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
        description: 'Maîtrisez React avec cette formation complète',
        price: 299.99,
        type: ProductType.SERVICE,
        categoryId: webCategory.id,
        features: JSON.stringify(['Projets pratiques', 'Support 24/7', 'Certificat'])
      },
      {
        name: 'Développement Site E-commerce',
        slug: 'developpement-site-ecommerce',
        description: 'Service de développement de site e-commerce sur mesure',
        price: 2999.99,
        type: ProductType.SERVICE,
        categoryId: webCategory.id,
        features: JSON.stringify(['Design responsive', 'Paiement sécurisé', 'SEO optimisé'])
      }
    ]

    for (const productData of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productData.slug }
      })

      if (!existingProduct) {
        await prisma.product.create({
          data: productData
        })
        console.log(`✅ Produit créé: ${productData.name}`)
      }
    }
  }

  // Ajouter le contenu initial des pages
  const { seedPageContent } = await import('../src/lib/seeds/page-content')
  await seedPageContent()

  // Ajouter les templates d'email par défaut
  const { seedEmailTemplates } = await import('../src/lib/seeds/email-templates')
  await seedEmailTemplates()

  // Créer des paramètres SMTP par défaut
  const existingSMTPSettings = await prisma.sMTPSettings.findFirst({
    where: { isDefault: true }
  })

  if (!existingSMTPSettings) {
    await prisma.sMTPSettings.create({
      data: {
        host: 'mail.smtp2go.com',
        port: 587,
        secure: false,
        username: 'admin@windevexpert.com',
        password: 'uj1qAttg4I0KMVDp',
        fromEmail: 'admin@windevexpert.com',
        fromName: 'WindevExpert Platform',
        isActive: true,
        isDefault: true
      }
    })
    console.log('✅ Paramètres SMTP par défaut créés')
  } else {
    console.log('✅ Les paramètres SMTP par défaut existent déjà')
  }

  // Créer des paramètres d'application par défaut
  const existingAppSettings = await prisma.appSettings.findFirst()

  if (!existingAppSettings) {
    await prisma.appSettings.create({
      data: {
        siteName: 'WindevExpert Platform',
        siteDescription: 'Plateforme de formation et services WindevExpert',
        maintenanceMode: false,
        tinymceApiKey: '6nttvh0omoqwmrzmitjepuyb3kpnwb1y9l50xlukhm0993ln'
      }
    })
    console.log('✅ Paramètres d\'application par défaut créés')
  } else {
    // Mettre à jour la clé API TinyMCE si elle n'est pas définie
    if (!existingAppSettings.tinymceApiKey) {
      await prisma.appSettings.update({
        where: { id: existingAppSettings.id },
        data: {
          tinymceApiKey: '6nttvh0omoqwmrzmitjepuyb3kpnwb1y9l50xlukhm0993ln'
        }
      })
      console.log('✅ Clé API TinyMCE mise à jour')
    }
    console.log('✅ Les paramètres d\'application existent déjà')
  }

  // Ajouter le contenu des pages
  await seedPageContent()

  // Ajouter les templates d'email
  await seedEmailTemplates()

  // Ajouter les cours
  await seedCourses()

  // Ajouter les projets
  await seedProjects()

  console.log('🎉 Seeding terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })