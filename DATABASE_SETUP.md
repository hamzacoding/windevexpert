# Configuration Base de Données - WinDevExpert Platform

## 📋 Vue d'ensemble

Ce guide détaille la configuration de la base de données pour le déploiement sur cPanel, incluant la migration depuis SQLite vers MySQL/PostgreSQL.

---

## 🔄 Migration depuis SQLite

### 1. Sauvegarde des données existantes

```bash
# Export des données depuis SQLite
npx prisma db pull
npx prisma db seed --preview-feature
```

### 2. Modification du schema Prisma

Éditez `prisma/schema.prisma` :

```prisma
// Remplacez
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Par (pour MySQL)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Ou (pour PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🗄️ Configuration MySQL (Recommandé)

### 1. Création via cPanel

#### Étapes dans cPanel :
1. **Bases de données MySQL** → **Créer une nouvelle base de données**
   ```
   Nom : windevexpert_prod
   ```

2. **Utilisateurs MySQL** → **Ajouter un nouvel utilisateur**
   ```
   Nom d'utilisateur : windev_user
   Mot de passe : [générez un mot de passe fort]
   ```

3. **Ajouter un utilisateur à la base de données**
   - Utilisateur : `windev_user`
   - Base de données : `windevexpert_prod`
   - Privilèges : **TOUS LES PRIVILÈGES**

### 2. URL de connexion

```env
# Format général
DATABASE_URL="mysql://username:password@host:port/database"

# Exemple pour cPanel
DATABASE_URL="mysql://windev_user:motdepasse@localhost:3306/windevexpert_prod"

# Avec SSL (si requis)
DATABASE_URL="mysql://windev_user:motdepasse@localhost:3306/windevexpert_prod?sslmode=require"
```

### 3. Adaptations du schéma pour MySQL

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  role          String    @default("USER")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  description String?   @db.Text
  slug        String    @unique
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  products    Product[]

  @@map("categories")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  categoryId  String   @map("category_id")
  imageUrl    String?  @map("image_url")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@map("products")
}
```

---

## 🐘 Configuration PostgreSQL (Alternative)

### 1. Création via cPanel PostgreSQL

```sql
-- Connexion en tant qu'administrateur
CREATE DATABASE windevexpert_prod;
CREATE USER windev_user WITH PASSWORD 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON DATABASE windevexpert_prod TO windev_user;

-- Permissions supplémentaires
GRANT USAGE ON SCHEMA public TO windev_user;
GRANT CREATE ON SCHEMA public TO windev_user;
```

### 2. URL de connexion PostgreSQL

```env
# Format général
DATABASE_URL="postgresql://username:password@host:port/database"

# Exemple pour cPanel
DATABASE_URL="postgresql://windev_user:motdepasse@localhost:5432/windevexpert_prod"

# Avec SSL
DATABASE_URL="postgresql://windev_user:motdepasse@localhost:5432/windevexpert_prod?sslmode=require"
```

---

## 🚀 Déploiement de la base de données

### 1. Génération du client Prisma

```bash
# Génération du client pour la nouvelle base
npx prisma generate
```

### 2. Application des migrations

```bash
# Création et application des migrations
npx prisma migrate deploy

# Ou pour un nouveau déploiement
npx prisma db push
```

### 3. Vérification de la connexion

```bash
# Test de connexion
npx prisma db pull

# Visualisation des données
npx prisma studio
```

### 4. Peuplement initial (optionnel)

```bash
# Exécution du seed
npm run db:seed
```

---

## 🔧 Scripts de migration

### Script de migration des données

Créez `scripts/migrate-data.js` :

