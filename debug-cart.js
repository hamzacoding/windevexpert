const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugCart() {
  try {
    console.log('=== DEBUG CART ===')
    
    // Check all carts
    const carts = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    console.log(`Found ${carts.length} carts:`)
    carts.forEach((cart, index) => {
      console.log(`\nCart ${index + 1}:`)
      console.log(`  ID: ${cart.id}`)
      console.log(`  User ID: ${cart.userId}`)
      console.log(`  Session ID: ${cart.sessionId}`)
      console.log(`  Total: ${cart.total}`)
      console.log(`  Items: ${cart.items.length}`)
      
      cart.items.forEach((item, itemIndex) => {
        console.log(`    Item ${itemIndex + 1}: ${item.product.name} (Qty: ${item.quantity}, Price: ${item.price})`)
      })
    })
    
    // Check all products
    const products = await prisma.product.findMany()
    console.log(`\nFound ${products.length} products in database`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCart()