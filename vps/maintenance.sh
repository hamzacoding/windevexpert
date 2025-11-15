#!/bin/bash

# Script de maintenance et monitoring pour WinDevExpert VPS
set -e

# Configuration
APP_NAME="windevexpert"
APP_USER="windevexpert"
APP_DIR="/home/windevexpert/app"
LOG_FILE="/var/log/windevexpert-maintenance.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_DISK=90

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Fonction de monitoring système
monitor_system() {
    log "Monitoring système..."
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    CPU_USAGE_INT=${CPU_USAGE%.*}
    
    # Memory usage
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    # Disk usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    # Load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | xargs)
    
    log "CPU: ${CPU_USAGE}% | Mémoire: ${MEMORY_USAGE}% | Disque: ${DISK_USAGE}% | Load: ${LOAD_AVG}"
    
    # Alertes
    if [ "$CPU_USAGE_INT" -gt "$ALERT_THRESHOLD_CPU" ]; then
        log_warning "ALERTE: Utilisation CPU élevée: ${CPU_USAGE}%"
    fi
    
    if [ "$MEMORY_USAGE" -gt "$ALERT_THRESHOLD_MEMORY" ]; then
        log_warning "ALERTE: Utilisation mémoire élevée: ${MEMORY_USAGE}%"
    fi
    
    if [ "$DISK_USAGE" -gt "$ALERT_THRESHOLD_DISK" ]; then
        log_warning "ALERTE: Utilisation disque élevée: ${DISK_USAGE}%"
    fi
    
    # Vérification des processus
    if ! pgrep -f "node.*server.js" > /dev/null; then
        log_error "ALERTE: Application Node.js non trouvée!"
        return 1
    fi
    
    if ! pgrep nginx > /dev/null; then
        log_error "ALERTE: Nginx non en cours d'exécution!"
        return 1
    fi
    
    log_success "Monitoring système terminé"
}

