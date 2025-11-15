#!/bin/bash

# Script d'installation automatique pour WinDevExpert VPS
# Usage: curl -sSL https://votre-domaine.com/install.sh | bash -s -- votre-domaine.com admin@domaine.com

set -e

# Configuration
DOMAIN="${1:-}"
ADMIN_EMAIL="${2:-admin@localhost}"
INSTALL_DIR="/opt/windevexpert"
LOG_FILE="/var/log/windevexpert-install.log"

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
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root"
    exit 1
fi

# En-tête
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                    INSTALLATEUR WINDEVEXPERT VPS                     ║"
echo "║                    Installation Automatique Ubuntu                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Vérification des paramètres
if [ -z "$DOMAIN" ]; then
    log_error "Usage: $0 <domaine> [email_admin]"
    echo "Exemple: $0 windevexpert.com admin@windevexpert.com"
    exit 1
fi

log_info "Paramètres: Domaine=$DOMAIN, Email=$ADMIN_EMAIL"

# Fonction de téléchargement et d'installation
install_windevexpert() {
    log "Téléchargement de l'installateur..."
    
    # Créer le répertoire d'installation
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Télécharger les fichiers depuis GitHub ou un serveur
    log "Téléchargement des fichiers d'installation..."
    
    # Option 1: Depuis GitHub (à adapter selon votre repo)
    REPO_URL="https://raw.githubusercontent.com/votre-repo/windevexpert/main/vps"
    
    # Télécharger les scripts principaux
    for script in install-ubuntu.sh setup-nginx.sh setup-pm2.sh backup.sh maintenance.sh; do
        wget -q "$REPO_URL/$script" -O "$script" || {
            log_error "Impossible de télécharger $script"
            exit 1
        }
        chmod +x "$script"
    done
    
    # Télécharger les fichiers de configuration
    wget -q "$REPO_URL/docker-compose.yml" -O docker-compose.yml || true
    wget -q "$REPO_URL/Dockerfile" -O Dockerfile || true
    wget -q "$REPO_URL/.env.vps.example" -O .env.example || true
    wget -q "$REPO_URL/windevexpert.service" -O windevexpert.service || true
    
    log_success "Fichiers téléchargés"
}

# Fonction d'installation Docker (optionnelle)
install_docker_method() {
    log "Installation via Docker..."
    
    # Installation de Docker
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
    
    # Installation de Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Configuration de l'environnement
    cp .env.example .env
    sed -i "s/your_domain_here/$DOMAIN/g" .env
    sed -i "s/your_admin_email_here/$ADMIN_EMAIL/g" .env
    
    # Génération des secrets
    sed -i "s/your_nextauth_secret_here/$(openssl rand -hex 32)/g" .env
    sed -i "s/your_database_password_here/$(openssl rand -hex 16)/g" .env
    
    # Lancement des conteneurs
    docker-compose up -d
    
    log_success "Installation Docker terminée"
}

# Fonction d'installation native
install_native_method() {
    log "Installation native..."
    
    # Exécuter l'installateur Ubuntu
    ./install-ubuntu.sh
    
    log_success "Installation native terminée"
}

# Fonction de configuration post-installation
post_install_config() {
    log "Configuration post-installation..."
    
    # Créer le script de management
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
    backup)
        echo "Backup de WinDevExpert..."
        /home/windevexpert/backup.sh full
        ;;
    monitor)
        echo "Monitoring de WinDevExpert..."
        /home/windevexpert/maintenance.sh monitor
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|backup|monitor}"
        echo
        echo "Commandes disponibles:"
        echo "  start   - Démarrer l'application"
        echo "  stop    - Arrêter l'application"
        echo "  restart - Redémarrer l'application"
        echo "  status  - Voir le statut"
        echo "  logs    - Voir les logs en temps réel"
        echo "  backup  - Faire un backup complet"
        echo "  monitor - Voir les métriques système"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/windevexpert
    
    # Créer le script de désinstallation
    cat > /usr/local/bin/windevexpert-uninstall << 'EOF'
#!/bin/bash
# Script de désinstallation WinDevExpert

echo "⚠️  ATTENTION: Cette action va désinstaller complètement WinDevExpert!"
read -p "Voulez-vous continuer? (o/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Désinstallation annulée."
    exit 0
fi

echo "Désinstallation de WinDevExpert..."

# Arrêter les services
systemctl stop windevexpert 2>/dev/null || true
systemctl disable windevexpert 2>/dev/null || true

# Supprimer les fichiers
rm -rf /home/windevexpert
rm -rf /opt/windevexpert
rm -f /etc/nginx/sites-available/windevexpert
rm -f /etc/nginx/sites-enabled/windevexpert
rm -f /etc/systemd/system/windevexpert.service

# Redémarrer Nginx
systemctl restart nginx

