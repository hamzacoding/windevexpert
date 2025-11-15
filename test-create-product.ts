import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCreateProduct() {
  try {
    console.log('🔍 Vérification de la connexion à la base de données...')
    
    // Vérifier les catégories existantes
    const categories = await prisma.category.findMany()
    console.log(`📁 Catégories trouvées: ${categories.length}`)
    
    if (categories.length === 0) {
      console.log('❌ Aucune catégorie trouvée. Impossible de créer un produit.')
      return
    }
    
    const defaultCategory = categories[0]
    console.log(`📁 Utilisation de la catégorie: ${defaultCategory.name}`)
    
    // Créer un produit de test avec seulement les champs obligatoires
    console.log('🛠️ Création d\'un produit de test...')
    
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'Description complète du produit de test pour vérifier que tout fonctionne correctement.',
        price: 29.99,
        type: 'SOFTWARE',
        categoryId: defaultCategory.id
      }
    })
    
    console.log('✅ Produit créé avec succès!')
    console.log(`📦 ID: ${testProduct.id}`)
    console.log(`📦 Nom: ${testProduct.name}`)
    console.log(`📦 Slug: ${testProduct.slug}`)
    console.log(`📦 Prix: ${testProduct.price}€`)
    
    // Vérifier le nombre total de produits
    const totalProducts = await prisma.product.count()
    console.log(`📊 Total de produits dans la base: ${totalProducts}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateProduct()