# Configuration Variables d'Environnement - WinDevExpert Platform

## 📋 Vue d'ensemble

Ce guide détaille la configuration complète des variables d'environnement pour le déploiement en production sur cPanel.

---

## 🔐 Fichier .env.production

### Structure complète

```env
# =============================================================================
# CONFIGURATION BASE DE DONNÉES
# =============================================================================

# URL de connexion à la base de données
# Format MySQL : mysql://username:password@host:port/database
# Format PostgreSQL : postgresql://username:password@host:port/database
DATABASE_URL="mysql://windev_user:votre_mot_de_passe@localhost:3306/windevexpert_prod"

# =============================================================================
# NEXTAUTH.JS - AUTHENTIFICATION
# =============================================================================

# URL de base de l'application (OBLIGATOIRE)
NEXTAUTH_URL="https://votre-domaine.com"

# Secret pour signer les tokens JWT (OBLIGATOIRE - 32 caractères minimum)
# Générez avec : openssl rand -base64 32
NEXTAUTH_SECRET="votre-secret-nextauth-super-securise-32-caracteres-minimum"

# =============================================================================
# CONFIGURATION SMTP - ENVOI D'EMAILS
# =============================================================================

# Serveur SMTP (généralement fourni par votre hébergeur)
SMTP_HOST="mail.votre-domaine.com"

# Port SMTP (587 pour STARTTLS, 465 pour SSL, 25 pour non-sécurisé)
SMTP_PORT="587"

# Sécurité SMTP (true pour SSL, false pour STARTTLS)
SMTP_SECURE="false"

# Nom d'utilisateur SMTP (généralement une adresse email)
SMTP_USER="noreply@votre-domaine.com"

# Mot de passe SMTP
SMTP_PASS="votre-mot-de-passe-email"

# Adresse email d'expédition
EMAIL_FROM="noreply@votre-domaine.com"

# Nom d'expéditeur affiché
EMAIL_FROM_NAME="WinDevExpert"

# =============================================================================
# FIREBASE - STOCKAGE DE FICHIERS (ADMIN)
# =============================================================================

# ID du projet Firebase
FIREBASE_PROJECT_ID="votre-projet-firebase"

# Email du compte de service Firebase
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@votre-projet.iam.gserviceaccount.com"

# Clé privée du compte de service (gardez les \n pour les retours à la ligne)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée Firebase\n-----END PRIVATE KEY-----"

# Bucket de stockage Firebase
FIREBASE_STORAGE_BUCKET="votre-projet.appspot.com"

# =============================================================================
# FIREBASE - CONFIGURATION CLIENT (PUBLIC)
# =============================================================================

# Clé API Firebase (publique)
NEXT_PUBLIC_FIREBASE_API_KEY="votre-api-key-firebase"

# Domaine d'authentification Firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="votre-projet.firebaseapp.com"

# ID du projet Firebase (doit correspondre à FIREBASE_PROJECT_ID)
NEXT_PUBLIC_FIREBASE_PROJECT_ID="votre-projet-firebase"

# Bucket de stockage (doit correspondre à FIREBASE_STORAGE_BUCKET)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="votre-projet.appspot.com"

# ID de l'expéditeur de messages
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"

# ID de l'application Firebase
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

# =============================================================================
# INTELLIGENCE ARTIFICIELLE - OPENAI
# =============================================================================

# Clé API OpenAI pour les fonctionnalités IA
OPENAI_API_KEY="sk-votre-cle-openai-ici"

# =============================================================================
# INTELLIGENCE ARTIFICIELLE - GOOGLE GEMINI
# =============================================================================

# Clé API Google Gemini (alternative à OpenAI)
GEMINI_API_KEY="votre-cle-gemini-ici"

# =============================================================================
# CONFIGURATION APPLICATION
# =============================================================================

# URL de base de l'application
APP_URL="https://votre-domaine.com"

# Environnement d'exécution
NODE_ENV="production"

# Port d'écoute (généralement géré par cPanel)
PORT="3000"

# =============================================================================
# STRIPE - PAIEMENTS (OPTIONNEL)
# =============================================================================

# Clé publique Stripe (si paiements activés)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_votre_cle_publique"

# Clé secrète Stripe (si paiements activés)
# STRIPE_SECRET_KEY="sk_live_votre_cle_secrete"

# Webhook secret Stripe (si webhooks configurés)
# STRIPE_WEBHOOK_SECRET="whsec_votre_secret_webhook"

# =============================================================================
# SÉCURITÉ AVANCÉE (OPTIONNEL)
# =============================================================================

# Clé de chiffrement pour les données sensibles
# ENCRYPTION_KEY="votre-cle-de-chiffrement-32-caracteres"

# Salt pour le hachage des mots de passe
# PASSWORD_SALT="votre-salt-unique"
```

