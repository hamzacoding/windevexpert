import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllProducts() {
  try {
    console.log('🗑️ Suppression de tous les produits existants...');
    
    const count = await prisma.product.count();
    console.log(`📊 Nombre de produits à supprimer: ${count}`);
    
    // Supprimer d'abord les enregistrements liés dans l'ordre correct
    console.log('🔗 Suppression des enregistrements liés...');
    
    // Supprimer les éléments de panier
    const cartItems = await prisma.cartItem.deleteMany({});
    console.log(`✅ ${cartItems.count} éléments de panier supprimés`);
    
    // Supprimer les éléments de commande
    const orderItems = await prisma.orderItem.deleteMany({});
    console.log(`✅ ${orderItems.count} éléments de commande supprimés`);
    
    // Supprimer les avis
    const reviews = await prisma.review.deleteMany({});
    console.log(`✅ ${reviews.count} avis supprimés`);
    
    // Supprimer les progrès des leçons
    const progress = await prisma.progress.deleteMany({});
    console.log(`✅ ${progress.count} progrès supprimés`);
    
    // Supprimer les inscriptions aux cours
    const enrollments = await prisma.enrollment.deleteMany({});
    console.log(`✅ ${enrollments.count} inscriptions supprimées`);
    
    // Supprimer les leçons
    const lessons = await prisma.lesson.deleteMany({});
    console.log(`✅ ${lessons.count} leçons supprimées`);
    
    // Supprimer les cours liés aux produits
    const courses = await prisma.course.deleteMany({});
    console.log(`✅ ${courses.count} cours supprimés`);
    
    // Maintenant supprimer tous les produits
    console.log('📦 Suppression des produits...');
    const result = await prisma.product.deleteMany({});
    
    console.log(`✅ ${result.count} produits supprimés avec succès!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProducts();