#!/bin/bash

# =============================================================================
# WinDevExpert Platform - Installation Script pour cPanel
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables par défaut
APP_NAME="windevexpert"
NODE_VERSION="18"
DEFAULT_PORT="3000"

# Fonctions utilitaires
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  WinDevExpert Platform - Installation cPanel"
    echo "=============================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé ou pas dans le PATH"
        print_info "Veuillez activer Node.js dans cPanel avant de continuer"
        exit 1
    fi
    
    NODE_CURRENT=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION+ requise. Version actuelle: v$NODE_CURRENT"
        exit 1
    fi
    
    print_success "Node.js v$(node --version) détecté"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas disponible"
        exit 1
    fi
    
    print_success "npm v$(npm --version) détecté"
    
    # Vérifier l'espace disque
    AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
    REQUIRED_SPACE=2097152  # 2GB en KB
    
    if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
        print_warning "Espace disque faible. Recommandé: 2GB minimum"
    fi
}

# Configuration interactive
configure_installation() {
    print_info "Configuration de l'installation..."
    
    # Demander le domaine
    read -p "Nom de domaine (ex: monsite.com): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        print_error "Le nom de domaine est requis"
        exit 1
    fi
    
    # Demander le port
    read -p "Port de l'application [$DEFAULT_PORT]: " PORT
    PORT=${PORT:-$DEFAULT_PORT}
    
    # Demander les informations de base de données
    echo ""
    print_info "Configuration de la base de données MySQL:"
    read -p "Nom de la base de données: " DB_NAME
    read -p "Utilisateur de la base: " DB_USER
    read -s -p "Mot de passe de la base: " DB_PASS
    echo ""
    
    if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
        print_error "Toutes les informations de base de données sont requises"
        exit 1
    fi
    
    # Demander l'email admin
    read -p "Email administrateur: " ADMIN_EMAIL
    if [ -z "$ADMIN_EMAIL" ]; then
        print_error "L'email administrateur est requis"
        exit 1
    fi
    
    # Configuration SMTP (optionnel)
    echo ""
    print_info "Configuration SMTP (optionnel - appuyez sur Entrée pour ignorer):"
    read -p "Serveur SMTP: " SMTP_HOST
    if [ ! -z "$SMTP_HOST" ]; then
        read -p "Port SMTP [587]: " SMTP_PORT
        SMTP_PORT=${SMTP_PORT:-587}
        read -p "Utilisateur SMTP: " SMTP_USER
        read -s -p "Mot de passe SMTP: " SMTP_PASS
        echo ""
    fi
}

# Installation des dépendances
install_dependencies() {
    print_info "Installation des dépendances..."
    
    if [ -f "package.json" ]; then
        npm install --production --silent
        print_success "Dépendances installées"
    else
        print_error "package.json non trouvé"
        exit 1
    fi
}

# Configuration de la base de données
setup_database() {
    print_info "Configuration de la base de données..."
    
    # Générer le client Prisma
    if [ -d "prisma" ]; then
        npx prisma generate --silent
        print_success "Client Prisma généré"
        
        # Appliquer les migrations
        npx prisma db push --silent
        print_success "Schéma de base de données appliqué"
    else
        print_warning "Dossier prisma non trouvé, configuration manuelle requise"
    fi
}

# Création du fichier .env
create_env_file() {
    print_info "Création du fichier de configuration..."
    
    # Générer un secret NextAuth
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")
    
    # Générer une clé de chiffrement
    ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")
    
    cat > .env << EOF
# Configuration de production - WinDevExpert
NODE_ENV=production
PORT=$PORT

# Base de données
DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"

# NextAuth.js
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://$DOMAIN"

# Administration
ADMIN_EMAIL="$ADMIN_EMAIL"

# Sécurité
ENCRYPTION_KEY="$ENCRYPTION_KEY"

# Application
APP_URL="https://$DOMAIN"
EOF

    # Ajouter la configuration SMTP si fournie
    if [ ! -z "$SMTP_HOST" ]; then
        cat >> .env << EOF

# Configuration SMTP
SMTP_HOST="$SMTP_HOST"
SMTP_PORT="$SMTP_PORT"
SMTP_USER="$SMTP_USER"
SMTP_PASSWORD="$SMTP_PASS"
SMTP_FROM="noreply@$DOMAIN"
EOF
    fi
    
    # Sécuriser le fichier
    chmod 600 .env
    print_success "Fichier de configuration créé et sécurisé"
}

