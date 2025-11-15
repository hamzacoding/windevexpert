import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPrices() {
  try {
    console.log('Vérification des prix des formations...')

    const courses = await prisma.course.findMany({
      include: {
        category: true
      }
    })

    console.log(`Trouvé ${courses.length} formations:`)

    courses.forEach((course) => {
      console.log(`\n📚 ${course.title}`)
      console.log(`   Prix EUR: ${course.price}€`)
      console.log(`   Prix DA: ${course.priceDA ?? 'N/A'} DA`)
      console.log(`   Catégorie: ${course.category?.name ?? 'Non catégorisé'}`)
    })
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPrices()