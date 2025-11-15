'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Euro, 
  FileText, 
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Code,
  Palette,
  Search,
  ShoppingCart,
  BarChart,
  Lock,
  ArrowLeft,
  ArrowRight,
  Star,
  Target,
  Lightbulb,
  MessageCircle,
  Sun,
  Upload,
  X
} from 'lucide-react'

const quoteSchema = z.object({
  // Informations personnelles
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  company: z.string().optional(),
  position: z.string().optional(),
  
  // Projet
  projectType: z.enum(['website', 'webapp', 'mobile', 'ecommerce', 'formation', 'consulting', 'maintenance', 'other']),
  projectTitle: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  projectDescription: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  
  // Services demandés
  services: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un service'),
  
  // Fonctionnalités
  features: z.array(z.string()).optional(),
  
  // Budget et délais
  budget: z.enum(['<5000', '5000-15000', '15000-30000', '30000-50000', '>50000']),
  timeline: z.enum(['urgent', '1-3months', '3-6months', '6-12months', 'flexible']),
  
  // Informations supplémentaires
  hasExistingWebsite: z.boolean().optional(),
  existingWebsiteUrl: z.string().optional(),
  targetAudience: z.string().optional(),
  competitors: z.string().optional(),
  additionalInfo: z.string().optional(),
  document: z.any().optional(), // Document PDF optionnel
  
  // Préférences de contact
  preferredContactMethod: z.enum(['email', 'phone', 'both']),
  preferredContactTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  
  // Consentements
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions'),
  acceptMarketing: z.boolean().optional(),
})

type QuoteForm = z.infer<typeof quoteSchema>

const serviceOptions = [
  { id: 'web-development', label: 'Développement Web', icon: Code, description: 'Sites web sur mesure' },
  { id: 'web-design', label: 'Design Web', icon: Palette, description: 'Interface utilisateur moderne' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, description: 'Boutique en ligne' },
  { id: 'mobile-app', label: 'Application Mobile', icon: Smartphone, description: 'iOS et Android' },
  { id: 'web-app', label: 'Application Web', icon: Monitor, description: 'SaaS et plateformes' },
  { id: 'database', label: 'Base de Données', icon: Database, description: 'Architecture et optimisation' },
  { id: 'cloud', label: 'Cloud & Hébergement', icon: Cloud, description: 'Infrastructure cloud' },
  { id: 'seo', label: 'SEO & Marketing', icon: Search, description: 'Référencement naturel' },
  { id: 'analytics', label: 'Analytics', icon: BarChart, description: 'Suivi et analyse' },
  { id: 'security', label: 'Sécurité', icon: Lock, description: 'Audit et protection' },
  { id: 'formation', label: 'Formation', icon: Users, description: 'Formation équipe' },
  { id: 'maintenance', label: 'Maintenance', icon: Shield, description: 'Support technique' },
]

const featureOptions = [
  'Système de connexion utilisateur',
  'Paiement en ligne',
  'Gestion de contenu (CMS)',
  'API et intégrations',
  'Tableau de bord admin',
  'Notifications push',
  'Chat en temps réel',
  'Géolocalisation',
  'Multilingue',
  'Responsive design',
  'PWA (Progressive Web App)',
  'Intégration réseaux sociaux',
  'Système de réservation',
  'Gestion d\'inventaire',
  'Rapports et statistiques',
  'Sauvegarde automatique',
]