---

## 🔧 Configuration par service

### 1. Base de données

#### MySQL (cPanel standard)
```env
# Configuration MySQL locale
DATABASE_URL="mysql://windev_user:password@localhost:3306/windevexpert_prod"

# Avec SSL (si requis par l'hébergeur)
DATABASE_URL="mysql://windev_user:password@localhost:3306/windevexpert_prod?sslmode=require"

# Avec options de connexion
DATABASE_URL="mysql://windev_user:password@localhost:3306/windevexpert_prod?connection_limit=10&pool_timeout=20"
```

#### PostgreSQL (si disponible)
```env
# Configuration PostgreSQL
DATABASE_URL="postgresql://windev_user:password@localhost:5432/windevexpert_prod"

# Avec SSL
DATABASE_URL="postgresql://windev_user:password@localhost:5432/windevexpert_prod?sslmode=require"
```

### 2. NextAuth.js

#### Génération du secret
```bash
# Méthode 1 : OpenSSL
openssl rand -base64 32

# Méthode 2 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Méthode 3 : En ligne
# Visitez : https://generate-secret.vercel.app/32
```

#### Configuration complète
```env
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="AbCdEf123456789+/AbCdEf123456789+/AbCdEf=="
```

### 3. Configuration SMTP

#### cPanel Mail
```env
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASS="votre-mot-de-passe"
EMAIL_FROM="noreply@votre-domaine.com"
EMAIL_FROM_NAME="WinDevExpert"
```

#### Gmail (alternative)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-application"
EMAIL_FROM="votre-email@gmail.com"
EMAIL_FROM_NAME="WinDevExpert"
```

#### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@outlook.com"
SMTP_PASS="votre-mot-de-passe"
EMAIL_FROM="votre-email@outlook.com"
EMAIL_FROM_NAME="WinDevExpert"
```

### 4. Firebase

#### Obtention des clés Firebase

1. **Accédez à la console Firebase :** https://console.firebase.google.com
2. **Créez ou sélectionnez votre projet**
3. **Configuration Web :**
   - Paramètres du projet → Applications → Web
   - Copiez les valeurs de configuration

4. **Compte de service :**
   - Paramètres du projet → Comptes de service
   - Générez une nouvelle clé privée
   - Téléchargez le fichier JSON

#### Configuration Firebase
```env
# Configuration publique (depuis la console Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="votre-projet.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="votre-projet"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="votre-projet.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"

# Configuration serveur (depuis le fichier JSON du compte de service)
FIREBASE_PROJECT_ID="votre-projet"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@votre-projet.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET="votre-projet.appspot.com"
```

### 5. Intelligence Artificielle

#### OpenAI
```env
# Obtenez votre clé sur : https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-proj-abc123..."
```

#### Google Gemini
```env
# Obtenez votre clé sur : https://makersuite.google.com/app/apikey
GEMINI_API_KEY="AIzaSyC..."
```

---

## 🛡️ Sécurité

### 1. Permissions du fichier

```bash
# Définir les permissions appropriées
chmod 600 .env.production

# Vérifier les permissions
ls -la .env.production
```

### 2. Validation des variables

Créez `scripts/validate-env.js` :

```javascript
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM'
]

const optionalVars = [
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'FIREBASE_PROJECT_ID'
]

function validateEnvironment() {
  console.log('🔍 Validation des variables d\'environnement...\n')

  let hasErrors = false

  // Vérification des variables obligatoires
  console.log('📋 Variables obligatoires :')
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      console.log(`❌ ${varName} : MANQUANTE`)
      hasErrors = true
    } else {
      console.log(`✅ ${varName} : DÉFINIE`)
    }
  })

  // Vérification des variables optionnelles
  console.log('\n📋 Variables optionnelles :')
  optionalVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      console.log(`⚠️  ${varName} : NON DÉFINIE`)
    } else {
      console.log(`✅ ${varName} : DÉFINIE`)
    }
  })

  // Validation spécifique
  console.log('\n🔍 Validations spécifiques :')

  // NEXTAUTH_SECRET longueur
  const secret = process.env.NEXTAUTH_SECRET
  if (secret && secret.length < 32) {
    console.log('❌ NEXTAUTH_SECRET : Trop court (minimum 32 caractères)')
    hasErrors = true
  } else if (secret) {
    console.log('✅ NEXTAUTH_SECRET : Longueur appropriée')
  }

  // DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl && !dbUrl.match(/^(mysql|postgresql):\/\/.+/)) {
    console.log('❌ DATABASE_URL : Format invalide')
    hasErrors = true
  } else if (dbUrl) {
    console.log('✅ DATABASE_URL : Format valide')
  }

  // NEXTAUTH_URL format
  const authUrl = process.env.NEXTAUTH_URL
  if (authUrl && !authUrl.match(/^https?:\/\/.+/)) {
    console.log('❌ NEXTAUTH_URL : Doit commencer par http:// ou https://')
    hasErrors = true
  } else if (authUrl) {
    console.log('✅ NEXTAUTH_URL : Format valide')
  }

  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.log('❌ Validation échouée : Corrigez les erreurs ci-dessus')
    process.exit(1)
  } else {
    console.log('✅ Validation réussie : Toutes les variables sont correctes')
  }
}

// Chargement du fichier .env.production
require('dotenv').config({ path: '.env.production' })
validateEnvironment()
```

