const { PrismaClient } = require('@prisma/client')

async function checkProducts() {
  const prisma = new PrismaClient()
  
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true },
      take: 5
    })
    
    console.log('Products with slugs:')
    products.forEach(p => {
      console.log(`- ${p.name} -> /produits/${p.slug}`)
    })
    
    if (products.length > 0) {
      console.log(`\nTest URL: http://localhost:3000/produits/${products[0].slug}`)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()