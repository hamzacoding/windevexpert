# Guide Build et Déploiement - WinDevExpert Platform

## 📋 Vue d'ensemble

Ce guide détaille le processus complet de build et de déploiement de l'application WinDevExpert sur un hébergement cPanel.

---

## 🏗️ Processus de Build

### 1. Préparation de l'environnement local

#### Vérification des prérequis
```bash
# Vérification de Node.js (version 18+)
node --version

# Vérification de npm
npm --version

# Vérification de Git
git --version
```

#### Installation des dépendances
```bash
# Installation complète
npm install

# Ou installation propre
npm ci
```

### 2. Configuration pour la production

#### Mise à jour du fichier next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour la production
  output: 'standalone',
  
  // Optimisations
  swcMinify: true,
  
  // Configuration des images
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: false,
  },
  
  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuration pour cPanel
  trailingSlash: false,
  
  // Gestion des redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/nimda',
        permanent: true,
      },
    ]
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 3. Build de production

#### Script de build complet
```bash
#!/bin/bash
# build-production.sh

echo "🚀 Début du build de production..."

# Nettoyage
echo "🧹 Nettoyage des fichiers précédents..."
rm -rf .next
rm -rf out
rm -rf dist

# Vérification des variables d'environnement
echo "🔍 Vérification des variables d'environnement..."
if [ ! -f .env.production ]; then
    echo "❌ Fichier .env.production manquant"
    exit 1
fi

# Génération du client Prisma
echo "🗄️ Génération du client Prisma..."
npx prisma generate

# Build Next.js
echo "⚡ Build Next.js..."
npm run build

# Vérification du build
if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
else
    echo "❌ Échec du build"
    exit 1
fi

# Création de l'archive de déploiement
echo "📦 Création de l'archive de déploiement..."
tar -czf windevexpert-production.tar.gz \
    .next \
    public \
    prisma \
    package.json \
    package-lock.json \
    next.config.js \
    .env.production

echo "🎉 Build terminé avec succès!"
echo "📁 Archive créée : windevexpert-production.tar.gz"
```

#### Exécution du build
```bash
# Rendre le script exécutable
chmod +x build-production.sh

# Exécuter le build
./build-production.sh
```

### 4. Optimisations du build

#### Package.json - Scripts optimisés
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "build:analyze": "ANALYZE=true npm run build",
    "build:production": "./build-production.sh",
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate deploy",
    "db:seed": "npx prisma db seed",
    "postbuild": "next-sitemap"
  }
}
```

---

## 🚀 Déploiement sur cPanel

### 1. Préparation du serveur

#### Vérification de l'environnement cPanel
```bash
# Connexion SSH (si disponible)
ssh votre-utilisateur@votre-serveur.com

# Vérification de Node.js
node --version
npm --version

# Vérification de l'espace disque
df -h

# Vérification des permissions
ls -la public_html/
```

### 2. Upload des fichiers

#### Méthode 1 : Via SSH/SCP
```bash
# Upload de l'archive
scp windevexpert-production.tar.gz user@server:~/public_html/

# Connexion SSH
ssh user@server

# Extraction
cd public_html/
tar -xzf windevexpert-production.tar.gz
rm windevexpert-production.tar.gz

# Permissions
chmod -R 755 .
chmod 600 .env.production
```

#### Méthode 2 : Via FTP/SFTP
```bash
# Utilisation d'un client FTP comme FileZilla
# 1. Connectez-vous à votre serveur FTP
# 2. Naviguez vers public_html/
# 3. Uploadez l'archive
# 4. Extrayez via le gestionnaire de fichiers cPanel
```

#### Méthode 3 : Via cPanel File Manager
1. Accédez au "Gestionnaire de fichiers"
2. Naviguez vers `public_html/`
3. Uploadez `windevexpert-production.tar.gz`
4. Clic droit → "Extraire"
5. Supprimez l'archive après extraction

### 3. Installation des dépendances

#### Installation via SSH
```bash
# Navigation vers le dossier
cd public_html/

# Installation des dépendances de production uniquement
npm ci --only=production

# Vérification de l'installation
npm list --depth=0
```

#### Installation via cPanel Terminal
```bash
# Si le terminal cPanel est disponible
cd public_html/
npm ci --only=production
```

### 4. Configuration de la base de données

#### Migration de la base de données
```bash
# Application des migrations
npx prisma migrate deploy

