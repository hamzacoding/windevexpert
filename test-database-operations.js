const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tests des opérations de base de données
async function testDatabaseOperations() {
  console.log('🗄️ Test des opérations de base de données...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Helper pour enregistrer les résultats
  function logTest(name, success, details) {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (details) console.log(`   ${details}`);
    
    results.tests.push({ name, success, details });
    if (success) results.passed++;
    else results.failed++;
  }

  try {
    // 1. Test de connexion à la base de données
    console.log('🔌 1. Test de connexion...');
    try {
      await prisma.$connect();
      logTest('Connexion à la base de données', true, 'Connexion établie avec succès');
    } catch (e) {
      logTest('Connexion à la base de données', false, `Erreur: ${e.message}`);
      return results;
    }

    // 2. Test des modèles User
    console.log('\n👤 2. Tests du modèle User...');
    
    try {
      const userCount = await prisma.user.count();
      logTest('Comptage des utilisateurs', true, `${userCount} utilisateurs trouvés`);
      
      if (userCount > 0) {
        const firstUser = await prisma.user.findFirst();
        logTest('Récupération d\'un utilisateur', !!firstUser, 
          firstUser ? `Utilisateur: ${firstUser.email}` : 'Aucun utilisateur trouvé');
      }
    } catch (e) {
      logTest('Tests du modèle User', false, `Erreur: ${e.message}`);
    }

    // 3. Test des modèles Product
    console.log('\n📦 3. Tests du modèle Product...');
    
    try {
      const productCount = await prisma.product.count();
      logTest('Comptage des produits', true, `${productCount} produits trouvés`);
      
      if (productCount > 0) {
        const products = await prisma.product.findMany({
          take: 5,
          include: {
            category: true
          }
        });
        logTest('Récupération des produits avec catégories', products.length > 0, 
          `${products.length} produits récupérés avec leurs catégories`);
      }
    } catch (e) {
      logTest('Tests du modèle Product', false, `Erreur: ${e.message}`);
    }

    // 4. Test des modèles Category
    console.log('\n📂 4. Tests du modèle Category...');
    
    try {
      const categoryCount = await prisma.category.count();
      logTest('Comptage des catégories', true, `${categoryCount} catégories trouvées`);
      
      if (categoryCount > 0) {
        const categoriesWithProducts = await prisma.category.findMany({
          include: {
            _count: {
              select: { products: true }
            }
          }
        });
        logTest('Récupération des catégories avec comptage des produits', 
          categoriesWithProducts.length > 0, 
          `${categoriesWithProducts.length} catégories avec comptage`);
      }
    } catch (e) {
      logTest('Tests du modèle Category', false, `Erreur: ${e.message}`);
    }

    // 5. Test des modèles Course
    console.log('\n🎓 5. Tests du modèle Course...');
    
    try {
      const courseCount = await prisma.course.count();
      logTest('Comptage des formations', true, `${courseCount} formations trouvées`);
      
      if (courseCount > 0) {
        const courses = await prisma.course.findMany({
          take: 3,
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        });
        logTest('Récupération des formations avec produits et catégories', courses.length > 0, 
          `${courses.length} formations récupérées`);
      }
    } catch (e) {
      logTest('Tests du modèle Course', false, `Erreur: ${e.message}`);
    }

    // 6. Test des modèles Cart
    console.log('\n🛒 6. Tests du modèle Cart...');
    
    try {
      const cartCount = await prisma.cart.count();
      logTest('Comptage des paniers', true, `${cartCount} paniers trouvés`);
      
      // Test de création d'un panier temporaire
      const testCart = await prisma.cart.create({
        data: {
          sessionId: `test_${Date.now()}`,
          total: 0
        }
      });
      logTest('Création d\'un panier de test', !!testCart, 
        `Panier créé avec ID: ${testCart.id}`);
      
      // Nettoyage
      await prisma.cart.delete({ where: { id: testCart.id } });
      logTest('Suppression du panier de test', true, 'Panier supprimé avec succès');
      
    } catch (e) {
      logTest('Tests du modèle Cart', false, `Erreur: ${e.message}`);
    }

    // 7. Test des modèles Order
    console.log('\n📋 7. Tests du modèle Order...');
    
    try {
      const orderCount = await prisma.order.count();
      logTest('Comptage des commandes', true, `${orderCount} commandes trouvées`);
      
      if (orderCount > 0) {
        const orders = await prisma.order.findMany({
          take: 3,
          include: {
            items: true,
            user: true
          }
        });
        logTest('Récupération des commandes avec détails', orders.length > 0, 
          `${orders.length} commandes avec détails récupérées`);
      }
    } catch (e) {
      logTest('Tests du modèle Order', false, `Erreur: ${e.message}`);
    }

    // 8. Test des modèles SMTPSettings
    console.log('\n📧 8. Tests du modèle SMTPSettings...');
    
    try {
      const smtpCount = await prisma.sMTPSettings.count();
      logTest('Comptage des configurations SMTP', true, `${smtpCount} configurations SMTP trouvées`);
      
      if (smtpCount > 0) {
        const smtpSettings = await prisma.sMTPSettings.findFirst();
        logTest('Récupération d\'une configuration SMTP', !!smtpSettings, 
          smtpSettings ? `Host: ${smtpSettings.host}` : 'Aucune configuration trouvée');
      }
    } catch (e) {
      logTest('Tests du modèle SMTPSettings', false, `Erreur: ${e.message}`);
    }

    // 9. Test des modèles AppSettings
    console.log('\n⚙️ 9. Tests du modèle AppSettings...');
    
    try {
      const appSettingsCount = await prisma.appSettings.count();
      logTest('Comptage des paramètres d\'application', true, `${appSettingsCount} paramètres trouvés`);
      
      if (appSettingsCount > 0) {
        const appSettings = await prisma.appSettings.findFirst();
        logTest('Récupération des paramètres d\'application', !!appSettings, 
          appSettings ? `Nom du site: ${appSettings.siteName}` : 'Aucun paramètre trouvé');
      }
    } catch (e) {
      logTest('Tests du modèle AppSettings', false, `Erreur: ${e.message}`);
    }

    // 10. Test des relations complexes
    console.log('\n🔗 10. Tests des relations complexes...');
    
    try {
      // Test relation User -> Orders -> OrderItems
      const usersWithOrders = await prisma.user.findMany({
        where: {
          orders: {
            some: {}
          }
        },
        include: {
          orders: {
            include: {
              items: true
            }
          }
        },
        take: 2
      });
      logTest('Relations User -> Orders -> OrderItems', usersWithOrders.length >= 0, 
        `${usersWithOrders.length} utilisateurs avec commandes trouvés`);
      
      // Test relation Category -> Products -> CartItems
      const categoriesWithProductsInCarts = await prisma.category.findMany({
        where: {
          products: {
            some: {
              cartItems: {
                some: {}
              }
            }
          }
        },
        include: {
          products: {
            include: {
              cartItems: true
            }
          }
        },
        take: 2
      });
      logTest('Relations Category -> Products -> CartItems', categoriesWithProductsInCarts.length >= 0, 
        `${categoriesWithProductsInCarts.length} catégories avec produits dans des paniers`);
      
    } catch (e) {
      logTest('Tests des relations complexes', false, `Erreur: ${e.message}`);
    }

    // 11. Test des requêtes d'agrégation
    console.log('\n📊 11. Tests des requêtes d\'agrégation...');
    
    try {
      const stats = await prisma.product.aggregate({
        _count: { id: true },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true }
      });
      logTest('Agrégation des prix des produits', !!stats, 
        `Prix moyen: ${stats._avg.price?.toFixed(2) || 0}€, Min: ${stats._min.price || 0}€, Max: ${stats._max.price || 0}€`);
      
      const orderStats = await prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true }
      });
      logTest('Groupement des commandes par statut', orderStats.length >= 0, 
        `${orderStats.length} statuts de commandes différents`);
      
    } catch (e) {
      logTest('Tests des requêtes d\'agrégation', false, `Erreur: ${e.message}`);
    }

    // 12. Test des transactions
    console.log('\n💳 12. Tests des transactions...');
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Créer un utilisateur de test
        const testUser = await tx.user.create({
          data: {
            email: `test_${Date.now()}@example.com`,
            name: 'Test User',
            password: 'hashedpassword'
          }
        });
        
        // Créer un panier pour cet utilisateur
        const testCart = await tx.cart.create({
          data: {
            user: {
              connect: { id: testUser.id }
            },
            total: 0
          }
        });
        
        return { user: testUser, cart: testCart };
      });
      
      logTest('Transaction de création User + Cart', !!result, 
        `Utilisateur ${result.user.email} et panier ${result.cart.id} créés`);
      
      // Nettoyage
      await prisma.cart.delete({ where: { id: result.cart.id } });
      await prisma.user.delete({ where: { id: result.user.id } });
      logTest('Nettoyage des données de test', true, 'Données supprimées avec succès');
      
    } catch (e) {
      logTest('Tests des transactions', false, `Erreur: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  // Résumé final
  console.log('\n📊 Résumé des tests de base de données:');
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Tests échoués:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎉 Test des opérations de base de données terminé !');
  return results;
}

// Exécution du test
if (require.main === module) {
  testDatabaseOperations().catch(console.error);
}

module.exports = { testDatabaseOperations };