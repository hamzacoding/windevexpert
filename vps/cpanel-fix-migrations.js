#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Correction des migrations Prisma pour cPanel');
console.log('=================================================');

// Fonction pour exécuter une commande
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📝 Exécution: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Commande réussie: ${command}`);
        resolve();
      } else {
        console.log(`❌ Erreur dans la commande: ${command} (code: ${code})`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ Erreur d'exécution: ${error.message}`);
      reject(error);
    });
  });
}

// Fonction principale
async function fixMigrations() {
  try {
    // Vérifier si le dossier node_modules existe
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('❌ node_modules non trouvé.');
      console.log('🚀 Lancement de l\'installation optimisée pour cPanel...');
      
      // Lancer l'installation optimisée mémoire
      try {
        await runCommand('node', ['cpanel-memory-install.js']);
        console.log('✅ Installation terminée, reprise des migrations...');
      } catch (installError) {
        console.log('❌ Erreur d\'installation:', installError.message);
        console.log('\n🔧 Solutions alternatives:');
        console.log('1. Utilisez l\'installateur web: /installer');
        console.log('2. Contactez votre hébergeur pour augmenter la limite mémoire');
        console.log('3. Installez manuellement: npm install --no-fund --no-audit');
        process.exit(1);
      }
    }

    // Vérifier si Prisma est installé
    const prismaPath = path.join(nodeModulesPath, '.bin', 'prisma');
    const prismaBinExists = fs.existsSync(prismaPath) || fs.existsSync(prismaPath + '.cmd');

    if (prismaBinExists) {
      console.log('✅ Prisma trouvé dans node_modules/.bin/');
      
      // Utiliser directement le chemin complet vers Prisma (compatible cPanel)
      const prismaExecutable = path.join('node_modules', '.bin', 'prisma');
      
      try {
        console.log('🔄 Génération du client Prisma...');
        await runCommand('node', [prismaExecutable, 'generate']);
        console.log('✅ Client Prisma généré avec succès');
        
        console.log('🔄 Synchronisation de la base de données...');
        await runCommand('node', [prismaExecutable, 'db', 'push']);
        console.log('✅ Base de données synchronisée avec succès');
      } catch (error) {
        console.log('⚠️  Tentative avec chemin alternatif...');
        
        // Fallback: essayer avec le chemin Windows (.cmd)
        const prismaCmd = path.join('node_modules', '.bin', 'prisma.cmd');
        if (fs.existsSync(prismaCmd)) {
          await runCommand('node', [prismaCmd, 'generate']);
          console.log('✅ Client Prisma généré avec .cmd');
          
          await runCommand('node', [prismaCmd, 'db', 'push']);
          console.log('✅ Base de données synchronisée avec .cmd');
        } else {
          throw error;
        }
      }
    } else {
      console.log('❌ Prisma non trouvé. Veuillez vérifier l\'installation.');
      process.exit(1);
    }

    console.log('🎉 Migrations Prisma corrigées avec succès !');
    console.log('📝 Vous pouvez maintenant continuer l\'installation.');

  } catch (error) {
    console.error('❌ Erreur lors de la correction des migrations:', error.message);
    console.log('\n🔧 Solutions alternatives:');
    console.log('1. Vérifiez que Node.js est correctement configuré dans cPanel');
    console.log('2. Essayez de redémarrer l\'application Node.js');
    console.log('3. Contactez votre hébergeur pour vérifier la configuration npm/npx');
    process.exit(1);
  }
}

// Exécuter le script
fixMigrations();