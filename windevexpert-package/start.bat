@echo off
echo 🚀 Démarrage de WinDevExpert Platform...

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si le fichier .env existe
if not exist .env (
    echo ⚠️  Fichier .env non trouvé. Copie du fichier d'exemple...
    copy .env.example .env
    echo 📝 Veuillez éditer le fichier .env avec vos paramètres avant de continuer.
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist node_modules (
    echo 📦 Installation des dépendances...
    npm install
)

REM Générer le client Prisma
echo 🔧 Génération du client Prisma...
npx prisma generate

REM Vérifier si la base de données est configurée
echo 🗄️  Vérification de la base de données...
npx prisma db push

REM Build de l'application si nécessaire
if not exist .next (
    echo 🏗️  Build de l'application...
    npm run build
)

REM Démarrer l'application
echo ✅ Démarrage de l'application...
npm start

pause
