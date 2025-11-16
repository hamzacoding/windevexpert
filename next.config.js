/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Configuration pour le VPS - écouter sur toutes les interfaces
  serverRuntimeConfig: {
    // Will be available on both server and client
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || '0.0.0.0'
  },
  // Configuration pour le build et le start
  output: 'standalone',
  // Sécurité et performance
  images: {
    domains: ['localhost', '93.127.143.68'],
  },
  // Désactiver la vérification TypeScript pendant le build (optionnel)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configuration webpack si nécessaire
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    return config;
  },
}

module.exports = nextConfig