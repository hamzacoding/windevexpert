const http = require('http');

// Fonction pour faire une requête HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testSlickPayPayment() {
  console.log('🧪 Test du processus de paiement SlickPay...\n');

  try {
    // 1. Test de connexion avec l'utilisateur admin
    console.log('1. Test de connexion...');
    const loginData = JSON.stringify({
      email: 'admin@windevexpert.com',
      password: 'Admin123!'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`   Status: ${loginResponse.statusCode}`);
    
    // Extraire les cookies de session
    const cookies = loginResponse.headers['set-cookie'] || [];
    const cookieHeader = cookies.join('; ');
    console.log(`   Cookies reçus: ${cookies.length > 0 ? 'Oui' : 'Non'}`);

    // 2. Test de l'API SlickPay avec l'utilisateur connecté
    console.log('\n2. Test de l\'API SlickPay...');
    const paymentData = JSON.stringify({
      formationId: '1',
      amount: 15000,
      currency: 'DZD'
    });

    const paymentOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/payments/slickpay',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(paymentData),
        'Cookie': cookieHeader
      }
    };

    const paymentResponse = await makeRequest(paymentOptions, paymentData);
    console.log(`   Status: ${paymentResponse.statusCode}`);
    
    if (paymentResponse.statusCode === 200) {
      const responseData = JSON.parse(paymentResponse.body);
      console.log('   ✅ Réponse SlickPay:');
      console.log(`      - Invoice ID: ${responseData.invoice?.id}`);
      console.log(`      - Payment URL: ${responseData.slickpay?.payment_url ? 'Présente' : 'Manquante'}`);
      console.log(`      - Payment ID: ${responseData.slickpay?.payment_id || 'Non défini'}`);
    } else {
      console.log('   ❌ Erreur:');
      console.log(`      ${paymentResponse.body}`);
    }

    // 3. Test des paramètres de paiement
    console.log('\n3. Vérification des paramètres SlickPay...');
    const settingsOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/payment-settings',
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      }
    };

    const settingsResponse = await makeRequest(settingsOptions);
    console.log(`   Status: ${settingsResponse.statusCode}`);
    
    if (settingsResponse.statusCode === 200) {
      const settings = JSON.parse(settingsResponse.body);
      console.log('   ✅ Configuration SlickPay:');
      console.log(`      - Activé: ${settings.slickPayEnabled ? 'Oui' : 'Non'}`);
      console.log(`      - Clé publique: ${settings.slickPayPublicKey ? 'Configurée' : 'Manquante'}`);
      console.log(`      - Mode test: ${settings.slickPayTestMode ? 'Oui' : 'Non'}`);
    } else {
      console.log('   ❌ Impossible de récupérer les paramètres');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testSlickPayPayment();