# Génération du client
npx prisma generate

# Vérification de la connexion
npx prisma db pull

# Peuplement initial (si nécessaire)
npm run db:seed
```

### 5. Configuration Node.js dans cPanel

#### Configuration via Node.js Selector
1. **Accédez à "Node.js Selector"** dans cPanel
2. **Configurez l'application :**
   ```
   Node.js Version: 18.x (ou la plus récente disponible)
   Application Mode: Production
   Application Root: public_html/
   Application URL: votre-domaine.com
   Application Startup File: server.js
   ```

#### Création du fichier server.js
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialisation de Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse de l'URL
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Gestion des routes API
      if (pathname.startsWith('/api/')) {
        await handle(req, res, parsedUrl)
        return
      }

      // Gestion des routes admin
      if (pathname.startsWith('/nimda')) {
        await handle(req, res, parsedUrl)
        return
      }

      // Gestion des autres routes
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Erreur lors du traitement de la requête:', req.url, err)
      res.statusCode = 500
      res.end('Erreur interne du serveur')
    }
  })
  .once('error', (err) => {
    console.error('Erreur du serveur:', err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Serveur prêt sur http://${hostname}:${port}`)
    console.log(`> Environnement: ${process.env.NODE_ENV}`)
  })
})

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('Arrêt du serveur...')
  process.exit(0)
})
```

### 6. Configuration .htaccess

#### Fichier .htaccess pour cPanel
```apache
# Redirection HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy vers Node.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache des fichiers statiques
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
</IfModule>
```

---

## 🔧 Scripts de déploiement automatisé

### 1. Script de déploiement complet

```bash
#!/bin/bash
# deploy-cpanel.sh

# Configuration
SERVER="votre-serveur.com"
USER="votre-utilisateur"
REMOTE_PATH="/home/$USER/public_html"
LOCAL_BUILD="windevexpert-production.tar.gz"

echo "🚀 Début du déploiement sur cPanel..."

# Vérification des prérequis
if [ ! -f "$LOCAL_BUILD" ]; then
    echo "❌ Archive de build manquante. Exécutez d'abord le build."
    exit 1
fi

# Upload de l'archive
echo "📤 Upload de l'archive..."
scp "$LOCAL_BUILD" "$USER@$SERVER:$REMOTE_PATH/"

# Déploiement sur le serveur
echo "🔧 Déploiement sur le serveur..."
ssh "$USER@$SERVER" << 'EOF'
cd ~/public_html

# Sauvegarde de l'ancienne version
if [ -d ".next" ]; then
    echo "💾 Sauvegarde de l'ancienne version..."
    tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" .next public prisma
fi

# Extraction de la nouvelle version
echo "📦 Extraction de la nouvelle version..."
tar -xzf windevexpert-production.tar.gz
rm windevexpert-production.tar.gz

# Installation des dépendances
echo "📚 Installation des dépendances..."
npm ci --only=production

# Migration de la base de données
echo "🗄️ Migration de la base de données..."
npx prisma migrate deploy
npx prisma generate

# Permissions
echo "🔒 Configuration des permissions..."
chmod -R 755 .
chmod 600 .env.production

echo "✅ Déploiement terminé!"
EOF

echo "🎉 Déploiement réussi!"
echo "🌐 Votre application est disponible sur : https://votre-domaine.com"
```

### 2. Script de rollback

```bash
#!/bin/bash
# rollback.sh

SERVER="votre-serveur.com"
USER="votre-utilisateur"

echo "🔄 Rollback vers la version précédente..."

ssh "$USER@$SERVER" << 'EOF'
cd ~/public_html

# Recherche de la dernière sauvegarde
BACKUP=$(ls -t backup-*.tar.gz | head -n1)

if [ -z "$BACKUP" ]; then
    echo "❌ Aucune sauvegarde trouvée"
    exit 1
fi

echo "📦 Restauration depuis : $BACKUP"

# Suppression de la version actuelle
rm -rf .next public prisma

# Restauration de la sauvegarde
tar -xzf "$BACKUP"

# Redémarrage de l'application
# (via cPanel Node.js Selector ou PM2 si disponible)

echo "✅ Rollback terminé!"
EOF
```

### 3. Script de monitoring

```bash
#!/bin/bash
# monitor-deployment.sh

