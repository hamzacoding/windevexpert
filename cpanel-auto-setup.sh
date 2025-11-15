#!/bin/bash

echo "🚀 Installation automatique WinDevExpert pour cPanel"
echo "=================================================="

# Fonction pour détecter Node.js
detect_nodejs() {
    echo "🔍 Détection de Node.js..."
    
    # Chemins possibles pour Node.js sur cPanel
    POSSIBLE_PATHS=(
        "/usr/local/bin/node"
        "/usr/bin/node"
        "/opt/cpanel/ea-nodejs*/bin/node"
        "~/nodevenv/*/bin/node"
        "/usr/local/nodejs/bin/node"
    )
    
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            NODE_PATH="$path"
            NPM_PATH="${path%/*}/npm"
            echo "✅ Node.js trouvé : $NODE_PATH"
            return 0
        fi
    done
    
    # Essayer de trouver avec which
    if command -v node >/dev/null 2>&1; then
        NODE_PATH=$(which node)
        NPM_PATH=$(which npm)
        echo "✅ Node.js trouvé dans PATH : $NODE_PATH"
        return 0
    fi
    
    echo "❌ Node.js non trouvé"
    return 1
}

# Fonction pour installer Node.js si nécessaire
install_nodejs() {
    echo "📦 Installation de Node.js..."
    
    # Télécharger Node.js LTS
    NODE_VERSION="v20.10.0"
    NODE_ARCHIVE="node-${NODE_VERSION}-linux-x64.tar.xz"
    NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_ARCHIVE}"
    
    echo "⬇️  Téléchargement de Node.js ${NODE_VERSION}..."
    wget -q "$NODE_URL" || {
        echo "❌ Échec du téléchargement de Node.js"
        exit 1
    }
    
    echo "📂 Extraction..."
    tar -xf "$NODE_ARCHIVE" || {
        echo "❌ Échec de l'extraction"
        exit 1
    }
    
    # Configurer les chemins
    NODE_DIR="node-${NODE_VERSION}-linux-x64"
    NODE_PATH="$(pwd)/${NODE_DIR}/bin/node"
    NPM_PATH="$(pwd)/${NODE_DIR}/bin/npm"
    
    # Ajouter au PATH
    export PATH="$(pwd)/${NODE_DIR}/bin:$PATH"
    
    echo "✅ Node.js installé localement"
    echo "📍 Chemin : $NODE_PATH"
    
    # Nettoyer
    rm -f "$NODE_ARCHIVE"
}

# Fonction pour installer les dépendances
install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    if [ -f "$NPM_PATH" ]; then
        "$NPM_PATH" install --production || {
            echo "❌ Échec de l'installation des dépendances"
            exit 1
        }
    else
        echo "❌ npm non disponible"
        exit 1
    fi
}

# Fonction pour configurer Prisma
setup_prisma() {
    echo "🗄️  Configuration de Prisma..."
    
    # Générer le client Prisma
    if [ -f "$NPM_PATH" ]; then
        "$NPM_PATH" run prisma:generate || {
            echo "⚠️  Échec de la génération du client Prisma"
            # Essayer avec le script de correction
            if [ -f "cpanel-fix-migrations.js" ]; then
                "$NODE_PATH" cpanel-fix-migrations.js
            fi
        }
        
        # Synchroniser la base de données
        "$NPM_PATH" run prisma:push || {
            echo "⚠️  Échec de la synchronisation de la base de données"
        }
    fi
}

# Fonction pour créer le fichier de démarrage
create_startup_script() {
    echo "📝 Création du script de démarrage..."
    
    cat > start-app.sh << EOF
#!/bin/bash
export PATH="$(pwd)/node-${NODE_VERSION}-linux-x64/bin:\$PATH"
export NODE_ENV=production
export PORT=3000

echo "🚀 Démarrage de WinDevExpert Platform..."
node server-cpanel.js
EOF
    
    chmod +x start-app.sh
    echo "✅ Script de démarrage créé : start-app.sh"
}

# Fonction principale
main() {
    echo "🏁 Début de l'installation..."
    
    # Vérifier si .env existe
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "📋 Fichier .env créé à partir de .env.example"
            echo "⚠️  IMPORTANT : Configurez vos variables d'environnement dans .env"
        else
            echo "❌ Fichier .env.example non trouvé"
            exit 1
        fi
    fi
    
    # Détecter ou installer Node.js
    if ! detect_nodejs; then
        install_nodejs
    fi
    
    # Vérifier les versions
    echo "📊 Versions installées :"
    "$NODE_PATH" --version
    "$NPM_PATH" --version
    
    # Installer les dépendances
    install_dependencies
    
    # Configurer Prisma
    setup_prisma
    
    # Créer le script de démarrage
    create_startup_script
    
    echo ""
    echo "🎉 Installation terminée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Configurez votre fichier .env"
    echo "2. Lancez l'application : ./start-app.sh"
    echo "3. Accédez à votre site web"
    echo ""
    echo "🔧 En cas de problème :"
    echo "- Vérifiez les logs : tail -f logs/app.log"
    echo "- Redémarrez : ./start-app.sh"
    echo ""
}

# Exécuter le script principal
main "$@"