### 3. Test de connectivité

Créez `scripts/test-connections.js` :

```javascript
const { PrismaClient } = require('@prisma/client')
const nodemailer = require('nodemailer')

async function testConnections() {
  console.log('🧪 Test des connexions...\n')

  // Test base de données
  console.log('📊 Test de la base de données...')
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Base de données : Connexion réussie')
    await prisma.$disconnect()
  } catch (error) {
    console.log('❌ Base de données : Échec de connexion')
    console.log('   Erreur :', error.message)
  }

  // Test SMTP
  console.log('\n📧 Test SMTP...')
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.verify()
    console.log('✅ SMTP : Connexion réussie')
  } catch (error) {
    console.log('❌ SMTP : Échec de connexion')
    console.log('   Erreur :', error.message)
  }

  // Test Firebase (si configuré)
  if (process.env.FIREBASE_PROJECT_ID) {
    console.log('\n🔥 Test Firebase...')
    try {
      const admin = require('firebase-admin')
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        })
      }

      const bucket = admin.storage().bucket()
      await bucket.getMetadata()
      console.log('✅ Firebase : Connexion réussie')
    } catch (error) {
      console.log('❌ Firebase : Échec de connexion')
      console.log('   Erreur :', error.message)
    }
  }

  console.log('\n🎉 Tests terminés')
}

// Chargement des variables d'environnement
require('dotenv').config({ path: '.env.production' })
testConnections()
```

---

## 🚀 Déploiement

### 1. Upload du fichier .env.production

#### Via FTP/SFTP
```bash
# Upload via SCP
scp .env.production user@server:/path/to/app/.env.production

# Définir les permissions
ssh user@server "chmod 600 /path/to/app/.env.production"
```

#### Via cPanel File Manager
1. Accédez au gestionnaire de fichiers
2. Naviguez vers le dossier de l'application
3. Uploadez le fichier `.env.production`
4. Définissez les permissions à `600`

### 2. Chargement des variables

Dans votre application, assurez-vous que les variables sont chargées :

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Variables publiques uniquement
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### 3. Vérification post-déploiement

```bash
# Exécution des scripts de validation
node scripts/validate-env.js
node scripts/test-connections.js
```

---

## 🔄 Maintenance

### 1. Rotation des secrets

```bash
# Générer un nouveau secret NextAuth
openssl rand -base64 32

# Mettre à jour le fichier .env.production
# Redémarrer l'application
```

### 2. Monitoring des variables

```javascript
// scripts/monitor-env.js
function monitorEnvironment() {
  const criticalVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'SMTP_PASS']
  
  criticalVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`🚨 Variable critique manquante : ${varName}`)
      // Envoyer une alerte
    }
  })
}

setInterval(monitorEnvironment, 60000) // Vérification chaque minute
```

### 3. Sauvegarde sécurisée

```bash
# Sauvegarde chiffrée du fichier .env
gpg --symmetric --cipher-algo AES256 .env.production

# Stockage sécurisé
mv .env.production.gpg ~/backups/
```

---

## 🚨 Dépannage

### Problèmes courants

#### 1. Variables non chargées
```bash
# Vérifiez le chemin du fichier
ls -la .env.production

# Vérifiez le contenu
cat .env.production | head -5
```

#### 2. Erreur de format
```bash
# Vérifiez les caractères spéciaux
grep -n "=" .env.production | head -10
```

#### 3. Permissions incorrectes
```bash
# Corriger les permissions
chmod 600 .env.production
chown www-data:www-data .env.production
```

---

## 📞 Support

Pour les problèmes de configuration :

1. **Validation** : Utilisez `scripts/validate-env.js`
2. **Tests** : Utilisez `scripts/test-connections.js`
3. **Logs** : Consultez les logs d'application
4. **Documentation** : Référez-vous aux docs des services (Firebase, OpenAI, etc.)

---

*Guide mis à jour : Janvier 2025*