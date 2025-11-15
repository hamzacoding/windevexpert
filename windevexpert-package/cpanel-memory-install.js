#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Installation optimisée pour cPanel (Mémoire limitée)');
console.log('====================================================');

// Détection automatique des chemins Node.js et npm sur cPanel
let NODE_PATH = 'node';
let NPM_PATH = 'npm';

function detectNodePaths() {
  console.log('🔍 Détection des chemins Node.js et npm...');
  
  // Chemins typiques sur cPanel
  const possibleNodePaths = [
    '/opt/cpanel/ea-nodejs18/bin/node',
    '/opt/cpanel/ea-nodejs20/bin/node',
    '/opt/cpanel/ea-nodejs*/bin/node',
    '/usr/local/nodejs/bin/node',
    'node'
  ];
  
  for (const nodePath of possibleNodePaths) {
    try {
      if (nodePath.includes('*')) {
        // Skip wildcard paths for now
        continue;
      }
      
      if (fs.existsSync(nodePath) || nodePath === 'node') {
        try {
          execSync(`${nodePath} --version`, { stdio: 'pipe' });
          NODE_PATH = nodePath;
          
          // Déduire le chemin npm du chemin node
          if (nodePath !== 'node') {
            const npmPath = nodePath.replace('/node', '/npm');
            if (fs.existsSync(npmPath)) {
              NPM_PATH = npmPath;
            }
          }
          
          console.log(`✅ Node.js trouvé: ${NODE_PATH}`);
          console.log(`✅ npm trouvé: ${NPM_PATH}`);
          return true;
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback: essayer de trouver npm via which
  try {
    NPM_PATH = execSync('which npm', { encoding: 'utf8' }).trim();
    console.log(`✅ npm trouvé via which: ${NPM_PATH}`);
    return true;
  } catch (error) {
    console.log('⚠️ npm non trouvé dans PATH, utilisation des chemins par défaut');
    return false;
  }
}

// Configuration pour économiser la mémoire
const MEMORY_SAFE_OPTIONS = {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=512',
    NPM_CONFIG_FUND: 'false',
    NPM_CONFIG_AUDIT: 'false',
    NPM_CONFIG_PROGRESS: 'false'
  }
};

// Fonction pour exécuter une commande avec gestion mémoire
function runMemorySafeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // Remplacer npm par le chemin détecté
    if (command === 'npm') {
      command = NPM_PATH;
    } else if (command === 'node') {
      command = NODE_PATH;
    }
    
    console.log(`📝 Exécution: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      ...MEMORY_SAFE_OPTIONS,
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

// Installation par groupes pour économiser la mémoire
const DEPENDENCY_GROUPS = [
  // Groupe 1: Core dependencies
  ['next', 'react', 'react-dom'],
  // Groupe 2: Prisma
  ['prisma', '@prisma/client'],
  // Groupe 3: UI Components
  ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label'],
  // Groupe 4: Utilities
  ['clsx', 'tailwind-merge', 'class-variance-authority'],
  // Groupe 5: Authentication & Payment
  ['next-auth', 'stripe', 'bcryptjs'],
  // Groupe 6: Development tools
  ['typescript', '@types/node', '@types/react']
];

// Fonction principale d'installation
async function memoryOptimizedInstall() {
  try {
    console.log('🔍 Vérification de l\'environnement...');
    
    // Détecter les chemins Node.js et npm
    detectNodePaths();
    
    // Vérifier si package.json existe
    if (!fs.existsSync('package.json')) {
      console.log('❌ package.json non trouvé');
      process.exit(1);
    }

    // Nettoyer le cache npm pour libérer de la mémoire
    console.log('🧹 Nettoyage du cache npm...');
    try {
      await runMemorySafeCommand('npm', ['cache', 'clean', '--force']);
    } catch (error) {
      console.log('⚠️ Impossible de nettoyer le cache, continuation...');
    }

    // Installation par groupes
    console.log('📦 Installation des dépendances par groupes...');
    
    for (let i = 0; i < DEPENDENCY_GROUPS.length; i++) {
      const group = DEPENDENCY_GROUPS[i];
      console.log(`\n📋 Groupe ${i + 1}/${DEPENDENCY_GROUPS.length}: ${group.join(', ')}`);
      
      try {
        await runMemorySafeCommand('npm', ['install', '--no-fund', '--no-audit', ...group]);
        console.log(`✅ Groupe ${i + 1} installé avec succès`);
        
        // Pause entre les groupes pour libérer la mémoire
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`⚠️ Erreur dans le groupe ${i + 1}, tentative d'installation individuelle...`);
        
        // Installation individuelle en cas d'échec du groupe
        for (const pkg of group) {
          try {
            await runMemorySafeCommand('npm', ['install', '--no-fund', '--no-audit', pkg]);
            console.log(`✅ ${pkg} installé individuellement`);
          } catch (pkgError) {
            console.log(`❌ Impossible d'installer ${pkg}: ${pkgError.message}`);
          }
        }
      }
    }

    // Installation des dépendances restantes
    console.log('\n📦 Installation des dépendances restantes...');
    try {
      await runMemorySafeCommand('npm', ['install', '--no-fund', '--no-audit', '--production']);
    } catch (error) {
      console.log('⚠️ Installation production échouée, tentative normale...');
      await runMemorySafeCommand('npm', ['install', '--no-fund', '--no-audit']);
    }

    // Génération de Prisma
    console.log('\n🔧 Configuration de Prisma...');
    try {
      // Essayer d'abord avec le chemin direct vers Prisma
      await runMemorySafeCommand('node', ['node_modules/.bin/prisma', 'generate']);
      console.log('✅ Prisma généré avec succès');
    } catch (error) {
      console.log('⚠️ Erreur Prisma avec node, tentative avec npx...');
      try {
        await runMemorySafeCommand('npx', ['prisma', 'generate']);
        console.log('✅ Prisma généré avec npx');
      } catch (npxError) {
        console.log('❌ Impossible de générer Prisma avec npx et node');
        console.log('💡 Vous devrez exécuter manuellement: node node_modules/.bin/prisma generate');
      }
    }

    console.log('\n🎉 Installation terminée avec succès !');
    console.log('📋 Prochaines étapes:');
    console.log('   1. Configurez votre fichier .env');
    console.log('   2. Exécutez les migrations Prisma');
    console.log('   3. Démarrez l\'application');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    console.log('\n🔧 Solutions alternatives:');
    console.log('   1. Contactez votre hébergeur pour augmenter la limite mémoire');
    console.log('   2. Utilisez l\'installateur web: /installer');
    console.log('   3. Installez manuellement les dépendances critiques uniquement');
    process.exit(1);
  }
}

// Démarrage du script
memoryOptimizedInstall();