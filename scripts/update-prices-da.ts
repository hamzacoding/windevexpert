import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePricesDA() {
  try {
    console.log('Mise à jour des prix en dinars...')
    
    // Taux de change approximatif : 1 EUR = 140 DZD
    const exchangeRate = 140
    
    // Récupérer tous les produits
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        priceDA: true
      }
    })
    
    console.log(`Trouvé ${products.length} produits`)
    
    // Mettre à jour les prix en dinars pour les produits qui n'en ont pas
    for (const product of products) {
      if (!product.priceDA) {
        const priceDA = Math.round(product.price * exchangeRate)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { priceDA }
        })
        
        console.log(`✅ ${product.name}: ${product.price}€ → ${priceDA} DA`)
      } else {
        console.log(`⏭️  ${product.name}: Prix DA déjà défini (${product.priceDA} DA)`)
      }
    }
    
    console.log('✅ Mise à jour terminée!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePricesDA()