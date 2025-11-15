import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types d'applications disponibles
const appTypes = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'PLUGIN', 'TEMPLATE', 'SERVICE'] as const

// Types de licences
const licenseTypes = [
  { name: 'MIT', description: 'Licence MIT open source', priceMultiplier: 0, isFree: true },
  { name: 'PERSONAL', description: 'Usage personnel uniquement', priceMultiplier: 1, isFree: false },
  { name: 'COMMERCIAL', description: 'Usage commercial autorisé', priceMultiplier: 2.5, isFree: false },
  { name: 'EXTENDED', description: 'Licence étendue avec revente', priceMultiplier: 4, isFree: false },
  { name: 'ENTERPRISE', description: 'Licence entreprise', priceMultiplier: 6, isFree: false }
]

// Niveaux de support (simulés avec des features)
const supportLevels = [
  { name: 'NONE', description: 'Aucun support', priceMultiplier: 1 },
  { name: 'BASIC', description: 'Support par email', priceMultiplier: 1.2 },
  { name: 'STANDARD', description: 'Support email + documentation', priceMultiplier: 1.5 },
  { name: 'PREMIUM', description: 'Support prioritaire + téléphone', priceMultiplier: 2 }
]

// Images disponibles pour les produits
const productImages = {
  WEB: [
    '/images/products/crm-system.svg',
    '/images/products/crm-dashboard-screenshot.svg'
  ],
  MOBILE: [
    '/images/products/mobile-ecommerce.svg',
    '/images/products/mobile-app-screenshot.svg'
  ],
  DESKTOP: [
    '/images/products/desktop-inventory.svg',
    '/images/products/desktop-app-screenshot.svg'
  ],
  API: [
    '/images/products/api-payment.svg',
    '/images/products/api-documentation.svg'
  ],
  PLUGIN: [
    '/images/products/wordpress-plugin.svg'
  ],
  TEMPLATE: [
    '/images/products/template-showcase.svg',
    '/images/products/crm-system.svg'
  ],
  SERVICE: [
    '/images/products/training-course.svg'
  ]
}

