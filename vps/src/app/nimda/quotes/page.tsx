'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Mail,
  Phone,
  Building,
  Quote,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  projectType: string
  projectTitle: string
  projectDescription: string
  services: string[]
  budget: string
  timeline: string
  status: 'PENDING' | 'REVIEWED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  estimatedPrice?: number
  quoteSentAt?: string
  createdAt: string
  updatedAt: string
}

interface QuotesResponse {
  quotes: QuoteRequest[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: Record<string, number>
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<QuotesResponse['pagination'] | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const { data: session, status } = useSession()
  const router = useRouter()

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

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
        search: searchTerm
      })

      const response = await fetch(`/api/admin/quotes?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des demandes de devis')
      }
      
      const data: QuotesResponse = await response.json()
      setQuotes(data.quotes)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      toast.error('Erreur lors du chargement des demandes de devis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchQuotes()
    }
  }, [session, currentPage, statusFilter, searchTerm])

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    setActionLoading(quoteId)
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut')
      }

      toast.success('Statut mis à jour avec succès')
      fetchQuotes() // Recharger la liste
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de devis ?')) {
      return
    }

    setActionLoading(quoteId)
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Demande de devis supprimée avec succès')
      fetchQuotes() // Recharger la liste
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Quote className="h-8 w-8 text-blue-600" />
            Demandes de devis
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez et répondez aux demandes de devis clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchQuotes}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(stats).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
              <Quote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.PENDING || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Devis envoyés</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.QUOTED || 0}
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.ACCEPTED || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email, entreprise, projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="REVIEWED">Examiné</SelectItem>
                <SelectItem value="QUOTED">Devis envoyé</SelectItem>
                <SelectItem value="ACCEPTED">Accepté</SelectItem>
                <SelectItem value="REJECTED">Refusé</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de devis</CardTitle>
          <CardDescription>
            {pagination && `${pagination.totalCount} demande(s) au total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Chargement des demandes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8">
              <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande de devis
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune demande ne correspond à vos critères de recherche.'
                  : 'Aucune demande de devis n\'a encore été soumise.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Projet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quote.fullName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {quote.email}
                          </div>
                          {quote.company && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {quote.company}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quote.projectTitle}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {quote.projectDescription}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            #{quote.quoteNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatBudget(quote.budget)}</div>
                          <div className="text-sm text-gray-500">{formatTimeline(quote.timeline)}</div>
                          {quote.estimatedPrice && (
                            <div className="text-sm font-medium text-green-600">
                              Devis: {quote.estimatedPrice.toLocaleString('fr-FR')} €
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(quote.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</div>
                          <div className="text-gray-500">
                            {new Date(quote.createdAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === quote.id}
                            >
                              {actionLoading === quote.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/nimda/quotes/${quote.id}`)
                              }}
                              className="cursor-pointer"
                              disabled={actionLoading === quote.id}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/nimda/quotes/${quote.id}/respond`)
                              }}
                              className="cursor-pointer"
                              disabled={actionLoading === quote.id}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Répondre
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const newStatus = quote.status === 'PENDING' ? 'REVIEWED' : 'PENDING'
                                handleStatusChange(quote.id, newStatus)
                              }}
                              className="cursor-pointer"
                              disabled={actionLoading === quote.id}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {quote.status === 'PENDING' ? 'Marquer comme examiné' : 'Marquer comme en attente'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete(quote.id)
                              }}
                              className="text-red-600 cursor-pointer focus:text-red-600"
                              disabled={actionLoading === quote.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}