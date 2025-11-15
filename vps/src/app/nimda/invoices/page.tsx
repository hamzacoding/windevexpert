'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  User,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  createdAt: string
  dueDate: string
  user: {
    name: string
    email: string
  }
  formation: {
    title: string
    description: string
  }
  paymentProofs: Array<{
    id: string
    fileName: string
    originalName: string
    status: string
    createdAt: string
    filePath: string
  }>
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingProof, setProcessingProof] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [filter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/admin/invoices?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      } else {
        toast.error('Erreur lors du chargement des factures')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des factures')
    } finally {
      setLoading(false)
    }
  }

  const handleProofAction = async (proofId: string, action: 'approve' | 'reject') => {
    setProcessingProof(proofId)
    
    try {
      const response = await fetch(`/api/admin/payment-proofs/${proofId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(action === 'approve' ? 'Preuve approuvée!' : 'Preuve rejetée!')
        fetchInvoices() // Recharger les factures
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du traitement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement')
    } finally {
      setProcessingProof(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
      case 'PROOF_UPLOADED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />À valider</Badge>
      case 'PAID':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payée</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Annulée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CCP':
        return 'Virement CCP'
      case 'BANK_TRANSFER':
        return 'Virement bancaire'
      case 'CIB':
        return 'Carte CIB'
      case 'STRIPE':
        return 'Stripe'
      default:
        return method
    }
  }

  const getProofStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approuvée</Badge>
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejetée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.formation.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Factures</h1>
        <p className="text-gray-600">Gérez les factures et validez les preuves de paiement</p>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par numéro, client, email ou formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les factures</option>
            <option value="PENDING">En attente</option>
            <option value="PROOF_UPLOADED">À valider</option>
            <option value="PAID">Payées</option>
            <option value="CANCELLED">Annulées</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune facture trouvée</h3>
          <p className="text-gray-600">Aucune facture ne correspond à vos critères de recherche.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{invoice.user.name} ({invoice.user.email})</span>
                    </div>
                    <p className="text-gray-600">{invoice.formation.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {getPaymentMethodLabel(invoice.paymentMethod)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Créée le {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {/* Preuves de paiement */}
                  {invoice.paymentProofs.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Preuves de paiement</h4>
                      {invoice.paymentProofs.map((proof) => (
                        <div key={proof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{proof.originalName}</p>
                            <p className="text-xs text-gray-500">
                              Téléchargée le {new Date(proof.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            <div className="mt-1">
                              {getProofStatusBadge(proof.status)}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/api/admin/payment-proofs/${proof.id}/download`, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {proof.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleProofAction(proof.id, 'approve')}
                                  disabled={processingProof === proof.id}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  {processingProof === proof.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleProofAction(proof.id, 'reject')}
                                  disabled={processingProof === proof.id}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {invoice.amount.toLocaleString()} {invoice.currency === 'DZD' ? 'DA' : '€'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}