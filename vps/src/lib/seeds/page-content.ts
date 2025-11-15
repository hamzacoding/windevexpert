import { prisma } from '@/lib/prisma'

export const defaultPageContent = [
  // Page d'accueil
  {
    pageSlug: 'home',
    sectionKey: 'hero',
    title: 'Section héro - Page d\'accueil',
    content: `
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          Bienvenue sur WindevExpert
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Votre plateforme de formation et services WinDev de référence
        </p>
        <div class="space-x-4">
          <a href="/formations" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Découvrir nos formations
          </a>
          <a href="/services" class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50">
            Nos services
          </a>
        </div>
      </div>
    `,
    isActive: true
  },
  {
    pageSlug: 'home',
    sectionKey: 'features',
    title: 'Fonctionnalités - Page d\'accueil',
    content: `
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Formations Expert</h3>
          <p class="text-gray-600">Formations WinDev complètes avec projets pratiques et support personnalisé</p>
        </div>
        <div class="text-center">
          <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Développement Rapide</h3>
          <p class="text-gray-600">Services de développement d'applications WinDev sur mesure</p>
        </div>
        <div class="text-center">
          <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Support 24/7</h3>
          <p class="text-gray-600">Assistance technique et support continu pour tous vos projets</p>
        </div>
      </div>
    `,
    isActive: true
  },
  {
    pageSlug: 'home',
    sectionKey: 'testimonials',
    title: 'Témoignages - Page d\'accueil',
    content: `
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
        <p class="text-gray-600">Découvrez les retours de nos clients satisfaits</p>
      </div>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600 mb-4">"Excellente formation WinDev ! J'ai pu développer mon application en quelques semaines grâce aux conseils d'expert."</p>
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
            <div class="ml-3">
              <p class="font-semibold">Jean Dupont</p>
              <p class="text-sm text-gray-500">Développeur indépendant</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600 mb-4">"Service de développement professionnel et réactif. Notre application a été livrée dans les temps et fonctionne parfaitement."</p>
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">ML</div>
            <div class="ml-3">
              <p class="font-semibold">Marie Leblanc</p>
              <p class="text-sm text-gray-500">Directrice IT</p>
            </div>
          </div>
        </div>
      </div>
    `,
    isActive: true
  },

  // Page À propos
  {
    pageSlug: 'about',
    sectionKey: 'hero',
    title: 'Section héro - À propos',
    content: `
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">À propos de WindevExpert</h1>
        <p class="text-xl text-gray-600 mb-8">
          Experts en développement WinDev depuis plus de 10 ans
        </p>
      </div>
    `,
    isActive: true
  },
  {
    pageSlug: 'about',
    sectionKey: 'story',
    title: 'Notre histoire',
    content: `
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre histoire</h2>
          <p class="text-gray-600 mb-4">
            WindevExpert a été fondé en 2014 par une équipe de développeurs passionnés par l'écosystème WinDev. 
            Notre mission est de démocratiser l'accès aux technologies PC Soft et d'accompagner les développeurs 
            dans leur montée en compétences.
          </p>
          <p class="text-gray-600 mb-4">
            Aujourd'hui, nous sommes fiers d'avoir formé plus de 1000 développeurs et d'avoir réalisé plus de 
            200 projets pour des entreprises de toutes tailles.
          </p>
          <div class="grid grid-cols-3 gap-4 mt-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">1000+</div>
              <div class="text-sm text-gray-500">Développeurs formés</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">200+</div>
              <div class="text-sm text-gray-500">Projets réalisés</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">10+</div>
              <div class="text-sm text-gray-500">Années d'expérience</div>
            </div>
          </div>
        </div>
        <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">Image de l'équipe</span>
        </div>
      </div>
    `,
    isActive: true
  },

  // Page Services
  {
    pageSlug: 'services',
    sectionKey: 'hero',
    title: 'Section héro - Services',
    content: `
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">Nos Services</h1>
        <p class="text-xl text-gray-600 mb-8">
          Solutions complètes pour vos projets WinDev
        </p>
      </div>
    `,
    isActive: true
  },
  {
    pageSlug: 'services',
    sectionKey: 'services-list',
    title: 'Liste des services',
    content: `
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Développement sur mesure</h3>
          <p class="text-gray-600 mb-4">Applications WinDev personnalisées selon vos besoins spécifiques</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Analyse des besoins</li>
            <li>• Conception et développement</li>
            <li>• Tests et déploiement</li>
            <li>• Maintenance et support</li>
          </ul>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Formation et coaching</h3>
          <p class="text-gray-600 mb-4">Formations personnalisées pour maîtriser WinDev</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Formations individuelles</li>
            <li>• Formations en équipe</li>
            <li>• Coaching technique</li>
            <li>• Certification</li>
          </ul>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Support technique</h3>
          <p class="text-gray-600 mb-4">Assistance et support pour vos projets existants</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Support 24/7</li>
            <li>• Résolution de bugs</li>
            <li>• Optimisation de code</li>
            <li>• Migration de versions</li>
          </ul>
        </div>
      </div>
    `,
    isActive: true
  },

  // Page Contact
  {
    pageSlug: 'contact',
    sectionKey: 'hero',
    title: 'Section héro - Contact',
    content: `
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">Contactez-nous</h1>
        <p class="text-xl text-gray-600 mb-8">
          Parlons de votre projet ensemble
        </p>
      </div>
    `,
    isActive: true
  },
  {
    pageSlug: 'contact',
    sectionKey: 'contact-info',
    title: 'Informations de contact',
    content: `
      <div class="grid md:grid-cols-2 gap-12">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>
          <div class="space-y-4">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p class="font-semibold">Adresse</p>
                <p class="text-gray-600">123 Rue de la Technologie<br>75001 Paris, France</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <div>
                <p class="font-semibold">Téléphone</p>
                <p class="text-gray-600">+33 1 23 45 67 89</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p class="font-semibold">Email</p>
                <p class="text-gray-600">contact@windevexpert.com</p>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-lg font-semibold mb-4">Horaires d'ouverture</h3>
            <div class="space-y-2 text-gray-600">
              <div class="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span>9h00 - 18h00</span>
              </div>
              <div class="flex justify-between">
                <span>Samedi</span>
                <span>9h00 - 12h00</span>
              </div>
              <div class="flex justify-between">
                <span>Dimanche</span>
                <span>Fermé</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">Carte Google Maps</span>
        </div>
      </div>
    `,
    isActive: true
  }
]

export async function seedPageContent() {
  console.log('🌱 Ajout du contenu initial des pages...')
  
  for (const content of defaultPageContent) {
    try {
      await prisma.pageContent.upsert({
        where: { 
          pageSlug_sectionKey: {
            pageSlug: content.pageSlug,
            sectionKey: content.sectionKey
          }
        },
        update: content,
        create: content
      })
      console.log(`✅ Contenu "${content.title}" ajouté`)
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du contenu "${content.title}":`, error)
    }
  }
  
  console.log('✅ Contenu initial des pages ajouté avec succès')
}