URL="https://votre-domaine.com"
API_URL="$URL/api/health"

echo "🔍 Vérification du déploiement..."

# Test de la page d'accueil
echo "🏠 Test de la page d'accueil..."
if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
    echo "✅ Page d'accueil accessible"
else
    echo "❌ Page d'accueil inaccessible"
fi

# Test de l'API
echo "🔌 Test de l'API..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL" | grep -q "200"; then
    echo "✅ API fonctionnelle"
else
    echo "❌ API non fonctionnelle"
fi

# Test de la base de données
echo "🗄️ Test de la base de données..."
# Ajoutez ici vos tests spécifiques

echo "🎉 Vérification terminée!"
```

---

## 🔄 Processus de mise à jour

### 1. Mise à jour standard

```bash
# 1. Build local
npm run build:production

# 2. Déploiement
./deploy-cpanel.sh

# 3. Vérification
./monitor-deployment.sh
```

### 2. Mise à jour avec migration de base de données

```bash
# 1. Sauvegarde de la base de données
ssh user@server "mysqldump -u user -p database > backup-db-$(date +%Y%m%d).sql"

# 2. Déploiement
./deploy-cpanel.sh

# 3. Vérification des migrations
ssh user@server "cd public_html && npx prisma migrate status"
```

### 3. Mise à jour d'urgence (hotfix)

```bash
# 1. Build rapide
npm run build

# 2. Upload direct des fichiers modifiés
scp -r .next/static user@server:~/public_html/.next/

# 3. Redémarrage de l'application
ssh user@server "cd public_html && npm restart"
```

---

## 📊 Monitoring et maintenance

### 1. Logs d'application

```bash
# Consultation des logs
ssh user@server "tail -f ~/logs/app.log"

# Logs d'erreur
ssh user@server "tail -f ~/logs/error.log"

# Logs de cPanel
# Accessible via cPanel > Logs > Error Logs
```

### 2. Monitoring des performances

```javascript
// scripts/performance-monitor.js
const https = require('https')

function checkPerformance() {
  const start = Date.now()
  
  https.get('https://votre-domaine.com', (res) => {
    const duration = Date.now() - start
    console.log(`Temps de réponse: ${duration}ms`)
    
    if (duration > 3000) {
      console.log('⚠️ Temps de réponse élevé')
      // Envoyer une alerte
    }
  })
}

setInterval(checkPerformance, 60000) // Toutes les minutes
```

### 3. Maintenance automatique

```bash
#!/bin/bash
# maintenance.sh

echo "🔧 Maintenance automatique..."

# Nettoyage des logs anciens
find ~/logs -name "*.log" -mtime +30 -delete

# Nettoyage des sauvegardes anciennes
find ~/public_html -name "backup-*.tar.gz" -mtime +7 -delete

# Optimisation de la base de données
mysql -u user -p -e "OPTIMIZE TABLE users, products, categories;"

# Redémarrage de l'application (si nécessaire)
# pm2 restart windevexpert

echo "✅ Maintenance terminée"
```

---

## 🚨 Dépannage

### Problèmes courants

#### 1. Erreur 500 après déploiement
```bash
# Vérification des logs
tail -f ~/logs/error.log

# Vérification des permissions
chmod -R 755 public_html/
chmod 600 .env.production

# Redémarrage de l'application
# Via cPanel Node.js Selector > Restart
```

#### 2. Base de données inaccessible
```bash
# Test de connexion
npx prisma db pull

# Vérification des credentials
cat .env.production | grep DATABASE_URL

# Reset des migrations (ATTENTION: perte de données)
npx prisma migrate reset
```

#### 3. Modules manquants
```bash
# Réinstallation des dépendances
rm -rf node_modules package-lock.json
npm install
```

#### 4. Problème de build
```bash
# Nettoyage complet
rm -rf .next out dist
npm run build
```

---

## 📞 Support

Pour les problèmes de déploiement :

1. **Logs** : Consultez toujours les logs en premier
2. **Scripts** : Utilisez les scripts de monitoring
3. **Rollback** : En cas de problème majeur, utilisez le rollback
4. **Support hébergeur** : Pour les problèmes d'infrastructure cPanel

---

*Guide mis à jour : Janvier 2025*