// Données de base pour les produits avec des prix réalistes et des données complètes
const productTemplates = [
  {
    name: 'WinDev CRM Pro',
    tagline: 'La solution CRM complète pour PME',
    shortDescription: 'Système de gestion client complet avec pipeline de ventes et reporting avancé',
    description: 'Solution CRM professionnelle développée avec WinDev, incluant la gestion complète des prospects, clients, opportunités commerciales, devis et factures. Tableaux de bord en temps réel, rapports personnalisables et synchronisation mobile.',
    basePrice: 89,
    appType: 'WEB_APP' as const,
    trialPeriod: 30,
    images: ['/images/products/crm-system.svg', '/images/products/crm-dashboard-screenshot.svg'],
    technologies: ['WinDev', 'WebDev', 'HFSQL', 'JavaScript', 'CSS3'],
    features: ['Gestion des prospects et clients', 'Pipeline de ventes visuel', 'Facturation intégrée', 'Rapports personnalisables', 'API REST', 'Synchronisation mobile'],
    compatibility: ['Windows 10+', 'Navigateurs modernes', 'iOS/Android (WebApp)']
  },
  {
    name: 'WinDev Mobile Shop',
    tagline: 'Votre boutique mobile native',
    shortDescription: 'Application e-commerce native iOS/Android avec paiement sécurisé',
    description: 'Application mobile e-commerce native développée avec WinDev Mobile. Interface moderne, catalogue produits, panier intelligent, paiement sécurisé (Stripe, PayPal), notifications push et synchronisation temps réel avec votre back-office.',
    basePrice: 149,
    appType: 'MOBILE_APP' as const,
    trialPeriod: 14,
    images: ['/images/products/mobile-ecommerce.svg', '/images/products/mobile-app-screenshot.svg'],
    technologies: ['WinDev Mobile', 'HFSQL Client/Serveur', 'REST API', 'Firebase', 'Stripe SDK'],
    features: ['Catalogue produits interactif', 'Panier et wishlist', 'Paiement sécurisé', 'Notifications push', 'Mode hors-ligne', 'Géolocalisation'],
    compatibility: ['iOS 12+', 'Android 8+', 'Synchronisation cloud']
  },
  {
    name: 'Site Vitrine WinDev',
    tagline: 'Votre présence web professionnelle',
    shortDescription: 'Site vitrine responsive avec CMS intégré',
    description: 'Site web vitrine professionnel développé avec WebDev. Design responsive, CMS intégré pour la gestion de contenu, optimisation SEO avancée, formulaires de contact intelligents et statistiques de visite détaillées.',
    basePrice: 49,
    appType: 'WEB_APP' as const,
    trialPeriod: 7,
    images: ['/images/products/crm-system.svg'],
    technologies: ['WebDev', 'HFSQL', 'HTML5', 'CSS3', 'JavaScript'],
    features: ['Design responsive', 'CMS intégré', 'Optimisation SEO', 'Formulaires intelligents', 'Galerie photos', 'Blog intégré'],
    compatibility: ['Tous navigateurs', 'Mobile-first', 'PWA compatible']
  },
  {
    name: 'WinDev Booking System',
    tagline: 'Réservations simplifiées',
    shortDescription: 'Système de réservation en ligne avec calendrier intelligent',
    description: 'Plateforme de réservation complète développée avec WinDev. Calendrier interactif, gestion des créneaux, notifications automatiques, paiement en ligne, gestion des ressources et reporting détaillé pour optimiser votre activité.',
    basePrice: 79,
    appType: 'WEB_APP' as const,
    trialPeriod: 21,
    images: ['/images/products/crm-dashboard-screenshot.svg'],
    technologies: ['WinDev', 'WebDev', 'HFSQL', 'Calendar API', 'Email API'],
    features: ['Calendrier interactif', 'Gestion des créneaux', 'Notifications automatiques', 'Paiement en ligne', 'Gestion des ressources', 'Rapports détaillés'],
    compatibility: ['Web responsive', 'Intégration Google Calendar', 'API mobile']
  },
  {
    name: 'Formation WinDev Complète',
    tagline: 'Maîtrisez WinDev de A à Z',
    shortDescription: 'Formation complète WinDev avec projets pratiques',
    description: 'Formation complète au développement avec WinDev, WebDev et WinDev Mobile. 40 heures de contenu vidéo, exercices pratiques, projets réels et certification. Accès à vie avec mises à jour incluses.',
    basePrice: 199,
    appType: 'SAAS_PLATFORM' as const,
    trialPeriod: 0,
    images: ['/images/products/training-course.svg'],
    technologies: ['WinDev', 'WebDev', 'WinDev Mobile', 'HFSQL', 'Concepts avancés'],
    features: ['40h de vidéos HD', 'Projets pratiques', 'Support instructeur', 'Certification', 'Accès à vie', 'Communauté privée'],
    compatibility: ['Plateforme e-learning', 'Mobile/Desktop', 'Téléchargement offline']
  },
  {
    name: 'WinDev UI Kit Pro',
    tagline: 'Composants UI professionnels',
    shortDescription: 'Bibliothèque de composants UI pour WinDev',
    description: 'Collection complète de composants UI modernes pour WinDev et WebDev. Plus de 100 composants prêts à l\'emploi, thèmes personnalisables, documentation complète et exemples d\'intégration.',
    basePrice: 39,
    appType: 'SAAS_PLATFORM' as const,
    trialPeriod: 0,
    images: ['/images/products/template-showcase.svg'],
    technologies: ['WinDev', 'WebDev', 'CSS3', 'JavaScript', 'Responsive Design'],
    features: ['100+ composants', 'Thèmes personnalisables', 'Documentation complète', 'Exemples d\'usage', 'Support technique', 'Mises à jour gratuites'],
    compatibility: ['WinDev 28+', 'WebDev 28+', 'Tous navigateurs']
  },
  {
    name: 'Plugin WinDev WordPress',
    tagline: 'Intégrez WinDev et WordPress',
    shortDescription: 'Plugin WordPress pour intégration WinDev',
    description: 'Plugin WordPress permettant l\'intégration parfaite avec vos applications WinDev. Synchronisation de données, authentification unique, widgets personnalisés et API bidirectionnelle.',
    basePrice: 29,
    appType: 'PLUGIN' as const,
    trialPeriod: 15,
    images: ['/images/products/wordpress-plugin.svg'],
    technologies: ['PHP', 'WordPress API', 'WinDev REST', 'MySQL', 'JavaScript'],
    features: ['Synchronisation données', 'SSO intégré', 'Widgets personnalisés', 'API bidirectionnelle', 'Configuration simple', 'Documentation complète'],
    compatibility: ['WordPress 5.0+', 'PHP 7.4+', 'WinDev 28+']
  },
  {
    name: 'WinDev RH Manager',
    tagline: 'Gestion RH complète et moderne',
    shortDescription: 'Solution RH complète avec paie et planning',
    description: 'Système complet de gestion des ressources humaines développé avec WinDev. Gestion des employés, planning, congés, paie, évaluations, formation et reporting RH avancé. Interface moderne et intuitive.',
    basePrice: 129,
    appType: 'WEB_APP' as const,
    trialPeriod: 30,
    images: ['/images/products/crm-dashboard-screenshot.svg'],
    technologies: ['WinDev', 'WebDev', 'HFSQL', 'Crystal Reports', 'Email API'],
    features: ['Gestion employés', 'Planning intelligent', 'Gestion congés', 'Module paie', 'Évaluations', 'Formation tracking'],
    compatibility: ['Web responsive', 'Export Excel/PDF', 'API mobile']
  },
  {
    name: 'WinDev Facture Pro',
    tagline: 'Facturation professionnelle simplifiée',
    shortDescription: 'Logiciel de facturation avec comptabilité',
    description: 'Application de facturation professionnelle développée avec WinDev. Gestion clients, devis, factures, avoir, relances automatiques, comptabilité simplifiée et synchronisation bancaire. Conforme aux normes fiscales.',
    basePrice: 69,
    appType: 'DESKTOP_APP' as const,
    trialPeriod: 21,
    images: ['/images/products/desktop-inventory.svg', '/images/products/desktop-app-screenshot.svg'],
    technologies: ['WinDev', 'HFSQL', 'PDF Generator', 'Email SMTP', 'Banking API'],
    features: ['Gestion clients', 'Devis et factures', 'Relances automatiques', 'Comptabilité simplifiée', 'Synchronisation bancaire', 'Conformité fiscale'],
    compatibility: ['Windows 10+', 'Impression PDF', 'Export comptable']
  },
  {
    name: 'Formation Base de Données WinDev',
    tagline: 'Maîtrisez HFSQL et les BDD',
    shortDescription: 'Formation spécialisée bases de données WinDev',
    description: 'Formation approfondie sur les bases de données avec WinDev. HFSQL Classic/Client-Serveur, requêtes avancées, optimisation, réplication, sauvegarde et migration. Exercices pratiques et cas d\'usage réels.',
    basePrice: 99,
    appType: 'SAAS_PLATFORM' as const,
    trialPeriod: 0,
    images: ['/images/products/training-course.svg'],
    technologies: ['HFSQL', 'WinDev', 'SQL', 'Optimisation BDD', 'Réplication'],
    features: ['HFSQL expert', 'Requêtes avancées', 'Optimisation performance', 'Réplication/Sauvegarde', 'Migration BDD', 'Cas pratiques'],
    compatibility: ['WinDev toutes versions', 'HFSQL Classic/CS', 'Outils tiers']
  },
  {
    name: 'WinDev API Gateway',
    tagline: 'Passerelle API moderne et sécurisée',
    shortDescription: 'Solution API Gateway pour applications WinDev',
    description: 'Passerelle API complète développée avec WinDev pour exposer vos données de manière sécurisée. Authentification JWT, limitation de débit, monitoring, documentation automatique et gestion des versions.',
    basePrice: 99,
    appType: 'API_SERVICE' as const,
    trialPeriod: 14,
    images: ['/images/products/api-payment.svg', '/images/products/api-documentation.svg'],
    technologies: ['WinDev', 'REST API', 'JWT', 'OpenAPI', 'Monitoring'],
    features: ['Authentification JWT', 'Rate limiting', 'Monitoring temps réel', 'Documentation auto', 'Gestion versions', 'Sécurité avancée'],
    compatibility: ['REST/JSON', 'OpenAPI 3.0', 'Intégration cloud']
  },
  {
    name: 'WinDev Inventory Pro',
    tagline: 'Gestion de stock intelligente',
    shortDescription: 'Système de gestion de stock avec codes-barres',
    description: 'Solution complète de gestion de stock développée avec WinDev. Codes-barres, RFID, alertes automatiques, mouvements de stock, inventaires, fournisseurs et intégration comptable. Interface tactile disponible.',
    basePrice: 89,
    appType: 'DESKTOP_APP' as const,
    trialPeriod: 30,
    images: ['/images/products/desktop-inventory.svg'],
    technologies: ['WinDev', 'HFSQL', 'Barcode Scanner', 'RFID', 'Touch Interface'],
    features: ['Codes-barres/RFID', 'Alertes automatiques', 'Mouvements stock', 'Inventaires', 'Gestion fournisseurs', 'Interface tactile'],
    compatibility: ['Windows 10+', 'Scanners codes-barres', 'Tablettes Windows']
  }
]

