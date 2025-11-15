# 🔧 Configuration des Variables d'Environnement cPanel

## 📋 Variables Obligatoires

### Base de Données
```
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```
**Remplacez :**
- `username` : Nom d'utilisateur de votre base MySQL
- `password` : Mot de passe de la base
- `database_name` : Nom de votre base de données

### Authentification
```
NEXTAUTH_SECRET=votre-cle-secrete-32-caracteres-minimum
NEXTAUTH_URL=https://votre-domaine.com
```
**Générer une clé secrète :**
```bash
openssl rand -base64 32
```
Ou utilisez un générateur en ligne sécurisé.

### Application
```
NODE_ENV=production
PORT=3000
APP_URL=https://votre-domaine.com
```

### Administration
```
ADMIN_EMAIL=admin@votre-domaine.com
```

## 🔐 Variables de Sécurité

### Clé de Chiffrement
```
ENCRYPTION_KEY=votre-cle-de-chiffrement-32-caracteres
```

## 📧 Configuration Email (Optionnel)

### SMTP Standard
```
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_USER=noreply@votre-domaine.com
SMTP_PASSWORD=votre-mot-de-passe-email
SMTP_FROM=noreply@votre-domaine.com
```

### Gmail SMTP
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

## 🚀 Comment Ajouter dans cPanel

### Méthode 1 : Interface Node.js
1. Allez dans **Node.js** dans cPanel
2. Sélectionnez votre application
3. Dans la section **Environment variables**
4. Cliquez sur **Add Variable**
5. Ajoutez chaque variable une par une

### Méthode 2 : Fichier .env
1. Créez un fichier `.env` dans le dossier racine
2. Ajoutez toutes les variables
3. Uploadez le fichier via File Manager

## 📝 Template .env Complet

```env
# =============================================================================
# Configuration WinDevExpert Platform - cPanel
# =============================================================================

# Environnement
NODE_ENV=production
PORT=3000

# Application
APP_URL=https://votre-domaine.com

# Base de données MySQL
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth.js
NEXTAUTH_SECRET="votre-cle-secrete-32-caracteres-minimum"
NEXTAUTH_URL="https://votre-domaine.com"

# Administration
ADMIN_EMAIL="admin@votre-domaine.com"

# Sécurité
ENCRYPTION_KEY="votre-cle-de-chiffrement-32-caracteres"

# Configuration SMTP (Optionnel)
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASSWORD="votre-mot-de-passe-email"
SMTP_FROM="noreply@votre-domaine.com"

# Logs et Debug (Optionnel)
LOG_LEVEL="info"
DEBUG="false"
```

## 🔍 Vérification des Variables

### Via Terminal cPanel
```bash
cd public_html/windevexpert
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB manquant')"
```

### Via l'Application
1. Accédez à `https://votre-domaine.com/api/health`
2. Vérifiez le statut de la base de données

## ⚠️ Sécurité

### Permissions du Fichier .env
```bash
chmod 600 .env
```

### Variables à NE JAMAIS Exposer
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `SMTP_PASSWORD`

## 🛠️ Dépannage

### Erreur de Connexion Base de Données
1. Vérifiez `DATABASE_URL`
2. Testez la connexion :
```bash
npx prisma db pull
```

### Erreur NextAuth
1. Vérifiez `NEXTAUTH_SECRET` (minimum 32 caractères)
2. Vérifiez `NEXTAUTH_URL` (doit correspondre au domaine)

### Erreur SMTP
1. Vérifiez les paramètres avec votre hébergeur
2. Testez via l'interface admin

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs d'erreur dans cPanel
2. Vérifiez que toutes les variables sont définies
3. Contactez le support de votre hébergeur pour les paramètres SMTP/DB