# 🚀 Guide d'Installation cPanel - WinDevExpert Platform

## 📋 Vue d'ensemble

Ce guide vous accompagne dans l'installation de WinDevExpert Platform sur un serveur cPanel. Il inclut toutes les corrections nécessaires pour contourner les problèmes courants rencontrés avec cPanel.

## ⚠️ Problèmes cPanel Connus et Solutions

### 🔧 Problème npx
**Problème :** cPanel ne supporte pas toujours `npx` correctement.
**Solution :** Utilisation de scripts npm alternatifs et d'un script de correction automatique.

### 🔧 Problème Prisma
**Problème :** Les migrations Prisma peuvent échouer avec `npx`.
**Solution :** Script `cpanel-fix-migrations.js` inclus dans le package.

## 📦 Contenu du Package cPanel

✅ **Code source complet**
✅ **Script de correction cPanel** (`cpanel-fix-migrations.js`)
✅ **Scripts npm alternatifs** (contournement npx)
✅ **Script de démarrage cPanel** (`start-cpanel.bat`)
✅ **Documentation spécialisée**
✅ **Installateur web compatible**

## 🛠️ Prérequis

- **Node.js 18+** installé sur le serveur cPanel
- **npm** fonctionnel
- **Base de données** (MySQL/PostgreSQL) configurée
- **Accès terminal** cPanel ou SSH

## 📥 Installation Étape par Étape

### Étape 1: Téléchargement et Décompression

```bash
# Téléchargez le package sur votre serveur cPanel
# Décompressez dans le répertoire de votre choix
unzip windevexpert-platform-v*.zip
cd windevexpert-platform
```

### Étape 2: Configuration de l'Environnement

```bash
# Copiez le fichier d'environnement
cp .env.example .env

# Éditez le fichier .env avec vos paramètres
nano .env
```

**Variables importantes pour cPanel :**
```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth
NEXTAUTH_SECRET="votre-clé-secrète-très-longue"
NEXTAUTH_URL="https://votre-domaine.com"

# Email (optionnel)
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASS="votre-mot-de-passe"
```

### Étape 3: Installation Automatique (Recommandée)

```bash
# Option 1: Installation complète automatique
npm run cpanel:install

# Option 2: Installation manuelle étape par étape
npm install --production
npm run cpanel:fix
```

### Étape 4: Vérification de l'Installation

```bash
# Vérifier que Prisma fonctionne
npm run prisma:generate
npm run prisma:push

# Tester le démarrage
npm start
```

## 🔧 Scripts npm Spécialisés cPanel

Le package inclut des scripts npm spécialement conçus pour cPanel :

```json
{
  "cpanel:fix": "node cpanel-fix-migrations.js",
  "cpanel:setup": "npm run prisma:generate && npm run prisma:push",
  "cpanel:migrate": "npm run prisma:migrate",
  "cpanel:install": "npm install --production && npm run cpanel:setup"
}
```

## 🚨 Résolution des Problèmes

### Problème: "npx command not found"

**Solution :**
```bash
# Utilisez le script de correction
node cpanel-fix-migrations.js

# Ou utilisez les scripts npm
npm run cpanel:fix
```

### Problème: "Prisma Client not generated"

**Solution :**
```bash
# Génération manuelle
npm run prisma:generate

# Ou avec le script de correction
npm run cpanel:setup
```

### Problème: "Database connection failed"

**Solution :**
1. Vérifiez votre `DATABASE_URL` dans `.env`
2. Assurez-vous que la base de données existe
3. Testez la connexion :
```bash
npm run prisma:push
```

### Problème: "Permission denied"

**Solution :**
```bash
# Ajustez les permissions
chmod +x cpanel-fix-migrations.js
chmod +x start-cpanel.bat
```

## 🚀 Démarrage de l'Application

### Option 1: Script de Démarrage cPanel (Windows)
```cmd
start-cpanel.bat
```

### Option 2: Démarrage Manuel
```bash
# Vérification finale
npm run cpanel:setup

# Démarrage
npm start
```

### Option 3: Démarrage avec PM2 (Recommandé pour Production)
```bash
# Installation de PM2
npm install -g pm2

# Démarrage avec PM2
pm2 start npm --name "windevexpert" -- start
pm2 save
pm2 startup
```

## 🌐 Configuration du Serveur Web

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Nginx
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📊 Monitoring et Logs

```bash
# Voir les logs de l'application
npm run logs

# Monitoring avec PM2
pm2 logs windevexpert
pm2 monit
```

## 🔒 Sécurité Post-Installation

1. **Supprimez l'installateur web** après installation
2. **Configurez HTTPS** obligatoirement
3. **Sauvegardez** régulièrement la base de données
4. **Mettez à jour** les dépendances régulièrement

```bash
# Suppression de l'installateur
rm -rf installer/

# Audit de sécurité
npm audit
npm audit fix
```

## 📞 Support

- **Email :** support@windevexpert.com
- **Documentation :** README.md
- **Logs d'erreur :** Consultez les logs cPanel et Node.js

## 🔄 Mise à Jour

```bash
# Sauvegarde
cp .env .env.backup
npm run backup:db

# Mise à jour
npm install
npm run cpanel:setup
npm start
```

---

**✅ Installation terminée avec succès !**

Votre plateforme WinDevExpert est maintenant opérationnelle sur cPanel.