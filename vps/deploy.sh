#!/bin/bash

# Script de déploiement automatique pour WinDevExpert VPS
set -e

# Configuration
APP_NAME="windevexpert"
APP_USER="windevexpert"
APP_DIR="/home/$APP_USER/app"
BACKUP_DIR="/home/$APP_USER/backups"
LOG_FILE="/var/log/windevexpert-deploy.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root"
    exit 1
fi

# Fonction de backup
create_backup() {
    log "Création d'une sauvegarde..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup de la base de données
    if command -v pg_dump &> /dev/null; then
        sudo -u postgres pg_dump windevexpert > "$BACKUP_DIR/${BACKUP_NAME}_db.sql"
    fi
    
    # Backup des fichiers
    if [ -d "$APP_DIR" ]; then
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz" -C "$(dirname $APP_DIR)" "$(basename $APP_DIR)"
    fi
    
    # Nettoyer les backups de plus de 7 jours
    find "$BACKUP_DIR" -name "backup_*" -mtime +7 -delete
    
    log_success "Backup créé: $BACKUP_NAME"
}

# Mise à jour du système
update_system() {
    log "Mise à jour du système..."
    apt update && apt upgrade -y
    log_success "Système mis à jour"
}

# Installation des dépendances
install_dependencies() {
    log "Installation des dépendances..."
    
    # Vérifier si Node.js est installé
    if ! command -v node &> /dev/null; then
        log "Installation de Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    
    # Vérifier si PM2 est installé
    if ! command -v pm2 &> /dev/null; then
        log "Installation de PM2..."
        npm install -g pm2
    fi
    
    # Vérifier si Nginx est installé
    if ! command -v nginx &> /dev/null; then
        log "Installation de Nginx..."
        apt install -y nginx
    fi
    
    log_success "Dépendances installées"
}

# Téléchargement du code
download_code() {
    log "Téléchargement du code..."
    
    # Créer l'utilisateur s'il n'existe pas
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
    fi
    
    # Arrêter l'application actuelle
    if pm2 status | grep -q "$APP_NAME"; then
        log "Arrêt de l'application actuelle..."
        sudo -u "$APP_USER" pm2 stop "$APP_NAME" || true
    fi
    
    # Sauvegarder l'ancienne version
    if [ -d "$APP_DIR" ]; then
        mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copier les nouveaux fichiers depuis le dossier vps
    if [ -d "./windevexpert-package" ]; then
        cp -r ./windevexpert-package "$APP_DIR"
    else
        log_error "Dossier windevexpert-package non trouvé"
        exit 1
    fi
    
    # Définir les permissions
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    
    log_success "Code téléchargé et installé"
}

# Installation des dépendances Node.js
install_node_deps() {
    log "Installation des dépendances Node.js..."
    
    cd "$APP_DIR"
    sudo -u "$APP_USER" npm install --production
    sudo -u "$APP_USER" npx prisma generate
    
    log_success "Dépendances Node.js installées"
}

# Configuration de l'application
configure_app() {
    log "Configuration de l'application..."
    
    # Créer le fichier .env s'il n'existe pas
    if [ ! -f "$APP_DIR/.env" ]; then
        cat > "$APP_DIR/.env" << EOF
# Configuration de l'application
NODE_ENV=production
PORT=3000

# Configuration NextAuth
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -hex 32)

# Configuration de la base de données
DATABASE_URL=postgresql://windevexpert:${DB_PASS}@localhost:5432/windevexpert

# Configuration SMTP (à configurer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Configuration des paiements (à configurer)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
CHARGILY_SECRET_KEY=

# Configuration Firebase (à configurer)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Configuration AI (à configurer)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOF
    fi
    
    # Construction de l'application
    cd "$APP_DIR"
    sudo -u "$APP_USER" npm run build
    
    log_success "Application configurée"
}

# Configuration Nginx
configure_nginx() {
    log "Configuration Nginx..."
    
    # Créer la configuration Nginx
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
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
    
    # Activer le site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
    
    log_success "Nginx configuré"
}

