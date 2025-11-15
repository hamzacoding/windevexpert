import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testGenerate() {
  try {
    console.log('🔍 Test de génération de produit...')
    
    // Vérifier les catégories
    const categories = await prisma.category.findMany()
    console.log('📁 Catégories trouvées:', categories.length)
    
    if (categories.length === 0) {
      console.log('❌ Aucune catégorie trouvée!')
      return
    }
    
    const defaultCategory = categories[0]
    console.log('📁 Utilisation de la catégorie:', defaultCategory.name)
    
    // Créer un produit simple
    const productData = {
      name: 'Test Product Simple',
      slug: `test-product-simple-${Date.now()}`,
      tagline: 'Test tagline',
      shortDescription: 'Test description courte',
      description: 'Test description complète',
      price: 29.99,
      priceDA: 4000,
      isFree: false,
      trialPeriod: 14,
      appType: 'WEB_APP' as const,
      type: 'SOFTWARE' as const,
      status: 'ACTIVE' as const,
      license: 'MIT',
      logo: '/images/products/test.svg',
      screenshots: JSON.stringify(['/images/products/test.svg']),
      features: JSON.stringify(['Feature 1', 'Feature 2']),
      keyBenefits: JSON.stringify(['Benefit 1', 'Benefit 2']),
      technologies: JSON.stringify(['WinDev', 'HFSQL']),
      compatibility: JSON.stringify(['Windows 10+']),
      languages: JSON.stringify(['Français']),
      requirements: JSON.stringify(['Windows 10+', 'RAM 4GB']),
      supportTypes: JSON.stringify(['Email']),
      documentation: 'Documentation test',
      updatePolicy: 'Mises à jour gratuites',
      paymentMethods: JSON.stringify(['Carte bancaire']),
      hosting: 'Cloud',
      termsOfUse: 'Conditions test',
      privacyPolicy: 'Politique test',
      categoryId: defaultCategory.id
    }
    
    console.log('🛠️ Création du produit...')
    console.log('📦 Données du produit:', JSON.stringify(productData, null, 2))
    
    const product = await prisma.product.create({
      data: productData
    })
    
    console.log('✅ Produit créé avec succès!')
    console.log('📦 ID:', product.id)
    console.log('📦 Nom:', product.name)
    
    // Vérifier le total
    const total = await prisma.product.count()
    console.log('📊 Total de produits dans la base:', total)
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGenerate()