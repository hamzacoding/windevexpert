// Service pour récupérer le contenu par défaut des pages
export interface DefaultPageContent {
  pageSlug: string
  sectionKey: string
  title: string
  content: string
}

// Contenu par défaut pour chaque page et section
export const defaultPageContents: DefaultPageContent[] = [
  // Page d'accueil
  {
    pageSlug: 'home',
    sectionKey: 'hero',
    title: 'Section héro - Page d\'accueil',
    content: `
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-6">Bienvenue sur WinDevExpert</h1>
          <p class="text-xl mb-8 max-w-2xl mx-auto">
            Votre plateforme de développement et de formation professionnelle. 
            Découvrez nos solutions innovantes pour faire évoluer vos compétences.
          </p>
          <div class="space-x-4">
            <a href="#services" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Découvrir nos services
            </a>
            <a href="#contact" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    `
  },
  {
    pageSlug: 'home',
    sectionKey: 'features',
    title: 'Fonctionnalités - Page d\'accueil',
    content: `
      <div class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Nos fonctionnalités</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Qualité garantie</h3>
              <p class="text-gray-600">Des solutions de haute qualité testées et approuvées par nos experts.</p>
            </div>
            <div class="text-center">
              <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Support expert</h3>
              <p class="text-gray-600">Une équipe d'experts disponible pour vous accompagner dans vos projets.</p>
            </div>
            <div class="text-center">
              <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Solutions flexibles</h3>
              <p class="text-gray-600">Des solutions adaptables à vos besoins spécifiques et évolutives.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    pageSlug: 'home',
    sectionKey: 'testimonials',
    title: 'Témoignages - Page d\'accueil',
    content: `
      <div class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Ce que disent nos clients</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">Jean Dupont</h4>
                  <p class="text-gray-600 text-sm">Directeur IT</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Excellent service et support technique. L'équipe WinDevExpert nous a aidés à moderniser notre infrastructure."</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  ML
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">Marie Leblanc</h4>
                  <p class="text-gray-600 text-sm">Chef de projet</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Formation de qualité et accompagnement personnalisé. Je recommande vivement leurs services."</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  PM
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold">Pierre Martin</h4>
                  <p class="text-gray-600 text-sm">Développeur</p>
                </div>
              </div>
              <p class="text-gray-700 italic">"Solutions innovantes et équipe réactive. Parfait pour nos besoins de développement."</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Page À propos
  {
    pageSlug: 'about',
    sectionKey: 'hero',
    title: 'Section héro - À propos',
    content: `
      <div class="bg-gray-900 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-6">À propos de WinDevExpert</h1>
          <p class="text-xl max-w-3xl mx-auto">
            Depuis plus de 10 ans, nous accompagnons les entreprises dans leur transformation digitale 
            avec expertise et passion.
          </p>
        </div>
      </div>
    `
  },
  {
    pageSlug: 'about',
    sectionKey: 'story',
    title: 'Notre histoire',
    content: `
      <div class="py-16">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-8">Notre histoire</h2>
            <div class="prose prose-lg">
              <p class="text-gray-700 mb-6">
                Fondée en 2014, WinDevExpert est née de la passion de ses fondateurs pour le développement 
                et l'innovation technologique. Notre mission est d'accompagner les entreprises dans leur 
                transformation digitale en proposant des solutions sur mesure et des formations de qualité.
              </p>
              <p class="text-gray-700 mb-6">
                Au fil des années, nous avons développé une expertise reconnue dans de nombreux domaines : 
                développement web et mobile, formation professionnelle, conseil en architecture logicielle, 
                et bien plus encore.
              </p>
              <p class="text-gray-700">
                Aujourd'hui, notre équipe de plus de 20 experts accompagne des clients de toutes tailles, 
                des startups aux grandes entreprises, dans la réalisation de leurs projets les plus ambitieux.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Page Services
  {
    pageSlug: 'services',
    sectionKey: 'hero',
    title: 'Section héro - Services',
    content: `
      <div class="bg-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-6">Nos Services</h1>
          <p class="text-xl max-w-2xl mx-auto">
            Découvrez notre gamme complète de services pour accompagner votre croissance digitale.
          </p>
        </div>
      </div>
    `
  },
  {
    pageSlug: 'services',
    sectionKey: 'services-list',
    title: 'Liste des services',
    content: `
      <div class="py-16">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-lg shadow-lg border">
              <div class="text-blue-600 mb-4">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4">Développement Web</h3>
              <p class="text-gray-600 mb-4">
                Création d'applications web modernes et performantes avec les dernières technologies.
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• React, Next.js, Vue.js</li>
                <li>• Node.js, Python, PHP</li>
                <li>• Bases de données SQL/NoSQL</li>
              </ul>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-lg border">
              <div class="text-green-600 mb-4">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4">Formation</h3>
              <p class="text-gray-600 mb-4">
                Programmes de formation sur mesure pour développer les compétences de vos équipes.
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Formations techniques</li>
                <li>• Accompagnement personnalisé</li>
                <li>• Certifications reconnues</li>
              </ul>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-lg border">
              <div class="text-purple-600 mb-4">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45.5a2.5 2.5 0 11-4.9 0 2.5 2.5 0 014.9 0zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-4">Conseil</h3>
              <p class="text-gray-600 mb-4">
                Expertise et conseil pour optimiser votre architecture et vos processus de développement.
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Audit technique</li>
                <li>• Architecture logicielle</li>
                <li>• Optimisation des performances</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // Page Contact
  {
    pageSlug: 'contact',
    sectionKey: 'hero',
    title: 'Section héro - Contact',
    content: `
      <div class="bg-gray-800 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-6">Contactez-nous</h1>
          <p class="text-xl max-w-2xl mx-auto">
            Prêt à démarrer votre projet ? Notre équipe est là pour vous accompagner.
          </p>
        </div>
      </div>
    `
  },
  {
    pageSlug: 'contact',
    sectionKey: 'contact-info',
    title: 'Informations de contact',
    content: `
      <div class="py-16">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-12">
            <div>
              <h2 class="text-2xl font-bold mb-6">Nos coordonnées</h2>
              <div class="space-y-4">
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <h3 class="font-semibold">Adresse</h3>
                    <p class="text-gray-600">123 Rue de la Technologie<br>75001 Paris, France</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <div>
                    <h3 class="font-semibold">Téléphone</h3>
                    <p class="text-gray-600">+33 1 23 45 67 89</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <div>
                    <h3 class="font-semibold">Email</h3>
                    <p class="text-gray-600">contact@windevexpert.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold mb-6">Horaires d'ouverture</h2>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="font-medium">Lundi - Vendredi</span>
                  <span class="text-gray-600">9h00 - 18h00</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Samedi</span>
                  <span class="text-gray-600">9h00 - 12h00</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Dimanche</span>
                  <span class="text-gray-600">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
]

/**
 * Récupère le contenu par défaut pour une page et une section donnée
 */
export function getDefaultContent(pageSlug: string, sectionKey: string): string {
  const defaultContent = defaultPageContents.find(
    content => content.pageSlug === pageSlug && content.sectionKey === sectionKey
  )
  
  return defaultContent?.content || ''
}

/**
 * Récupère le titre par défaut pour une page et une section donnée
 */
export function getDefaultTitle(pageSlug: string, sectionKey: string): string {
  const defaultContent = defaultPageContents.find(
    content => content.pageSlug === pageSlug && content.sectionKey === sectionKey
  )
  
  return defaultContent?.title || ''
}

/**
 * Vérifie si du contenu par défaut existe pour une page et une section donnée
 */
export function hasDefaultContent(pageSlug: string, sectionKey: string): boolean {
  return defaultPageContents.some(
    content => content.pageSlug === pageSlug && content.sectionKey === sectionKey
  )
}