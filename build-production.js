#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Création du package de déploiement WinDevExpert...\n');

const rootDir = __dirname;
const packageDir = path.join(rootDir, 'windevexpert-package');

// Fonction pour copier des fichiers
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

// Fonction pour copier un répertoire récursivement
function copyDirectory(src, dest, excludes = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        if (excludes.includes(item)) continue;
        
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath, excludes);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Fonction pour créer le fichier .env.example
function createEnvExample() {
    const envExample = `# Configuration de base de données
DATABASE_URL="postgresql://username:password@localhost:5432/windevexpert"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Stripe (Optionnel)
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# SlickPay (Optionnel)
SLICKPAY_APP_ID="your-app-id"
SLICKPAY_APP_SECRET="your-app-secret"

# Sécurité
ENCRYPTION_KEY="your-encryption-key-here"

# Administration
ADMIN_EMAIL="admin@yourdomain.com"
`;
    
    fs.writeFileSync(path.join(packageDir, '.env.example'), envExample);
}

// Fonction pour créer le README d'installation
function createInstallationReadme() {
    const readme = `# WinDevExpert Platform - Guide d'Installation

## 🚀 Installation Automatique (Recommandée)

1. **Téléchargez et décompressez** le package sur votre serveur
2. **Accédez à l'installateur** : \`https://votre-domaine.com/installer\`
3. **Suivez l'assistant d'installation** en 4 étapes simples
4. **Configurez vos paramètres** (base de données, email, paiements)
5. **Lancez l'installation automatique**

## 📋 Prérequis

### Serveur Web
- **PHP 8.1+** avec extensions : PDO, JSON, mbstring, OpenSSL, cURL, GD
- **Node.js 18+** et npm
- **Serveur web** : Apache 2.4+ ou Nginx 1.18+

### Base de Données (au choix)
- **PostgreSQL 12+** (recommandé)
- **MySQL 8.0+**
- **SQLite 3.35+** (pour tests uniquement)

### Hébergement
- **2 Go RAM minimum** (4 Go recommandé)
- **10 Go d'espace disque**
- **Support HTTPS** (certificat SSL)

## 🛠️ Installation Manuelle

Si vous préférez installer manuellement :

### 1. Configuration de l'environnement

\`\`\`bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer la configuration
nano .env
\`\`\`

### 2. Installation des dépendances

\`\`\`bash
# Installer les packages Node.js
npm install

# Générer le client Prisma
npx prisma generate
\`\`\`

### 3. Configuration de la base de données

\`\`\`bash
# Appliquer les migrations
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
\`\`\`

### 4. Build de production

\`\`\`bash
# Construire l'application
npm run build

# Démarrer en production
npm start
\`\`\`

## 🔧 Configuration

### Variables d'environnement essentielles

| Variable | Description | Exemple |
|----------|-------------|---------|
| \`DATABASE_URL\` | URL de connexion à la base de données | \`postgresql://user:pass@localhost:5432/db\` |
| \`NEXTAUTH_SECRET\` | Clé secrète pour l'authentification | Généré automatiquement |
| \`NEXTAUTH_URL\` | URL publique de votre site | \`https://votre-domaine.com\` |
| \`ADMIN_EMAIL\` | Email de l'administrateur | \`admin@votre-domaine.com\` |

### Configuration SMTP (Email)

Pour l'envoi d'emails (notifications, récupération de mot de passe) :

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com
\`\`\`

### Configuration des paiements (Optionnel)

#### Stripe
\`\`\`env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
\`\`\`

#### SlickPay
\`\`\`env
SLICKPAY_APP_ID=votre-app-id
SLICKPAY_APP_SECRET=votre-app-secret
\`\`\`

## 🌐 Configuration du serveur web

### Apache (.htaccess inclus)

Le fichier \`.htaccess\` est automatiquement créé. Assurez-vous que \`mod_rewrite\` est activé.

### Nginx

Exemple de configuration :

\`\`\`nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /path/to/windevexpert;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\\. {
        deny all;
    }
}
\`\`\`

## 🔒 Sécurité

### Après installation

1. **Supprimez l'installateur** : Utilisez le bouton dans l'interface ou supprimez manuellement le dossier \`installer/\`
2. **Vérifiez les permissions** : Les fichiers sensibles ne doivent pas être accessibles publiquement
3. **Activez HTTPS** : Configurez un certificat SSL valide
4. **Sauvegardez régulièrement** : Base de données et fichiers uploadés

### Fichiers sensibles protégés

- \`.env*\` - Variables d'environnement
- \`*.log\` - Fichiers de logs
- \`storage/\` - Données privées
- \`node_modules/\` - Dépendances

## 📞 Support

### Documentation
- **Site officiel** : [https://windevexpert.com](https://windevexpert.com)
- **Documentation technique** : [https://docs.windevexpert.com](https://docs.windevexpert.com)

### Assistance
- **Email** : support@windevexpert.com
- **Forum** : [https://forum.windevexpert.com](https://forum.windevexpert.com)

### Dépannage courant

#### Erreur de connexion à la base de données
- Vérifiez les paramètres dans \`.env\`
- Assurez-vous que la base de données est accessible
- Vérifiez les permissions utilisateur

#### Erreur 500 (Erreur interne du serveur)
- Consultez les logs : \`storage/logs/\`
- Vérifiez les permissions des fichiers
- Assurez-vous que toutes les extensions PHP sont installées

#### Page blanche après installation
- Vérifiez que le build a été généré : \`.next/\`
- Consultez les logs du serveur web
- Vérifiez la configuration Node.js

## 📄 Licence

WinDevExpert Platform - Tous droits réservés © 2025

---

**Version** : 1.0.0  
**Date de build** : ${new Date().toLocaleDateString('fr-FR')}
`;
    
    fs.writeFileSync(path.join(packageDir, 'README.md'), readme);
}

