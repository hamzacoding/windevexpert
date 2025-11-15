'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PaymentModal } from '@/components/ui/payment-modal'
import Image from 'next/image'
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  Globe, 
  Flag,
  ArrowLeft,
  Play,
  Calendar,
  Target,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { sanitizeHtml } from '@/lib/sanitize-html'

interface Formation {
  id: string
  slug?: string
  title: string
  subtitle?: string | null
  description: string
  longDescription: string
  duration: string
  level: string
  category: string
  subcategory?: string | null
  language?: string
  rating: number
  studentsCount: number
  priceEuro: number
  priceDA: number
  lien_paiement?: string | null
  prix_affiche?: { valeur: number; devise: 'USD' | 'EUR' | 'DZD' }
  image: string
  features: string[]
  objectives: string[]
  prerequisites: string[]
  modulesCount?: number
  lessonsCount?: number
  certificate?: boolean
  accessType?: string
  refundableDays?: number
  videoUrl?: string | null
  targetAudience?: string | null
  modules: {
    title: string
    duration: string
    lessons: string[]
  }[]
}



export default function FormationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formation, setFormation] = useState<Formation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)



  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true)
        const formationId = params.id as string
        const response = await fetch(`/api/courses/${formationId}`)
        
        if (!response.ok) {
          throw new Error('Formation non trouvée')
        }
        
        const data = await response.json()
        setFormation(data)
      } catch (error) {
        console.error('Erreur lors du chargement de la formation:', error)
        setFormation(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFormation()
  }, [params.id])

  // Always call hooks before any conditional returns to respect React's Rules of Hooks
  const heroImage = useMemo(
    () => (formation?.image ? formation.image : '/api/placeholder/800/450'),
    [formation?.image]
  )

  const handleEnrollment = () => {
    if (!formation) return

    // Vérifier l'état d'authentification
    if (status === 'loading') {
      return // Attendre que l'état d'authentification soit chargé
    }

    if (!session) {
      // Utilisateur non connecté - rediriger vers la page d'inscription
      router.push('/auth/signup')
      return
    }

    // Utilisateur connecté - ouvrir la popup de paiement
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la formation...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!formation) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
            <p className="text-gray-600 mb-6">La formation que vous recherchez n'existe pas.</p>
            <Link href="/formations">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux formations
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const getLevelColor = (level: string) => {
    const lv = (level || '').toUpperCase()
    if (lv === 'DÉBUTANT' || lv === 'DEBUTANT' || lv === 'BEGINNER') return 'bg-green-100 text-green-800'
    if (lv === 'INTERMÉDIAIRE' || lv === 'INTERMEDIAIRE' || lv === 'INTERMEDIATE') return 'bg-yellow-100 text-yellow-800'
    if (lv === 'AVANCÉ' || lv === 'AVANCE' || lv === 'ADVANCED') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLevel = (level: string) => {
    const lv = (level || '').toUpperCase()
    if (lv === 'DEBUTANT' || lv === 'BEGINNER') return 'Débutant'
    if (lv === 'INTERMEDIAIRE' || lv === 'INTERMEDIATE') return 'Intermédiaire'
    if (lv === 'AVANCE' || lv === 'ADVANCED') return 'Avancé'
    return level || 'Tous niveaux'
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header avec breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600">Accueil</Link>
              <span>/</span>
              <Link href="/formations" className="hover:text-blue-600">Formations</Link>
              <span>/</span>
              <span className="text-gray-900">{formation.title}</span>
            </div>
            <Link href="/formations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux formations
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className={getLevelColor(formation.level)}>
                    {formatLevel(formation.level)}
                  </Badge>
                  <Badge variant="outline" className="border-white text-white">
                    {formation.category}
                  </Badge>
                  {formation.subcategory && (
                    <Badge variant="outline" className="border-white text-white">
                      {formation.subcategory}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {formation.title}
                </h1>
                {formation.subtitle && (
                  <p className="text-lg text-blue-100 mb-2">
                    {formation.subtitle}
                  </p>
                )}
                <p className="text-xl text-blue-100 mb-6">
                  {formation.description}
                </p>
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {formation.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {formation.studentsCount} étudiants
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 fill-current" />
                    {formation.rating}/5
                  </div>
                </div>
              </div>
              
              {/* Couverture + Prix localisé */}
              <div className="space-y-4">
                <div className="block">
                  <Image
                    src={heroImage}
                    alt={formation.title}
                    width={800}
                    height={450}
                    className="w-full h-56 md:h-72 object-cover rounded-xl shadow-xl border border-white/20"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      img.onerror = null
                      img.src = '/api/placeholder/800/450'
                    }}
                  />
                </div>
                <div className="bg-white rounded-xl p-6 text-gray-900 shadow-xl">
                  <h3 className="text-2xl font-bold mb-4">Prix</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">Prix local</span>
                    </div>
                    <span className="text-3xl font-extrabold text-blue-700">
                      {formation.prix_affiche?.valeur?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      {" "}{formation.prix_affiche?.devise}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    {formation.accessType && (
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-gray-600" />
                        <span>Accès: {formation.accessType === 'ACCES_A_VIE' ? 'À vie' : 'Abonnement 1 an'}</span>
                      </div>
                    )}
                    {typeof formation.refundableDays === 'number' && formation.refundableDays > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-600" />
                        <span>Garantie: {formation.refundableDays} jours</span>
                      </div>
                    )}
                    {formation.certificate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Certificat de fin de formation</span>
                      </div>
                    )}
                    {formation.language && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-600" />
                        <span>Langue: {formation.language === 'ANGLAIS' ? 'Anglais' : 'Français'}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleEnrollment}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {status === 'loading' ? 'Chargement...' : (session ? 'Acheter maintenant' : 'S\'inscrire maintenant')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed">
                    <div
                      className="wysiwyg-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formation.longDescription) }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Objectifs pédagogiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Programme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Programme de formation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formation.modules.map((module, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{module.title}</h4>
                          <Badge variant="outline">{module.duration}</Badge>
                        </div>
                        <ul className="space-y-1">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="text-gray-600 text-sm">
                              • {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prérequis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prérequis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ce que vous obtiendrez */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Ce que vous obtiendrez
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Prêt à commencer ?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Rejoignez {formation.studentsCount} autres étudiants
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleEnrollment}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {status === 'loading' ? 'Chargement...' : (session ? 'Acheter maintenant' : 'S\'inscrire maintenant')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        formation={formation}
      />
    </PublicLayout>
  )
}