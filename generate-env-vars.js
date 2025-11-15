#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Générateur de variables d\'environnement pour WinDevExpert Platform');
console.log('================================================================\n');

// Générer NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Générer JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Générer ENCRYPTION_KEY
const encryptionKey = crypto.randomBytes(32).toString('base64');

console.log('📋 Variables d\'environnement générées :\n');

console.log('# Authentification');
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);

console.log('\n# Application');
console.log('NODE_ENV=production');
console.log('NEXTAUTH_URL=https://zynahtech.com/dev/wxp');

console.log('\n# Base de données (à compléter avec vos informations)');
console.log('DATABASE_URL="mysql://VOTRE_USER:VOTRE_PASSWORD@localhost:3306/VOTRE_DATABASE"');

console.log('\n# Email SMTP (optionnel)');
console.log('SMTP_HOST=');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=');
console.log('SMTP_PASSWORD=');
console.log('SMTP_FROM=');

console.log('\n# Paiements (optionnel)');
console.log('STRIPE_PUBLIC_KEY=');
console.log('STRIPE_SECRET_KEY=');
console.log('STRIPE_WEBHOOK_SECRET=');

console.log('\n🔒 IMPORTANT : Gardez ces clés secrètes et ne les partagez jamais !');
console.log('💾 Copiez ces variables dans votre fichier .env ou dans cPanel');