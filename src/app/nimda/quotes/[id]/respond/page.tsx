'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Send,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  User,
  Mail
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
import { Checkbox } from '@/components/ui/checkbox'
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
  projectType: string
  projectTitle: string
  projectDescription: string
  services: string[]
  budget: string
  timeline: string
  status: string
  createdAt: string
}

interface ResponseData {
  subject: string
  message: string
  estimatedPrice: string
  estimatedTimeline: string
  includeTerms: boolean
  includeNextSteps: boolean
  updateStatus: string
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

export default function QuoteResponsePage() {
  const [quote, setQuote] = useState<QuoteRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [responseData, setResponseData] = useState<ResponseData>({
    subject: '',
    message: '',
    estimatedPrice: '',
    estimatedTimeline: '',
    includeTerms: true,
    includeNextSteps: true,
    updateStatus: 'QUOTED'
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
      
      // Initialiser le sujet par défaut
      setResponseData(prev => ({
        ...prev,
        subject: `Réponse à votre demande de devis - ${data.projectTitle}`
      }))
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

  const generateDefaultMessage = () => {
    if (!quote) return ''

    return `Bonjour ${quote.firstName},

Merci pour votre demande de devis concernant "${quote.projectTitle}".

Après avoir étudié votre projet de ${projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}, nous sommes ravis de vous proposer notre accompagnement.

## Votre projet
- **Type** : ${projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
- **Services demandés** : ${quote.services.map(s => serviceLabels[s as keyof typeof serviceLabels] || s).join(', ')}
- **Budget indicatif** : ${formatBudget(quote.budget)}

## Notre proposition
${responseData.estimatedPrice ? `- **Prix estimé** : ${responseData.estimatedPrice} €\n` : ''}${responseData.estimatedTimeline ? `- **Délai estimé** : ${responseData.estimatedTimeline}\n` : ''}
Nous vous proposons une solution sur mesure qui répond parfaitement à vos besoins et objectifs.

## Description détaillée
[Décrivez ici votre proposition détaillée, les technologies utilisées, les fonctionnalités incluses, etc.]

${responseData.includeNextSteps ? `## Prochaines étapes
1. **Validation du devis** : Confirmez votre accord avec cette proposition
2. **Réunion de cadrage** : Planification d'un rendez-vous pour affiner les détails
3. **Signature du contrat** : Formalisation de notre collaboration
4. **Démarrage du projet** : Lancement des travaux selon le planning convenu

` : ''}${responseData.includeTerms ? `## Conditions
- Devis valable 30 jours
- Acompte de 30% à la signature
- Paiement échelonné selon les livrables
- Garantie et maintenance incluses

` : ''}N'hésitez pas à me contacter si vous avez des questions ou souhaitez discuter de ce projet.

Cordialement,
L'équipe WinDevExpert`
  }

  const handleSendResponse = async () => {
    if (!responseData.subject.trim() || !responseData.message.trim()) {
      toast.error('Veuillez remplir le sujet et le message')
      return
    }

    try {
      setSending(true)
      
      const response = await fetch(`/api/admin/quotes/${params.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: responseData.subject,
          message: responseData.message,
          estimatedPrice: responseData.estimatedPrice ? parseFloat(responseData.estimatedPrice) : undefined,
          estimatedTimeline: responseData.estimatedTimeline || undefined,
          updateStatus: responseData.updateStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la réponse')
      }

      toast.success('Réponse envoyée avec succès')
      router.push(`/nimda/quotes/${params.id}`)
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la réponse')
    } finally {
      setSending(false)
    }
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
              Répondre à la demande #{quote.quoteNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {quote.fullName} - {quote.projectTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
          <Button
            onClick={handleSendResponse}
            disabled={sending || !responseData.subject.trim() || !responseData.message.trim()}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Envoi...' : 'Envoyer la réponse'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de réponse */}
        <div className="lg:col-span-2 space-y-6">
          {previewMode ? (
            /* Mode aperçu */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Aperçu de l'email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="border-b pb-4 mb-4">
                    <p><strong>À :</strong> {quote.email}</p>
                    <p><strong>Sujet :</strong> {responseData.subject}</p>
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900">
                      {responseData.message || generateDefaultMessage()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Mode édition */
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Composer la réponse
                  </CardTitle>
                  <CardDescription>
                    Rédigez votre réponse personnalisée au client
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Sujet de l'email</Label>
                    <Input
                      id="subject"
                      value={responseData.subject}
                      onChange={(e) => setResponseData({...responseData, subject: e.target.value})}
                      placeholder="Sujet de l'email"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedPrice">Prix estimé (€)</Label>
                      <Input
                        id="estimatedPrice"
                        type="number"
                        value={responseData.estimatedPrice}
                        onChange={(e) => setResponseData({...responseData, estimatedPrice: e.target.value})}
                        placeholder="Prix en euros"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedTimeline">Délai estimé</Label>
                      <Input
                        id="estimatedTimeline"
                        value={responseData.estimatedTimeline}
                        onChange={(e) => setResponseData({...responseData, estimatedTimeline: e.target.value})}
                        placeholder="ex: 4-6 semaines"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={responseData.message}
                      onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                      placeholder="Votre message personnalisé..."
                      className="mt-1 min-h-[400px]"
                    />
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setResponseData({...responseData, message: generateDefaultMessage()})}
                      >
                        Générer un message par défaut
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeTerms"
                        checked={responseData.includeTerms}
                        onCheckedChange={(checked) => setResponseData({...responseData, includeTerms: checked as boolean})}
                      />
                      <Label htmlFor="includeTerms">Inclure les conditions générales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeNextSteps"
                        checked={responseData.includeNextSteps}
                        onCheckedChange={(checked) => setResponseData({...responseData, includeNextSteps: checked as boolean})}
                      />
                      <Label htmlFor="includeNextSteps">Inclure les prochaines étapes</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="updateStatus">Nouveau statut après envoi</Label>
                    <Select value={responseData.updateStatus} onValueChange={(value) => setResponseData({...responseData, updateStatus: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUOTED">Devis envoyé</SelectItem>
                        <SelectItem value="REVIEWED">Examiné</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar - Informations de la demande */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Client</Label>
                <p className="text-gray-900 font-medium">{quote.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-gray-900">{quote.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                <p className="text-gray-900">{quote.phone}</p>
              </div>
              {quote.company && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Entreprise</Label>
                  <p className="text-gray-900">{quote.company}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Résumé du projet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Titre</Label>
                <p className="text-gray-900 font-medium">{quote.projectTitle}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <Badge variant="outline">
                  {projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Services</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {quote.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {serviceLabels[service as keyof typeof serviceLabels] || service}
                    </Badge>
                  ))}
                  {quote.services.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{quote.services.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Budget indicatif</Label>
                <p className="text-gray-900">{formatBudget(quote.budget)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Demande reçue</Label>
                <p className="text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Numéro</Label>
                <p className="text-gray-900 font-mono">{quote.quoteNumber}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}