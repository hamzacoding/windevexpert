#!/bin/bash

# Script d'installation complet pour WinDevExpert VPS
# Ce script est autonome et ne dépend pas de GitHub
# Usage: sudo bash install-complete.sh

set -e

# Configuration
APP_NAME="windevexpert"
APP_USER="windevexpert"
APP_DIR="/var/www/windevexpert"
NODE_VERSION="18"
LOG_FILE="/var/log/windevexpert-install.log"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1" | tee -a "$LOG_FILE"
}

# Vérifier si le script est exécuté en root
if [[ $EUID -ne 0 ]]; then
   error "Ce script doit être exécuté en tant que root (sudo)"
fi

# Vérifier la version d'Ubuntu
UBUNTU_VERSION=$(lsb_release -rs)
if [[ ! "$UBUNTU_VERSION" =~ ^(20\.04|22\.04|24\.04)$ ]]; then
    warning "Cette version d'Ubuntu ($UBUNTU_VERSION) n'est pas officiellement supportée"
    warning "Le script va continuer mais des problèmes peuvent survenir"
fi

log "Démarrage de l'installation de WinDevExpert VPS"
log "Version Ubuntu: $UBUNTU_VERSION"

# Mise à jour du système
log "Mise à jour du système..."
apt-get update -y >> "$LOG_FILE" 2>&1
apt-get upgrade -y >> "$LOG_FILE" 2>&1
success "Système mis à jour"

# Installation des dépendances système
log "Installation des dépendances système..."
apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    htop \
    nano \
    vim >> "$LOG_FILE" 2>&1
success "Dépendances système installées"

# Installation de Node.js
log "Installation de Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - >> "$LOG_FILE" 2>&1
apt-get install -y nodejs >> "$LOG_FILE" 2>&1
success "Node.js installé"

# Vérification de Node.js
NODE_VERSION_INSTALLED=$(node --version)
NPM_VERSION_INSTALLED=$(npm --version)
log "Node.js version: $NODE_VERSION_INSTALLED"
log "NPM version: $NPM_VERSION_INSTALLED"

# Installation de PM2
log "Installation de PM2..."
npm install -g pm2 >> "$LOG_FILE" 2>&1
success "PM2 installé"

# Création de l'utilisateur système
log "Création de l'utilisateur système..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    success "Utilisateur $APP_USER créé"
else
    warning "L'utilisateur $APP_USER existe déjà"
fi

# Création du répertoire de l'application
log "Création du répertoire de l'application..."
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
success "Répertoire créé: $APP_DIR"

# Configuration de la base de données locale (SQLite)
log "Configuration de la base de données..."
mkdir -p "$APP_DIR/data"
chown "$APP_USER:$APP_USER" "$APP_DIR/data"
success "Base de données configurée"

# Création de l'application Node.js
log "Création de l'application Node.js..."
cd "$APP_DIR"

# Création du package.json
cat > package.json << 'EOF'
{
  "name": "windevexpert-platform",
  "version": "1.0.0",
  "description": "Plateforme WinDevExpert - Gestion des projets et des clients",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:logs": "pm2 logs"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "sqlite3": "^5.1.6",
    "sequelize": "^6.32.1",
    "node-cron": "^3.0.2",
    "nodemailer": "^6.9.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["windev", "project-management", "crm"],
  "author": "WinDevExpert",
  "license": "MIT"
}
EOF

# Installation des dépendances
log "Installation des dépendances Node.js..."
sudo -u "$APP_USER" npm install >> "$LOG_FILE" 2>&1
success "Dépendances installées"

# Création du serveur Express principal
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://votre-domaine.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/projects', require('./routes/projects'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/auth', require('./routes/auth'));

