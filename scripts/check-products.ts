import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 Vérification des produits en base de données...\n')
    
    // Compter le total des produits
    const totalProducts = await prisma.product.count()
    console.log(`📦 Total des produits: ${totalProducts}`)
    
    // Compter par type
    const productsByType = await prisma.product.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })
    
    console.log('\n📊 Répartition par type:')
    productsByType.forEach(group => {
      console.log(`- ${group.type}: ${group._count.type} produits`)
    })
    
    // Afficher quelques exemples
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        type: true,
        price: true,
        priceDA: true,
        description: true
      }
    })
    
    console.log('\n🎯 Exemples de produits créés:')
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Type: ${product.type}`)
      console.log(`   Prix: ${product.price}€ / ${product.priceDA} DA`)
      console.log(`   Description: ${product.description}`)
      console.log('')
    })
    
    // Vérifier les prix
    const priceStats = await prisma.product.aggregate({
      _min: { price: true, priceDA: true },
      _max: { price: true, priceDA: true },
      _avg: { price: true, priceDA: true }
    })
    
    console.log('💰 Statistiques des prix:')
    console.log(`- Prix EUR: Min ${priceStats._min.price}€, Max ${priceStats._max.price}€, Moyenne ${Math.round(priceStats._avg.price || 0)}€`)
    console.log(`- Prix DA: Min ${priceStats._min.priceDA} DA, Max ${priceStats._max.priceDA} DA, Moyenne ${Math.round(priceStats._avg.priceDA || 0)} DA`)
    
    console.log('\n✅ Vérification terminée!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()