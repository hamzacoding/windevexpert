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

async function testEmailWorkflows() {
  console.log('📧 Test des workflows d\'email et notifications...\n');

  try {
    // 1. Test de l'API de test d'email
    console.log('1. Test de l\'API de test d\'email...');
    const testEmailData = JSON.stringify({
      to: 'test@example.com',
      templateType: 'WELCOME',
      templateData: {
        userName: 'Test User',
        userEmail: 'test@example.com',
        siteUrl: 'http://localhost:3000'
      }
    });

    const testEmailOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testEmailData)
      }
    };

    const testEmailResponse = await makeRequest(testEmailOptions, testEmailData);
    console.log(`   Status: ${testEmailResponse.statusCode}`);
    
    if (testEmailResponse.statusCode === 200) {
      console.log('   ✅ API de test d\'email fonctionne');
    } else {
      console.log('   ❌ Erreur API de test d\'email:', testEmailResponse.body);
    }

    // 2. Test des templates d'email disponibles
    console.log('\n2. Vérification des templates d\'email...');
    const templatesOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/nimda/email-templates',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const templatesResponse = await makeRequest(templatesOptions);
    console.log(`   Status: ${templatesResponse.statusCode}`);
    
    if (templatesResponse.statusCode === 200) {
      const templates = JSON.parse(templatesResponse.body);
      console.log(`   ✅ ${templates.length} templates d'email trouvés`);
      templates.forEach(template => {
        console.log(`      - ${template.name} (${template.type})`);
      });
    } else {
      console.log('   ❌ Erreur récupération templates:', templatesResponse.body);
    }

    // 3. Test de configuration SMTP
    console.log('\n3. Test de la configuration SMTP...');
    const smtpTestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/nimda/smtp/test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const smtpTestResponse = await makeRequest(smtpTestOptions, '{}');
    console.log(`   Status: ${smtpTestResponse.statusCode}`);
    
    if (smtpTestResponse.statusCode === 200) {
      console.log('   ✅ Configuration SMTP valide');
    } else {
      console.log('   ⚠️  Configuration SMTP en mode développement (simulation)');
    }

    // 4. Test d'envoi d'email de bienvenue
    console.log('\n4. Test d\'envoi d\'email de bienvenue...');
    const welcomeEmailData = JSON.stringify({
      email: 'newuser@example.com',
      name: 'Nouvel Utilisateur'
    });

    const welcomeEmailOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/welcome-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(welcomeEmailData)
      }
    };

    const welcomeEmailResponse = await makeRequest(welcomeEmailOptions, welcomeEmailData);
    console.log(`   Status: ${welcomeEmailResponse.statusCode}`);
    
    if (welcomeEmailResponse.statusCode === 200) {
      console.log('   ✅ Email de bienvenue envoyé avec succès');
    } else {
      console.log('   ❌ Erreur envoi email de bienvenue:', welcomeEmailResponse.body);
    }

    // 5. Test d'email de réinitialisation de mot de passe
    console.log('\n5. Test d\'email de réinitialisation...');
    const resetEmailData = JSON.stringify({
      email: 'admin@windevexpert.com'
    });

    const resetEmailOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(resetEmailData)
      }
    };

    const resetEmailResponse = await makeRequest(resetEmailOptions, resetEmailData);
    console.log(`   Status: ${resetEmailResponse.statusCode}`);
    
    if (resetEmailResponse.statusCode === 200) {
      console.log('   ✅ Email de réinitialisation envoyé avec succès');
    } else {
      console.log('   ❌ Erreur envoi email de réinitialisation:', resetEmailResponse.body);
    }

    console.log('\n📧 Tests des workflows d\'email terminés!');
    console.log('\n📝 Résumé:');
    console.log('   - Les emails sont en mode simulation (développement)');
    console.log('   - Vérifiez les logs de la console du serveur pour voir les emails simulés');
    console.log('   - Configurez SMTP_HOST, SMTP_USER, SMTP_PASS pour les vrais envois');

  } catch (error) {
    console.error('❌ Erreur lors des tests d\'email:', error.message);
  }
}

// Exécuter les tests
testEmailWorkflows();