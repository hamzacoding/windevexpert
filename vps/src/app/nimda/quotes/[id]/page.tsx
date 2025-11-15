'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Building,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import toast from 'react-hot-toast'

interface QuoteRequest {
  id: string
  quoteNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  company?: string
  position?: string
  projectType: string
  projectTitle: string
  projectDescription: string
  services: string[]
  features: string[]
  budget: string
  timeline: string
  hasExistingWebsite: boolean
  existingWebsiteUrl?: string
  targetAudience?: string
  competitors?: string
  additionalInfo?: string
  preferredContactMethod: string
  preferredContactTime: string
  acceptTerms: boolean
  acceptMarketing: boolean
  status: 'PENDING' | 'REVIEWED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  adminNotes?: string
  estimatedPrice?: number
  quoteSentAt?: string
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  REVIEWED: { label: 'Examiné', color: 'bg-blue-100 text-blue-800', icon: Eye },
  QUOTED: { label: 'Devis envoyé', color: 'bg-purple-100 text-purple-800', icon: Mail },
  ACCEPTED: { label: 'Accepté', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: XCircle },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-800', icon: Pause }
}

const projectTypeLabels = {
  website: 'Site Web',
  webapp: 'Application Web',
  mobile: 'Application Mobile',
  ecommerce: 'E-commerce',
  formation: 'Formation',
  consulting: 'Conseil',
  maintenance: 'Maintenance',
  other: 'Autre'
}

const serviceLabels = {
  'web-development': 'Développement Web',
  'web-design': 'Design Web',
  'ecommerce': 'E-commerce',
  'mobile-app': 'Application Mobile',
  'web-app': 'Application Web',
  'database': 'Base de Données',
  'cloud': 'Cloud & Hébergement',
  'seo': 'SEO & Marketing',
  'analytics': 'Analytics',
  'security': 'Sécurité',
  'formation': 'Formation',
  'maintenance': 'Maintenance'
}

