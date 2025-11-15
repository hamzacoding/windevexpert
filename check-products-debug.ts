import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        status: true
      }
    })
    
    console.log(`Nombre total de produits: ${products.length}`)
    
    if (products.length > 0) {
      console.log('\nProduits trouvés:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.slug}) - ${product.price}€ - Status: ${product.status}`)
      })
    } else {
      console.log('Aucun produit trouvé dans la base de données.')
    }
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()