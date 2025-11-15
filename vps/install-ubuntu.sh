#!/bin/bash

# WinDevExpert VPS Ubuntu Installer
# Script d'installation complète pour serveur VPS Ubuntu 20.04/22.04

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
DEFAULT_DOMAIN=""
DEFAULT_PORT="3000"
DEFAULT_DB_TYPE="postgresql"
DEFAULT_DB_NAME="windevexpert"
DEFAULT_DB_USER="windevexpert"
DEFAULT_NODE_VERSION="20"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Fonction pour demander les paramètres
ask_parameters() {
    echo -e "${BLUE}=== Configuration de l'installation WinDevExpert ===${NC}"
    echo
    
    read -p "Nom de domaine (ex: windevexpert.com): " DOMAIN
    read -p "Port d'écoute (défaut: 3000): " PORT
    read -p "Type de base de données (postgresql/mysql, défaut: postgresql): " DB_TYPE
    read -p "Nom de la base de données (défaut: windevexpert): " DB_NAME
    read -p "Utilisateur de la base de données (défaut: windevexpert): " DB_USER
    read -s -p "Mot de passe de la base de données: " DB_PASS
    echo
    read -s -p "Mot de passe administrateur: " ADMIN_PASS
    echo
    read -p "Email administrateur: " ADMIN_EMAIL
    
    # Utiliser les valeurs par défaut si non fournies
    PORT=${PORT:-$DEFAULT_PORT}
    DB_TYPE=${DB_TYPE:-$DEFAULT_DB_TYPE}
    DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}
    DB_USER=${DB_USER:-$DEFAULT_DB_USER}
}

# Mise à jour du système
update_system() {
    log_info "Mise à jour du système..."
    apt update && apt upgrade -y
    log_success "Système mis à jour"
}

# Installation des dépendances système
install_dependencies() {
    log_info "Installation des dépendances système..."
    
    apt install -y \
        curl \
        wget \
        git \
        nginx \
        ufw \
        certbot \
        python3-certbot-nginx \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    log_success "Dépendances système installées"
}

# Installation de Node.js
install_nodejs() {
    log_info "Installation de Node.js v${DEFAULT_NODE_VERSION}..."
    
    curl -fsSL https://deb.nodesource.com/setup_${DEFAULT_NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Installation de PM2
    npm install -g pm2
    
    log_success "Node.js v${DEFAULT_NODE_VERSION} et PM2 installés"
}

