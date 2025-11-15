#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Création du package de déploiement final WinDevExpert...\n');

const rootDir = __dirname;
const packageDir = path.join(rootDir, 'windevexpert-package');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version || '1.0.0';

// Vérifier que le package existe
if (!fs.existsSync(packageDir)) {
    console.error('❌ Le package windevexpert-package n\'existe pas.');
    console.log('💡 Exécutez d\'abord: node build-production.js');
    process.exit(1);
}

// Fonction pour créer un fichier de checksums
function createChecksums() {
    console.log('🔐 Génération des checksums de sécurité...');
    
    const crypto = require('crypto');
    const checksums = {};
    
    function calculateChecksum(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
    
    function processDirectory(dir, basePath = '') {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item).replace(/\\/g, '/');
            
            if (fs.statSync(fullPath).isDirectory()) {
                processDirectory(fullPath, relativePath);
            } else {
                checksums[relativePath] = calculateChecksum(fullPath);
            }
        }
    }
    
    processDirectory(packageDir);
    
    fs.writeFileSync(
        path.join(packageDir, 'checksums.json'),
        JSON.stringify(checksums, null, 2)
    );
    
    console.log('✅ Checksums générés dans checksums.json');
}

// Fonction pour créer un fichier d'installation automatique
function createAutoInstaller() {
    console.log('🤖 Création du script d\'installation automatique...');
    
    const autoInstaller = `#!/bin/bash

# Script d'installation automatique WinDevExpert Platform
# Version: ${version}

set -e

echo "🚀 Installation automatique de WinDevExpert Platform v${version}"
echo "=================================================="

# Couleurs pour l'affichage
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_status() {
    echo -e "\${BLUE}[INFO]\${NC} $1"
}

print_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} $1"
}

print_warning() {
    echo -e "\${YELLOW}[WARNING]\${NC} $1"
}

print_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

# Vérification des prérequis
check_requirements() {
    print_status "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Version requise: 18+"
        exit 1
    fi
    
    NODE_VERSION=\$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "\$NODE_VERSION" -lt 18 ]; then
        print_error "Version Node.js trop ancienne. Version actuelle: \$(node --version), requise: 18+"
        exit 1
    fi
    
    print_success "Node.js \$(node --version) détecté"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    print_success "npm \$(npm --version) détecté"
    
    # Vérifier PHP (optionnel pour l'installateur web)
    if command -v php &> /dev/null; then
        print_success "PHP \$(php --version | head -n1 | cut -d' ' -f2) détecté"
    else
        print_warning "PHP non détecté - L'installateur web ne sera pas disponible"
    fi
}

# Installation des dépendances
install_dependencies() {
    print_status "Installation des dépendances Node.js..."
    npm install --production
    print_success "Dépendances installées"
}

# Configuration de la base de données
setup_database() {
    print_status "Configuration de la base de données..."
    
    if [ ! -f .env ]; then
        print_warning "Fichier .env non trouvé, copie du fichier d'exemple"
        cp .env.example .env
        print_warning "Veuillez éditer le fichier .env avec vos paramètres de base de données"
        return 1
    fi
    
    # Vérifier si nous sommes sur cPanel (problèmes npx connus)
    if [ -f "cpanel-fix-migrations.js" ]; then
        print_status "Détection d'un environnement cPanel - Application des corrections..."
        npm run cpanel:fix
        print_success "Corrections cPanel appliquées"
    else
        # Générer le client Prisma
        npx prisma generate
        print_success "Client Prisma généré"
        
        # Appliquer les migrations
        npx prisma db push
        print_success "Base de données configurée"
    fi
}

# Build de l'application
build_application() {
    print_status "Construction de l'application..."
    npm run build
    print_success "Application construite"
}

# Configuration des permissions
setup_permissions() {
    print_status "Configuration des permissions..."
    
    # Créer les dossiers nécessaires
    mkdir -p storage/logs
    mkdir -p storage/uploads
    mkdir -p storage/cache
    
    # Définir les permissions appropriées
    chmod -R 755 storage/
    chmod -R 755 public/uploads/
    
    print_success "Permissions configurées"
}

# Fonction principale
main() {
    echo
    print_status "Début de l'installation..."
    echo
    
    check_requirements
    echo
    
    install_dependencies
    echo
    
    if setup_database; then
        echo
        build_application
        echo
        setup_permissions
        echo
        
        print_success "Installation terminée avec succès!"
        echo
        print_status "Pour démarrer l'application:"
        echo "  npm start"
        echo
        print_status "Pour accéder à l'interface d'administration:"
        echo "  http://localhost:3000/admin"
        echo
        print_status "Pour utiliser l'installateur web:"
        echo "  http://localhost:3000/installer"
        echo
    else
        echo
        print_warning "Installation partiellement terminée"
        print_status "Veuillez configurer le fichier .env puis relancer:"
        echo "  ./auto-install.sh"
    fi
}

# Exécution
main
`;
    
    fs.writeFileSync(path.join(packageDir, 'auto-install.sh'), autoInstaller);
    
    // Rendre le script exécutable
    try {
        fs.chmodSync(path.join(packageDir, 'auto-install.sh'), '755');
    } catch (error) {
        // Ignorer l'erreur sur Windows
    }
    
    console.log('✅ Script d\'installation automatique créé: auto-install.sh');
}

