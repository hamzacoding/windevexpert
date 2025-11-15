const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'admin@windevexpert.com',
  password: 'Admin123!'
};

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

// Tests des endpoints API
async function testAPIEndpoints() {
  console.log('🧪 Test complet des endpoints API...\n');

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
    // 1. Test de l'endpoint de santé/status
    console.log('📊 1. Tests des endpoints de base...');
    try {
      const healthCheck = await makeRequest(`${BASE_URL}/api/health`);
      logTest('Health Check', healthCheck.status === 200 || healthCheck.status === 404, 
        `Status: ${healthCheck.status}`);
    } catch (e) {
      logTest('Health Check', false, `Erreur: ${e.message}`);
    }

    // 2. Test des endpoints d'authentification
    console.log('\n🔐 2. Tests d\'authentification...');
    
    // Test login
    try {
      const loginResponse = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password,
          redirect: false
        }
      });
      logTest('Login API', loginResponse.status === 200 || loginResponse.status === 302, 
        `Status: ${loginResponse.status}`);
    } catch (e) {
      logTest('Login API', false, `Erreur: ${e.message}`);
    }

    // Test session
    try {
      const sessionResponse = await makeRequest(`${BASE_URL}/api/auth/session`);
      logTest('Session API', sessionResponse.status === 200, 
        `Status: ${sessionResponse.status}`);
    } catch (e) {
      logTest('Session API', false, `Erreur: ${e.message}`);
    }

    // 3. Test des endpoints produits
    console.log('\n📦 3. Tests des endpoints produits...');
    
    // Liste des produits
    try {
      const productsResponse = await makeRequest(`${BASE_URL}/api/products`);
      logTest('Liste des produits', productsResponse.status === 200, 
        `Status: ${productsResponse.status}, Produits: ${productsResponse.data?.length || 0}`);
    } catch (e) {
      logTest('Liste des produits', false, `Erreur: ${e.message}`);
    }

    // Catégories
    try {
      const categoriesResponse = await makeRequest(`${BASE_URL}/api/categories`);
      logTest('Liste des catégories', categoriesResponse.status === 200, 
        `Status: ${categoriesResponse.status}, Catégories: ${categoriesResponse.data?.length || 0}`);
    } catch (e) {
      logTest('Liste des catégories', false, `Erreur: ${e.message}`);
    }

    // 4. Test des endpoints formations
    console.log('\n🎓 4. Tests des endpoints formations...');
    
    try {
      const coursesResponse = await makeRequest(`${BASE_URL}/api/courses`);
      logTest('Liste des formations', coursesResponse.status === 200, 
        `Status: ${coursesResponse.status}, Formations: ${coursesResponse.data?.length || 0}`);
    } catch (e) {
      logTest('Liste des formations', false, `Erreur: ${e.message}`);
    }

    // 5. Test des endpoints panier
    console.log('\n🛒 5. Tests des endpoints panier...');
    
    const sessionId = `test_session_${Date.now()}`;
    
    try {
      const cartResponse = await makeRequest(`${BASE_URL}/api/cart?sessionId=${sessionId}`);
      logTest('Récupération du panier', cartResponse.status === 200, 
        `Status: ${cartResponse.status}`);
    } catch (e) {
      logTest('Récupération du panier', false, `Erreur: ${e.message}`);
    }

    // 6. Test des endpoints de paiement
    console.log('\n💳 6. Tests des endpoints de paiement...');
    
    // SlickPay settings
    try {
      const slickpayResponse = await makeRequest(`${BASE_URL}/api/payment-settings/slickpay`);
      logTest('Configuration SlickPay', slickpayResponse.status === 200 || slickpayResponse.status === 404, 
        `Status: ${slickpayResponse.status}`);
    } catch (e) {
      logTest('Configuration SlickPay', false, `Erreur: ${e.message}`);
    }

    // Stripe settings
    try {
      const stripeResponse = await makeRequest(`${BASE_URL}/api/payment-settings/stripe`);
      logTest('Configuration Stripe', stripeResponse.status === 200 || stripeResponse.status === 404, 
        `Status: ${stripeResponse.status}`);
    } catch (e) {
      logTest('Configuration Stripe', false, `Erreur: ${e.message}`);
    }

    // 7. Test des endpoints admin
    console.log('\n👨‍💼 7. Tests des endpoints admin...');
    
    // SMTP settings
    try {
      const smtpResponse = await makeRequest(`${BASE_URL}/api/admin/smtp-settings`);
      logTest('Configuration SMTP', smtpResponse.status === 200 || smtpResponse.status === 401, 
        `Status: ${smtpResponse.status}`);
    } catch (e) {
      logTest('Configuration SMTP', false, `Erreur: ${e.message}`);
    }

    // App settings
    try {
      const appSettingsResponse = await makeRequest(`${BASE_URL}/api/admin/app-settings`);
      logTest('Paramètres application', appSettingsResponse.status === 200 || appSettingsResponse.status === 401, 
        `Status: ${appSettingsResponse.status}`);
    } catch (e) {
      logTest('Paramètres application', false, `Erreur: ${e.message}`);
    }

    // 8. Test des endpoints de contenu
    console.log('\n📄 8. Tests des endpoints de contenu...');
    
    try {
      const pageContentResponse = await makeRequest(`${BASE_URL}/api/page-content`);
      logTest('Contenu des pages', pageContentResponse.status === 200, 
        `Status: ${pageContentResponse.status}`);
    } catch (e) {
      logTest('Contenu des pages', false, `Erreur: ${e.message}`);
    }

    // 9. Test des endpoints de recherche
    console.log('\n🔍 9. Tests des endpoints de recherche...');
    
    try {
      const searchResponse = await makeRequest(`${BASE_URL}/api/search?q=test`);
      logTest('Recherche', searchResponse.status === 200 || searchResponse.status === 404, 
        `Status: ${searchResponse.status}`);
    } catch (e) {
      logTest('Recherche', false, `Erreur: ${e.message}`);
    }

    // 10. Test des endpoints de statistiques
    console.log('\n📈 10. Tests des endpoints de statistiques...');
    
    try {
      const statsResponse = await makeRequest(`${BASE_URL}/api/admin/stats`);
      logTest('Statistiques', statsResponse.status === 200 || statsResponse.status === 401, 
        `Status: ${statsResponse.status}`);
    } catch (e) {
      logTest('Statistiques', false, `Erreur: ${e.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }

  // Résumé final
  console.log('\n📊 Résumé des tests API:');
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Tests échoués:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎉 Test des endpoints API terminé !');
  return results;
}

// Exécution du test
if (require.main === module) {
  testAPIEndpoints().catch(console.error);
}

module.exports = { testAPIEndpoints };