// Fonction pour créer le script de démarrage
function createStartScript() {
    const startScript = `#!/bin/bash

# Script de démarrage WinDevExpert Platform

echo "🚀 Démarrage de WinDevExpert Platform..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Copie du fichier d'exemple..."
    cp .env.example .env
    echo "📝 Veuillez éditer le fichier .env avec vos paramètres avant de continuer."
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Vérifier si la base de données est configurée
echo "🗄️  Vérification de la base de données..."
npx prisma db push

# Build de l'application si nécessaire
if [ ! -d ".next" ]; then
    echo "🏗️  Build de l'application..."
    npm run build
fi

# Démarrer l'application
echo "✅ Démarrage de l'application..."
npm start
`;
    
    fs.writeFileSync(path.join(packageDir, 'start.sh'), startScript);
    
    // Rendre le script exécutable (sur Unix)
    try {
        fs.chmodSync(path.join(packageDir, 'start.sh'), '755');
    } catch (error) {
        // Ignorer l'erreur sur Windows
    }
}

// Fonction pour créer le script de démarrage Windows
function createStartScriptWindows() {
    const startScript = `@echo off
echo 🚀 Démarrage de WinDevExpert Platform...

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si le fichier .env existe
if not exist .env (
    echo ⚠️  Fichier .env non trouvé. Copie du fichier d'exemple...
    copy .env.example .env
    echo 📝 Veuillez éditer le fichier .env avec vos paramètres avant de continuer.
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist node_modules (
    echo 📦 Installation des dépendances...
    npm install
)

REM Générer le client Prisma
echo 🔧 Génération du client Prisma...
npx prisma generate

REM Vérifier si la base de données est configurée
echo 🗄️  Vérification de la base de données...
npx prisma db push

REM Build de l'application si nécessaire
if not exist .next (
    echo 🏗️  Build de l'application...
    npm run build
)

REM Démarrer l'application
echo ✅ Démarrage de l'application...
npm start

pause
`;
    
    fs.writeFileSync(path.join(packageDir, 'start.bat'), startScript);
}

// Début du processus de création du package
console.log('🧹 Nettoyage des packages précédents...');
if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
}

// Créer le répertoire
fs.mkdirSync(packageDir, { recursive: true });

// Copier les fichiers essentiels
console.log('📁 Copie des fichiers essentiels...');

const filesToCopy = [
    'package.json',
    'package-lock.json',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'tsconfig.json',
    'cpanel-fix-migrations.js',
    'cpanel-auto-setup.sh',
    'cpanel-memory-install.js'
];

const directoriesToCopy = [
    { src: 'src', dest: 'src' },
    { src: 'public', dest: 'public' },
    { src: 'prisma', dest: 'prisma' },
    { src: 'installer', dest: 'installer' }
];

// Copier les fichiers
filesToCopy.forEach(file => {
    if (fs.existsSync(path.join(rootDir, file))) {
        copyFile(path.join(rootDir, file), path.join(packageDir, file));
        console.log(`✅ Copié: ${file}`);
    }
});