// Fonction pour créer un fichier de configuration Docker
function createDockerConfig() {
    console.log('🐳 Création de la configuration Docker...');
    
    const dockerfile = `# WinDevExpert Platform Dockerfile
FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache \\
    openssl \\
    postgresql-client \\
    curl

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["npm", "start"]
`;
    
    const dockerCompose = `version: '3.8'

services:
  windevexpert:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/windevexpert
      - NEXTAUTH_SECRET=your-secret-key-here
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./storage:/app/storage
      - ./public/uploads:/app/public/uploads

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=windevexpert
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
`;
    
    const dockerIgnore = `node_modules
npm-debug.log
.next
.env*
.git
.gitignore
README.md
Dockerfile
.dockerignore
storage/logs/*
storage/cache/*
`;
    
    fs.writeFileSync(path.join(packageDir, 'Dockerfile'), dockerfile);
    fs.writeFileSync(path.join(packageDir, 'docker-compose.yml'), dockerCompose);
    fs.writeFileSync(path.join(packageDir, '.dockerignore'), dockerIgnore);
    
    console.log('✅ Configuration Docker créée (Dockerfile, docker-compose.yml)');
}

// Fonction pour créer l'archive finale
function createArchive() {
    console.log('📦 Création de l\'archive de déploiement...');
    
    const archiveName = `windevexpert-platform-v${version}`;
    
    try {
        // Essayer de créer un tar.gz
        execSync(`tar -czf "${archiveName}.tar.gz" -C "${packageDir}" .`, { stdio: 'inherit' });
        console.log(`✅ Archive créée: ${archiveName}.tar.gz`);
        return `${archiveName}.tar.gz`;
    } catch (error) {
        try {
            // Fallback vers zip sur Windows
            execSync(`powershell Compress-Archive -Path "${packageDir}\\*" -DestinationPath "${archiveName}.zip" -Force`, { stdio: 'inherit' });
            console.log(`✅ Archive créée: ${archiveName}.zip`);
            return `${archiveName}.zip`;
        } catch (zipError) {
            console.log('⚠️  Impossible de créer l\'archive automatiquement.');
            console.log(`💡 Compressez manuellement le dossier: ${packageDir}`);
            return null;
        }
    }
}

// Fonction pour afficher les instructions finales
function showFinalInstructions(archiveName) {
    console.log('\n🎉 Package de déploiement finalisé avec succès !');
    console.log('\n📋 Contenu du package:');
    console.log('   ✅ Code source complet');
    console.log('   ✅ Installateur web professionnel');
    console.log('   ✅ Script d\'installation automatique');
    console.log('   ✅ Configuration Docker');
    console.log('   ✅ Documentation complète');
    console.log('   ✅ Scripts de démarrage multi-plateforme');
    console.log('   ✅ Checksums de sécurité');
    console.log('   ✅ Corrections spécifiques cPanel');
    console.log('   ✅ Scripts npm pour contourner npx');
    
    console.log('\n🚀 Options de déploiement:');
    console.log('\n1️⃣  Installation Web (Recommandée)');
    console.log('   • Téléchargez et décompressez sur votre serveur');
    console.log('   • Accédez à: https://votre-domaine.com/installer');
    console.log('   • Suivez l\'assistant en 4 étapes');
    
    console.log('\n2️⃣  Installation Automatique');
    console.log('   • Décompressez le package');
    console.log('   • Exécutez: ./auto-install.sh (Linux/Mac)');
    console.log('   • Ou: start.bat (Windows)');
    
    console.log('\n3️⃣  Installation Docker');
    console.log('   • docker-compose up -d');
    console.log('   • Accédez à: http://localhost:3000');
    
    console.log('\n4️⃣  Installation cPanel (Spécialisée)');
    console.log('   • Décompressez le package sur votre serveur cPanel');
    console.log('   • Exécutez: node cpanel-fix-migrations.js');
    console.log('   • Ou utilisez: npm run cpanel:install');
    console.log('   • Démarrez avec: start-cpanel.bat');
    
    console.log('\n5️⃣  Installation Manuelle');
    console.log('   • Consultez README.md pour les instructions détaillées');
    
    if (archiveName) {
        console.log(`\n📦 Archive prête: ${archiveName}`);
    }
    
    console.log('\n📖 Documentation:');
    console.log('   • README.md - Guide complet');
    console.log('   • QUICK_START.md - Démarrage rapide');
    console.log('   • checksums.json - Vérification d\'intégrité');
    
    console.log('\n🔒 Sécurité:');
    console.log('   • Supprimez l\'installateur après installation');
    console.log('   • Configurez HTTPS en production');
    console.log('   • Sauvegardez régulièrement la base de données');
    
    console.log('\n📞 Support: support@windevexpert.com');
}

