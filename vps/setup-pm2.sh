#!/bin/bash

# Configuration PM2 pour WinDevExpert
set -e

# Variables
APP_USER="${APP_USER:-windevexpert}"
APP_DIR="${APP_DIR:-/home/windevexpert/app}"
APP_PORT="${PORT:-3000}"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Configuration PM2 pour WinDevExpert...${NC}"

# Installation de PM2 globalement si nécessaire
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installation de PM2...${NC}"
    npm install -g pm2
fi

# Création du fichier de configuration PM2
cat > $APP_DIR/ecosystem.config.js << EOF
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
      PORT: $APP_PORT
    },
    error_file: '/home/$APP_USER/logs/err.log',
    out_file: '/home/$APP_USER/logs/out.log',
    log_file: '/home/$APP_USER/logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    source_map_support: true
  }],
  
  deploy: {
    production: {
      user: '$APP_USER',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/votre-repo/windevexpert.git',
      path: '$APP_DIR',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
EOF

# Création du fichier de configuration systemd pour PM2
cat > /etc/systemd/system/pm2-$APP_USER.service << EOF
[Unit]
Description=PM2 process manager for $APP_USER
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$APP_USER
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=8
TimeoutStopSec=8
Restart=always
RestartSec=3
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/bin
Environment=PM2_HOME=/home/$APP_USER/.pm2
PIDFile=/home/$APP_USER/.pm2/pm2.pid

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

# Création des répertoires de logs
mkdir -p /home/$APP_USER/logs
chown -R $APP_USER:$APP_USER /home/$APP_USER

# Configuration PM2 pour l'utilisateur
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# Sauvegarde de la configuration PM2
sudo -u $APP_USER pm2 save

# Activation du service systemd
systemctl daemon-reload
systemctl enable pm2-$APP_USER
systemctl start pm2-$APP_USER

# Création d'un script de démarrage/arrêt
cat > /home/$APP_USER/pm2-control.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "Démarrage de l'application WinDevExpert..."
        pm2 start ecosystem.config.js
        ;;
    stop)
        echo "Arrêt de l'application WinDevExpert..."
        pm2 stop windevexpert
        ;;
    restart)
        echo "Redémarrage de l'application WinDevExpert..."
        pm2 restart windevexpert
        ;;
    reload)
        echo "Rechargement de l'application WinDevExpert..."
        pm2 reload windevexpert
        ;;
    status)
        echo "Statut de l'application WinDevExpert:"
        pm2 status
        ;;
    logs)
        echo "Logs de l'application WinDevExpert:"
        pm2 logs windevexpert --lines 50
        ;;
    monitor)
        echo "Monitoring de l'application WinDevExpert:"
        pm2 monit
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reload|status|logs|monitor}"
        exit 1
        ;;
esac
EOF

chmod +x /home/$APP_USER/pm2-control.sh
chown $APP_USER:$APP_USER /home/$APP_USER/pm2-control.sh

# Création d'un script de monitoring
cat > /home/$APP_USER/monitor.sh << 'EOF'
#!/bin/bash

# Script de monitoring pour WinDevExpert
LOG_FILE="/home/APP_USER/logs/monitor.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Vérifier si l'application est en cours d'exécution
if ! pm2 status | grep -q "windevexpert.*online"; then
    log_message "ALERTE: L'application WinDevExpert n'est pas en cours d'exécution!"
    pm2 restart windevexpert
    log_message "Redémarrage de l'application effectué."
fi

# Vérifier l'utilisation de la mémoire
MEMORY_USAGE=$(pm2 monit | grep windevexpert | awk '{print $4}' | sed 's/MB//')
if [ ! -z "$MEMORY_USAGE" ] && [ "$MEMORY_USAGE" -gt 800 ]; then
    log_message "ALERTE: Utilisation mémoire élevée: ${MEMORY_USAGE}MB"
fi

# Vérifier les logs d'erreur récents
ERROR_COUNT=$(tail -100 /home/APP_USER/logs/err.log | grep -c "ERROR\|FATAL" || echo "0")
if [ "$ERROR_COUNT" -gt 5 ]; then
    log_message "ALERTE: $ERROR_COUNT erreurs détectées dans les logs récents"
fi

log_message "Monitoring terminé - $(pm2 status | grep windevexpert)"
EOF

sed -i "s/APP_USER/$APP_USER/g" /home/$APP_USER/monitor.sh
chmod +x /home/$APP_USER/monitor.sh
chown $APP_USER:$APP_USER /home/$APP_USER/monitor.sh

# Configuration du cron pour le monitoring
(crontab -u $APP_USER -l 2>/dev/null; echo "*/5 * * * * /home/$APP_USER/monitor.sh") | crontab -u $APP_USER -

# Création d'un script de rotation des logs
cat > /home/$APP_USER/rotate-logs.sh << 'EOF'
#!/bin/bash

# Rotation des logs PM2
pm2 flush

# Archivage des logs
LOG_DIR="/home/APP_USER/logs"
DATE=$(date +%Y%m%d_%H%M%S)

if [ -d "$LOG_DIR" ]; then
    cd $LOG_DIR
    
    # Archivage des logs existants
    for log in err.log out.log combined.log; do
        if [ -f "$log" ] && [ -s "$log" ]; then
            mv "$log" "${log%.log}_${DATE}.log"
            gzip "${log%.log}_${DATE}.log"
        fi
    done
    
    # Suppression des archives de plus de 30 jours
    find $LOG_DIR -name "*.log.gz" -mtime +30 -delete
fi

# Redémarrage des logs PM2
pm2 reloadLogs
EOF

sed -i "s/APP_USER/$APP_USER/g" /home/$APP_USER/rotate-logs.sh
chmod +x /home/$APP_USER/rotate-logs.sh
chown $APP_USER:$APP_USER /home/$APP_USER/rotate-logs.sh

# Configuration du cron pour la rotation des logs
(crontab -u $APP_USER -l 2>/dev/null; echo "0 2 * * 0 /home/$APP_USER/rotate-logs.sh") | crontab -u $APP_USER -

echo -e "${GREEN}Configuration PM2 terminée avec succès!${NC}"
echo -e "Commandes disponibles:"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh start${NC}"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh stop${NC}"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh restart${NC}"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh status${NC}"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh logs${NC}"
echo -e "  ${YELLOW}sudo -u $APP_USER /home/$APP_USER/pm2-control.sh monitor${NC}"
echo -e ""
echo -e "Service systemd: ${YELLOW}systemctl {start|stop|restart|status} pm2-$APP_USER${NC}"