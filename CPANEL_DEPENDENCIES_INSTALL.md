# 📦 Installation des Dépendances sur cPanel

## 🎯 Méthodes d'Installation

### Méthode 1 : Via Terminal SSH (Recommandée)

Si votre hébergeur propose l'accès SSH :

```bash
# 1. Connexion SSH
ssh votre-utilisateur@votre-serveur.com

# 2. Navigation vers le dossier de l'application
cd public_html/windevexpert

# 3. Installation des dépendances de production
npm install --production

# 4. Génération du client Prisma
npx prisma generate

# 5. Application du schéma de base de données
npx prisma db push

# 6. Construction de l'application
npm run build
```

### Méthode 2 : Via Terminal cPanel

Si cPanel propose un terminal intégré :

1. **Connectez-vous à cPanel**
2. **Recherchez "Terminal"** dans les outils
3. **Ouvrez le terminal**
4. **Exécutez les commandes :**

```bash
# Navigation vers votre dossier
cd public_html/windevexpert

# Vérification de Node.js
node --version
npm --version

# Installation des dépendances
npm install --production --no-optional

# Configuration Prisma
npx prisma generate
npx prisma db push

# Build de l'application
npm run build
```

### Méthode 3 : Via Node.js Selector cPanel

1. **Allez dans "Node.js"** dans cPanel
2. **Sélectionnez votre application**
3. **Cliquez sur "NPM Install Packages"**
4. **Attendez la fin de l'installation**

### Méthode 4 : Upload Manuel (Si pas d'accès terminal)

Si vous n'avez pas accès au terminal :

#### Étape 1 : Préparation Locale
```bash
# Sur votre machine locale
cd windevexpert-platform

# Installation complète
npm install

# Build de production
npm run build

# Génération Prisma
npx prisma generate
```

#### Étape 2 : Upload des Fichiers
1. **Compressez les dossiers nécessaires :**
   - `node_modules/` (optionnel, très lourd)
   - `.next/` (obligatoire)
   - `prisma/` (obligatoire)

2. **Uploadez via File Manager cPanel**

## 🔧 Configuration Spécifique cPanel

### Variables d'Environnement Node.js

Dans cPanel > Node.js > Votre App > Environment Variables :

```
NODE_ENV=production
NPM_CONFIG_PRODUCTION=true
NPM_CONFIG_OPTIONAL=false
```

### Optimisation pour cPanel

Créez un fichier `.npmrc` dans votre dossier :

```
production=true
optional=false
dev=false
package-lock=false
audit=false
fund=false
```

## 📋 Commandes Détaillées

### Installation Complète
```bash
# Installation avec options optimisées pour cPanel
npm ci --only=production --no-audit --no-fund --silent

# Alternative si npm ci ne fonctionne pas
npm install --production --no-optional --no-audit --no-fund
```

### Configuration Prisma
```bash
# Génération du client Prisma
npx prisma generate

# Vérification de la connexion DB
npx prisma db pull

# Application du schéma (première fois)
npx prisma db push

# Migration (si vous avez des migrations)
npx prisma migrate deploy
```

### Build Next.js
```bash
# Build optimisé pour production
npm run build

# Vérification du build
ls -la .next/
```

## 🚨 Résolution des Problèmes

### Erreur "npm command not found"

**Solution 1 :** Vérifiez Node.js dans cPanel
```bash
# Dans cPanel > Node.js
# Assurez-vous que Node.js est activé pour votre domaine
```

**Solution 2 :** Ajoutez Node.js au PATH
```bash
export PATH=$PATH:/opt/cpanel/ea-nodejs18/bin
npm --version
```

### Erreur "Permission denied"

```bash
# Correction des permissions
chmod -R 755 public_html/windevexpert/
chmod 644 package.json
```

### Erreur "ENOSPC: no space left"

```bash
# Vérification de l'espace disque
df -h

# Nettoyage du cache npm
npm cache clean --force

# Installation sans cache
npm install --no-cache
```

### Erreur "Module not found"

```bash
# Suppression et réinstallation
rm -rf node_modules package-lock.json
npm install --production
```

### Erreur Prisma "Environment variable not found"

```bash
# Vérification des variables d'environnement
echo $DATABASE_URL

# Si vide, ajoutez dans .env ou variables cPanel
```

## 📊 Vérification de l'Installation

### Test des Dépendances
```bash
# Vérification des packages installés
npm list --depth=0

# Test de l'application
node -e "console.log('Node.js fonctionne')"

# Test Prisma
npx prisma --version
```

### Test de l'Application
```bash
# Test du serveur (local)
npm start

# Vérification du build
ls -la .next/static/
```

## 🔄 Script d'Installation Automatique

Créez un fichier `install-deps.sh` :

```bash
#!/bin/bash

echo "🚀 Installation des dépendances WinDevExpert..."

# Vérifications préliminaires
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trouvé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm non trouvé"
    exit 1
fi

echo "✅ Node.js $(node --version) détecté"
echo "✅ npm $(npm --version) détecté"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install --production --no-optional --silent

if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi

# Configuration Prisma
if [ -d "prisma" ]; then
    echo "🔧 Configuration Prisma..."
    npx prisma generate
    echo "✅ Client Prisma généré"
fi

# Build de l'application
echo "🏗️ Construction de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application construite"
    echo "🎉 Installation terminée avec succès!"
else
    echo "❌ Erreur lors de la construction"
    exit 1
fi
```

Rendez-le exécutable et lancez-le :
```bash
chmod +x install-deps.sh
./install-deps.sh
```

## 📞 Support

### Logs à Consulter
- **cPanel Error Logs** : Logs > Error Logs
- **Node.js Logs** : Node.js > Votre App > Logs
- **npm Debug** : `npm-debug.log` dans votre dossier

### Commandes de Debug
```bash
# Informations système
uname -a
node --version
npm --version

# Espace disque
df -h

# Permissions
ls -la package.json
ls -la node_modules/

# Variables d'environnement
env | grep NODE
```

### Contact Support
Si les problèmes persistent :
1. Contactez le support de votre hébergeur
2. Fournissez les logs d'erreur
3. Mentionnez votre version de Node.js
4. Précisez le type d'hébergement cPanel

---

**💡 Conseil :** Toujours tester l'installation en local avant de déployer sur cPanel pour identifier les problèmes potentiels.