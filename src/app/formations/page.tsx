'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Star, BookOpen, Filter, Globe, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/public-layout'

interface Course {
  id: string
  title: string
  description: string
  duration: string
  level: string
  category: string
  priceEuro: number
  priceDA: number | null
  prix_affiche?: { valeur: number; devise: 'USD' | 'EUR' | 'DZD' }
  students: number
  rating: number
  features: string[]
  image: string
}

export default function FormationsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')

  const categories = ['all', 'Développement Web', 'WinDev', 'WebDev', 'WinDev Mobile', 'HFSQL', 'WLangage', 'Wordpress']
  const levels = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  // Fonction pour traduire les niveaux en français
  const translateLevel = (level: string) => {
    const lv = (level || '').toUpperCase()
    if (lv === 'BEGINNER' || lv === 'DEBUTANT' || lv === 'DÉBUTANT') return 'Débutant'
    if (lv === 'INTERMEDIATE' || lv === 'INTERMEDIAIRE' || lv === 'INTERMÉDIAIRE') return 'Intermédiaire'
    if (lv === 'ADVANCED' || lv === 'AVANCE' || lv === 'AVANCÉ') return 'Avancé'
    return level
  }

  // Récupérer les formations depuis l'API
  useEffect(() => {
    const detectClientCountry = (): string | null => {
      try {
        // Détection via fuseau horaire
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        if (tz.toLowerCase() === 'africa/algiers') return 'DZ'
        // Détection via langue du navigateur
        const langs = (navigator.languages || [navigator.language]).filter(Boolean)
        const found = langs.find(l => /-dz$/i.test(l))
        if (found) return 'DZ'
      } catch {}
      return null
    }

    const fetchCourses = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const cc = detectClientCountry()
        const response = await fetch('/api/courses', cc ? { headers: { 'x-country-code': cc } } : undefined)
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Vérification de la structure des données
        if (data && Array.isArray(data.courses)) {
          setCourses(data.courses)
        } else if (data && Array.isArray(data)) {
          setCourses(data)
        } else {
          console.error('Structure de données inattendue:', data)
          setError('Structure de données inattendue')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error)
        setError('Erreur lors du chargement des formations')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Filtrage des formations
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filtre par catégorie
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false
      }
      
      // Filtre par niveau
      if (selectedLevel !== 'all' && course.level !== selectedLevel) {
        return false
      }
      
      // Filtre par prix
      if (selectedPriceRange !== 'all') {
        const price = (course.prix_affiche?.valeur ?? course.priceEuro)
        switch (selectedPriceRange) {
          case '0-100':
            return price <= 100
          case '100-300':
            return price > 100 && price <= 300
          case '300+':
            return price > 300
          default:
            return true
        }
      }
      
      return true
    })
  }, [courses, selectedCategory, selectedLevel, selectedPriceRange])
  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nos Formations
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
              Développez vos compétences avec nos formations expertes et 
              maîtrisez les technologies qui feront la différence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <BookOpen className="h-5 w-5 mr-2" />
                Parcourir les formations
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Users className="h-5 w-5 mr-2" />
                Rejoindre la communauté
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Formations disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">Étudiants formés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Note moyenne</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Taux de réussite</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filtrer par :</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Tous' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'Tous' : translateLevel(level)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                <select 
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les prix</option>
                  <option value="free">Gratuit</option>
                  <option value="0-100">0€ - 100€</option>
                  <option value="100-300">100€ - 300€</option>
                  <option value="300+">300€+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement des formations...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          )}
          
          {!loading && !error && filteredCourses.length > 0 && (
              <>
                <div className="mb-6">
                <p className="text-gray-600">
                  {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} trouvée{filteredCourses.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <Image
                  src={course.image || '/api/placeholder/400/250'}
                  alt={course.title}
                  width={400}
                  height={250}
                  className="h-48 w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  onError={(e) => {
                    // Si l'image est invalide ou introuvable, basculer sur le placeholder
                    const img = e.currentTarget as HTMLImageElement
                    img.onerror = null
                    img.src = '/api/placeholder/400/250'
                  }}
                />
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {course.category}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {translateLevel(course.level)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                     <ul className="text-sm text-gray-600 space-y-1">
                       {course.features.slice(0, 3).map((feature, index) => (
                         <li key={index} className="flex items-center">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                           {feature}
                         </li>
                       ))}
                     </ul>
                   </div>
                  
                  <div className="space-y-3">
                    {/* Prix Localisé */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <div>
                          <span className="text-2xl font-extrabold text-gray-900">
                            {course.prix_affiche?.valeur?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            {" "}{course.prix_affiche?.devise}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/formations/${course.id}`}>
                      <Button className="w-full">
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont déjà transformé leur carrière 
            grâce à nos formations expertes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Parler à un conseiller
            </Button>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}