```javascript
const { PrismaClient } = require('@prisma/client')

async function migrateData() {
  const prisma = new PrismaClient()

  try {
    console.log('🚀 Début de la migration des données...')

    // Vérification de la connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données établie')

    // Migration des catégories
    const categories = [
      {
        name: 'Développement Web',
        description: 'Cours et ressources pour le développement web',
        slug: 'developpement-web'
      },
      {
        name: 'Mobile',
        description: 'Applications mobiles et développement mobile',
        slug: 'mobile'
      },
      {
        name: 'Intelligence Artificielle',
        description: 'IA, Machine Learning et Deep Learning',
        slug: 'intelligence-artificielle'
      }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    }

    console.log('✅ Migration des catégories terminée')

    // Ajoutez ici d'autres migrations de données...

    console.log('🎉 Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

### Exécution du script

```bash
node scripts/migrate-data.js
```

---

## 🔍 Vérification et tests

### 1. Tests de connexion

```bash
# Test de connexion simple
npx prisma db pull

# Test avec requête
npx prisma studio
```

### 2. Tests de performance

```javascript
// scripts/test-db-performance.js
const { PrismaClient } = require('@prisma/client')

async function testPerformance() {
  const prisma = new PrismaClient()

  console.time('Connection Test')
  await prisma.$connect()
  console.timeEnd('Connection Test')

  console.time('Simple Query')
  const userCount = await prisma.user.count()
  console.timeEnd('Simple Query')

  console.log(`Nombre d'utilisateurs: ${userCount}`)

  await prisma.$disconnect()
}

testPerformance()
```

### 3. Monitoring des requêtes

```javascript
// Dans votre configuration Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

---

## 🛠️ Maintenance

### 1. Sauvegardes automatiques

#### MySQL
```bash
#!/bin/bash
# backup-mysql.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u windev_user -p windevexpert_prod > "backup_${DATE}.sql"
gzip "backup_${DATE}.sql"
```

#### PostgreSQL
```bash
#!/bin/bash
# backup-postgresql.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U windev_user -h localhost windevexpert_prod > "backup_${DATE}.sql"
gzip "backup_${DATE}.sql"
```

### 2. Optimisation des performances

```sql
-- MySQL - Optimisation des index
ANALYZE TABLE users, products, categories;
OPTIMIZE TABLE users, products, categories;

-- PostgreSQL - Mise à jour des statistiques
ANALYZE;
VACUUM ANALYZE;
```

### 3. Monitoring

```javascript
// scripts/db-health-check.js
const { PrismaClient } = require('@prisma/client')

async function healthCheck() {
  const prisma = new PrismaClient()

  try {
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Base de données accessible')

    // Test de requête
    const start = Date.now()
    await prisma.user.findFirst()
    const duration = Date.now() - start
    console.log(`✅ Temps de réponse: ${duration}ms`)

    // Vérification des tables
    const tables = await prisma.$queryRaw`SHOW TABLES`
    console.log(`✅ Nombre de tables: ${tables.length}`)

  } catch (error) {
    console.error('❌ Erreur de santé de la base:', error)
  } finally {
    await prisma.$disconnect()
  }
}

healthCheck()
```

---

## 🚨 Dépannage

### Problèmes courants

#### 1. Erreur de connexion
```bash
# Vérifiez les credentials
echo $DATABASE_URL

# Test de connexion directe
mysql -u windev_user -p -h localhost windevexpert_prod
```

#### 2. Erreur de migration
```bash
# Reset des migrations (ATTENTION: perte de données)
npx prisma migrate reset

# Migration manuelle
npx prisma db push --force-reset
```

#### 3. Problème de permissions
```sql
-- MySQL
GRANT ALL PRIVILEGES ON windevexpert_prod.* TO 'windev_user'@'localhost';
FLUSH PRIVILEGES;

-- PostgreSQL
GRANT ALL PRIVILEGES ON DATABASE windevexpert_prod TO windev_user;
```

#### 4. Problème de charset (MySQL)
```sql
ALTER DATABASE windevexpert_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📞 Support

Pour les problèmes de base de données :

1. **Vérifiez les logs** : `tail -f ~/logs/mysql.log`
2. **Testez la connexion** : `npx prisma db pull`
3. **Consultez la documentation** : [Prisma Docs](https://www.prisma.io/docs)
4. **Support hébergeur** : Pour les problèmes d'infrastructure

---

*Guide mis à jour : Janvier 2025*