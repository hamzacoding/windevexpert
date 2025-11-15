#!/bin/bash

# Script de backup complet pour WinDevExpert VPS
set -e

# Configuration
BACKUP_DIR="/home/windevexpert/backups"
APP_DIR="/home/windevexpert/app"
LOG_FILE="/var/log/windevexpert-backup.log"
RETENTION_DAYS=7
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_REGION="${S3_REGION:-eu-west-1}"

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

# Vérification des privilèges
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté en tant que root"
    exit 1
fi

# Création des répertoires
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Fonction de backup de la base de données
backup_database() {
    log "Backup de la base de données..."
    
    DB_BACKUP_FILE="$BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql"
    
    # Backup PostgreSQL
    if command -v pg_dump &> /dev/null; then
        sudo -u postgres pg_dump windevexpert > "$DB_BACKUP_FILE"
    # Backup MySQL
    elif command -v mysqldump &> /dev/null; then
        mysqldump windevexpert > "$DB_BACKUP_FILE"
    else
        log_error "Aucun outil de backup de base de données trouvé"
        return 1
    fi
    
    # Compression du backup
    gzip "$DB_BACKUP_FILE"
    
    log_success "Backup de la base de données terminé: ${DB_BACKUP_FILE}.gz"
}

# Fonction de backup des fichiers de l'application
backup_application() {
    log "Backup des fichiers de l'application..."
    
    APP_BACKUP_FILE="$BACKUP_DIR/app_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Créer l'archive
    tar -czf "$APP_BACKUP_FILE" \
        --exclude="node_modules" \
        --exclude=".next" \
        --exclude="logs" \
        --exclude="*.log" \
        -C "$(dirname "$APP_DIR")" \
        "$(basename "$APP_DIR")"
    
    log_success "Backup de l'application terminé: $APP_BACKUP_FILE"
}

# Fonction de backup des uploads
backup_uploads() {
    log "Backup des fichiers uploadés..."
    
    UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    if [ -d "$APP_DIR/public/uploads" ]; then
        tar -czf "$UPLOADS_BACKUP_FILE" -C "$APP_DIR/public" uploads
        log_success "Backup des uploads terminé: $UPLOADS_BACKUP_FILE"
    else
        log_warning "Aucun répertoire uploads trouvé"
    fi
}

# Fonction de backup des logs
backup_logs() {
    log "Backup des logs..."
    
    LOGS_BACKUP_FILE="$BACKUP_DIR/logs_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Backup des logs PM2
    if [ -d "/home/windevexpert/logs" ]; then
        tar -czf "$LOGS_BACKUP_FILE" -C "/home/windevexpert" logs
        log_success "Backup des logs terminé: $LOGS_BACKUP_FILE"
    fi
    
    # Backup des logs système
    SYSTEM_LOGS_BACKUP="$BACKUP_DIR/system_logs_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$SYSTEM_LOGS_BACKUP" /var/log/nginx /var/log/syslog 2>/dev/null || true
    log_success "Backup des logs système terminé: $SYSTEM_LOGS_BACKUP"
}

# Fonction de backup de la configuration
backup_configuration() {
    log "Backup de la configuration..."
    
    CONFIG_BACKUP_FILE="$BACKUP_DIR/config_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Backup des fichiers de configuration
    tar -czf "$CONFIG_BACKUP_FILE" \
        /etc/nginx/sites-available/windevexpert \
        /etc/systemd/system/pm2-windevexpert.service \
        /home/windevexpert/ecosystem.config.js \
        /home/windevexpert/.env 2>/dev/null || true
    
    log_success "Backup de la configuration terminé: $CONFIG_BACKUP_FILE"
}

# Fonction de backup complet
backup_full() {
    log "Début du backup complet..."
    
    backup_database
    backup_application
    backup_uploads
    backup_logs
    backup_configuration
    
    # Créer un backup complet
    FULL_BACKUP_FILE="$BACKUP_DIR/full_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    tar -czf "$FULL_BACKUP_FILE" -C "$BACKUP_DIR" \
        --exclude="full_backup_*.tar.gz" \
        --exclude="*.tmp" \
        .
    
    log_success "Backup complet créé: $FULL_BACKUP_FILE"
    
    # Afficher la taille du backup
    BACKUP_SIZE=$(du -h "$FULL_BACKUP_FILE" | cut -f1)
    log_success "Taille du backup: $BACKUP_SIZE"
}