// Fonction pour copier les scripts de correction cPanel
function copyCPanelFixes() {
    console.log('🔧 Ajout des corrections cPanel...');
    
    const cpanelFixScript = path.join(rootDir, 'cpanel-fix-migrations.js');
    if (fs.existsSync(cpanelFixScript)) {
        fs.copyFileSync(cpanelFixScript, path.join(packageDir, 'cpanel-fix-migrations.js'));
        console.log('✅ Script de correction cPanel ajouté');
    } else {
        console.log('⚠️  Script de correction cPanel non trouvé, création...');
        
        const cpanelFixContent = `#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Correction des migrations Prisma pour cPanel');
console.log('=================================================');

// Fonction pour exécuter une commande
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(\`📝 Exécution: \${command} \${args.join(' ')}\`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(\`✅ Commande réussie: \${command}\`);
        resolve();
      } else {
        console.log(\`❌ Erreur dans la commande: \${command} (code: \${code})\`);
        reject(new Error(\`Command failed with code \${code}\`));
      }
    });

    child.on('error', (error) => {
      console.log(\`❌ Erreur d'exécution: \${error.message}\`);
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
      console.log('❌ node_modules non trouvé. Veuillez d\\'abord installer les dépendances.');
      process.exit(1);
    }

    // Vérifier si Prisma est installé
    const prismaPath = path.join(nodeModulesPath, '.bin', 'prisma');
    const prismaBinExists = fs.existsSync(prismaPath) || fs.existsSync(prismaPath + '.cmd');

    if (prismaBinExists) {
      console.log('✅ Prisma trouvé dans node_modules/.bin/');
      
      // Essayer d\\'abord avec npm run
      try {
        await runCommand('npm', ['run', 'prisma:generate']);
        console.log('✅ Client Prisma généré avec succès');
        
        await runCommand('npm', ['run', 'prisma:push']);
        console.log('✅ Base de données synchronisée avec succès');
      } catch (error) {
        console.log('⚠️  npm run a échoué, essai avec node directement...');
        
        // Fallback: utiliser node directement
        await runCommand('node', [path.join('node_modules', '.bin', 'prisma'), 'generate']);
        console.log('✅ Client Prisma généré avec node');
        
        await runCommand('node', [path.join('node_modules', '.bin', 'prisma'), 'db', 'push']);
        console.log('✅ Base de données synchronisée avec node');
      }
    } else {
      console.log('❌ Prisma non trouvé. Veuillez vérifier l\\'installation.');
      process.exit(1);
    }

    console.log('🎉 Migrations Prisma corrigées avec succès !');
    console.log('📝 Vous pouvez maintenant continuer l\\'installation.');

  } catch (error) {
    console.error('❌ Erreur lors de la correction des migrations:', error.message);
    console.log('\\n🔧 Solutions alternatives:');
    console.log('1. Vérifiez que Node.js est correctement configuré dans cPanel');
    console.log('2. Essayez de redémarrer l\\'application Node.js');
    console.log('3. Contactez votre hébergeur pour vérifier la configuration npm/npx');
    process.exit(1);
  }
}

// Exécuter le script
fixMigrations();
`;
        
        fs.writeFileSync(path.join(packageDir, 'cpanel-fix-migrations.js'), cpanelFixContent);
        console.log('✅ Script de correction cPanel créé');
    }
    
    // Copier aussi le script de démarrage pour cPanel
    const cpanelStartScript = `@echo off
echo 🚀 Démarrage de WinDevExpert Platform sur cPanel
echo ===============================================

echo 📝 Vérification de l'environnement...
if not exist node_modules (
    echo ❌ node_modules non trouvé. Installation des dépendances...
    npm install --production
)

echo 🔧 Application des corrections cPanel...
if exist cpanel-fix-migrations.js (
    node cpanel-fix-migrations.js
) else (
    echo ⚠️  Script de correction non trouvé, utilisation des commandes standard...
    npm run prisma:generate
    npm run prisma:push
)

echo 🚀 Démarrage de l'application...
npm start
`;
    
    fs.writeFileSync(path.join(packageDir, 'start-cpanel.bat'), cpanelStartScript);
    console.log('✅ Script de démarrage cPanel ajouté');
}

// Exécution principale
console.log('🔧 Finalisation du package...\n');

createChecksums();
createAutoInstaller();
createDockerConfig();
copyCPanelFixes();

const archiveName = createArchive();

showFinalInstructions(archiveName);