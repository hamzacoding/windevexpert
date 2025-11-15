# 🚀 WinDevExpert Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-green)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC)](https://tailwindcss.com/)

Une plateforme SaaS complète de formation et e-commerce pour développeurs, construite avec Next.js 15, TypeScript, Prisma et Tailwind CSS.

## ✨ Fonctionnalités Principales

### 🎓 Gestion des Formations
- 📚 **Cours Interactifs** - Support vidéo, texte et exercices
- 🎯 **Parcours d'Apprentissage** - Progression structurée avec certification
- 📊 **Tableau de Bord Étudiant** - Suivi de progression et statistiques
- 🏆 **Système de Certification** - Badges et certificats de réussite

### 🛒 E-Commerce Complet
- 🛍️ **Produits Numériques** - Vente de formations, ebooks, outils
- 💳 **Paiements Multiples** - Stripe, Chargily (Algérie), virement
- 🛡️ **Sécurisé** - Paiements sécurisés et protection anti-fraude
- 📦 **Gestion des Commandes** - Suivi complet du processus d'achat

### 🤖 Intelligence Artificielle
- 🎨 **Génération d'Images** - Création automatique de visuels
- ✍️ **Génération de Contenu** - Assistance à la création de cours
- 🔄 **Traduction Automatique** - Support multilingue
- 💡 **Recommandations** - Suggestions personnalisées

### 👨‍💼 Administration Complète
- 📈 **Tableau de Bord Admin** - Analytics et statistiques détaillées
- 👥 **Gestion des Utilisateurs** - Rôles, permissions, blocage
- 📧 **Templates Email** - Emails transactionnels personnalisables
- 💰 **Gestion Financière** - Revenus, factures, rapports

### 🔧 Fonctionnalités Techniques
- 🔐 **Authentification Sécurisée** - NextAuth.js avec multiples providers
- 📱 **Responsive Design** - Mobile-first, PWA ready
- 🌐 **Multilingue** - Support français/arabe avec i18n
- 🎨 **Thème Personnalisable** - Dark mode et personnalisation
- 📧 **Système Email** - SMTP configurable avec templates
- 🗺️ **Géolocalisation** - Support géographique avec géolocalisation

## 🏗️ Architecture Technique

### Stack Frontend
- **Next.js 15** - Framework React avec SSR/SSG
- **TypeScript** - Type safety et développement robuste
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animations fluides
- **React Hook Form** - Gestion de formulaires

### Stack Backend
- **Next.js API Routes** - API RESTful intégrée
- **Prisma** - ORM moderne avec migrations
- **PostgreSQL** - Base de données relationnelle
- **Redis** - Cache et gestion des sessions
- **NextAuth.js** - Authentification sécurisée

### Services Externes
- **Stripe** - Paiements internationaux
- **Chargily** - Paiements en Algérie
- **Firebase** - Stockage et notifications
- **OpenAI/Anthropic** - Services IA
- **SMTP** - Envoi d'emails transactionnels

## 🚀 Installation Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 14+
- Redis 6+

### 1. Clone et Installation
```bash
git clone https://github.com/votre-repo/windevexpert-platform.git
cd windevexpert-platform
npm install
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Configurer vos variables d'environnement
nano .env
```

### 3. Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Créer et migrer la base de données
npx prisma db push

# (Optionnel) Remplir avec des données de test
npx prisma db seed
```

### 4. Lancement
```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🐳 Déploiement Docker

```bash
# Construction et lancement
docker-compose up -d

# Vérification
docker-compose ps
```

## 🖥️ Déploiement VPS Ubuntu

### Installation Automatique
```bash
# Sur votre VPS Ubuntu
curl -sSL https://raw.githubusercontent.com/votre-repo/windevexpert-platform/main/vps/install.sh | bash -s -- windevexpert.com admin@email.com
```

### Installation Manuelle
Voir le dossier [`vps/`](vps/) pour les scripts d'installation complets.

## 📁 Structure du Projet

```
windevexpert-platform/
├── 📁 src/                    # Code source principal
│   ├── 📁 app/               # Pages Next.js (App Router)
│   ├── 📁 components/        # Composants React
│   ├── 📁 lib/              # Utilitaires et configuration
│   └── 📁 types/            # Définitions TypeScript
├── 📁 prisma/                # Schéma et migrations DB
├── 📁 public/                # Assets statiques
├── 📁 vps/                   # Scripts de déploiement VPS
├── 📁 installer/             # Installateur web
└── 📁 docs/                  # Documentation
```

## 🎨 Personnalisation

### Thème et Styles
- Modifier [`tailwind.config.ts`](tailwind.config.ts) pour les couleurs
- Personnaliser [`src/app/globals.css`](src/app/globals.css) pour les styles globaux
- Adapter les composants dans [`src/components/ui/`](src/components/ui/)

### Configuration
- Variables d'environnement dans [`.env`](.env.example)
- Configuration SMTP dans [`src/lib/auth.ts`](src/lib/auth.ts)
- Paramètres de paiement dans [`src/lib/services/payment.ts`](src/lib/services/)

### Contenu
- Pages de contenu dans [`src/app/`](src/app/)
- Templates email dans [`src/lib/email/templates/`](src/lib/email/templates/)
- Traductions dans [`src/lib/i18n/`](src/lib/i18n/)

## 🔐 Variables d'Environnement

### Requises
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/windevexpert"

# NextAuth
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="votre-secret-32-caracteres"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="email@gmail.com"
SMTP_PASS="mot-de-passe-app"
```

### Optionnelles
```env
# Paiements
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
CHARGILY_SECRET_KEY="votre-cle-chargily"

# IA
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Firebase
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
```

## 📊 Monitoring et Analytics

### Métriques Disponibles
- 📈 **Performance** - Temps de chargement, Core Web Vitals
- 👥 **Utilisateurs** - Inscriptions, connexions, activité
- 💰 **Revenus** - Ventes, abonnements, taux de conversion
- 📧 **Emails** - Taux d'ouverture, clics, bounce

### Monitoring
- **Prometheus** - Collecte de métriques
- **Grafana** - Dashboards de visualisation
- **Health Checks** - Endpoints de vérification

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance
```

## 📚 Documentation

- [Guide d'Installation VPS](vps/README.md) - Déploiement complet sur Ubuntu
- [Configuration Environnement](ENVIRONMENT_SETUP.md) - Variables et services
- [Setup Base de Données](DATABASE_SETUP.md) - Configuration PostgreSQL/MySQL
- [Guide Docker](docker-compose.yml) - Déploiement avec Docker

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteur

**ZEROUALA Hamza** - *Développeur Full Stack*

- 🌐 Portfolio: [https://hamzacoding.com](https://hamzacoding.com)
- 📧 Email: [hamza@windevexpert.com](mailto:hamza@windevexpert.com)
- 💼 LinkedIn: [https://linkedin.com/in/hamzacoding](https://linkedin.com/in/hamzacoding)
- 🐦 Twitter: [@hamzacoding](https://twitter.com/hamzacoding)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React incroyable
- [Prisma](https://www.prisma.io/) - ORM moderne et puissant
- [Tailwind CSS](https://tailwindcss.com/) - Pour le styling rapide
- [Vercel](https://vercel.com/) - Pour l'hébergement et l'inspiration

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile !