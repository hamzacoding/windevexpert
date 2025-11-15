# Guide de Configuration MySQL avec XAMPP

## 📋 Prérequis

- XAMPP installé et fonctionnel
- Node.js et npm installés
- Accès à phpMyAdmin

## 🚀 Étapes de Configuration

### 1. Démarrer XAMPP

1. Ouvrez le panneau de contrôle XAMPP
2. Démarrez **Apache** et **MySQL**
3. Vérifiez que les services sont en cours d'exécution (voyants verts)

### 2. Créer la Base de Données

#### Option A : Via phpMyAdmin (Recommandé)

1. Ouvrez votre navigateur et allez sur `http://localhost/phpmyadmin`
2. Cliquez sur l'onglet **SQL**
3. Copiez et collez le contenu du fichier `scripts/create-mysql-database.sql`
4. Cliquez sur **Exécuter**

#### Option B : Via MySQL CLI

```bash
# Connectez-vous à MySQL
mysql -u root -p

# Exécutez le script
source scripts/create-mysql-database.sql
```

### 3. Configuration de l'Application

Le fichier `.env` a déjà été mis à jour avec la configuration MySQL :

```env
DATABASE_URL="mysql://windevexpert_user:windevexpert_password@localhost:3306/windevexpert_platform"
```

### 4. Installation et Configuration

#### Option A : Script Automatique (Recommandé)

```bash
# Exécutez le script de configuration automatique
scripts/setup-mysql.bat
```

#### Option B : Configuration Manuelle

```bash
# 1. Installer le driver MySQL
npm install mysql2

# 2. Générer le client Prisma
npx prisma generate

# 3. Appliquer le schéma à la base de données
npx prisma db push

# 4. Injecter les données de seed
npx tsx scripts/mysql-seed.ts
```

### 5. Vérification

```bash
# Vérifier la connexion à la base de données
npx prisma db pull

# Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### 6. Démarrer l'Application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Résolution de Problèmes

### Erreur de Connexion MySQL

**Problème :** `Error: P1001: Can't reach database server`

**Solutions :**
1. Vérifiez que MySQL est démarré dans XAMPP
2. Vérifiez que le port 3306 n'est pas bloqué
3. Testez la connexion avec phpMyAdmin

### Erreur d'Authentification

**Problème :** `Access denied for user`

**Solutions :**
1. Vérifiez les identifiants dans le fichier `.env`
2. Recréez l'utilisateur MySQL :
   ```sql
   DROP USER IF EXISTS 'windevexpert_user'@'localhost';
   CREATE USER 'windevexpert_user'@'localhost' IDENTIFIED BY 'windevexpert_password';
   GRANT ALL PRIVILEGES ON windevexpert_platform.* TO 'windevexpert_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Erreur de Schéma

**Problème :** `Table doesn't exist`

**Solutions :**
1. Réappliquez le schéma : `npx prisma db push`
2. Vérifiez que la base de données existe dans phpMyAdmin

### Port 3306 Occupé

**Problème :** MySQL ne démarre pas dans XAMPP

**Solutions :**
1. Vérifiez les processus utilisant le port 3306 :
   ```bash
   netstat -ano | findstr :3306
   ```
2. Arrêtez les services MySQL existants :
   ```bash
   net stop mysql
   ```

## 📊 Données de Test

Après le seed, vous aurez :

### Utilisateur Admin
- **Email :** admin@windevexpert.com
- **Mot de passe :** admin123
- **Rôle :** Administrateur

### Catégories
- Développement Web
- Applications Mobiles
- Consulting IT
- Formation

### Produits de Test
- Formation React Avancée (299.99€)
- Développement Site E-commerce (2999.99€)
- Audit de Performance Web (499.99€)

### Templates d'Email
- Email de bienvenue
- Vérification d'email

## 🔒 Sécurité

### Recommandations pour la Production

1. **Changez les mots de passe par défaut :**
   ```sql
   ALTER USER 'windevexpert_user'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe_fort';
   ```

2. **Mettez à jour le fichier `.env` :**
   ```env
   DATABASE_URL="mysql://windevexpert_user:nouveau_mot_de_passe_fort@localhost:3306/windevexpert_platform"
   ```

3. **Configurez les sauvegardes automatiques**

4. **Activez SSL pour MySQL en production**

## 📝 Commandes Utiles

```bash
# Réinitialiser la base de données
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Sauvegarder la base de données
mysqldump -u windevexpert_user -p windevexpert_platform > backup.sql

# Restaurer la base de données
mysql -u windevexpert_user -p windevexpert_platform < backup.sql
```

## 🆘 Support

En cas de problème :

1. Vérifiez les logs XAMPP
2. Consultez les logs de l'application
3. Testez la connexion avec phpMyAdmin
4. Vérifiez la configuration du fichier `.env`

---

**Note :** Ce guide suppose une installation locale avec XAMPP. Pour un environnement de production, adaptez les configurations de sécurité en conséquence.