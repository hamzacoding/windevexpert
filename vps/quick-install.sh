#!/bin/bash

# Installation rapide de WinDevExpert sur VPS Ubuntu
# Usage: ./quick-install.sh <domaine> <email_admin>

set -e

# Configuration
SCRIPT_URL="https://raw.githubusercontent.com/votre-repo/windevexpert/main/vps"
INSTALL_DIR="/opt/windevexpert"
LOG_FILE="/var/log/windevexpert-install.log"

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

# Vérification des paramètres
if [ $# -lt 2 ]; then
    echo "Usage: $0 <domaine> <email_admin> [options]"
    echo "Options:"
    echo "  --docker     Utiliser Docker au lieu d'une installation native"
    echo "  --ssl-auto   Configuration SSL automatique avec Let's Encrypt"
    echo "  --backup-s3  Configurer le backup vers S3"
    echo "  --monitoring Installer le monitoring (Prometheus/Grafana)"
    exit 1
fi

DOMAIN="$1"
ADMIN_EMAIL="$2"
USE_DOCKER=false
SSL_AUTO=false
BACKUP_S3=false
MONITORING=false

# Analyse des options
while [[ $# -gt 2 ]]; do
    case "$3" in
        --docker)
            USE_DOCKER=true
            ;;
        --ssl-auto)
            SSL_AUTO=true
            ;;
        --backup-s3)
            BACKUP_S3=true
            ;;
        --monitoring)
            MONITORING=true
            ;;
    esac
    shift
done

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root"
    exit 1
fi

# En-tête
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Installation Rapide WinDevExpert VPS  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Domaine: ${YELLOW}$DOMAIN${NC}"
echo -e "Email Admin: ${YELLOW}$ADMIN_EMAIL${NC}"
echo -e "Docker: ${YELLOW}$USE_DOCKER${NC}"
echo -e "SSL Auto: ${YELLOW}$SSL_AUTO${NC}"
echo -e "Backup S3: ${YELLOW}$BACKUP_S3${NC}"
echo -e "Monitoring: ${YELLOW}$MONITORING${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Fonction d'installation native
install_native() {
    log "Installation native..."
    
    # Téléchargement des scripts
    log "Téléchargement des scripts d'installation..."
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Télécharger les scripts (à adapter selon votre repo)
    wget -q "$SCRIPT_URL/install-ubuntu.sh" -O install-ubuntu.sh || {
        log_error "Impossible de télécharger les scripts"
        exit 1
    }
    
    chmod +x install-ubuntu.sh
    
    # Exécution de l'installation
    log "Exécution de l'installation Ubuntu..."
    ./install-ubuntu.sh
    
    log_success "Installation native terminée"
}

# Fonction d'installation Docker
install_docker() {
    log "Installation Docker..."
    
    # Installation de Docker et Docker Compose
    log "Installation de Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
    
    # Installation de Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Téléchargement des fichiers Docker
    log "Téléchargement des fichiers Docker..."
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    wget -q "$SCRIPT_URL/docker-compose.yml" -O docker-compose.yml
    wget -q "$SCRIPT_URL/Dockerfile" -O Dockerfile
    wget -q "$SCRIPT_URL/.env.vps.example" -O .env
    
    # Configuration de l'environnement
    log "Configuration de l'environnement..."
    sed -i "s/your_domain_here/$DOMAIN/g" .env
    sed -i "s/your_admin_email_here/$ADMIN_EMAIL/g" .env
    
    # Génération des secrets
    sed -i "s/your_nextauth_secret_here/$(openssl rand -hex 32)/g" .env
    sed -i "s/your_database_password_here/$(openssl rand -hex 16)/g" .env
    
    # Lancement des conteneurs
    log "Lancement des conteneurs Docker..."
    docker-compose up -d
    
    log_success "Installation Docker terminée"
}

# Configuration SSL
setup_ssl() {
    if [ "$SSL_AUTO" = true ]; then
        log "Configuration SSL automatique..."
        
        # Installation de Certbot
        apt install -y certbot python3-certbot-nginx
        
        # Obtention du certificat
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL"
        
        # Configuration du renouvellement automatique
        echo "0 12 * * * root certbot renew --quiet" >> /etc/crontab
        
        log_success "SSL configuré automatiquement"
    fi
}

# Configuration S3 Backup
setup_s3_backup() {
    if [ "$BACKUP_S3" = true ]; then
        log "Configuration du backup S3..."
        
        # Installation d'AWS CLI
        apt install -y awscli
        
        # Configuration AWS (nécessite des clés)
        log_warning "Configuration AWS requise. Veuillez configurer AWS CLI manuellement."
        log_info "Utilisez: aws configure"
        
        log_success "Préparation S3 backup terminée"
    fi
}

# Configuration du monitoring
setup_monitoring() {
    if [ "$MONITORING" = true ]; then
        log "Installation du monitoring..."
        
        # Installation de Prometheus et Grafana via Docker
        cd "$INSTALL_DIR"
        
        # Créer le fichier docker-compose monitoring
        cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: windevexpert-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: windevexpert-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    container_name: windevexpert-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
EOF
        
        # Lancer le monitoring
        docker-compose -f docker-compose.monitoring.yml up -d
        
        log_success "Monitoring installé"
    fi
}

# Configuration finale
final_setup() {
    log "Configuration finale..."
    
    # Créer un script de management
    cat > /usr/local/bin/windevexpert << 'EOF'
#!/bin/bash

# Script de management WinDevExpert

case "$1" in
    start)
        echo "Démarrage de WinDevExpert..."
        # Commande de démarrage
        ;;
    stop)
        echo "Arrêt de WinDevExpert..."
        # Commande d'arrêt
        ;;
    restart)
        echo "Redémarrage de WinDevExpert..."
        # Commande de redémarrage
        ;;
    status)
        echo "Statut de WinDevExpert..."
        # Commande de statut
        ;;
    logs)
        echo "Logs de WinDevExpert..."
        # Commande de logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/windevexpert
    
    # Configuration UFW
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_success "Configuration finale terminée"
}

# Fonction principale
main() {
    log "Début de l'installation rapide..."
    
    # Mise à jour du système
    log "Mise à jour du système..."
    apt update && apt upgrade -y
    
    # Installation selon le mode choisi
    if [ "$USE_DOCKER" = true ]; then
        install_docker
    else
        install_native
    fi
    
    # Configuration supplémentaire
    setup_ssl
    setup_s3_backup
    setup_monitoring
    final_setup
    
    echo
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Installation terminée avec succès !   ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo
    echo -e "${BLUE}Accès:${NC}"
    echo -e "  Site web: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  Email admin: ${YELLOW}$ADMIN_EMAIL${NC}"
    echo
    if [ "$MONITORING" = true ]; then
        echo -e "${BLUE}Monitoring:${NC}"
        echo -e "  Prometheus: ${YELLOW}http://$DOMAIN:9090${NC}"
        echo -e "  Grafana: ${YELLOW}http://$DOMAIN:3001${NC}"
        echo
    fi
    echo -e "${BLUE}Commandes:${NC}"
    echo -e "  Gestion: ${YELLOW}windevexpert {start|stop|restart|status|logs}${NC}"
    echo -e "  Logs: ${YELLOW}tail -f /var/log/windevexpert-*.log${NC}"
    echo
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo -e "  1. Configurez les variables d'environnement"
    echo -e "  2. Configurez SMTP pour les emails"
    echo -e "  3. Configurez les clés API (Stripe, etc.)"
    echo -e "  4. Testez le site web"
    echo
}

# Exécution du script
main "$@"