// Copier les répertoires
directoriesToCopy.forEach(({ src, dest }) => {
    if (fs.existsSync(path.join(rootDir, src))) {
        copyDirectory(path.join(rootDir, src), path.join(packageDir, dest));
        console.log(`✅ Copié: ${src}/ -> ${dest}/`);
    }
});

// Créer les fichiers de configuration
console.log('⚙️  Création des fichiers de configuration...');
createEnvExample();
createInstallationReadme();
createStartScript();
createStartScriptWindows();

// Optimiser le package.json pour la production
console.log('📝 Optimisation du package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

// Garder seulement les scripts essentiels
const productionPackageJson = {
    ...packageJson,
    scripts: {
        start: 'next start',
        build: 'next build',
        dev: 'next dev',
        'db:generate': 'prisma generate',
        'db:push': 'prisma db push',
        'db:migrate': 'prisma migrate deploy',
        'db:studio': 'prisma studio',
        'prisma:generate': 'prisma generate',
        'prisma:push': 'prisma db push',
        'prisma:migrate': 'prisma migrate deploy',
        'prisma:studio': 'prisma studio',
        'cpanel:fix': 'node cpanel-fix-migrations.js',
        'cpanel:setup': 'npm run prisma:generate && npm run prisma:push',
        'cpanel:migrate': 'npm run prisma:migrate',
        'cpanel:install': 'npm install --production && npm run cpanel:setup'
    }
};

fs.writeFileSync(
    path.join(packageDir, 'package.json'), 
    JSON.stringify(productionPackageJson, null, 2)
);

// Créer le fichier de version
const versionInfo = {
    version: packageJson.version || '1.0.0',
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    description: 'WinDevExpert Platform - Package de déploiement'
};

fs.writeFileSync(
    path.join(packageDir, 'version.json'), 
    JSON.stringify(versionInfo, null, 2)
);

// Créer un fichier .gitignore pour le package
const gitignore = `# Dépendances
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
.next/
out/
dist/

# Environnement
.env
.env.local
.env.production
.env.development

# Logs
*.log
logs/

# Base de données
*.sqlite
*.db

# Cache
.cache/
.temp/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Installation
.installed
`;

fs.writeFileSync(path.join(packageDir, '.gitignore'), gitignore);

// Créer un fichier d'instructions rapides
const quickStart = `# 🚀 Démarrage Rapide - WinDevExpert Platform

## Installation Automatique (Recommandée)

1. **Téléchargez** ce package sur votre serveur web
2. **Décompressez** dans le répertoire de votre site
3. **Accédez** à : https://votre-domaine.com/installer
4. **Suivez** l'assistant d'installation

## Installation Manuelle

### Windows
\`\`\`cmd
start.bat
\`\`\`

### Linux/Mac
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

## Configuration Minimale

1. Copiez \`.env.example\` vers \`.env\`
2. Configurez votre base de données dans \`.env\`
3. Lancez \`npm install\`
4. Lancez \`npm run build\`
5. Lancez \`npm start\`

## Support

📧 Email: support@windevexpert.com
📖 Documentation: README.md
`;

fs.writeFileSync(path.join(packageDir, 'QUICK_START.md'), quickStart);

// Résumé final
console.log('\n🎉 Package de déploiement créé avec succès !');
console.log('\n📋 Résumé:');
console.log(`   📁 Package créé dans: ${packageDir}`);
console.log(`   📦 Version: ${versionInfo.version}`);
console.log(`   📅 Date de création: ${new Date().toLocaleString('fr-FR')}`);
console.log('\n📦 Contenu du package:');
console.log('   ✅ Code source complet');
console.log('   ✅ Installateur web professionnel');
console.log('   ✅ Scripts de démarrage (Windows/Linux)');
console.log('   ✅ Configuration d\'exemple (.env.example)');
console.log('   ✅ Documentation complète (README.md)');
console.log('   ✅ Guide de démarrage rapide');
console.log('\n🚀 Prochaines étapes:');
console.log('   1. Compressez le dossier windevexpert-package');
console.log('   2. Téléchargez-le sur votre serveur web');
console.log('   3. Décompressez dans le répertoire de votre site');
console.log('   4. Accédez à https://votre-domaine.com/installer');
console.log('   5. Suivez l\'assistant d\'installation');
console.log('\n📖 Consultez README.md et QUICK_START.md pour plus d\'informations.');