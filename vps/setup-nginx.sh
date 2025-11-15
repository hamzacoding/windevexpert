#!/bin/bash

# Configuration Nginx optimisée pour WinDevExpert
set -e

# Variables
APP_PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-localhost}"
SSL_EMAIL="${SSL_EMAIL:-admin@localhost}"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configuration Nginx pour WinDevExpert...${NC}"

# Configuration Nginx optimisée
cat > /etc/nginx/sites-available/windevexpert << 'EOF'
# Configuration optimisée pour Next.js
upstream windevexpert_backend {
    server 127.0.0.1:APP_PORT;
    keepalive 64;
}

# Configuration HTTP → HTTPS redirect
server {
    listen 80;
    server_name DOMAIN;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS principale
server {
    listen 443 ssl http2;
    server_name DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=general:10m rate=1r/s;
    
    # Cache configuration
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=nextjs:10m max_size=100m inactive=60m;
    
    # Root directory
    root /var/www/html;
    index index.html index.htm;
    
    # Client max body size (pour les uploads)
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Static files - Cache 1 an
    location /_next/static {
        proxy_pass http://windevexpert_backend;
        proxy_cache_valid 200 1y;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Static files public - Cache 1 jour
    location /public {
        proxy_pass http://windevexpert_backend;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
        access_log off;
    }
    
    # Images - Cache 1 semaine
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://windevexpert_backend;
        proxy_cache_valid 200 1w;
        expires 1w;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }
    
    # CSS/JS - Cache 1 jour
    location ~* \.(css|js)$ {
        proxy_pass http://windevexpert_backend;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
        access_log off;
    }
    
    # API endpoints - Rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://windevexpert_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering on;
        proxy_cache nextjs;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
    }
    
    # Auth endpoints - Stricter rate limiting
    location ~ ^/api/auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://windevexpert_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /socket.io {
        proxy_pass http://windevexpert_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # All other requests
    location / {
        limit_req zone=general burst=10 nodelay;
        proxy_pass http://windevexpert_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering on;
        proxy_cache nextjs;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Robots.txt
    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
    
    # Favicon.ico
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Remplacement des variables
sed -i "s/APP_PORT/$APP_PORT/g" /etc/nginx/sites-available/windevexpert
sed -i "s/DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/windevexpert

# Activation du site
ln -sf /etc/nginx/sites-available/windevexpert /etc/nginx/sites-enabled/

# Test de la configuration
nginx -t

# Optimisation des performances Nginx
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Performance
    worker_rlimit_nofile 2048;
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Redémarrage de Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}Configuration Nginx terminée avec succès!${NC}"
echo -e "Domaine configuré: ${DOMAIN}"
echo -e "Port backend: ${APP_PORT}"
echo -e ""
echo -e "Commandes utiles:"
echo -e "  Vérifier la config: nginx -t"
echo -e "  Recharger Nginx: systemctl reload nginx"
echo -e "  Voir les logs: tail -f /var/log/nginx/error.log"