import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const count = await prisma.product.count();
    console.log('Nombre de produits:', count);
    
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        slug: true,
        logo: true,
        screenshots: true,
        appType: true
      }
    });
    
    console.log('Premiers produits:', products);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();