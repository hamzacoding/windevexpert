# 🚀 Guide d'Installation WinDevExpert sur cPanel

## 📋 Prérequis

### Hébergement cPanel
- **Node.js activé** (version 18+ recommandée)
- **Base de données MySQL** ou **PostgreSQL**
- **Accès SSH** (optionnel mais recommandé)
- **Domaine configuré**

### Fichiers nécessaires
- Archive `windevexpert-platform-v0.1.0.tar.gz`
- Accès à votre cPanel

## 🔧 Étape 1: Configuration de l'Application Node.js dans cPanel

### 1.1 Créer l'Application Node.js

1. **Connectez-vous à cPanel**
2. **Allez dans "Node.js"** (section Software/Logiciels)
3. **Cliquez sur "CREATE APPLICATION"**
4. **Configurez les paramètres :**

```
Node.js version: 18.24.1 (ou la plus récente disponible)
Application mode: Production
Application root: /public_html/windevexpert (ou votre dossier préféré)
Application URL: votre-domaine.com (ou sous-domaine)
Application startup file: server.js
```

5. **Cliquez sur "CREATE"**

### 1.2 Variables d'Environnement

Ajoutez ces variables d'environnement dans cPanel :

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://username:password@localhost:3306/database_name
NEXTAUTH_SECRET=votre-cle-secrete-generee
NEXTAUTH_URL=https://votre-domaine.com
```

## 📁 Étape 2: Upload et Extraction des Fichiers

### 2.1 Upload de l'Archive

1. **Allez dans "File Manager"** (Gestionnaire de fichiers)
2. **Naviguez vers le dossier de votre application** (`/public_html/windevexpert/`)
3. **Uploadez** `windevexpert-platform-v0.1.0.tar.gz`
4. **Clic droit > Extract** pour décompresser

### 2.2 Structure des Fichiers

Après extraction, vous devriez avoir :
```
/public_html/windevexpert/
├── src/
├── public/
├── prisma/
├── installer/
├── package.json
├── server.js (à créer)
└── .env (à configurer)
```

## ⚙️ Étape 3: Configuration

### 3.1 Créer le Fichier de Démarrage

Créez `server.js` dans le dossier racine :

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### 3.2 Configuration de la Base de Données

1. **Créez une base de données** dans cPanel (MySQL Databases)
2. **Notez les informations de connexion**
3. **Configurez le fichier `.env`** :

```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth.js
NEXTAUTH_SECRET="votre-cle-secrete-32-caracteres-minimum"
NEXTAUTH_URL="https://votre-domaine.com"

# Email SMTP (optionnel)
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASSWORD="votre-mot-de-passe-email"
SMTP_FROM="noreply@votre-domaine.com"

# Sécurité
ENCRYPTION_KEY="votre-cle-de-chiffrement-32-caracteres"

# Administration
ADMIN_EMAIL="admin@votre-domaine.com"
```

## 🔨 Étape 4: Installation des Dépendances

### 4.1 Via Terminal SSH (Recommandé)

Si vous avez accès SSH :

```bash
cd /home/username/public_html/windevexpert
npm install --production
npx prisma generate
npx prisma db push
npm run build
```

### 4.2 Via cPanel Terminal

1. **Allez dans "Terminal"** dans cPanel
2. **Naviguez vers votre dossier** :
```bash
cd public_html/windevexpert
```
3. **Installez les dépendances** :
```bash
npm install --production
```
4. **Configurez Prisma** :
```bash
npx prisma generate
npx prisma db push
```
5. **Construisez l'application** :
```bash
npm run build
```

## 🚀 Étape 5: Démarrage de l'Application

### 5.1 Redémarrer l'Application Node.js

1. **Retournez dans "Node.js"** dans cPanel
2. **Trouvez votre application**
3. **Cliquez sur "RESTART"**

### 5.2 Vérification

1. **Visitez votre domaine** : `https://votre-domaine.com`
2. **Vérifiez que l'application se charge**
3. **Testez l'accès admin** : `https://votre-domaine.com/admin`

## 🛠️ Étape 6: Configuration Avancée (Optionnel)

### 6.1 Configuration SSL

1. **Activez SSL** dans cPanel (Let's Encrypt)
2. **Forcez HTTPS** dans les paramètres du domaine

### 6.2 Configuration des Emails

Si vous utilisez l'email du domaine :
```env
SMTP_HOST="mail.votre-domaine.com"
SMTP_PORT="587"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASSWORD="mot-de-passe-email"
```

### 6.3 Optimisation des Performances

Ajoutez dans `.htaccess` (si Apache) :
```apache
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

# Cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🔍 Dépannage

### Problèmes Courants

#### 1. Erreur "npm command not found"
```bash
# Vérifiez que Node.js est activé dans cPanel
# Redémarrez l'application Node.js
```

#### 2. Erreur de base de données
```bash
# Vérifiez DATABASE_URL dans .env
# Assurez-vous que la base de données existe
# Vérifiez les permissions utilisateur
```

#### 3. Erreur 500 (Internal Server Error)
```bash
# Consultez les logs d'erreur dans cPanel
# Vérifiez que tous les fichiers sont uploadés
# Assurez-vous que server.js existe
```

#### 4. Application ne démarre pas
```bash
# Vérifiez le fichier de démarrage dans la config Node.js
# Assurez-vous que le port est correct
# Redémarrez l'application dans cPanel
```

### Logs et Monitoring

1. **Logs d'erreur** : Consultables dans cPanel > Error Logs
2. **Logs Node.js** : Visibles dans la section Node.js de cPanel
3. **Monitoring** : Utilisez les outils de monitoring de votre hébergeur

## 📞 Support

### Ressources
- **Documentation cPanel** : Consultez la documentation de votre hébergeur
- **Support technique** : Contactez le support de votre hébergement
- **Logs d'application** : Consultez les logs pour diagnostiquer les problèmes

### Commandes Utiles

```bash
# Vérifier l'état de l'application
pm2 status

# Redémarrer l'application
pm2 restart all

# Voir les logs en temps réel
pm2 logs

# Vérifier la version Node.js
node --version

# Vérifier les dépendances installées
npm list --depth=0
```

## ✅ Checklist Post-Installation

- [ ] Application Node.js créée dans cPanel
- [ ] Fichiers uploadés et extraits
- [ ] Base de données créée et configurée
- [ ] Variables d'environnement définies
- [ ] Dépendances installées (`npm install`)
- [ ] Prisma configuré (`npx prisma generate && npx prisma db push`)
- [ ] Application construite (`npm run build`)
- [ ] Application redémarrée dans cPanel
- [ ] Site accessible via le navigateur
- [ ] SSL activé (recommandé)
- [ ] Emails configurés (optionnel)
- [ ] Sauvegarde configurée

---

**🎉 Votre application WinDevExpert est maintenant installée sur cPanel !**

Pour toute assistance supplémentaire, consultez les logs d'erreur dans cPanel ou contactez le support technique de votre hébergeur.