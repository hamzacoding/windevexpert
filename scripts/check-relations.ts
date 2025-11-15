import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRelations() {
  try {
    console.log('Vérification des relations formations-catégories...')

    const courses = await prisma.course.findMany({
      include: {
        category: true
      }
    })

    console.log(`\nFormations trouvées: ${courses.length}`)

    courses.forEach((course) => {
      console.log(`\n📚 Formation: ${course.title}`)
      console.log(`   ID Formation: ${course.id}`)
      console.log(`   Catégorie: ${course.category?.name ?? 'Non catégorisé'}`)
      console.log(`   Prix EUR: ${course.price}€`)
      console.log(`   Prix DA: ${course.priceDA ?? 'N/A'} DA`)
    })

    console.log('\n--- Produits existants (sans relation directe aux formations) ---')
    const products = await prisma.product.findMany()
    console.log(`Produits trouvés: ${products.length}`)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRelations()