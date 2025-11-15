#!/bin/bash

# Installation complète de WinDevExpert sur VPS Ubuntu
# Ce script configure un serveur VPS Ubuntu de A à Z

set -e

# Configuration
DOMAIN="${1:-}"
ADMIN_EMAIL="${2:-admin@localhost}"
DB_PASSWORD="${3:-$(openssl rand -hex 16)}"
NEXTAUTH_SECRET="${4:-$(openssl rand -hex 32)}"

# Répertoires
INSTALL_DIR="/opt/windevexpert"
APP_DIR="/home/windevexpert/app"
BACKUP_DIR="/home/windevexpert/backups"
LOG_DIR="/var/log/windevexpert"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root"
    exit 1
fi

# En-tête
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                    WINCEVEXPERT VPS INSTALLER                      ║"
echo "║                    Installation Complète Ubuntu                    ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Vérification des paramètres
if [ -z "$DOMAIN" ]; then
    log_error "Usage: $0 <domaine> [email_admin] [db_password] [nextauth_secret]"
    echo "Exemple: $0 windevexpert.com admin@windevexpert.com"
    exit 1
fi

log_info "Paramètres de configuration:"
log_info "  Domaine: $DOMAIN"
log_info "  Email Admin: $ADMIN_EMAIL"
log_info "  Database Password: ${DB_PASSWORD:0:10}..."
log_info "  NextAuth Secret: ${NEXTAUTH_SECRET:0:10}..."
echo

# Fonction de confirmation
confirm_installation() {
    echo -e "${YELLOW}⚠️  ATTENTION: Ce script va installer et configurer complètement votre serveur VPS.${NC}"
    echo -e "${YELLOW}   Cela inclut l'installation de paquets système, la configuration de services, etc.${NC}"
    echo
    read -p "Voulez-vous continuer? (o/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        log_info "Installation annulée."
        exit 0
    fi
}

# Étape 1: Mise à jour du système
update_system() {
    log "Mise à jour du système..."
    
    apt update && apt upgrade -y
    apt install -y software-properties-common apt-transport-https ca-certificates curl gnupg lsb-release
    
    log_success "Système mis à jour"
}

# Étape 2: Installation des dépendances système
install_dependencies() {
    log "Installation des dépendances système..."
    
    # Dépendances de base
    apt install -y \
        build-essential \
        git \
        wget \
        curl \
        unzip \
        htop \
        tree \
        nginx \
        ufw \
        fail2ban \
        certbot \
        python3-certbot-nginx \
        python3-pip \
        python3-venv \
        logrotate \
        cron \
        rsync
    
    log_success "Dépendances système installées"
}

# Étape 3: Installation de Node.js
install_nodejs() {
    log "Installation de Node.js 20 LTS..."
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Vérification
    node_version=$(node --version)
    npm_version=$(npm --version)
    log_success "Node.js installé: $node_version"
    log_success "NPM installé: $npm_version"
}

# Étape 4: Installation de PostgreSQL
install_postgresql() {
    log "Installation de PostgreSQL..."
    
    # Ajout du dépôt PostgreSQL
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt update
    
    # Installation
    apt install -y postgresql postgresql-contrib postgresql-client
    
    # Démarrage et activation
    systemctl start postgresql
    systemctl enable postgresql
    
    log_success "PostgreSQL installé et démarré"
}

