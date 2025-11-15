#!/bin/bash

echo "🔧 Script de correction des migrations Prisma pour cPanel"
echo "======================================================="

# Vérifier si npx est disponible
if command -v npx &> /dev/null; then
    echo "✅ npx trouvé, utilisation de npx"
    npx prisma generate
    npx prisma db push
else
    echo "⚠️  npx non trouvé, utilisation de npm run"
    
    # Vérifier si Node.js est disponible
    if command -v node &> /dev/null; then
        echo "✅ Node.js trouvé"
        
        # Utiliser npm directement
        if command -v npm &> /dev/null; then
            echo "✅ npm trouvé, génération du client Prisma..."
            npm run prisma:generate 2>/dev/null || node node_modules/.bin/prisma generate
            
            echo "📊 Synchronisation de la base de données..."
            npm run prisma:push 2>/dev/null || node node_modules/.bin/prisma db push
        else
            echo "❌ npm non trouvé, utilisation directe de Node.js"
            node node_modules/.bin/prisma generate
            node node_modules/.bin/prisma db push
        fi
    else
        echo "❌ Node.js non trouvé. Veuillez vérifier votre installation."
        exit 1
    fi
fi

echo "✅ Migrations terminées avec succès !"