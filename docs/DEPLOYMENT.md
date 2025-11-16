# 🚀 Guide de Déploiement - WinDevExpert Platform

Guide complet pour déployer WinDevExpert Platform sur différentes plateformes.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Docker](#déploiement-docker)
3. [Déploiement VPS](#déploiement-vps)
4. [Déploiement Cloud](#déploiement-cloud)
5. [Configuration SSL](#configuration-ssl)
6. [Monitoring](#monitoring)
7. [Backup](#backup)
8. [Mise à Jour](#mise-à-jour)
9. [Dépannage](#dépannage)

## 📋 Prérequis

### Configuration Système

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 2+ cœurs
- **RAM**: 4GB minimum (8GB recommandé)
- **Storage**: 20GB minimum (50GB recommandé)
- **Network**: Port 80, 443, 3000, 5432

### Logiciels Requis

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl wget git nginx postgresql redis-server docker.io docker-compose

# Installation Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification des installations
node --version  # v18.x.x
npm --version   # 8.x.x
docker --version
docker-compose --version
```

### Variables d'Environnement

Créer le fichier `.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.windevexpert.com
FRONTEND_URL=https://windevexpert.com

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=windevexpert_prod
DB_USER=windevexpert_user
DB_PASSWORD=your_secure_password
DB_SSL=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@windevexpert.com

# File Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=windevexpert-uploads

# Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Docker
COMPOSE_PROJECT_NAME=windevexpert
```

## 🐳 Déploiement Docker

### 1. Configuration Docker Compose

Créer `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.windevexpert.com
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - windevexpert-network

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=windevexpert_prod
      - DB_USER=windevexpert_user
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - windevexpert-network
    volumes:
      - ./uploads:/app/uploads

  # Base de données PostgreSQL
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=windevexpert_prod
      - POSTGRES_USER=windevexpert_user
      - POSTGRES_PASSWORD=${