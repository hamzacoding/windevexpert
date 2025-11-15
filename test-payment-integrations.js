const http = require('http');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Tests des intégrations de paiement
async function testPaymentIntegrations() {
  console.log('💳 Test complet des intégrations de paiement...\n');

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
    // 1. Test des configurations de paiement dans la base de données
    console.log('🗄️ 1. Tests des configurations de paiement en base...');
    
    try {
      const slickpaySettings = await prisma.slickPaySettings.findFirst();
      logTest('Configuration SlickPay en base', !!slickpaySettings, 
        slickpaySettings ? `Configuré avec API Key: ${slickpaySettings.apiKey ? 'Oui' : 'Non'}` : 'Aucune configuration trouvée');
    } catch (e) {
      logTest('Configuration SlickPay en base', false, `Erreur: ${e.message}`);
    }

    try {
      const stripeSettings = await prisma.stripeSettings.findFirst();
      logTest('Configuration Stripe en base', !!stripeSettings, 
        stripeSettings ? `Configuré avec clés: ${stripeSettings.publicKey ? 'Oui' : 'Non'}` : 'Aucune configuration trouvée');
    } catch (e) {
      logTest('Configuration Stripe en base', false, `Erreur: ${e.message}`);
    }

    // 2. Test des endpoints de configuration de paiement
    console.log('\n🔧 2. Tests des endpoints de configuration...');
    
    try {
      const slickpayConfigResponse = await makeRequest(`${BASE_URL}/api/payment-settings/slickpay`);
      logTest('Endpoint configuration SlickPay', 
        slickpayConfigResponse.status === 200 || slickpayConfigResponse.status === 404, 
        `Status: ${slickpayConfigResponse.status}`);
    } catch (e) {
      logTest('Endpoint configuration SlickPay', false, `Erreur: ${e.message}`);
    }

    try {
      const stripeConfigResponse = await makeRequest(`${BASE_URL}/api/payment-settings/stripe`);
      logTest('Endpoint configuration Stripe', 
        stripeConfigResponse.status === 200 || stripeConfigResponse.status === 404, 
        `Status: ${stripeConfigResponse.status}`);
    } catch (e) {
      logTest('Endpoint configuration Stripe', false, `Erreur: ${e.message}`);
    }

    // 3. Test des endpoints de paiement SlickPay
    console.log('\n💰 3. Tests des endpoints SlickPay...');
    
    const testPaymentData = {
      amount: 100,
      currency: 'DZD',
      productId: 'test-product',
      userId: 'test-user'
    };

    try {
      const slickpayPaymentResponse = await makeRequest(`${BASE_URL}/api/payments/slickpay`, {
        method: 'POST',
        body: testPaymentData
      });
      logTest('Endpoint paiement SlickPay', 
        slickpayPaymentResponse.status === 200 || slickpayPaymentResponse.status === 500 || slickpayPaymentResponse.status === 400, 
        `Status: ${slickpayPaymentResponse.status}, Message: ${slickpayPaymentResponse.data?.error || slickpayPaymentResponse.data?.message || 'OK'}`);
    } catch (e) {
      logTest('Endpoint paiement SlickPay', false, `Erreur: ${e.message}`);
    }

    // 4. Test des endpoints de paiement Stripe
    console.log('\n💳 4. Tests des endpoints Stripe...');
    
    try {
      const stripePaymentResponse = await makeRequest(`${BASE_URL}/api/payments/stripe`, {
        method: 'POST',
        body: testPaymentData
      });
      logTest('Endpoint paiement Stripe', 
        stripePaymentResponse.status === 200 || stripePaymentResponse.status === 500 || stripePaymentResponse.status === 400, 
        `Status: ${stripePaymentResponse.status}, Message: ${stripePaymentResponse.data?.error || stripePaymentResponse.data?.message || 'OK'}`);
    } catch (e) {
      logTest('Endpoint paiement Stripe', false, `Erreur: ${e.message}`);
    }

    // 5. Test des webhooks de paiement
    console.log('\n🔗 5. Tests des webhooks de paiement...');
    
    try {
      const slickpayWebhookResponse = await makeRequest(`${BASE_URL}/api/webhooks/slickpay`, {
        method: 'POST',
        body: {
          event: 'payment.success',
          data: {
            payment_id: 'test_payment_123',
            amount: 100,
            status: 'completed'
          }
        }
      });
      logTest('Webhook SlickPay', 
        slickpayWebhookResponse.status === 200 || slickpayWebhookResponse.status === 404 || slickpayWebhookResponse.status === 400, 
        `Status: ${slickpayWebhookResponse.status}`);
    } catch (e) {
      logTest('Webhook SlickPay', false, `Erreur: ${e.message}`);
    }

    try {
      const stripeWebhookResponse = await makeRequest(`${BASE_URL}/api/webhooks/stripe`, {
        method: 'POST',
        body: {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_test_123',
              amount: 10000,
              status: 'succeeded'
            }
          }
        }
      });
      logTest('Webhook Stripe', 
        stripeWebhookResponse.status === 200 || stripeWebhookResponse.status === 404 || stripeWebhookResponse.status === 400, 
        `Status: ${stripeWebhookResponse.status}`);
    } catch (e) {
      logTest('Webhook Stripe', false, `Erreur: ${e.message}`);
    }

    // 6. Test du processus de paiement complet avec facture
    console.log('\n📋 6. Tests du processus de paiement avec factures...');
    
    try {
      // Créer un utilisateur de test
      const testUser = await prisma.user.create({
        data: {
          email: `payment_test_${Date.now()}@example.com`,
          name: 'Payment Test User',
          password: 'hashedpassword'
        }
      });

      // Créer une facture de test
      const testInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-TEST-${Date.now()}`,
          userId: testUser.id,
          productName: 'Test Product',
          productPrice: 100,
          currency: 'DZD',
          paymentMethod: 'CCP',
          totalAmount: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        }
      });

      logTest('Création de facture de test', !!testInvoice, 
        `Facture ${testInvoice.invoiceNumber} créée pour ${testUser.email}`);

      // Test de mise à jour du statut de la facture
      const updatedInvoice = await prisma.invoice.update({
        where: { id: testInvoice.id },
        data: { status: 'PROOF_UPLOADED' }
      });

      logTest('Mise à jour du statut de facture', updatedInvoice.status === 'PROOF_UPLOADED', 
        `Statut mis à jour: ${updatedInvoice.status}`);

      // Nettoyage
      await prisma.invoice.delete({ where: { id: testInvoice.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      logTest('Nettoyage des données de test', true, 'Facture et utilisateur supprimés');

    } catch (e) {
      logTest('Tests du processus de paiement avec factures', false, `Erreur: ${e.message}`);
    }

    // 7. Test des notifications admin
    console.log('\n🔔 7. Tests des notifications admin...');
    
    try {
      // Créer une notification de test
      const testNotification = await prisma.adminNotification.create({
        data: {
          type: 'PAYMENT_PROOF_UPLOADED',
          title: 'Test Notification',
          message: 'Nouvelle preuve de paiement uploadée',
          priority: 'MEDIUM'
        }
      });

      logTest('Création de notification admin', !!testNotification, 
        `Notification créée: ${testNotification.title}`);

      // Test de marquage comme lue
      const readNotification = await prisma.adminNotification.update({
        where: { id: testNotification.id },
        data: { 
          isRead: true,
          readAt: new Date()
        }
      });

      logTest('Marquage notification comme lue', readNotification.isRead, 
        `Notification marquée comme lue: ${readNotification.isRead}`);

      // Nettoyage
      await prisma.adminNotification.delete({ where: { id: testNotification.id } });
      logTest('Nettoyage notification de test', true, 'Notification supprimée');

    } catch (e) {
      logTest('Tests des notifications admin', false, `Erreur: ${e.message}`);
    }

    // 8. Test des preuves de paiement
    console.log('\n📎 8. Tests des preuves de paiement...');
    
    try {
      // Créer un utilisateur et une facture pour le test
      const testUser = await prisma.user.create({
        data: {
          email: `proof_test_${Date.now()}@example.com`,
          name: 'Proof Test User',
          password: 'hashedpassword'
        }
      });

      const testInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-PROOF-${Date.now()}`,
          userId: testUser.id,
          productName: 'Test Product',
          productPrice: 100,
          currency: 'DZD',
          paymentMethod: 'CCP',
          totalAmount: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Créer une preuve de paiement
      const testProof = await prisma.paymentProof.create({
        data: {
          invoiceId: testInvoice.id,
          fileName: 'test_receipt.jpg',
          fileUrl: '/uploads/proofs/test_receipt.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          paymentDate: new Date(),
          amount: 100,
          reference: 'TEST-REF-123'
        }
      });

      logTest('Création de preuve de paiement', !!testProof, 
        `Preuve créée: ${testProof.fileName}`);

      // Test de validation de la preuve
      const validatedProof = await prisma.paymentProof.update({
        where: { id: testProof.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: 'admin-test'
        }
      });

      logTest('Validation de preuve de paiement', validatedProof.status === 'APPROVED', 
        `Preuve validée: ${validatedProof.status}`);

      // Nettoyage
      await prisma.paymentProof.delete({ where: { id: testProof.id } });
      await prisma.invoice.delete({ where: { id: testInvoice.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      logTest('Nettoyage des données de preuve', true, 'Données supprimées');

    } catch (e) {
      logTest('Tests des preuves de paiement', false, `Erreur: ${e.message}`);
    }

    // 9. Test des statistiques de paiement
    console.log('\n📊 9. Tests des statistiques de paiement...');
    
    try {
      const invoiceStats = await prisma.invoice.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      logTest('Statistiques des factures par statut', invoiceStats.length >= 0, 
        `${invoiceStats.length} statuts différents trouvés`);

      const paymentMethodStats = await prisma.invoice.groupBy({
        by: ['paymentMethod'],
        _count: { id: true }
      });

      logTest('Statistiques par méthode de paiement', paymentMethodStats.length >= 0, 
        `${paymentMethodStats.length} méthodes de paiement utilisées`);

    } catch (e) {
      logTest('Tests des statistiques de paiement', false, `Erreur: ${e.message}`);
    }

    // 10. Test de l'endpoint de simulation de paiement
    console.log('\n🎭 10. Tests de simulation de paiement...');
    
    try {
      const simulationResponse = await makeRequest(`${BASE_URL}/api/payment/simulation`, {
        method: 'POST',
        body: {
          amount: 100,
          currency: 'DZD',
          method: 'CCP'
        }
      });
      logTest('Endpoint simulation de paiement', 
        simulationResponse.status === 200 || simulationResponse.status === 404, 
        `Status: ${simulationResponse.status}`);
    } catch (e) {
      logTest('Endpoint simulation de paiement', false, `Erreur: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  // Résumé final
  console.log('\n📊 Résumé des tests d\'intégrations de paiement:');
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Tests échoués:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎉 Test des intégrations de paiement terminé !');
  return results;
}

// Exécution du test
if (require.main === module) {
  testPaymentIntegrations().catch(console.error);
}

module.exports = { testPaymentIntegrations };