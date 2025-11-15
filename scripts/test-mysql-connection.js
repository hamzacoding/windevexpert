const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Test de connexion MySQL...\n');

  // Configuration de test
  const configs = [
    {
      name: 'Sans mot de passe',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'windevexpert_user',
        database: 'windevexpert_platform'
      }
    },
    {
      name: 'Avec mot de passe vide',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'windevexpert_user',
        password: '',
        database: 'windevexpert_platform'
      }
    },
    {
      name: 'Utilisateur root',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'windevexpert_platform'
      }
    }
  ];

  for (const { name, config } of configs) {
    try {
      console.log(`📡 Test: ${name}`);
      console.log(`   Connexion: ${config.user}@${config.host}:${config.port}/${config.database}`);
      
      const connection = await mysql.createConnection(config);
      
      // Test simple
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log(`   ✅ Connexion réussie!`);
      
      // Vérifier les privilèges
      const [privileges] = await connection.execute('SHOW GRANTS');
      console.log(`   📋 Privilèges:`, privileges.map(p => Object.values(p)[0]).join(', '));
      
      await connection.end();
      
      // Si cette configuration fonctionne, mettre à jour le .env
      const dbUrl = config.password 
        ? `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`
        : `mysql://${config.user}@${config.host}:${config.port}/${config.database}`;
      
      console.log(`   🔧 URL de connexion: ${dbUrl}\n`);
      return dbUrl;
      
    } catch (error) {
      console.log(`   ❌ Échec: ${error.message}\n`);
    }
  }
  
  console.log('❌ Aucune configuration de connexion n\'a fonctionné.');
  console.log('\n📝 Suggestions:');
  console.log('1. Vérifiez que XAMPP MySQL est démarré');
  console.log('2. Vérifiez que la base "windevexpert_platform" existe');
  console.log('3. Vérifiez que l\'utilisateur "windevexpert_user" existe et a les bons privilèges');
  console.log('4. Essayez de vous connecter via phpMyAdmin pour vérifier');
  
  return null;
}

// Fonction pour créer l'utilisateur si nécessaire
async function createUserIfNeeded() {
  console.log('\n🔧 Tentative de création de l\'utilisateur...');
  
  try {
    // Essayer avec root
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    console.log('✅ Connexion root réussie');
    
    // Créer la base si elle n'existe pas
    await connection.execute('CREATE DATABASE IF NOT EXISTS windevexpert_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Base de données créée/vérifiée');
    
    // Créer l'utilisateur
    await connection.execute('CREATE USER IF NOT EXISTS \'windevexpert_user\'@\'localhost\'');
    console.log('✅ Utilisateur créé');
    
    // Donner tous les privilèges
    await connection.execute('GRANT ALL PRIVILEGES ON windevexpert_platform.* TO \'windevexpert_user\'@\'localhost\'');
    await connection.execute('FLUSH PRIVILEGES');
    console.log('✅ Privilèges accordés');
    
    await connection.end();
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur lors de la création: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Diagnostic de connexion MySQL pour WindevExpert Platform\n');
  
  // D'abord essayer les connexions existantes
  let workingUrl = await testConnection();
  
  if (!workingUrl) {
    // Si aucune ne fonctionne, essayer de créer l'utilisateur
    const created = await createUserIfNeeded();
    
    if (created) {
      console.log('\n🔄 Nouveau test après création de l\'utilisateur...');
      workingUrl = await testConnection();
    }
  }
  
  if (workingUrl) {
    console.log(`\n🎉 Configuration MySQL prête!`);
    console.log(`📝 Utilisez cette URL dans votre .env:`);
    console.log(`DATABASE_URL="${workingUrl}"`);
  } else {
    console.log('\n❌ Impossible de configurer MySQL automatiquement.');
    console.log('Veuillez configurer manuellement via phpMyAdmin.');
  }
}

main().catch(console.error);