# Configuration de la base de données
setup_database() {
    log_info "Configuration de la base de données ${DB_TYPE}..."
    
    case $DB_TYPE in
        "postgresql")
            # Installation PostgreSQL
            sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
            wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
            apt update
            apt install -y postgresql postgresql-contrib
            
            # Configuration PostgreSQL
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
            
            # Configuration de l'accès distant
            sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/'" /etc/postgresql/*/main/postgresql.conf
            echo "host $DB_NAME $DB_USER 0.0.0.0/0 md5" >> /etc/postgresql/*/main/pg_hba.conf
            systemctl restart postgresql
            ;;
            
        "mysql")
            # Installation MySQL
            apt install -y mysql-server mysql-client
            
            # Configuration MySQL
            mysql -e "CREATE DATABASE $DB_NAME;"
            mysql -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
            mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
            mysql -e "FLUSH PRIVILEGES;"
            ;;
            
        *)
            log_error "Type de base de données non supporté: $DB_TYPE"
            exit 1
            ;;
    esac
    
    log_success "Base de données ${DB_TYPE} configurée"
}

# Configuration du firewall
setup_firewall() {
    log_info "Configuration du firewall UFW..."
    
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow $PORT/tcp
    
    echo "y" | ufw enable
    
    log_success "Firewall configuré"
}

# Création de l'utilisateur d'application
create_app_user() {
    log_info "Création de l'utilisateur d'application..."
    
    useradd -m -s /bin/bash windevexpert
    usermod -aG sudo windevexpert
    
    log_success "Utilisateur d'application créé"
}

# Configuration Nginx
setup_nginx() {
    log_info "Configuration de Nginx..."
    
    # Configuration Nginx pour l'application
    cat > /etc/nginx/sites-available/windevexpert << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /_next {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    client_max_body_size 50M;
}
EOF

    ln -sf /etc/nginx/sites-available/windevexpert /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
    
    log_success "Nginx configuré"
}

# Installation de l'application
install_application() {
    log_info "Installation de l'application WinDevExpert..."
    
    # Copie des fichiers dans le répertoire de l'application
    APP_DIR="/home/windevexpert/app"
    mkdir -p $APP_DIR
    
    # Copie des fichiers (à adapter selon la méthode de déploiement)
    # Ici, on suppose que les fichiers sont déjà présents ou téléchargés
    
    chown -R windevexpert:windevexpert $APP_DIR
    
    # Installation des dépendances Node.js
    cd $APP_DIR
    sudo -u windevexpert npm install --production
    
    # Configuration de l'environnement
    cat > $APP_DIR/.env << EOF
# Configuration de l'application
NODE_ENV=production
PORT=$PORT

# Configuration de la base de données
DATABASE_URL="${DB_TYPE}://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# Configuration NextAuth
NEXTAUTH_URL="https://${DOMAIN}"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"

# Configuration de l'administrateur
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASS}"

# Configuration SMTP (à configurer ultérieurement)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Configuration des paiements (à configurer ultérieurement)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
CHARGILY_SECRET_KEY=""

# Configuration Firebase (à configurer ultérieurement)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Configuration AI (à configurer ultérieurement)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
EOF

    # Construction de l'application
    sudo -u windevexpert npm run build
    
    log_success "Application installée"
}

# Configuration PM2
setup_pm2() {
    log_info "Configuration de PM2..."
    
    cat > /home/windevexpert/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'windevexpert',
    script: 'npm',
    args: 'start',
    cwd: '/home/windevexpert/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '/home/windevexpert/logs/err.log',
    out_file: '/home/windevexpert/logs/out.log',
    log_file: '/home/windevexpert/logs/combined.log',
    time: true
  }]
};
EOF

    # Création des répertoires de logs
    mkdir -p /home/windevexpert/logs
    chown -R windevexpert:windevexpert /home/windevexpert
    
    # Démarrage de l'application avec PM2
    sudo -u windevexpert pm2 start /home/windevexpert/ecosystem.config.js
    sudo -u windevexpert pm2 save
    sudo -u windevexpert pm2 startup systemd -u windevexpert --hp /home/windevexpert
    
    log_success "PM2 configuré"
}

# Configuration SSL
setup_ssl() {
    if [ ! -z "$DOMAIN" ]; then
        log_info "Configuration du certificat SSL..."
        
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $ADMIN_EMAIL
        
        # Configuration du renouvellement automatique
        echo "0 12 * * * root certbot renew --quiet" >> /etc/crontab
        
        log_success "Certificat SSL configuré"
    fi
}

# Nettoyage et finalisation
cleanup() {
    log_info "Nettoyage et finalisation..."
    
    apt autoremove -y
    apt autoclean
    
    log_success "Installation terminée"
}

# Fonction principale
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Installation WinDevExpert VPS Ubuntu ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
    
    # Demande des paramètres
    ask_parameters
    
    # Exécution des étapes d'installation
    update_system
    install_dependencies
    install_nodejs
    setup_database
    setup_firewall
    create_app_user
    setup_nginx
    install_application
    setup_pm2
    setup_ssl
    cleanup
    
    echo
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Installation terminée avec succès !  ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo
    echo -e "${BLUE}Informations de connexion:${NC}"
    echo -e "  Domaine: ${YELLOW}https://${DOMAIN}${NC}"
    echo -e "  Port: ${YELLOW}${PORT}${NC}"
    echo -e "  Email admin: ${YELLOW}${ADMIN_EMAIL}${NC}"
    echo
    echo -e "${BLUE}Commandes utiles:${NC}"
    echo -e "  Voir les logs: ${YELLOW}pm2 logs${NC}"
    echo -e "  Redémarrer l'app: ${YELLOW}pm2 restart windevexpert${NC}"
    echo -e "  Statut: ${YELLOW}pm2 status${NC}"
    echo
    echo -e "${YELLOW}N'oubliez pas de:${NC}"
    echo -e "  1. Configurer les variables d'environnement dans ${YELLOW}/home/windevexpert/app/.env${NC}"
    echo -e "  2. Configurer SMTP pour les emails"
    echo -e "  3. Configurer les clés API pour les paiements"
    echo -e "  4. Configurer Firebase si nécessaire"
}

# Exécution du script
main "$@"