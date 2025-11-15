# WinDevExpert Platform - Guide d'Installation

## 🚀 Installation Automatique (Recommandée)

1. **Téléchargez et décompressez** le package sur votre serveur
2. **Accédez à l'installateur** : `https://votre-domaine.com/installer`
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

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer la configuration
nano .env
```

### 2. Installation des dépendances

```bash
# Installer les packages Node.js
npm install

# Générer le client Prisma
npx prisma generate
```

### 3. Configuration de la base de données

```bash
# Appliquer les migrations
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
```

### 4. Build de production

```bash
# Construire l'application
npm run build

# Démarrer en production
npm start
```

## 🔧 Configuration

### Variables d'environnement essentielles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion à la base de données | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Clé secrète pour l'authentification | Généré automatiquement |
| `NEXTAUTH_URL` | URL publique de votre site | `https://votre-domaine.com` |
| `ADMIN_EMAIL` | Email de l'administrateur | `admin@votre-domaine.com` |

### Configuration SMTP (Email)

Pour l'envoi d'emails (notifications, récupération de mot de passe) :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com
```

### Configuration des paiements (Optionnel)

#### Stripe
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

#### SlickPay
```env
SLICKPAY_APP_ID=votre-app-id
SLICKPAY_APP_SECRET=votre-app-secret
```

## 🌐 Configuration du serveur web

### Apache (.htaccess inclus)

Le fichier `.htaccess` est automatiquement créé. Assurez-vous que `mod_rewrite` est activé.

### Nginx

Exemple de configuration :

```nginx
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
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\. {
        deny all;
    }
}
```

## 🔒 Sécurité

### Après installation

1. **Supprimez l'installateur** : Utilisez le bouton dans l'interface ou supprimez manuellement le dossier `installer/`
2. **Vérifiez les permissions** : Les fichiers sensibles ne doivent pas être accessibles publiquement
3. **Activez HTTPS** : Configurez un certificat SSL valide
4. **Sauvegardez régulièrement** : Base de données et fichiers uploadés

### Fichiers sensibles protégés

- `.env*` - Variables d'environnement
- `*.log` - Fichiers de logs
- `storage/` - Données privées
- `node_modules/` - Dépendances

## 📞 Support

### Documentation
- **Site officiel** : [https://windevexpert.com](https://windevexpert.com)
- **Documentation technique** : [https://docs.windevexpert.com](https://docs.windevexpert.com)

### Assistance
- **Email** : support@windevexpert.com
- **Forum** : [https://forum.windevexpert.com](https://forum.windevexpert.com)

### Dépannage courant

#### Erreur de connexion à la base de données
- Vérifiez les paramètres dans `.env`
- Assurez-vous que la base de données est accessible
- Vérifiez les permissions utilisateur

#### Erreur 500 (Erreur interne du serveur)
- Consultez les logs : `storage/logs/`
- Vérifiez les permissions des fichiers
- Assurez-vous que toutes les extensions PHP sont installées

#### Page blanche après installation
- Vérifiez que le build a été généré : `.next/`
- Consultez les logs du serveur web
- Vérifiez la configuration Node.js

## 📄 Licence

WinDevExpert Platform - Tous droits réservés © 2025

---

**Version** : 1.0.0  
**Date de build** : 15/11/2025
