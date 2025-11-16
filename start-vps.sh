#!/bin/bash

# Script de démarrage sécurisé pour le VPS
# Ce script configure l'environnement et démarre l'application Next.js

echo "🚀 Démarrage de l'application Next.js sur le VPS..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Afficher les versions
echo "📋 Versions installées :"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Construire l'application si nécessaire
if [ ! -d ".next" ]; then
    echo "🏗️  Construction de l'application..."
    npm run build
fi

# Définir les variables d'environnement
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=3000

echo "🌐 Configuration :"
echo "HOST: $HOST"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

# Lancer l'application
echo "🎯 Démarrage de l'application..."
npm run start:vps