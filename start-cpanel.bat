@echo off
REM =============================================================================
REM WinDevExpert Platform - Script de démarrage pour cPanel (Windows)
REM =============================================================================

setlocal enabledelayedexpansion

REM Configuration des couleurs (si supportées)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%==============================================
echo   WinDevExpert Platform - Démarrage cPanel
echo ==============================================%NC%
echo.

REM Vérifier si Node.js est disponible
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%Erreur: Node.js n'est pas installé ou pas dans le PATH%NC%
    echo %YELLOW%Veuillez installer Node.js ou l'ajouter au PATH%NC%
    pause
    exit /b 1
)

REM Afficher la version de Node.js
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%Node.js %NODE_VERSION% détecté%NC%

REM Vérifier si npm est disponible
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%Erreur: npm n'est pas disponible%NC%
    pause
    exit /b 1
)

REM Afficher la version de npm
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%npm v%NPM_VERSION% détecté%NC%
echo.

REM Vérifier si le fichier package.json existe
if not exist "package.json" (
    echo %RED%Erreur: package.json non trouvé%NC%
    echo %YELLOW%Assurez-vous d'être dans le bon répertoire%NC%
    pause
    exit /b 1
)

REM Vérifier si le fichier .env existe
if not exist ".env" (
    echo %YELLOW%Attention: Fichier .env non trouvé%NC%
    echo %YELLOW%L'application utilisera les variables d'environnement par défaut%NC%
    echo.
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo %YELLOW%Installation des dépendances...%NC%
    call npm install --production
    if %errorlevel% neq 0 (
        echo %RED%Erreur lors de l'installation des dépendances%NC%
        pause
        exit /b 1
    )
    echo %GREEN%Dépendances installées avec succès%NC%
    echo.
)

REM Vérifier si l'application est construite
if not exist ".next" (
    echo %YELLOW%Construction de l'application...%NC%
    call npm run build
    if %errorlevel% neq 0 (
        echo %RED%Erreur lors de la construction%NC%
        pause
        exit /b 1
    )
    echo %GREEN%Application construite avec succès%NC%
    echo.
)

REM Vérifier si Prisma est configuré
if exist "prisma" (
    echo %BLUE%Configuration de Prisma...%NC%
    call npx prisma generate
    if %errorlevel% neq 0 (
        echo %YELLOW%Attention: Erreur lors de la génération du client Prisma%NC%
    ) else (
        echo %GREEN%Client Prisma généré%NC%
    )
    echo.
)

REM Définir les variables d'environnement par défaut si .env n'existe pas
if not exist ".env" (
    set "NODE_ENV=production"
    set "PORT=3000"
) else (
    REM Charger les variables depuis .env (version simplifiée pour Windows)
    echo %BLUE%Chargement des variables d'environnement...%NC%
)

REM Créer le fichier server.js s'il n'existe pas
if not exist "server.js" (
    echo %YELLOW%Création du fichier server.js...%NC%
    (
        echo const { createServer } = require('http'^);
        echo const { parse } = require('url'^);
        echo const next = require('next'^);
        echo.
        echo const dev = process.env.NODE_ENV !== 'production';
        echo const hostname = 'localhost';
        echo const port = process.env.PORT ^|^| 3000;
        echo.
        echo const app = next({ dev, hostname, port }^);
        echo const handle = app.getRequestHandler(^);
        echo.
        echo app.prepare(^).then(^(^) =^> {
        echo   createServer(async (req, res^) =^> {
        echo     try {
        echo       const parsedUrl = parse(req.url, true^);
        echo       await handle(req, res, parsedUrl^);
        echo     } catch (err^) {
        echo       console.error('Error occurred handling', req.url, err^);
        echo       res.statusCode = 500;
        echo       res.end('internal server error'^);
        echo     }
        echo   }^)
        echo   .once('error', (err^) =^> {
        echo     console.error(err^);
        echo     process.exit(1^);
        echo   }^)
        echo   .listen(port, (^) =^> {
        echo     console.log(`^> Ready on http://${hostname}:${port}`^);
        echo   }^);
        echo }^);
    ) > server.js
    echo %GREEN%Fichier server.js créé%NC%
    echo.
)

REM Afficher les informations de démarrage
echo %BLUE%==============================================
echo   Démarrage de l'application
echo ==============================================%NC%
echo.
echo %GREEN%Application: WinDevExpert Platform%NC%
echo %GREEN%Environnement: Production%NC%
echo %GREEN%Port: %PORT%%NC%
echo %GREEN%Mode: cPanel%NC%
echo.

REM Instructions pour cPanel
echo %YELLOW%INSTRUCTIONS POUR CPANEL:%NC%
echo.
echo 1. Copiez ce dossier vers votre hébergement cPanel
echo 2. Dans cPanel, allez dans "Node.js"
echo 3. Créez une nouvelle application avec:
echo    - Node.js version: 18+
echo    - Application mode: Production
echo    - Application startup file: server.js
echo 4. Ajoutez les variables d'environnement
echo 5. Redémarrez l'application
echo.

REM Demander si l'utilisateur veut démarrer localement pour test
set /p "START_LOCAL=Voulez-vous démarrer l'application localement pour test? (o/N): "
if /i "%START_LOCAL%"=="o" (
    echo.
    echo %BLUE%Démarrage local de l'application...%NC%
    echo %YELLOW%Appuyez sur Ctrl+C pour arrêter%NC%
    echo.
    node server.js
) else (
    echo.
    echo %GREEN%Prêt pour le déploiement sur cPanel!%NC%
    echo.
    echo %BLUE%Fichiers à uploader:%NC%
    echo - Tous les fichiers du projet
    echo - Dossier .next (après build)
    echo - Fichier server.js
    echo - Fichier .env (à configurer)
    echo.
    pause
)

endlocal