# Étape 5: Configuration de la base de données
setup_database() {
    log "Configuration de la base de données..."
    
    # Création de l'utilisateur et de la base
    sudo -u postgres psql << EOF
CREATE USER windevexpert WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE windevexpert OWNER windevexpert;
GRANT ALL PRIVILEGES ON DATABASE windevexpert TO windevexpert;
\c windevexpert;
GRANT ALL ON SCHEMA public TO windevexpert;
GRANT CREATE ON SCHEMA public TO windevexpert;
EOF
    
    # Configuration de l'accès distant (optionnel)
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/'" /etc/postgresql/*/main/postgresql.conf
    echo "host windevexpert windevexpert 0.0.0.0/0 md5" >> /etc/postgresql/*/main/pg_hba.conf
    
    # Redémarrage
    systemctl restart postgresql
    
    log_success "Base de données configurée"
}

# Étape 6: Installation de Redis
install_redis() {
    log "Installation de Redis..."
    
    apt install -y redis-server
    
    # Configuration
    sed -i 's/^supervised no$/supervised systemd/' /etc/redis/redis.conf
    sed -i 's/^maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
    sed -i 's/^maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    # Démarrage et activation
    systemctl start redis-server
    systemctl enable redis-server
    
    log_success "Redis installé et configuré"
}

# Étape 7: Création de l'utilisateur d'application
create_app_user() {
    log "Création de l'utilisateur d'application..."
    
    # Création de l'utilisateur
    useradd -m -s /bin/bash -G sudo windevexpert
    
    # Configuration SSH
    mkdir -p /home/windevexpert/.ssh
    chmod 700 /home/windevexpert/.ssh
    chown windevexpert:windevexpert /home/windevexpert/.ssh
    
    log_success "Utilisateur d'application créé"
}

# Étape 8: Configuration du firewall
setup_firewall() {
    log "Configuration du firewall UFW..."
    
    # Configuration de base
    ufw default deny incoming
    ufw default allow outgoing
    
    # Ports essentiels
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 3000/tcp  # Port de l'application
    ufw allow 5432/tcp # PostgreSQL (optionnel, à restreindre)
    ufw allow 6379/tcp # Redis (optionnel, à restreindre)
    
    # Activation
    echo "y" | ufw enable
    
    log_success "Firewall configuré"
}

# Étape 9: Installation et configuration de Nginx
setup_nginx() {
    log "Configuration de Nginx..."
    
    # Configuration optimisée
    cat > /etc/nginx/sites-available/windevexpert << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Client max body size
    client_max_body_size 50M;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Auth endpoints - stricter rate limiting
    location ~ ^/api/auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF

    # Remplacement du domaine
    sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/windevexpert
    
    # Activation du site
    ln -sf /etc/nginx/sites-available/windevexpert /etc/nginx/sites-enabled/
    
    # Test et redémarrage
    nginx -t && systemctl restart nginx
    
    log_success "Nginx configuré"
}

# Étape 10: Installation de l'application
install_application() {
    log "Installation de l'application WinDevExpert..."
    
    # Copie des fichiers depuis le dossier vps
    if [ -d "/vagrant/vps" ] || [ -d "./vps" ]; then
        SOURCE_DIR="${VAGRANT_MOUNT:-./vps}"
        cp -r "$SOURCE_DIR"/* /home/windevexpert/
    else
        log_warning "Dossier source non trouvé, création d'une structure minimale..."
        mkdir -p "$APP_DIR"
        mkdir -p /home/windevexpert/logs
        mkdir -p /home/windevexpert/backups
    fi
    
    # Configuration des permissions
    chown -R windevexpert:windevexpert /home/windevexpert
    
    # Installation des dépendances Node.js
    cd "$APP_DIR"
    sudo -u windevexpert npm install --production
    sudo -u windevexpert npx prisma generate
    
    # Création du fichier d'environnement
    cat > "$APP_DIR/.env" << EOF
# Configuration de l'application
NODE_ENV=production
PORT=3000

# Configuration NextAuth
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Configuration de la base de données
DATABASE_URL="postgresql://windevexpert:$DB_PASSWORD@localhost:5432/windevexpert"

# Configuration SMTP (à configurer)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Configuration des paiements (à configurer)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
CHARGILY_SECRET_KEY=""

# Configuration Firebase (à configurer)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Configuration AI (à configurer)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
EOF
    
    # Construction de l'application
    sudo -u windevexpert npm run build
    
    log_success "Application installée"
}

# Étape 11: Configuration PM2
setup_pm2() {
    log "Configuration de PM2..."
    
    # Installation de PM2
    npm install -g pm2
    
    # Création de la configuration
    cat > /home/windevexpert/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'windevexpert',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 5,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/windevexpert/logs/err.log',
    out_file: '/home/windevexpert/logs/out.log',
    log_file: '/home/windevexpert/logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000
  }]
};
EOF
    
    # Démarrage de l'application
    cd /home/windevexpert
    sudo -u windevexpert pm2 start ecosystem.config.js
    sudo -u windevexpert pm2 save
    
    # Configuration du démarrage automatique
    sudo -u windevexpert pm2 startup systemd -u windevexpert --hp /home/windevexpert
    
    log_success "PM2 configuré"
}

# Étape 12: Configuration SSL
setup_ssl() {
    if [ "$DOMAIN" != "localhost" ]; then
        log "Configuration du certificat SSL..."
        
        # Obtention du certificat
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL"
        
        # Configuration du renouvellement automatique
        echo "0 12 * * * root certbot renew --quiet" >> /etc/crontab
        
        log_success "Certificat SSL configuré"
    else
        log_warning "SSL non configuré (domaine: localhost)"
    fi
}

# Étape 13: Configuration de la sécurité
setup_security() {
    log "Configuration de la sécurité..."
    
    # Configuration de fail2ban
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
EOF
    
    # Redémarrage de fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    # Configuration SSH
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    
    log_success "Sécurité configurée"
}

# Étape 14: Configuration des backups
setup_backups() {
    log "Configuration des backups..."
    
    # Création du script de backup
    cp /vps/backup.sh /home/windevexpert/backup.sh 2>/dev/null || {
        log_warning "Script de backup non trouvé, création d'un script basique..."
        cat > /home/windevexpert/backup.sh << 'EOF'
#!/bin/bash
# Script de backup basique
BACKUP_DIR="/home/windevexpert/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump windevexpert > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /home/windevexpert app --exclude=node_modules --exclude=.next
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF
    }
    
    chmod +x /home/windevexpert/backup.sh
    chown windevexpert:windevexpert /home/windevexpert/backup.sh
    
    # Configuration du cron
    (crontab -u windevexpert -l 2>/dev/null; echo "0 2 * * * /home/windevexpert/backup.sh") | crontab -u windevexpert -
    
    log_success "Backups configurés"
}

# Étape 15: Configuration du monitoring
setup_monitoring() {
    log "Configuration du monitoring..."
    
    # Création du script de monitoring
    cp /vps/maintenance.sh /home/windevexpert/maintenance.sh 2>/dev/null || {
        log_warning "Script de maintenance non trouvé, création d'un script basique..."
        cat > /home/windevexpert/maintenance.sh << 'EOF'
#!/bin/bash
# Script de monitoring basique
echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%"
echo "Memory: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')%"
echo "Disk: $(df -h / | awk 'NR==2 {print $5}')"
pm2 status
EOF
    }
    
    chmod +x /home/windevexpert/maintenance.sh
    chown windevexpert:windevexpert /home/windevexpert/maintenance.sh
    
    log_success "Monitoring configuré"
}

# Étape 16: Nettoyage et finalisation
cleanup() {
    log "Nettoyage et finalisation..."
    
    # Nettoyage des paquets
    apt autoremove -y
    apt autoclean
    
    # Création du fichier de configuration systemd
    cat > /etc/systemd/system/windevexpert.service << EOF
[Unit]
Description=WinDevExpert Application
After=network.target postgresql.service nginx.service

[Service]
Type=forking
User=windevexpert
Group=windevexpert
WorkingDirectory=/home/windevexpert
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
ExecStopPost=/usr/bin/pm2 kill
RemainAfterExit=yes
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Activation du service
    systemctl daemon-reload
    systemctl enable windevexpert.service
    
    # Création du script de management
    cat > /usr/local/bin/windevexpert << 'EOF'
#!/bin/bash
# Script de management WinDevExpert

case "$1" in
    start)
        echo "Démarrage de WinDevExpert..."
        systemctl start windevexpert
        ;;
    stop)
        echo "Arrêt de WinDevExpert..."
        systemctl stop windevexpert
        ;;
    restart)
        echo "Redémarrage de WinDevExpert..."
        systemctl restart windevexpert
        ;;
    status)
        echo "Statut de WinDevExpert:"
        systemctl status windevexpert
        ;;
    logs)
        echo "Logs de WinDevExpert:"
        journalctl -u windevexpert -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/windevexpert
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    confirm_installation
    
    log_info "Début de l'installation complète..."
    
    # Exécution des étapes
    update_system
    install_dependencies
    install_nodejs
    install_postgresql
    setup_database
    install_redis
    create_app_user
    setup_firewall
    setup_nginx
    install_application
    setup_pm2
    setup_ssl
    setup_security
    setup_backups
    setup_monitoring
    cleanup
    
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    INSTALLATION TERMINÉE AVEC SUCCÈS!                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}📊 INFORMATIONS DE CONNEXION:${NC}"
    echo -e "  🌐 Site Web: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  📧 Email Admin: ${YELLOW}$ADMIN_EMAIL${NC}"
    echo -e "  🔑 Database Password: ${YELLOW}$DB_PASSWORD${NC}"
    echo
    echo -e "${BLUE}🛠️ COMMANDES UTILES:${NC}"
    echo -e "  🚀 Gestion: ${YELLOW}windevexpert {start|stop|restart|status|logs}${NC}"
    echo -e "  📊 Monitoring: ${YELLOW}/home/windevexpert/maintenance.sh${NC}"
    echo -e "  💾 Backup: ${YELLOW}/home/windevexpert/backup.sh${NC}"
    echo -e "  📋 Logs: ${YELLOW}journalctl -u windevexpert -f${NC}"
    echo
    echo -e "${BLUE}📁 RÉPERTOIRES IMPORTANTS:${NC}"
    echo -e "  📂 Application: ${YELLOW}$APP_DIR${NC}"
    echo -e "  💾 Backups: ${YELLOW}/home/windevexpert/backups${NC}"
    echo -e "  📝 Logs: ${YELLOW}/home/windevexpert/logs${NC}"
    echo
    echo -e "${YELLOW}⚠️ PROCHAINES ÉTAPES:${NC}"
    echo -e "  1️⃣  Configurer les variables d'environnement dans ${YELLOW}$APP_DIR/.env${NC}"
    echo -e "  2️⃣  Configurer SMTP pour les emails"
    echo -e "  3️⃣  Configurer les clés API (Stripe, etc.)"
    echo -e "  4️⃣  Configurer Firebase si nécessaire"
    echo -e "  5️⃣  Tester le site web"
    echo -e "  6️⃣  Configurer les DNS"
    echo
    echo -e "${GREEN}✅ Installation terminée! Votre serveur WinDevExpert est prêt!${NC}"
}

# Gestion des erreurs
trap 'log_error "Erreur lors de l'installation"; exit 1' ERR

# Exécution du script
main "$@"