echo "✅ Désinstallation terminée."
echo "Note: Les bases de données et certificats SSL ne sont pas supprimés."
EOF
    
    chmod +x /usr/local/bin/windevexpert-uninstall
    
    # Créer le script de mise à jour
    cat > /usr/local/bin/windevexpert-update << 'EOF'
#!/bin/bash
# Script de mise à jour WinDevExpert

echo "Mise à jour de WinDevExpert..."

# Backup avant mise à jour
/home/windevexpert/backup.sh full

# Arrêter l'application
systemctl stop windevexpert

# Mise à jour du code (à adapter selon votre méthode de déploiement)
cd /home/windevexpert/app
sudo -u windevexpert git pull origin main 2>/dev/null || {
    echo "Aucun dépôt Git trouvé, mise à jour manuelle requise."
}

# Réinstaller les dépendances
sudo -u windevexpert npm install --production
sudo -u windevexpert npm run build

# Redémarrer l'application
systemctl start windevexpert

echo "✅ Mise à jour terminée."
EOF
    
    chmod +x /usr/local/bin/windevexpert-update
    
    log_success "Configuration post-installation terminée"
}

# Fonction de création des cron jobs
setup_cron_jobs() {
    log "Configuration des tâches cron..."
    
    # Backup quotidien
    (crontab -u windevexpert -l 2>/dev/null; echo "0 2 * * * /home/windevexpert/backup.sh incremental") | crontab -u windevexpert -
    
    # Backup complet hebdomadaire
    (crontab -u windevexpert -l 2>/dev/null; echo "0 3 * * 0 /home/windevexpert/backup.sh full") | crontab -u windevexpert -
    
    # Monitoring toutes les 5 minutes
    (crontab -u windevexpert -l 2>/dev/null; echo "*/5 * * * * /home/windevexpert/maintenance.sh monitor") | crontab -u windevexpert -
    
    # Nettoyage des logs tous les jours
    (crontab -u windevexpert -l 2>/dev/null; echo "0 4 * * * /home/windevexpert/maintenance.sh cleanup") | crontab -u windevexpert -
    
    log_success "Tâches cron configurées"
}

# Fonction de test final
final_test() {
    log "Test final de l'installation..."
    
    # Test de connexion HTTP
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log_success "✅ Application accessible sur le port 3000"
    else
        log_error "❌ Application non accessible"
        return 1
    fi
    
    # Test Nginx
    if curl -f -s http://localhost/health > /dev/null; then
        log_success "✅ Nginx configuré correctement"
    else
        log_warning "⚠️  Nginx peut nécessiter une configuration manuelle"
    fi
    
    # Test SSL (si applicable)
    if [ "$DOMAIN" != "localhost" ] && command -v certbot &> /dev/null; then
        if curl -f -s https://$DOMAIN/health > /dev/null; then
            log_success "✅ SSL configuré correctement"
        else
            log_warning "⚠️  SSL peut nécessiter une configuration manuelle"
        fi
    fi
    
    log_success "Tests terminés"
}

# Fonction principale
main() {
    log "Début de l'installation automatique..."
    
    # Vérifier si Docker est disponible
    if command -v docker &> /dev/null; then
        log_info "Docker détecté - Installation via Docker recommandée"
        read -p "Utiliser Docker? (O/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            USE_DOCKER=true
        else
            USE_DOCKER=false
        fi
    else
        USE_DOCKER=false
    fi
    
    # Installation
    install_windevexpert
    
    if [ "$USE_DOCKER" = true ]; then
        install_docker_method
    else
        install_native_method
    fi
    
    # Configuration post-installation
    post_install_config
    setup_cron_jobs
    
    # Test final
    final_test
    
    # Rapport final
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    INSTALLATION TERMINÉE AVEC SUCCÈS!                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}🌐 ACCÈS:${NC}"
    echo -e "  Site Web: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  Email Admin: ${YELLOW}$ADMIN_EMAIL${NC}"
    echo
    echo -e "${BLUE}🛠️ COMMANDES:${NC}"
    echo -e "  Gestion: ${YELLOW}windevexpert {start|stop|restart|status|logs}${NC}"
    echo -e "  Backup: ${YELLOW}windevexpert backup${NC}"
    echo -e "  Monitoring: ${YELLOW}windevexpert monitor${NC}"
    echo -e "  Mise à jour: ${YELLOW}windevexpert-update${NC}"
    echo -e "  Désinstallation: ${YELLOW}windevexpert-uninstall${NC}"
    echo
    echo -e "${YELLOW}📋 À FAIRE:${NC}"
    echo -e "  1️⃣  Configurer les variables d'environnement"
    echo -e "  2️⃣  Configurer SMTP pour les emails"
    echo -e "  3️⃣  Configurer les clés API (Stripe, etc.)"
    echo -e "  4️⃣  Tester toutes les fonctionnalités"
    echo
    echo -e "${GREEN}✅ Votre serveur WinDevExpert est prêt!${NC}"
}

# Gestion des erreurs
trap 'log_error "Erreur lors de l'installation"; exit 1' ERR

# Exécution du script
main