// Route principale
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WinDevExpert Platform</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 600px;
                width: 90%;
            }
            h1 {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                font-weight: 300;
            }
            .status {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(76, 175, 80, 0.2);
                padding: 0.5rem 1rem;
                border-radius: 50px;
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                background: #4CAF50;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 2rem;
            }
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 1rem;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .feature h3 {
                font-size: 1rem;
                margin-bottom: 0.5rem;
                font-weight: 600;
            }
            .feature p {
                font-size: 0.85rem;
                opacity: 0.8;
                font-weight: 300;
            }
            .api-link {
                display: inline-block;
                margin-top: 2rem;
                padding: 0.75rem 1.5rem;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                transition: all 0.3s ease;
                font-weight: 500;
            }
            .api-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>WinDevExpert</h1>
            <p class="subtitle">Plateforme de Gestion de Projets</p>
            <div class="status">
                <div class="status-dot"></div>
                <span>Plateforme Opérationnelle</span>
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>📊 Dashboard</h3>
                    <p>Suivi en temps réel de vos projets</p>
                </div>
                <div class="feature">
                    <h3>👥 Gestion Clients</h3>
                    <p>Base de données clients complète</p>
                </div>
                <div class="feature">
                    <h3>📈 Analytics</h3>
                    <p>Statistiques et rapports détaillés</p>
                </div>
                <div class="feature">
                    <h3>🔒 Sécurité</h3>
                    <p>Protection avancée des données</p>
                </div>
            </div>
            
            <a href="/api/health" class="api-link">📡 Vérifier l'API</a>
        </div>
    </body>
    </html>
  `);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Serveur WinDevExpert démarré sur le port \${PORT}\`);
  console.log(\`📡 API disponible sur http://localhost:\${PORT}/api\`);
});
EOF

# Création du dossier routes
mkdir -p routes

# Route pour les projets
cat > routes/projects.js << 'EOF'
const express = require('express');
const router = express.Router();

// Données temporaires - à remplacer par une vraie base de données
let projects = [
  { id: 1, name: 'Site E-commerce', client: 'Client A', status: 'en_cours', budget: 5000 },
  { id: 2, name: 'Application Mobile', client: 'Client B', status: 'termine', budget: 8000 },
  { id: 3, name: 'Dashboard Analytics', client: 'Client C', status: 'planifie', budget: 3000 }
];

// GET /api/projects
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: projects,
    count: projects.length
  });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ success: false, message: 'Projet non trouvé' });
  }
  res.json({ success: true, data: project });
});

// POST /api/projects
router.post('/', (req, res) => {
  const { name, client, status, budget } = req.body;
  
  if (!name || !client) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom et le client sont requis' 
    });
  }
  
  const newProject = {
    id: projects.length + 1,
    name,
    client,
    status: status || 'planifie',
    budget: budget || 0
  };
  
  projects.push(newProject);
  
  res.status(201).json({
    success: true,
    data: newProject,
    message: 'Projet créé avec succès'
  });
});

module.exports = router;
EOF

# Route pour les clients
cat > routes/clients.js << 'EOF'
const express = require('express');
const router = express.Router();

// Données temporaires
let clients = [
  { id: 1, name: 'Client A', email: 'clienta@email.com', phone: '0123456789', projects: 2 },
  { id: 2, name: 'Client B', email: 'clientb@email.com', phone: '0987654321', projects: 1 },
  { id: 3, name: 'Client C', email: 'clientc@email.com', phone: '0654321987', projects: 3 }
];

// GET /api/clients
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: clients,
    count: clients.length
  });
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  if (!client) {
    return res.status(404).json({ success: false, message: 'Client non trouvé' });
  }
  res.json({ success: true, data: client });
});

// POST /api/clients
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom et l\'email sont requis' 
    });
  }
  
  const newClient = {
    id: clients.length + 1,
    name,
    email,
    phone: phone || '',
    projects: 0
  };
  
  clients.push(newClient);
  
  res.status(201).json({
    success: true,
    data: newClient,
    message: 'Client créé avec succès'
  });
});

module.exports = router;
EOF

# Route d'authentification
cat > routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Utilisateur admin par défaut (à changer en production)
const ADMIN_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@windevexpert.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }
    
    // Vérifier si c'est l'admin
    if (email === ADMIN_USER.email) {
      const isValidPassword = await bcrypt.compare(password, ADMIN_USER.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Identifiants invalides' 
        });
      }
      
      const token = jwt.sign(
        { userId: ADMIN_USER.id, email: ADMIN_USER.email },
        process.env.JWT_SECRET || 'votre-secret-jwt-tres-securise',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
          email: ADMIN_USER.email
        }
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Identifiants invalides' 
    });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Vérifier le token
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre-secret-jwt-tres-securise');
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
});

module.exports = router;
EOF

# Création du fichier d'environnement
cat > .env << 'EOF'
# Configuration de l'application
NODE_ENV=production
PORT=3000

# Sécurité
JWT_SECRET=votre-secret-jwt-tres-securise-a-changer-en-production

# Base de données
DB_PATH=./data/database.sqlite

# Email (configurer selon vos besoins)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# URL de l'application
APP_URL=https://votre-domaine.com
EOF

# Configuration PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'windevexpert',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/windevexpert-error.log',
    out_file: '/var/log/pm2/windevexpert-out.log',
    log_file: '/var/log/pm2/windevexpert-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Création des logs PM2
mkdir -p /var/log/pm2
chown "$APP_USER:$APP_USER" /var/log/pm2

# Configuration Nginx
log "Configuration de Nginx..."
cat > /etc/nginx/sites-available/windevexpert << 'EOF'
server {
    listen 80;
    server_name _; # Remplacer par votre domaine
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Logging
    access_log /var/log/nginx/windevexpert-access.log;
    error_log /var/log/nginx/windevexpert-error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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
        proxy_buffering off;
    }
    
    # Static files (if needed)
    location /static/ {
        alias /var/www/windevexpert/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activation du site Nginx
ln -sf /etc/nginx/sites-available/windevexpert /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test de la configuration Nginx
nginx -t >> "$LOG_FILE" 2>&1
success "Configuration Nginx créée"

# Configuration du pare-feu UFW
log "Configuration du pare-feu UFW..."
ufw --force reset >> "$LOG_FILE" 2>&1
ufw default deny incoming >> "$LOG_FILE" 2>&1
ufw default allow outgoing >> "$LOG_FILE" 2>&1
ufw allow ssh >> "$LOG_FILE" 2>&1
ufw allow 80/tcp >> "$LOG_FILE" 2>&1
ufw allow 443/tcp >> "$LOG_FILE" 2>&1
ufw --force enable >> "$LOG_FILE" 2>&1
success "Pare-feu UFW configuré"

# Configuration de fail2ban
log "Configuration de fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Adresses IP à ignorer (ajoutez votre IP si nécessaire)
ignoreip = 127.0.0.1/8 ::1

# Temps de bannissement en secondes (3600 = 1 heure)
bantime = 3600

# Temps pendant lequel le nombre de tentatives doit être atteint
findtime = 600

# Nombre de tentatives avant bannissement
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

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
systemctl restart fail2ban >> "$LOG_FILE" 2>&1
systemctl enable fail2ban >> "$LOG_FILE" 2>&1
success "Fail2ban configuré"

# Création du script de démarrage
log "Création du script de démarrage..."
cat > /usr/local/bin/windevexpert-start.sh << 'EOF'
#!/bin/bash

# Script de démarrage de WinDevExpert

APP_DIR="/var/www/windevexpert"
APP_USER="windevexpert"
LOG_FILE="/var/log/windevexpert-start.log"

echo "Démarrage de WinDevExpert..." >> "$LOG_FILE"

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "PM2 non installé" >> "$LOG_FILE"
    exit 1
fi

# Arrêter l'application si elle est déjà en cours
cd "$APP_DIR"
sudo -u "$APP_USER" pm2 stop ecosystem.config.js >> "$LOG_FILE" 2>&1 || true

# Démarrer l'application
sudo -u "$APP_USER" pm2 start ecosystem.config.js --env production >> "$LOG_FILE" 2>&1

# Sauvegarder la configuration PM2
sudo -u "$APP_USER" pm2 save >> "$LOG_FILE" 2>&1

echo "WinDevExpert démarré avec succès" >> "$LOG_FILE"
EOF

chmod +x /usr/local/bin/windevexpert-start.sh
success "Script de démarrage créé"

# Création du script d'arrêt
cat > /usr/local/bin/windevexpert-stop.sh << 'EOF'
#!/bin/bash

# Script d'arrêt de WinDevExpert

APP_DIR="/var/www/windevexpert"
APP_USER="windevexpert"
LOG_FILE="/var/log/windevexpert-stop.log"

echo "Arrêt de WinDevExpert..." >> "$LOG_FILE"

cd "$APP_DIR"
sudo -u "$APP_USER" pm2 stop ecosystem.config.js >> "$LOG_FILE" 2>&1

echo "WinDevExpert arrêté" >> "$LOG_FILE"
EOF

chmod +x /usr/local/bin/windevexpert-stop.sh

# Configuration du service systemd
log "Configuration du service systemd..."
cat > /etc/systemd/system/windevexpert.service << 'EOF'
[Unit]
Description=WinDevExpert Platform
After=network.target

[Service]
Type=forking
User=windevexpert
Group=windevexpert
WorkingDirectory=/var/www/windevexpert
ExecStart=/usr/local/bin/windevexpert-start.sh
ExecStop=/usr/local/bin/windevexpert-stop.sh
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Recharger systemd et activer le service
systemctl daemon-reload >> "$LOG_FILE" 2>&1
systemctl enable windevexpert.service >> "$LOG_FILE" 2>&1
success "Service systemd configuré"

# Configuration PM2 pour le démarrage automatique
log "Configuration de PM2 pour le démarrage automatique..."
runuser -l "$APP_USER" -c "pm2 startup systemd -u $APP_USER --hp /home/$APP_USER" >> "$LOG_FILE" 2>&1 || true
success "PM2 configuré pour le démarrage automatique"

# Démarrage de l'application
log "Démarrage de l'application..."
cd "$APP_DIR"
sudo -u "$APP_USER" pm2 start ecosystem.config.js --env production >> "$LOG_FILE" 2>&1
sudo -u "$APP_USER" pm2 save >> "$LOG_FILE" 2>&1
success "Application démarrée"

# Redémarrage de Nginx
log "Redémarrage de Nginx..."
systemctl restart nginx >> "$LOG_FILE" 2>&1
success "Nginx redémarré"

# Création du script de maintenance
cat > /usr/local/bin/windevexpert-maintenance.sh << 'EOF'
#!/bin/bash

# Script de maintenance pour WinDevExpert

ACTION=$1
LOG_FILE="/var/log/windevexpert-maintenance.log"

case $ACTION in
    "status")
        echo "Statut de l'application WinDevExpert:"
        pm2 status
        ;;
    "logs")
        echo "Logs de l'application:"
        pm2 logs --lines 50
        ;;
    "restart")
        echo "Redémarrage de l'application..."
        /usr/local/bin/windevexpert-stop.sh
        sleep 5
        /usr/local/bin/windevexpert-start.sh
        echo "Application redémarrée"
        ;;
    "update")
        echo "Mise à jour de l'application..."
        cd /var/www/windevexpert
        sudo -u windevexpert npm install
        /usr/local/bin/windevexpert-stop.sh
        sleep 5
        /usr/local/bin/windevexpert-start.sh
        echo "Application mise à jour"
        ;;
    *)
        echo "Usage: $0 {status|logs|restart|update}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/windevexpert-maintenance.sh

# Création d'un résumé de l'installation
cat > /var/www/windevexpert/INSTALLATION_SUMMARY.md << 'EOF'
# Installation WinDevExpert - Résumé

## ✅ Installation Terminée

### 🚀 Services Démarrés
- **Application Node.js**: Port 3000 (via PM2)
- **Nginx**: Port 80 (reverse proxy)
- **Fail2ban**: Protection contre les attaques
- **UFW**: Pare-feu configuré

### 📁 Répertoires Importants
- **Application**: `/var/www/windevexpert/`
- **Logs**: `/var/log/windevexpert-install.log`
- **Logs PM2**: `/var/log/pm2/`
- **Logs Nginx**: `/var/log/nginx/`

### 🔧 Commandes Utiles

#### Gestion de l'application
```bash
# Démarrer l'application
sudo /usr/local/bin/windevexpert-start.sh