async function generateProducts() {
  try {
    console.log('🚀 Génération de 30 produits avec types, licences et support...')
    
    // Vérifier s'il existe une catégorie par défaut
    let defaultCategory = await prisma.category.findFirst()
    
    if (!defaultCategory) {
      // Créer une catégorie par défaut
      defaultCategory = await prisma.category.create({
        data: {
          name: 'Produits Généraux',
          slug: 'produits-generaux',
          description: 'Catégorie par défaut pour les produits'
        }
      })
      console.log('✅ Catégorie par défaut créée')
    }

    const products = []
    
    // Générer 30 produits
    for (let i = 0; i < 30; i++) {
      const template = productTemplates[i % productTemplates.length]
      const license = licenseTypes[i % licenseTypes.length]
      const support = supportLevels[i % supportLevels.length]
      
      // Calculer le prix avec les multiplicateurs
      const basePrice = template.basePrice
      const isFree = license.isFree
      const finalPriceEUR = isFree ? 0 : Math.round(basePrice * license.priceMultiplier * support.priceMultiplier)
      const finalPriceDA = isFree ? 0 : Math.round(finalPriceEUR * 140) // Taux de change EUR -> DZD
      
      // Créer le nom unique
      const productName = isFree ? `${template.name} (Gratuit)` : `${template.name} - ${license.name}`
      const slug = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${license.name.toLowerCase()}-${i + 1}`
      
      // Utiliser les données du template ou créer des données par défaut
      const templateFeatures = template.features || [
        'Interface intuitive et moderne',
        'Documentation complète incluse',
        'Support technique disponible'
      ]
      
      const features = [
        ...templateFeatures,
        'Mises à jour régulières',
        isFree ? 'Version gratuite' : `Licence ${license.description}`,
        `Support: ${support.description}`
      ]

      const keyBenefits = [
        'Gain de temps considérable',
        'Interface utilisateur intuitive',
        'Sécurité renforcée',
        'Performance optimisée',
        'Solution développée avec WinDev',
        'Support technique français'
      ]

      const technologies = template.technologies || ['WinDev', 'HFSQL', 'WebDev']
      const compatibility = template.compatibility || ['Windows 10+', 'Navigateurs modernes']
      const languages = ['Français', 'Anglais', 'Arabe']
      
      // Sélectionner les images appropriées pour le type d'application
      const availableImages = template.images || productImages[template.appType] || ['/images/products/crm-system.svg']
      const selectedImages = availableImages.slice(0, Math.min(3, availableImages.length)) // Maximum 3 images
      
      const productData = {
        name: productName,
        slug: slug,
        tagline: template.tagline,
        shortDescription: template.shortDescription,
        description: template.description,
        price: finalPriceEUR,
        priceDA: finalPriceDA,
        isFree: isFree,
        trialPeriod: template.trialPeriod,
        appType: template.appType,
        type: 'SOFTWARE' as const,
        status: 'ACTIVE' as const,
        license: license.name,
        logo: selectedImages[0] || '/images/products/crm-system.svg', // Premier image comme logo
        screenshots: JSON.stringify(selectedImages), // Toutes les images comme screenshots
        features: JSON.stringify(features),
        keyBenefits: JSON.stringify(keyBenefits),
        technologies: JSON.stringify(technologies),
        compatibility: JSON.stringify(compatibility),
        languages: JSON.stringify(languages),
        requirements: JSON.stringify([
          'Processeur: Intel i5 ou équivalent',
          'RAM: 8 GB minimum',
          'Espace disque: 2 GB',
          'Connexion Internet requise'
        ]),
        supportTypes: JSON.stringify(['Email', 'Documentation', 'Forum communautaire']),
        documentation: 'Documentation complète disponible en ligne',
        updatePolicy: 'Mises à jour gratuites pendant 1 an',
        paymentMethods: JSON.stringify(['Carte bancaire', 'PayPal', 'Virement']),
        hosting: 'Hébergement sécurisé en Europe (RGPD)',
        termsOfUse: 'Conditions générales d\'utilisation disponibles',
        privacyPolicy: 'Politique de confidentialité conforme RGPD',
        categoryId: defaultCategory.id
      }
      
      products.push(productData)
    }
    
    // Insérer tous les produits
    console.log('📦 Insertion des produits en base...')
    
    for (const product of products) {
      try {
        await prisma.product.create({
          data: product
        })
        console.log(`✅ ${product.name} - ${product.price}€ / ${product.priceDA} DA`)
      } catch (error) {
        console.log(`❌ Erreur pour ${product.name}:`, error)
      }
    }
    
    console.log('\n📊 Résumé de la génération:')
    console.log(`- ${products.length} produits générés`)
    console.log(`- Types d'applications: ${appTypes.join(', ')}`)
    console.log(`- Licences: ${licenseTypes.map(l => l.name).join(', ')}`)
    console.log(`- Support: ${supportLevels.map(s => s.name).join(', ')}`)
    console.log('- Tarifs: EUR (International) + DA (Algérie)')
    console.log('- Champs complets: tagline, description courte, technologies, compatibilité, etc.')
    console.log(`- Produits gratuits: ${products.filter(p => p.isFree).length}`)
    console.log(`- Produits payants: ${products.filter(p => !p.isFree).length}`)
    
    console.log('\n🎉 Génération terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateProducts()