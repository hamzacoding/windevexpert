@echo off
echo ========================================
echo Configuration MySQL pour WindevExpert Platform
echo ========================================
echo.

echo 1. Installation des dependances MySQL...
npm install mysql2
echo.

echo 2. Generation du client Prisma pour MySQL...
npx prisma generate
echo.

echo 3. Application du schema a la base de donnees...
npx prisma db push
echo.

echo 4. Execution du seed MySQL...
npx tsx scripts/mysql-seed.ts
echo.

echo ========================================
echo Configuration MySQL terminee !
echo ========================================
echo.
echo Prochaines etapes :
echo 1. Verifiez que XAMPP MySQL est demarre
echo 2. Importez le fichier scripts/create-mysql-database.sql dans phpMyAdmin
echo 3. Lancez ce script avec : setup-mysql.bat
echo 4. Demarrez l'application avec : npm run dev
echo.
pause