# Arrêter l'application
sudo /usr/local/bin/windevexpert-stop.sh

# Statut de l'application
sudo /usr/local/bin/windevexpert-maintenance.sh status

# Voir les logs
sudo /usr/local/bin/windevexpert-maintenance.sh logs

# Redémarrer l'application
sudo /usr/local/bin/windevexpert-maintenance.sh restart

# Mettre à jour l'application
sudo /usr/local/bin/windevexpert-maintenance.sh update
```

#### Gestion PM2
```bash
# Voir les processus
sudo -u windevexpert pm2 list

# Voir les logs
sudo -u windevexpert pm2 logs

# Arrêter l'application
sudo -u windevexpert pm2 stop windevexpert

# Redémarrer l'application
sudo -u windevexpert pm2 restart windevexpert
```

### 🔐 Accès à l'application

#### URL de l'application
- **Locale**: http://localhost
- **API Health**: http://localhost/api/health
- **API Projects**: http://localhost/api/projects
- **API Clients**: http://localhost/api/clients

#### Identifiants par défaut (à changer)
- **Email**: admin@windevexpert.com
- **Mot de passe**: password

### 🛡️ Sécurité

#### Pare-feu UFW
- SSH (22): ✅ Ouvert
- HTTP (80): ✅ Ouvert
- HTTPS (443): ✅ Ouvert
- Tout autre trafic: ❌ Bloqué

#### Fail2ban
- SSH: 3 tentatives max
- Nginx: 3 tentatives max
- Temps de bannissement: 1 heure

### 📊 Monitoring

#### Logs disponibles
- Installation: `/var/log/windevexpert-install.log`
- Application: `/var/log/pm2/windevexpert-*.log`
- Nginx: `/var/log/nginx/windevexpert-*.log`
- Système: `journalctl -u windevexpert.service`

### 🔄 Prochaines Étapes

1. **Configuration du domaine**
   - Remplacer `server_name _;` dans `/etc/nginx/sites-available/windevexpert`
   - Redémarrer Nginx: `sudo systemctl restart nginx`

2. **SSL/TLS avec Let's Encrypt**
   ```bash
   sudo certbot --nginx -d votre-domaine.com
   ```

3. **Changer les identifiants par défaut**
   - Modifier le fichier `/var/www/windevexpert/routes/auth.js`
   - Changer le JWT_SECRET dans `/var/www/windevexpert/.env`

4. **Configuration email**
   - Configurer les variables SMTP dans `/var/www/windevexpert/.env`

5. **Backup automatique**
   - Configurer des sauvegardes régulières de `/var/www/windevexpert/data/`

### 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs: `sudo /usr/local/bin/windevexpert-maintenance.sh logs`
2. Vérifiez le statut: `sudo systemctl status windevexpert`
3. Redémarrez le service: `sudo systemctl restart windevexpert`

---
*Installation effectuée le: $(date)*
EOF

# Finalisation
log "Finalisation de l'installation..."
chown "$APP_USER:$APP_USER" /var/www/windevexpert -R

# Nettoyage
apt-get autoremove -y >> "$LOG_FILE" 2>&1
apt-get autoclean -y >> "$LOG_FILE" 2>&1

success "Installation terminée avec succès!"

# Affichage du résumé
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  INSTALLATION WINDEVEXPERT TERMINÉE   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Statut des services:${NC}"
systemctl status windevexpert --no-pager -l || true
echo ""
echo -e "${BLUE}🌐 Accès à l'application:${NC}"
echo "  • URL locale: http://localhost"
echo "  • API Health: http://localhost/api/health"
echo ""
echo -e "${BLUE}🔧 Commandes utiles:${NC}"
echo "  • Voir les logs: sudo /usr/local/bin/windevexpert-maintenance.sh logs"
echo "  • Statut: sudo /usr/local/bin/windevexpert-maintenance.sh status"
echo "  • Redémarrer: sudo /usr/local/bin/windevexpert-maintenance.sh restart"
echo ""
echo -e "${YELLOW}📖 Documentation complète:${NC}"
echo "  • Voir: /var/www/windevexpert/INSTALLATION_SUMMARY.md"
echo "  • Commande: cat /var/www/windevexpert/INSTALLATION_SUMMARY.md"
echo ""
echo -e "${GREEN}✅ Votre plateforme WinDevExpert est prête!${NC}"
echo ""