# Création du fichier server.js
create_server_file() {
    print_info "Création du fichier de démarrage..."
    
    cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
EOF
    
    print_success "Fichier de démarrage créé"
}

# Build de l'application
build_application() {
    print_info "Construction de l'application..."
    
    if npm run build --silent; then
        print_success "Application construite avec succès"
    else
        print_error "Erreur lors de la construction"
        exit 1
    fi
}

# Création du script de démarrage
create_startup_script() {
    print_info "Création du script de démarrage..."
    
    cat > start-cpanel.sh << EOF
#!/bin/bash

# Script de démarrage pour cPanel
cd "\$(dirname "\$0")"

# Charger les variables d'environnement
if [ -f .env ]; then
    export \$(cat .env | grep -v '^#' | xargs)
fi

# Démarrer l'application
echo "Démarrage de WinDevExpert sur le port \$PORT..."
node server.js
EOF
    
    chmod +x start-cpanel.sh
    print_success "Script de démarrage créé"
}

# Vérification finale
final_verification() {
    print_info "Vérification finale de l'installation..."
    
    # Vérifier les fichiers essentiels
    REQUIRED_FILES=(".env" "server.js" "package.json" ".next")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -e "$file" ]; then
            print_success "$file présent"
        else
            print_error "$file manquant"
            return 1
        fi
    done
    
    # Vérifier la connexion à la base de données
    if command -v npx &> /dev/null && [ -d "prisma" ]; then
        if npx prisma db pull --silent 2>/dev/null; then
            print_success "Connexion à la base de données OK"
        else
            print_warning "Impossible de vérifier la connexion à la base de données"
        fi
    fi
    
    return 0
}

# Affichage des instructions finales
show_final_instructions() {
    echo ""
    print_header
    print_success "Installation terminée avec succès!"
    echo ""
    print_info "Prochaines étapes dans cPanel:"
    echo "1. Allez dans 'Node.js' dans votre cPanel"
    echo "2. Créez une nouvelle application avec ces paramètres:"
    echo "   - Node.js version: 18+"
    echo "   - Application mode: Production"
    echo "   - Application root: $(pwd)"
    echo "   - Application URL: $DOMAIN"
    echo "   - Application startup file: server.js"
    echo "3. Ajoutez les variables d'environnement depuis le fichier .env"
    echo "4. Redémarrez l'application"
    echo ""
    print_info "Votre application sera accessible sur: https://$DOMAIN"
    print_info "Interface admin: https://$DOMAIN/admin"
    echo ""
    print_warning "N'oubliez pas de:"
    echo "- Configurer SSL/TLS dans cPanel"
    echo "- Sauvegarder régulièrement votre base de données"
    echo "- Consulter les logs en cas de problème"
    echo ""
}

# Fonction principale
main() {
    print_header
    
    # Vérifications préliminaires
    check_prerequisites
    
    # Configuration
    configure_installation
    
    # Installation
    install_dependencies
    create_env_file
    create_server_file
    setup_database
    build_application
    create_startup_script
    
    # Vérification finale
    if final_verification; then
        show_final_instructions
    else
        print_error "L'installation n'est pas complète. Vérifiez les erreurs ci-dessus."
        exit 1
    fi
}

# Gestion des erreurs
trap 'print_error "Installation interrompue"; exit 1' INT TERM

# Exécution du script principal
main "$@"