# Fonction de monitoring de l'application
monitor_app() {
    log "Monitoring de l'application..."
    
    # Vérifier le statut PM2
    if ! sudo -u $APP_USER pm2 status | grep -q "$APP_NAME.*online"; then
        log_error "ALERTE: L'application n'est pas en ligne!"
        return 1
    fi
    
    # Vérifier la mémoire utilisée par l'application
    APP_MEMORY=$(sudo -u $APP_USER pm2 monit | grep $APP_NAME | awk '{print $4}' | sed 's/MB//' || echo "0")
    if [ "$APP_MEMORY" -gt 800 ]; then
        log_warning "ALERTE: Mémoire application élevée: ${APP_MEMORY}MB"
    fi
    
    # Vérifier les logs d'erreur
    ERROR_COUNT=$(tail -100 /home/$APP_USER/logs/err.log 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
    if [ "$ERROR_COUNT" -gt 5 ]; then
        log_warning "ALERTE: $ERROR_COUNT erreurs détectées dans les logs récents"
    fi
    
    # Test de disponibilité HTTP
    if ! curl -f -s http://localhost:3000/health > /dev/null; then
        log_error "ALERTE: Health check échoué!"
        return 1
    fi
    
    # Vérifier la base de données
    if command -v pg_isready &> /dev/null; then
        if ! pg_isready -h localhost -p 5432; then
            log_error "ALERTE: Base de données PostgreSQL non accessible!"
            return 1
        fi
    fi
    
    log_success "Monitoring application terminé"
}

# Fonction de nettoyage des logs
cleanup_logs() {
    log "Nettoyage des logs..."
    
    # Rotation des logs PM2
    sudo -u $APP_USER pm2 flush
    
    # Nettoyer les vieux logs
    find /home/$APP_USER/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Nettoyer les logs Nginx
    if [ -f /var/log/nginx/access.log ]; then
        echo "" > /var/log/nginx/access.log
    fi
    
    # Nettoyer les logs système
    journalctl --vacuum-time=7d
    
    log_success "Nettoyage des logs terminé"
}

# Fonction de nettoyage des fichiers temporaires
cleanup_temp() {
    log "Nettoyage des fichiers temporaires..."
    
    # Nettoyer le cache NPM
    sudo -u $APP_USER npm cache clean --force 2>/dev/null || true
    
    # Nettoyer les fichiers temporaires
    rm -rf /tmp/*
    rm -rf /var/tmp/*
    
    # Nettoyer le cache APT
    apt clean
    apt autoremove -y
    
    # Nettoyer les anciens noyaux
    dpkg --list | grep linux-image | awk '{ print $2 }' | sort -V | sed -n "/$(uname -r | sed 's/-generic//')/q;p" | xargs apt -y purge 2>/dev/null || true
    
    log_success "Nettoyage temporaire terminé"
}

# Fonction de mise à jour du système
update_system() {
    log "Mise à jour du système..."
    
    # Mise à jour des paquets
    apt update
    apt upgrade -y
    
    # Mise à jour de Node.js si nécessaire
    if command -v npm &> /dev/null; then
        npm install -g npm@latest
    fi
    
    # Mise à jour de PM2
    if command -v pm2 &> /dev/null; then
        npm install -g pm2@latest
        sudo -u $APP_USER pm2 update
    fi
    
    log_success "Mise à jour du système terminée"
}

# Fonction de vérification de la sécurité
security_check() {
    log "Vérification de la sécurité..."
    
    # Vérifier les mises à jour de sécurité
    SECURITY_UPDATES=$(apt list --upgradable 2>/dev/null | grep -i security | wc -l)
    if [ "$SECURITY_UPDATES" -gt 0 ]; then
        log_warning "$SECURITY_UPDATES mises à jour de sécurité disponibles"
    fi
    
    # Vérifier les ports ouverts
    OPEN_PORTS=$(netstat -tuln | grep LISTEN | wc -l)
    log "Ports ouverts: $OPEN_PORTS"
    
    # Vérifier les tentatives de connexion SSH échouées
    FAILED_SSH=$(grep "Failed password" /var/log/auth.log 2>/dev/null | wc -l || echo "0")
    if [ "$FAILED_SSH" -gt 10 ]; then
        log_warning "$FAILED_SSH tentatives de connexion SSH échouées détectées"
    fi
    
    # Vérifier les utilisateurs récents
    RECENT_USERS=$(last | grep -v "^$" | wc -l)
    log "Connexions utilisateur récentes: $RECENT_USERS"
    
    log_success "Vérification de sécurité terminée"
}

# Fonction de maintenance de la base de données
db_maintenance() {
    log "Maintenance de la base de données..."
    
    # VACUUM et ANALYZE pour PostgreSQL
    if command -v vacuumdb &> /dev/null; then
        sudo -u postgres vacuumdb -z -v windevexpert 2>/dev/null || true
    fi
    
    # Nettoyer les vieilles sessions
    if command -v psql &> /dev/null; then
        sudo -u postgres psql -d windevexpert -c "DELETE FROM sessions WHERE expires < NOW();" 2>/dev/null || true
    fi
    
    log_success "Maintenance de la base de données terminée"
}

# Fonction de redémarrage des services
restart_services() {
    log "Redémarrage des services..."
    
    # Redémarrage de l'application
    sudo -u $APP_USER pm2 restart $APP_NAME
    
    # Redémarrage de Nginx
    systemctl restart nginx
    
    # Redémarrage de la base de données
    if command -v systemctl &> /dev/null; then
        systemctl restart postgresql || true
        systemctl restart redis || true
    fi
    
    log_success "Services redémarrés"
}

# Fonction de rapport
generate_report() {
    log "Génération du rapport de maintenance..."
    
    REPORT_FILE="/var/log/windevexpert-maintenance-report-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
RAPPORT DE MAINTENANCE WINDEVEXPERT
Date: $(date)
Serveur: $(hostname)
IP: $(hostname -I)

=== STATUT DU SYSTÈME ===
CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')%
Mémoire: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')%
Disque: $(df -h / | awk 'NR==2 {print $5}')
Load Average: $(uptime | awk -F'load average:' '{print $2}')

=== SERVICES ===
Application PM2: $(sudo -u $APP_USER pm2 status | grep $APP_NAME | wc -l) processus(s)
Nginx: $(systemctl is-active nginx)
PostgreSQL: $(systemctl is-active postgresql)

=== BACKUPS ===
Dernier backup: $(find /home/$APP_USER/backups -name "*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2 | xargs -r ls -la)
Espace backup utilisé: $(du -sh /home/$APP_USER/backups 2>/dev/null || echo "N/A")

=== LOGS ===
Erreurs récentes: $(tail -100 /home/$APP_USER/logs/err.log 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
Taille des logs: $(du -sh /home/$APP_USER/logs 2>/dev/null || echo "N/A")

=== SÉCURITÉ ===
Mises à jour disponibles: $(apt list --upgradable 2>/dev/null | wc -l)
Tentatives SSH échouées: $(grep "Failed password" /var/log/auth.log 2>/dev/null | wc -l || echo "0")

=== PERFORMANCES ===
Temps de réponse moyen: $(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/health 2>/dev/null || echo "N/A")s
Requêtes actives: $(netstat -an | grep :3000 | grep ESTABLISHED | wc -l)

EOF
    
    log_success "Rapport généré: $REPORT_FILE"
}

# Fonction d'envoi de notification
send_notification() {
    local subject="$1"
    local message="$2"
    
    # Notification email
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "$subject" "$NOTIFICATION_EMAIL" 2>/dev/null || true
    fi
    
    # Notification webhook
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"$subject: $message\"}" \
             "$WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Fonction principale
main() {
    local operation="${1:-full}"
    
    log "Début de la maintenance (opération: $operation)"
    
    case "$operation" in
        "full")
            monitor_system
            monitor_app
            cleanup_logs
            cleanup_temp
            db_maintenance
            security_check
            generate_report
            ;;
        "monitor")
            monitor_system
            monitor_app
            ;;
        "cleanup")
            cleanup_logs
            cleanup_temp
            ;;
        "update")
            update_system
            ;;
        "security")
            security_check
            ;;
        "db")
            db_maintenance
            ;;
        "restart")
            restart_services
            ;;
        "report")
            generate_report
            ;;
        *)
            log_error "Opération invalide: $operation"
            log_error "Opérations disponibles: full, monitor, cleanup, update, security, db, restart, report"
            exit 1
            ;;
    esac
    
    log_success "Maintenance terminée"
    
    # Envoyer une notification si des alertes ont été détectées
    if grep -q "ALERTE" "$LOG_FILE"; then
        send_notification "Maintenance WinDevExpert - Alertes détectées" "Des alertes ont été détectées lors de la maintenance. Consultez le log: $LOG_FILE"
    fi
}

# Gestion des erreurs
trap 'log_error "Erreur lors de la maintenance"; send_notification "Maintenance WinDevExpert - Erreur" "Erreur lors de la maintenance"; exit 1' ERR

# Exécution du script
main "$@"