export default function QuoteRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      services: [],
      features: [],
      hasExistingWebsite: false,
      acceptTerms: false,
      acceptMarketing: false,
      preferredContactMethod: 'email',
      preferredContactTime: 'anytime',
    },
  })

  const watchedServices = watch('services') || []
  const watchedFeatures = watch('features') || []
  const watchedProjectType = watch('projectType')
  const watchedBudget = watch('budget')
  const watchedTimeline = watch('timeline')
  const watchedHasExistingWebsite = watch('hasExistingWebsite')
  const watchedPreferredContactMethod = watch('preferredContactMethod')
  const watchedPreferredContactTime = watch('preferredContactTime')
  const watchedAcceptTerms = watch('acceptTerms')
  const watchedAcceptMarketing = watch('acceptMarketing')

  const onSubmit = async (data: QuoteForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la demande')
      }

      toast.success('Votre demande de devis a été envoyée avec succès !')
      router.push('/demande-devis/confirmation')
    } catch (error) {
      console.error('Error submitting quote request:', error)
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = watchedServices
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId]
    setValue('services', newServices)
  }

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = watchedFeatures
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    setValue('features', newFeatures)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        toast.error('Veuillez sélectionner un fichier PDF')
        return
      }
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 10MB')
        return
      }
      setUploadedFile(file)
      setValue('document', file)
      toast.success('Document uploadé avec succès')
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setValue('document', undefined)
    // Reset the input
    const fileInput = document.getElementById('document-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const nextStep = async () => {
    // Validation par étape
    let fieldsToValidate: (keyof QuoteForm)[] = []
    
    switch (currentStep) {
      case 1:
        // Étape 1: Informations personnelles
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone']
        break
      case 2:
        // Étape 2: Détails du projet
        fieldsToValidate = ['projectType', 'projectTitle', 'projectDescription', 'services']
        break
      case 3:
        // Étape 3: Budget et délais
        fieldsToValidate = ['budget', 'timeline']
        break
      case 4:
        // Étape 4: Préférences de contact et conditions
        fieldsToValidate = ['preferredContactMethod', 'preferredContactTime', 'acceptTerms']
        break
    }

    // Valider les champs requis pour l'étape actuelle
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (!isValid) {
      // Afficher un message d'erreur si la validation échoue
      toast.error('Veuillez remplir tous les champs obligatoires avant de continuer.')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {i + 1 <= currentStep ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${
                i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Target className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Demande de Devis Personnalisé
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Transformez votre vision en réalité digitale. Décrivez votre projet en détail 
            pour recevoir un devis sur mesure adapté à vos besoins spécifiques.
          </p>
          <div className="flex items-center justify-center mt-8 space-x-8 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Devis gratuit</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>Réponse sous 24h</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Données sécurisées</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Étape {currentStep} sur {totalSteps}</h2>
            <div className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% complété
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Informations personnelles
            </span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Projet & Services
            </span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Budget & Délais
            </span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
              Finalisation
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center text-white">
                  <User className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Informations personnelles</h3>
                    <p className="text-blue-100 mt-1">
                      Vos coordonnées pour que nous puissions vous contacter
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                      Prénom *
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      placeholder="Votre prénom"
                      className={`h-12 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                      Nom *
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      placeholder="Votre nom"
                      className={`h-12 ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="votre@email.com"
                        className={`h-12 pl-11 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Téléphone *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="06 12 34 56 78"
                        className={`h-12 pl-11 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                      Entreprise
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="company"
                        {...register('company')}
                        placeholder="Nom de votre entreprise"
                        className="h-12 pl-11 border-gray-300 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-semibold text-gray-700">
                      Poste
                    </Label>
                    <Input
                      id="position"
                      {...register('position')}
                      placeholder="Votre fonction"
                      className="h-12 border-gray-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Type de projet et services */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Lightbulb className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Votre projet</h3>
                      <p className="text-blue-100 mt-1">
                        Décrivez le type de projet que vous souhaitez réaliser
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Type de projet *</Label>
                    <RadioGroup
                      value={watchedProjectType}
                      onValueChange={(value) => setValue('projectType', value as any)}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {[
                        { value: 'website', label: 'Site Web', icon: Globe },
                        { value: 'webapp', label: 'App Web', icon: Monitor },
                        { value: 'mobile', label: 'App Mobile', icon: Smartphone },
                        { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
                        { value: 'formation', label: 'Formation', icon: Users },
                        { value: 'consulting', label: 'Consulting', icon: Target },
                        { value: 'maintenance', label: 'Maintenance', icon: Shield },
                        { value: 'other', label: 'Autre', icon: Star }
                      ].map((type) => {
                        const Icon = type.icon
                        return (
                          <div key={type.value} className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                            watchedProjectType === type.value 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                            <Label htmlFor={type.value} className="cursor-pointer flex flex-col items-center space-y-2">
                              <Icon className={`w-8 h-8 ${watchedProjectType === type.value ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${watchedProjectType === type.value ? 'text-blue-600' : 'text-gray-700'}`}>
                                {type.label}
                              </span>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                    {errors.projectType && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.projectType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="projectTitle" className="text-lg font-semibold text-gray-800">
                      Titre du projet *
                    </Label>
                    <Input
                      id="projectTitle"
                      {...register('projectTitle')}
                      placeholder="Ex: Site e-commerce pour vente de produits artisanaux"
                      className={`h-12 ${errors.projectTitle ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
                    />
                    {errors.projectTitle && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.projectTitle.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="projectDescription" className="text-lg font-semibold text-gray-800">
                      Description détaillée *
                    </Label>
                    <Textarea
                      id="projectDescription"
                      {...register('projectDescription')}
                      placeholder="Décrivez votre projet en détail : objectifs, public cible, fonctionnalités souhaitées..."
                      rows={6}
                      className={`${errors.projectDescription ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors resize-none`}
                    />
                    {errors.projectDescription && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.projectDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Code className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Services demandés *</h3>
                      <p className="text-purple-100 mt-1">
                        Sélectionnez tous les services dont vous avez besoin
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceOptions.map((service) => {
                      const Icon = service.icon
                      const isSelected = watchedServices.includes(service.id)
                      
                      return (
                        <div
                          key={service.id}
                          className={`group p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleServiceToggle(service.id)}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {service.label}
                                </span>
                              </div>
                              <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {errors.services && (
                    <p className="text-red-500 text-sm mt-4 flex items-center">
                      <span className="w-4 h-4 mr-1">⚠</span>
                      {errors.services.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Fonctionnalités et budget */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Star className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Fonctionnalités souhaitées</h3>
                      <p className="text-green-100 mt-1">
                        Sélectionnez les fonctionnalités que vous aimeriez inclure
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureOptions.map((feature) => {
                      const isSelected = watchedFeatures.includes(feature)
                      
                      return (
                        <div
                          key={feature}
                          className={`group p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleFeatureToggle(feature)}
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <span className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                              {feature}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Euro className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Budget et délais</h3>
                      <p className="text-orange-100 mt-1">
                        Définissez votre budget et vos contraintes temporelles
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Budget estimé *</Label>
                    <RadioGroup
                      value={watchedBudget}
                      onValueChange={(value) => setValue('budget', value as any)}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {[
                        { value: '<5000', label: 'Moins de 5 000€', desc: 'Projet simple' },
                        { value: '5000-15000', label: '5 000€ - 15 000€', desc: 'Projet standard' },
                        { value: '15000-30000', label: '15 000€ - 30 000€', desc: 'Projet avancé' },
                        { value: '30000-50000', label: '30 000€ - 50 000€', desc: 'Projet complexe' },
                        { value: '>50000', label: 'Plus de 50 000€', desc: 'Projet entreprise' }
                      ].map((budget) => (
                        <div key={budget.value} className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                          watchedBudget === budget.value 
                            ? 'border-orange-500 bg-orange-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <RadioGroupItem value={budget.value} id={budget.value} className="sr-only" />
                          <Label htmlFor={budget.value} className="cursor-pointer">
                            <div className="text-center">
                              <div className={`font-semibold ${watchedBudget === budget.value ? 'text-orange-900' : 'text-gray-900'}`}>
                                {budget.label}
                              </div>
                              <div className={`text-sm mt-1 ${watchedBudget === budget.value ? 'text-orange-700' : 'text-gray-600'}`}>
                                {budget.desc}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.budget && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.budget.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Délai souhaité *</Label>
                    <RadioGroup
                      value={watchedTimeline}
                      onValueChange={(value) => setValue('timeline', value as any)}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {[
                        { value: 'urgent', label: 'Urgent', desc: '< 1 mois', icon: Zap },
                        { value: '1-3months', label: '1-3 mois', desc: 'Standard', icon: Calendar },
                        { value: '3-6months', label: '3-6 mois', desc: 'Planifié', icon: Calendar },
                        { value: '6-12months', label: '6-12 mois', desc: 'Long terme', icon: Calendar },
                        { value: 'flexible', label: 'Flexible', desc: 'Pas de contrainte', icon: Clock }
                      ].map((timeline) => {
                        const Icon = timeline.icon
                        return (
                          <div key={timeline.value} className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                            watchedTimeline === timeline.value 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value={timeline.value} id={timeline.value} className="sr-only" />
                            <Label htmlFor={timeline.value} className="cursor-pointer">
                              <div className="text-center">
                                <Icon className={`w-6 h-6 mx-auto mb-2 ${watchedTimeline === timeline.value ? 'text-orange-600' : 'text-gray-400'}`} />
                                <div className={`font-semibold ${watchedTimeline === timeline.value ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {timeline.label}
                                </div>
                                <div className={`text-sm mt-1 ${watchedTimeline === timeline.value ? 'text-orange-700' : 'text-gray-600'}`}>
                                  {timeline.desc}
                                </div>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                    {errors.timeline && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.timeline.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Étape 4: Informations complémentaires et préférences */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <FileText className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Informations complémentaires</h3>
                      <p className="text-purple-100 mt-1">
                        Aidez-nous à mieux comprendre votre projet
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                      <Checkbox
                        id="hasExistingWebsite"
                        checked={watchedHasExistingWebsite}
                        onCheckedChange={(checked) => setValue('hasExistingWebsite', checked as boolean)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor="hasExistingWebsite" className="font-medium text-gray-700 cursor-pointer">
                        J'ai déjà un site web
                      </Label>
                    </div>

                    {watchedHasExistingWebsite && (
                      <div className="space-y-2 ml-8">
                        <Label htmlFor="existingWebsiteUrl" className="text-sm font-semibold text-gray-700">
                          URL du site existant
                        </Label>
                        <Input
                          id="existingWebsiteUrl"
                          {...register('existingWebsiteUrl')}
                          placeholder="https://monsite.com"
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="targetAudience" className="text-lg font-semibold text-gray-800">
                      Public cible
                    </Label>
                    <Textarea
                      id="targetAudience"
                      {...register('targetAudience')}
                      placeholder="Décrivez votre public cible : âge, profession, besoins..."
                      rows={3}
                      className="border-2 border-gray-200 focus:border-purple-500 rounded-xl p-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="competitors" className="text-lg font-semibold text-gray-800">
                      Concurrents ou sites de référence
                    </Label>
                    <Textarea
                      id="competitors"
                      {...register('competitors')}
                      placeholder="Mentionnez des sites que vous admirez ou vos concurrents directs..."
                      rows={3}
                      className="border-2 border-gray-200 focus:border-purple-500 rounded-xl p-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="additionalInfo" className="text-lg font-semibold text-gray-800">
                      Informations supplémentaires
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      {...register('additionalInfo')}
                      placeholder="Toute autre information que vous jugez importante pour votre projet..."
                      rows={4}
                      className="border-2 border-gray-200 focus:border-purple-500 rounded-xl p-4"
                    />
                  </div>

                  {/* Section Upload de Document */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">
                      Document complémentaire (optionnel)
                    </Label>
                    <p className="text-sm text-gray-600">
                      Vous pouvez joindre un document PDF (cahier des charges, maquettes, etc.) - Max 10MB
                    </p>
                    
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="document-upload"
                          className="cursor-pointer flex flex-col items-center space-y-4"
                        >
                          <Upload className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-lg font-medium text-gray-700">
                              Cliquez pour sélectionner un fichier PDF
                            </p>
                            <p className="text-sm text-gray-500">
                              ou glissez-déposez votre fichier ici
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">{uploadedFile.name}</p>
                            <p className="text-sm text-green-600">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Phone className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Préférences de contact</h3>
                      <p className="text-teal-100 mt-1">
                        Comment souhaitez-vous être contacté ?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Méthode de contact préférée</Label>
                    <RadioGroup
                      value={watchedPreferredContactMethod}
                      onValueChange={(value) => setValue('preferredContactMethod', value as any)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {[
                        { value: 'email', label: 'Email', desc: 'Réponse rapide', icon: Mail },
                        { value: 'phone', label: 'Téléphone', desc: 'Discussion directe', icon: Phone },
                        { value: 'both', label: 'Les deux', desc: 'Maximum de flexibilité', icon: Users }
                      ].map((method) => {
                        const Icon = method.icon
                        return (
                          <div key={method.value} className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                            watchedPreferredContactMethod === method.value 
                              ? 'border-teal-500 bg-teal-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                            <Label htmlFor={method.value} className="cursor-pointer">
                              <div className="text-center">
                                <Icon className={`w-6 h-6 mx-auto mb-2 ${watchedPreferredContactMethod === method.value ? 'text-teal-600' : 'text-gray-400'}`} />
                                <div className={`font-semibold ${watchedPreferredContactMethod === method.value ? 'text-teal-900' : 'text-gray-900'}`}>
                                  {method.label}
                                </div>
                                <div className={`text-sm mt-1 ${watchedPreferredContactMethod === method.value ? 'text-teal-700' : 'text-gray-600'}`}>
                                  {method.desc}
                                </div>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Moment préféré pour vous contacter</Label>
                    <RadioGroup
                      value={watchedPreferredContactTime}
                      onValueChange={(value) => setValue('preferredContactTime', value as any)}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {[
                        { value: 'morning', label: 'Matin', desc: '9h-12h', icon: Clock },
                        { value: 'afternoon', label: 'Après-midi', desc: '14h-17h', icon: Clock },
                        { value: 'evening', label: 'Soir', desc: '18h-20h', icon: Clock },
                        { value: 'anytime', label: 'Flexible', desc: 'N\'importe quand', icon: Calendar }
                      ].map((time) => {
                        const Icon = time.icon
                        return (
                          <div key={time.value} className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                            watchedPreferredContactTime === time.value 
                              ? 'border-teal-500 bg-teal-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <RadioGroupItem value={time.value} id={time.value} className="sr-only" />
                            <Label htmlFor={time.value} className="cursor-pointer">
                              <div className="text-center">
                                <Icon className={`w-5 h-5 mx-auto mb-2 ${watchedPreferredContactTime === time.value ? 'text-teal-600' : 'text-gray-400'}`} />
                                <div className={`font-semibold text-sm ${watchedPreferredContactTime === time.value ? 'text-teal-900' : 'text-gray-900'}`}>
                                  {time.label}
                                </div>
                                <div className={`text-xs mt-1 ${watchedPreferredContactTime === time.value ? 'text-teal-700' : 'text-gray-600'}`}>
                                  {time.desc}
                                </div>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-8 py-6">
                  <div className="flex items-center text-white">
                    <Shield className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Conditions et consentements</h3>
                      <p className="text-gray-300 mt-1">
                        Protection de vos données personnelles
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    watchedAcceptTerms 
                      ? 'border-green-500 bg-green-50' 
                      : errors.acceptTerms
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="acceptTerms"
                        checked={watchedAcceptTerms}
                        onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                        className={`mt-1 ${
                          errors.acceptTerms 
                            ? 'border-red-500' 
                            : 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
                        }`}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer font-medium text-gray-700">
                        J'accepte les{' '}
                        <a href="/conditions" target="_blank" className="text-blue-600 hover:underline font-semibold">
                          conditions générales d'utilisation
                        </a>{' '}
                        et la{' '}
                        <a href="/confidentialite" target="_blank" className="text-blue-600 hover:underline font-semibold">
                          politique de confidentialité
                        </a>
                        . *
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-sm flex items-center mt-2">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {errors.acceptTerms.message}
                      </p>
                    )}
                  </div>

                  <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    watchedAcceptMarketing 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="acceptMarketing"
                        checked={watchedAcceptMarketing}
                        onCheckedChange={(checked) => setValue('acceptMarketing', checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor="acceptMarketing" className="text-sm leading-relaxed cursor-pointer font-medium text-gray-700">
                        J'accepte de recevoir des communications marketing de WindevExpert : newsletters, offres spéciales, conseils techniques et actualités du secteur.
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer ma demande de devis
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}