export default function QuoteDetailPage() {
  const [quote, setQuote] = useState<QuoteRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    status: '',
    adminNotes: '',
    estimatedPrice: ''
  })
  
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()

  // Protection de l'accès admin
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const fetchQuote = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/quotes/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Demande de devis non trouvée')
        }
        throw new Error('Erreur lors du chargement de la demande de devis')
      }
      
      const data = await response.json()
      setQuote(data)
      setEditData({
        status: data.status,
        adminNotes: data.adminNotes || '',
        estimatedPrice: data.estimatedPrice?.toString() || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      toast.error('Erreur lors du chargement de la demande de devis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchQuote()
    }
  }, [session, params.id])

  const handleSave = async () => {
    try {
      const updateData: any = {
        status: editData.status,
        adminNotes: editData.adminNotes
      }

      if (editData.estimatedPrice) {
        updateData.estimatedPrice = parseFloat(editData.estimatedPrice)
      }

      const response = await fetch(`/api/admin/quotes/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      toast.success('Demande mise à jour avec succès')
      setIsEditing(false)
      fetchQuote() // Recharger les données
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatBudget = (budget: string) => {
    const budgetLabels = {
      '<5000': '< 5 000 €',
      '5000-15000': '5 000 - 15 000 €',
      '15000-30000': '15 000 - 30 000 €',
      '30000-50000': '30 000 - 50 000 €',
      '>50000': '> 50 000 €'
    }
    return budgetLabels[budget as keyof typeof budgetLabels] || budget
  }

  const formatTimeline = (timeline: string) => {
    const timelineLabels = {
      urgent: 'Urgent',
      '1-3months': '1-3 mois',
      '3-6months': '3-6 mois',
      '6-12months': '6-12 mois',
      flexible: 'Flexible'
    }
    return timelineLabels[timeline as keyof typeof timelineLabels] || timeline
  }

  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement...
          </h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement de la demande...</p>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
          <p className="text-red-600">{error || 'Demande de devis non trouvée'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Demande de devis #{quote.quoteNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {quote.fullName} - {quote.projectTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                onClick={() => router.push(`/nimda/quotes/${quote.id}/respond`)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Répondre
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nom complet</Label>
                  <p className="text-gray-900 font-medium">{quote.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {quote.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {quote.phone}
                  </p>
                </div>
                {quote.company && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Entreprise</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {quote.company}
                    </p>
                  </div>
                )}
                {quote.position && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Poste</Label>
                    <p className="text-gray-900">{quote.position}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Détails du projet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails du projet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Titre du projet</Label>
                <p className="text-gray-900 font-medium">{quote.projectTitle}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type de projet</Label>
                <Badge variant="outline">
                  {projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-gray-900 whitespace-pre-wrap">{quote.projectDescription}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Services demandés</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quote.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {serviceLabels[service as keyof typeof serviceLabels] || service}
                    </Badge>
                  ))}
                </div>
              </div>
              {quote.features && quote.features.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fonctionnalités souhaitées</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quote.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget et délais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget et délais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Budget indicatif</Label>
                  <p className="text-gray-900 font-medium">{formatBudget(quote.budget)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Délai souhaité</Label>
                  <p className="text-gray-900 font-medium">{formatTimeline(quote.timeline)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          {(quote.hasExistingWebsite || quote.targetAudience || quote.competitors || quote.additionalInfo) && (
            <Card>
              <CardHeader>
                <CardTitle>Informations supplémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.hasExistingWebsite && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Site web existant</Label>
                    <p className="text-gray-900">
                      {quote.existingWebsiteUrl ? (
                        <a 
                          href={quote.existingWebsiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {quote.existingWebsiteUrl}
                        </a>
                      ) : (
                        'Oui'
                      )}
                    </p>
                  </div>
                )}
                {quote.targetAudience && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Public cible</Label>
                    <p className="text-gray-900">{quote.targetAudience}</p>
                  </div>
                )}
                {quote.competitors && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Concurrents</Label>
                    <p className="text-gray-900">{quote.competitors}</p>
                  </div>
                )}
                {quote.additionalInfo && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Informations complémentaires</Label>
                    <p className="text-gray-900 whitespace-pre-wrap">{quote.additionalInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statut et gestion */}
          <Card>
            <CardHeader>
              <CardTitle>Statut et gestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Statut actuel</Label>
                {isEditing ? (
                  <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="REVIEWED">Examiné</SelectItem>
                      <SelectItem value="QUOTED">Devis envoyé</SelectItem>
                      <SelectItem value="ACCEPTED">Accepté</SelectItem>
                      <SelectItem value="REJECTED">Refusé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    {getStatusBadge(quote.status)}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Prix estimé</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="Prix en euros"
                    value={editData.estimatedPrice}
                    onChange={(e) => setEditData({...editData, estimatedPrice: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-900 font-medium mt-1">
                    {quote.estimatedPrice 
                      ? `${quote.estimatedPrice.toLocaleString('fr-FR')} €`
                      : 'Non défini'
                    }
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Notes administrateur</Label>
                {isEditing ? (
                  <Textarea
                    placeholder="Notes internes..."
                    value={editData.adminNotes}
                    onChange={(e) => setEditData({...editData, adminNotes: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {quote.adminNotes || 'Aucune note'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Méthode préférée</Label>
                <p className="text-gray-900">{quote.preferredContactMethod}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Moment préféré</Label>
                <p className="text-gray-900">{quote.preferredContactTime}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Marketing</Label>
                <p className="text-gray-900">
                  {quote.acceptMarketing ? 'Accepte les communications' : 'Refuse les communications'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dates importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Demande reçue</Label>
                <p className="text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {quote.quoteSentAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Devis envoyé</Label>
                  <p className="text-gray-900">
                    {new Date(quote.quoteSentAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Dernière modification</Label>
                <p className="text-gray-900">
                  {new Date(quote.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}