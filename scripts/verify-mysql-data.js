const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Vérification des données MySQL...\n');

  try {
    // Vérifier les utilisateurs
    const users = await prisma.user.findMany();
    console.log(`👥 Utilisateurs: ${users.length} trouvé(s)`);
    if (users.length > 0) {
      console.log(`   - Admin: ${users.find(u => u.role === 'ADMIN')?.email || 'Non trouvé'}`);
    }

    // Vérifier les catégories
    const categories = await prisma.category.findMany();
    console.log(`📂 Catégories: ${categories.length} trouvée(s)`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Vérifier les produits
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    console.log(`📦 Produits: ${products.length} trouvé(s)`);
    products.forEach(prod => {
      console.log(`   - ${prod.name} (${prod.category.name}) - ${prod.price}€`);
    });

    // Vérifier les paramètres SMTP
    const smtpSettings = await prisma.sMTPSettings.findMany();
    console.log(`📧 Paramètres SMTP: ${smtpSettings.length} trouvé(s)`);
    if (smtpSettings.length > 0) {
      console.log(`   - Host: ${smtpSettings[0].host}:${smtpSettings[0].port}`);
    }

    // Vérifier les paramètres d'application
    const appSettings = await prisma.appSettings.findMany();
    console.log(`⚙️ Paramètres d'app: ${appSettings.length} trouvé(s)`);
    if (appSettings.length > 0) {
      console.log(`   - Site: ${appSettings[0].siteName}`);
    }

    // Vérifier les templates d'email
    const emailTemplates = await prisma.emailTemplate.findMany();
    console.log(`📨 Templates d'email: ${emailTemplates.length} trouvé(s)`);
    emailTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.type})`);
    });

    // Vérifier les tables vides mais importantes
    const orders = await prisma.order.count();
    const courses = await prisma.course.count();
    const projects = await prisma.project.count();
    
    console.log(`\n📊 Autres tables:`);
    console.log(`   - Commandes: ${orders}`);
    console.log(`   - Cours: ${courses}`);
    console.log(`   - Projets: ${projects}`);

    // Test de connexion et performance
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - start;
    console.log(`\n⚡ Performance: Requête test en ${duration}ms`);

    console.log('\n✅ Vérification terminée avec succès!');
    console.log('🎉 La base de données MySQL est prête pour le développement!');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();