# Configuration SSL
setup_ssl() {
    if [ ! -z "$DOMAIN" ]; then
        log "Configuration SSL..."
        
        # Installer Certbot si nécessaire
        if ! command -v certbot &> /dev/null; then
            apt install -y certbot python3-certbot-nginx
        fi
        
        # Obtenir le certificat SSL
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || true
        
        log_success "SSL configuré"
    fi
}

# Démarrage de l'application
start_app() {
    log "Démarrage de l'application..."
    
    # Créer la configuration PM2
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/$APP_USER/logs/err.log',
    out_file: '/home/$APP_USER/logs/out.log',
    log_file: '/home/$APP_USER/logs/combined.log',
    time: true
  }]
};
EOF
    
    # Créer les répertoires de logs
    mkdir -p "/home/$APP_USER/logs"
    chown -R "$APP_USER:$APP_USER" "/home/$APP_USER"
    
    # Démarrer l'application
    cd "$APP_DIR"
    sudo -u "$APP_USER" pm2 start ecosystem.config.js
    sudo -u "$APP_USER" pm2 save
    
    # Configuration du démarrage automatique
    sudo -u "$APP_USER" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"
    
    log_success "Application démarrée"
}

# Configuration du monitoring
setup_monitoring() {
    log "Configuration du monitoring..."
    
    # Créer un script de monitoring
    cat > "/home/$APP_USER/monitor.sh" << 'EOF'
#!/bin/bash
# Script de monitoring simple

APP_NAME="windevexpert"
LOG_FILE="/home/windevexpert/logs/monitor.log"

if ! pm2 status | grep -q "$APP_NAME.*online"; then
    echo "$(date): ALERTE - L'application n'est pas en ligne!" >> "$LOG_FILE"
    pm2 restart "$APP_NAME"
else
    echo "$(date): Application OK" >> "$LOG_FILE"
fi
EOF
    
    chmod +x "/home/$APP_USER/monitor.sh"
    chown "$APP_USER:$APP_USER" "/home/$APP_USER/monitor.sh"
    
    # Ajouter au cron
    (crontab -u "$APP_USER" -l 2>/dev/null; echo "*/5 * * * * /home/$APP_USER/monitor.sh") | crontab -u "$APP_USER" -
    
    log_success "Monitoring configuré"
}

# Nettoyage
cleanup() {
    log "Nettoyage..."
    
    # Supprimer les anciennes versions (garder les 3 dernières)
    find "/home/$APP_USER" -maxdepth 1 -name "app.backup.*" -type d | sort -r | tail -n +4 | xargs rm -rf
    
    # Nettoyer les packages
    apt autoremove -y
    apt autoclean
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Déploiement WinDevExpert VPS Ubuntu ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
    
    # Vérifier les paramètres
    if [ -z "$1" ]; then
        log_error "Usage: $0 <domaine> [email_admin]"
        exit 1
    fi
    
    DOMAIN="$1"
    ADMIN_EMAIL="${2:-admin@$DOMAIN}"
    
    log "Début du déploiement pour le domaine: $DOMAIN"
    
    # Exécution des étapes
    create_backup
    update_system
    install_dependencies
    download_code
    install_node_deps
    configure_app
    configure_nginx
    setup_ssl
    start_app
    setup_monitoring
    cleanup
    
    echo
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Déploiement terminé avec succès !    ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo
    echo -e "${BLUE}Informations:${NC}"
    echo -e "  Domaine: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  Email admin: ${YELLOW}$ADMIN_EMAIL${NC}"
    echo -e "  Logs: ${YELLOW}/home/$APP_USER/logs/${NC}"
    echo
    echo -e "${BLUE}Commandes utiles:${NC}"
    echo -e "  Voir les logs: ${YELLOW}pm2 logs$NC}"
    echo -e "  Statut: ${YELLOW}pm2 status${NC}"
    echo -e "  Redémarrer: ${YELLOW}pm2 restart $APP_NAME${NC}"
    echo
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo -e "  1. Configurer les variables d'environnement dans ${YELLOW}/home/$APP_USER/app/.env${NC}"
    echo -e "  2. Configurer SMTP pour les emails"
    echo -e "  3. Configurer les clés API pour les paiements"
    echo -e "  4. Configurer Firebase si nécessaire"
}

# Exécution du script
main "$@"