# Fonction de backup incrémental
backup_incremental() {
    log "Début du backup incrémental..."
    
    # Trouver le dernier backup complet
    LAST_FULL_BACKUP=$(find "$BACKUP_DIR" -name "full_backup_*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2)
    
    if [ -z "$LAST_FULL_BACKUP" ]; then
        log_warning "Aucun backup complet trouvé, création d'un backup complet..."
        backup_full
        return 0
    fi
    
    # Backup incrémental de la base de données
    backup_database
    
    # Backup incrémental des uploads (fichiers modifiés depuis le dernier backup)
    UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_incremental_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    if [ -d "$APP_DIR/public/uploads" ]; then
        find "$APP_DIR/public/uploads" -type f -newer "$LAST_FULL_BACKUP" -print0 | tar -czf "$UPLOADS_BACKUP_FILE" --null -T -
        if [ -s "$UPLOADS_BACKUP_FILE" ]; then
            log_success "Backup incrémental des uploads créé: $UPLOADS_BACKUP_FILE"
        else
            rm -f "$UPLOADS_BACKUP_FILE"
            log_info "Aucun fichier upload modifié depuis le dernier backup"
        fi
    fi
    
    log_success "Backup incrémental terminé"
}

# Fonction de backup vers S3
backup_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log_warning "Aucun bucket S3 configuré, saut de l'upload S3"
        return 0
    fi
    
    log "Upload des backups vers S3..."
    
    # Installer AWS CLI si nécessaire
    if ! command -v aws &> /dev/null; then
        log "Installation d'AWS CLI..."
        apt update && apt install -y awscli
    fi
    
    # Upload des backups récents
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime -1 -exec aws s3 cp {} "s3://$S3_BUCKET/backups/" --region "$S3_REGION" \;
    
    log_success "Upload S3 terminé"
}

# Fonction de nettoyage
cleanup_old_backups() {
    log "Nettoyage des anciens backups..."
    
    # Supprimer les backups locaux de plus de X jours
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Nettoyer les logs
    find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    log_success "Nettoyage terminé"
}

# Fonction de vérification du backup
verify_backup() {
    log "Vérification des backups..."
    
    # Vérifier l'intégrité des archives
    for backup in "$BACKUP_DIR"/*.tar.gz; do
        if [ -f "$backup" ]; then
            if tar -tzf "$backup" > /dev/null 2>&1; then
                log_success "Backup valide: $(basename "$backup")"
            else
                log_error "Backup corrompu: $(basename "$backup")"
            fi
        fi
    done
    
    # Vérifier l'espace disque
    DISK_USAGE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        log_warning "Espace disque faible: ${DISK_USAGE}% utilisé"
    fi
    
    log_success "Vérification terminée"
}

# Fonction d'envoi de notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Notification email (si configuré)
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "Backup WinDevExpert - $status" "$NOTIFICATION_EMAIL" 2>/dev/null || true
    fi
    
    # Notification webhook (si configuré)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"Backup WinDevExpert - $status: $message\"}" \
             "$WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Fonction principale
main() {
    local backup_type="${1:-full}"
    
    log "Début du script de backup (type: $backup_type)"
    
    case "$backup_type" in
        "full")
            backup_full
            ;;
        "incremental")
            backup_incremental
            ;;
        "database")
            backup_database
            ;;
        "app")
            backup_application
            ;;
        "uploads")
            backup_uploads
            ;;
        "config")
            backup_configuration
            ;;
        *)
            log_error "Type de backup invalide: $backup_type"
            log_error "Types disponibles: full, incremental, database, app, uploads, config"
            exit 1
            ;;
    esac
    
    # Upload vers S3 (si configuré)
    backup_to_s3
    
    # Nettoyage
    cleanup_old_backups
    
    # Vérification
    verify_backup
    
    # Notification
    send_notification "Succès" "Backup $backup_type terminé avec succès"
    
    log_success "Script de backup terminé"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du backup"; send_notification "Échec" "Erreur lors du backup"; exit 1' ERR

# Exécution du script
main "$@"