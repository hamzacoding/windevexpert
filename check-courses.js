const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourses() {
  try {
    console.log('=== VÉRIFICATION DES FORMATIONS ===');
    
    // Compter toutes les formations
    const totalCourses = await prisma.course.count();
    console.log(`Total formations en base: ${totalCourses}`);
    
    // Compter les formations actives
    const activeCourses = await prisma.course.count({
      where: { isActive: true }
    });
    console.log(`Formations actives: ${activeCourses}`);
    
    // Lister toutes les formations
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n=== LISTE DES FORMATIONS ===');
    if (allCourses.length === 0) {
      console.log('Aucune formation trouvée en base de données');
    } else {
      allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (ID: ${course.id}) - Active: ${course.isActive} - Créée: ${course.createdAt.toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();