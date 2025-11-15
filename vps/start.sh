#!/bin/bash

# Script de démarrage WinDevExpert Platform

echo "🚀 Démarrage de WinDevExpert Platform..."

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

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Copie du fichier d'exemple..."
    cp .env.example .env
    echo "📝 Veuillez éditer le fichier .env avec vos paramètres avant de continuer."
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Vérifier si la base de données est configurée
echo "🗄️  Vérification de la base de données..."
npx prisma db push

# Build de l'application si nécessaire
if [ ! -d ".next" ]; then
    echo "🏗️  Build de l'application..."
    npm run build
fi

# Démarrer l'application
echo "✅ Démarrage de l'application..."
npm start
