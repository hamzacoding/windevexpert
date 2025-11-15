# Dockerfile optimisé pour WinDevExpert VPS
FROM node:20-alpine AS base

# Installation des dépendances système
RUN apk add --no-cache libc6-compat python3 make g++ git

# Configuration du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Étape de build
FROM base AS builder
WORKDIR /app

# Copie des fichiers source
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Build de l'application
RUN npm run build

# Étape finale de production
FROM node:20-alpine AS runner
WORKDIR /app

# Création de l'utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Installation des dépendances système minimales
RUN apk add --no-cache curl

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Création des répertoires nécessaires
RUN mkdir -p /app/public/uploads /app/logs /app/.next/cache/images
RUN chown -R nextjs:nodejs /app

# Configuration des variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Utilisateur non-root
USER nextjs

# Exposition du port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"]