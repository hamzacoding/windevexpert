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

async function testSlickPayWithAuth() {
  console.log('🧪 Test de l\'API SlickPay avec authentification...\n');

  try {
    // 1. Obtenir le token CSRF
    console.log('1. Récupération du token CSRF...');
    const csrfOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/csrf',
      method: 'GET'
    };

    const csrfResponse = await makeRequest(csrfOptions);
    console.log(`   Status: ${csrfResponse.statusCode}`);
    
    if (csrfResponse.statusCode !== 200) {
      console.log('   ❌ Impossible d\'obtenir le token CSRF');
      return;
    }

    const csrfData = JSON.parse(csrfResponse.body);
    const csrfToken = csrfData.csrfToken;
    console.log(`   ✅ Token CSRF obtenu: ${csrfToken.substring(0, 20)}...`);

    // 2. Connexion avec credentials
    console.log('\n2. Connexion avec credentials...');
    const loginData = new URLSearchParams({
      email: 'admin@windevexpert.com',
      password: 'Admin123!',
      csrfToken: csrfToken,
      callbackUrl: 'http://localhost:3000',
      json: 'true'
    }).toString();

    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`   Status: ${loginResponse.statusCode}`);
    
    // Extraire les cookies de session
    const cookies = loginResponse.headers['set-cookie'] || [];
    const cookieHeader = cookies.join('; ');
    console.log(`   Cookies reçus: ${cookies.length > 0 ? 'Oui' : 'Non'}`);

    if (loginResponse.statusCode === 200) {
      const loginResult = JSON.parse(loginResponse.body);
      console.log(`   ✅ Connexion réussie: ${loginResult.url ? 'Redirection configurée' : 'Pas de redirection'}`);
    }

    // 3. Test de l'API SlickPay avec session
    console.log('\n3. Test de l\'API SlickPay...');
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
      console.log(`      - Success: ${responseData.success}`);
      console.log(`      - Invoice ID: ${responseData.invoice?.id}`);
      console.log(`      - Payment URL: ${responseData.slickpay?.payment_url ? 'Présente' : 'Manquante'}`);
      console.log(`      - Payment ID: ${responseData.slickpay?.payment_id || 'Non défini'}`);
    } else {
      console.log('   ❌ Erreur:');
      try {
        const errorData = JSON.parse(paymentResponse.body);
        console.log(`      ${JSON.stringify(errorData, null, 2)}`);
      } catch {
        console.log(`      ${paymentResponse.body}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testSlickPayWithAuth();