# 🚀 WinDevExpert VPS - Installation Summary

## 📦 Contenu du Package VPS

Ce dossier contient tous les fichiers nécessaires pour installer WinDevExpert sur un serveur VPS Ubuntu.

### 📁 Fichiers Principaux

| Fichier | Description | Usage |
|---------|-------------|--------|
| `install.sh` | Installateur automatique principal | `curl -sSL URL/install.sh \| bash -s -- domaine.com admin@email.com` |
| `quick-install.sh` | Installation rapide avec options | `./quick-install.sh domaine.com admin@email.com --docker --ssl-auto` |
| `setup-vps-complete.sh` | Installation complète manuelle | `./setup-vps-complete.sh domaine.com admin@email.com` |
| `install-ubuntu.sh` | Script d'installation Ubuntu détaillé | `./install-ubuntu.sh` |

### 🔧 Scripts de Configuration

| Fichier | Description |
|---------|-------------|
| `setup-nginx.sh` | Configuration optimisée de Nginx avec SSL, caching, rate limiting |
| `setup-pm2.sh` | Configuration de PM2 avec monitoring et auto-restart |
| `backup.sh` | Scripts de backup complet (base de données, fichiers, configuration) |
| `maintenance.sh` | Monitoring système et maintenance automatique |

### 🐳 Docker

| Fichier | Description |
|---------|-------------|
| `docker-compose.yml` | Configuration complète avec app, db, redis, nginx, monitoring |
| `Dockerfile` | Image Docker optimisée pour production |
| `.env.vps.example` | Exemple de configuration d'environnement |

### 📊 Monitoring

| Fichier | Description |
|---------|-------------|
| `monitoring/prometheus.yml` | Configuration Prometheus pour métriques |
| `monitoring/grafana-dashboard.json` | Dashboard Grafana prêt à importer |
| `windevexpert.service` | Service systemd pour démarrage automatique |

### 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `README.md` | Guide complet d'installation et configuration |
| `INSTALLATION_SUMMARY.md` | Ce fichier - résumé rapide |

## 🎯 Méthodes d'Installation

### 1️⃣ Installation Ultra-Rapide (Recommandé)

```bash
# Connexion SSH à votre VPS
ssh root@votre-vps-ip

# Installation en une ligne
curl -sSL https://raw.githubusercontent.com/votre-repo/windevexpert/main/vps/install.sh | bash -s -- windevexpert.com admin@windevexpert.com
```

### 2️⃣ Installation Rapide avec Options

```bash
# Télécharger le script
wget https://raw.githubusercontent.com/votre-repo/windevexpert/main/vps/quick-install.sh
chmod +x quick-install.sh

# Installation avec options
./quick-install.sh windevexpert.com admin@windevexpert.com --docker --ssl-auto --monitoring
```

### 3️⃣ Installation Manuelle Complète

```bash
# Copier tous les fichiers sur le VPS
scp -r vps/ root@votre-vps-ip:/opt/windevexpert/

# Connexion SSH
ssh root@votre-vps-ip

# Installation
cd /opt/windevexpert/vps/
chmod +x *.sh
./setup-vps-complete.sh windevexpert.com admin@windevexpert.com
```

## ⚙️ Configuration Requise

### Serveur VPS Minimum
- **OS**: Ubuntu 20.04 LTS ou 22.04 LTS
- **RAM**: 2GB (4GB recommandé)
- **CPU**: 2 cœurs
- **Stockage**: 20GB (50GB recommandé)
- **Réseau**: Ports 80, 443 ouverts

### Domaine
- Nom de domaine pointant vers l'IP du VPS
- Accès DNS pour configuration des enregistrements A

## 🔧 Configuration Post-Installation

### 1. Variables d'Environnement
Modifier `/home/windevexpert/app/.env`:

```bash
# Base de données
DATABASE_URL="postgresql://windevexpert:password@localhost:5432/windevexpert"

# NextAuth
NEXTAUTH_URL="https://windevexpert.com"
NEXTAUTH_SECRET="votre-secret-32-caracteres"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-app"

# Paiements
STRIPE_SECRET_KEY="sk_test_votre-cle"
```

### 2. Commandes de Gestion

```bash
# Gestion générale
windevexpert {start|stop|restart|status|logs}

# Backup
windevexpert backup

# Monitoring
windevexpert monitor

# Mise à jour
windevexpert-update
```

### 3. Monitoring

- **Prometheus**: `http://votre-domaine.com:9090`
- **Grafana**: `http://votre-domaine.com:3001` (admin/admin123)
- **Health Check**: `http://votre-domaine.com/health`

## 🚀 Démarrage Rapide

```bash
# 1. Installation
curl -sSL https://votre-domaine.com/install.sh | bash -s -- monsite.com admin@monsite.com

# 2. Configuration
# Modifier /home/windevexpert/app/.env avec vos clés API

# 3. Test
windevexpert status
curl https://monsite.com/health
```

## 📈 Features Incluses

✅ **Installation Automatique** - Script one-line installer
✅ **SSL/TLS** - Certificats Let's Encrypt avec renouvellement auto
✅ **Nginx Optimisé** - Reverse proxy avec caching et rate limiting
✅ **PostgreSQL** - Base de données avec configuration optimale
✅ **Redis** - Cache et sessions
✅ **PM2** - Process manager avec auto-restart
✅ **Monitoring** - Prometheus + Grafana dashboard
✅ **Backup** - Scripts de backup automatique (local + S3)
✅ **Sécurité** - Firewall, fail2ban, headers de sécurité
✅ **Performance** - Gzip, caching, optimisation Node.js
✅ **Logs** - Centralisation et rotation des logs
✅ **Mise à Jour** - Scripts de mise à jour automatique

## 🔒 Sécurité

- Firewall UFW configuré
- Fail2ban pour protection SSH/HTTP
- Headers de sécurité HTTP
- Rate limiting sur les endpoints critiques
- SSL/TLS avec configuration moderne
- Monitoring des tentatives de connexion

## 📊 Monitoring

- CPU, mémoire, disque monitoring
- Application health checks
- Logs d'erreurs surveillance
- Alertes automatiques
- Dashboard Grafana complet

## 💾 Backup

- Backup quotidien automatique
- Backup hebdomadaire complet
- Backup vers S3 (optionnel)
- Retention 7 jours
- Restoration facile

## 🆘 Support

En cas de problème:
1. Vérifiez `windevexpert logs`
2. Consultez `/var/log/windevexpert-*.log`
3. Testez `windevexpert status`
4. Vérifiez `systemctl status windevexpert`

## 📞 Contact

Pour support technique ou questions:
- Email: support@windevexpert.com
- Documentation: https://docs.windevexpert.com
- GitHub: https://github.com/votre-repo/windevexpert

---

**✅ Votre installateur VPS WinDevExpert est prêt!** 
Choisissez votre méthode d'installation et déployez en production en quelques minutes.