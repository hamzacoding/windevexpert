# 🚀 Guide de Démarrage Rapide - WinDevExpert Platform

Ce guide vous aidera à démarrer rapidement avec la plateforme WinDevExpert.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Locale](#installation-locale)
3. [Configuration](#configuration)
4. [Développement](#développement)
5. [Déploiement](#déploiement)
6. [Dépannage](#dépannage)

## Prérequis

### Logiciels Requis
- **Node.js** 20.x ou supérieur
- **PostgreSQL** 14.x ou supérieur
- **Redis** 6.x ou supérieur (optionnel mais recommandé)
- **Git** pour le contrôle de version

### Connaissances Recommandées
- JavaScript/TypeScript de base
- React et Next.js
- SQL et bases de données relationnelles
- Concepts d'authentification et sécurité web

## Installation Locale

### 1. Cloner le Repository
```bash
git clone https://github.com/hamzacoding/WindevExpert.git
cd WindevExpert
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configurer la Base de Données
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Configurer vos variables d'environnement
nano .env
```

### 4. Préparer la Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma db push

# (Optionnel) Remplir avec des données de test
npx prisma db seed
```

### 5. Lancer le Serveur de Développement
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Configuration

### Variables d'Environnement Essentielles

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/windevexpert"

# Authentification
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-minimum-32-caracteres"

# SMTP (pour les emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-app"
```

### Configuration Optionnelle

#### Paiements
```env
# Stripe
STRIPE_SECRET_KEY="sk_test_votre-cle"
STRIPE_PUBLISHABLE_KEY="pk_test_votre-cle"

# Chargily (Algérie)
CHARGILY_SECRET_KEY="votre-cle-chargily"
```

#### Intelligence Artificielle
```env
# OpenAI
OPENAI_API_KEY="sk-votre-cle-openai"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-votre-cle-anthropic"
```

#### Firebase (Stockage et Notifications)
```env
FIREBASE_PROJECT_ID="votre-project-id"
FIREBASE_CLIENT_EMAIL="firebase@votre-projet.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Développement

### Scripts NPM Disponibles

```bash
# Mode développement
npm run dev

# Construction production
npm run build

# Lancement production
npm start

# Linting
npm run lint

# Tests
npm run test

# Générer Prisma
npx prisma generate

# Migrer base de données
npx prisma migrate dev

# Interface Prisma Studio
npx prisma studio
```

### Structure du Code

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Tableau de bord utilisateur
│   ├── nimda/             # Interface d'administration
│   └── ...
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI basiques
│   ├── admin/            # Composants admin
│   └── ...
├── lib/                   # Utilitaires et configuration
│   ├── auth.ts           # Configuration NextAuth
│   ├── db.ts             # Configuration Prisma
│   └── services/         # Services métier
└── types/                # Définitions TypeScript
```

### Points d'API Importants

- **Authentification**: `/api/auth/*`
- **Produits**: `/api/products`
- **Cours**: `/api/courses`
- **Paiements**: `/api/payments/*`
- **Admin**: `/api/admin/*`

## Déploiement

### Options de Déploiement

1. **VPS Ubuntu** (Recommandé pour la production)
   - Voir [Guide VPS](vps/README.md)

2. **Docker**
   - Voir [Docker Compose](docker-compose.yml)

3. **Vercel** (Pour le frontend)
   - Configuration automatique via Git

### Déploiement VPS Rapide

```bash
# Sur votre serveur Ubuntu
curl -sSL https://raw.githubusercontent.com/hamzacoding/WindevExpert/main/vps/install.sh | bash -s -- votre-domaine.com admin@email.com
```

## Dépannage

### Problèmes Courants

#### 1. Erreur de connexion à la base de données
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Créer la base de données
sudo -u postgres createdb windevexpert
```

#### 2. Erreur Prisma
```bash
# Régénérer le client
npx prisma generate

# Réinitialiser la base de données (attention: perte de données)
npx prisma db push --force-reset
```

#### 3. Erreur NextAuth
```bash
# Vérifier la configuration
# NEXTAUTH_URL doit correspondre à votre URL
# NEXTAUTH_SECRET doit être défini
```

#### 4. Erreur de build
```bash
# Nettoyer le cache
rm -rf .next
rm -rf node_modules/.cache

# Réinstaller les dépendances
npm install
```

### Logs et Debugging

```bash
# Voir les logs de l'application
npm run dev

# Voir les logs de Prisma
npx prisma studio

# Voir les logs système (Linux)
journalctl -f -u windevexpert
```

## Support

Si vous rencontrez des problèmes :

1. 📖 Consultez la documentation complète dans le dossier [`docs/`](docs/)
2. 🔍 Vérifiez les [issues GitHub](https://github.com/hamzacoding/WindevExpert/issues)
3. 💬 Contactez le support : [support@windevexpert.com](mailto:support@windevexpert.com)

## Ressources Additionnelles

- [Documentation API](docs/API.md)
- [Guide de Sécurité](docs/SECURITY.md)
- [Guide de Performance](docs/PERFORMANCE.md)
- [FAQ](docs/FAQ.md)

---

**🎉 Félicitations ! Vous êtes maintenant prêt à utiliser WinDevExpert Platform.**

Pour des questions ou suggestions, n'hésitez pas à ouvrir une issue sur GitHub.