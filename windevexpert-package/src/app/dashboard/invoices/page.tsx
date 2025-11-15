'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  Eye, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoiceNumber: string
  amount?: number
  totalAmount?: number
  currency: string
  paymentMethod: string
  status: string
  createdAt: string
  dueDate: string
  productName?: string
  formation: {
    title: string
    description: string
  }
  paymentProofs: Array<{
    id: string
    fileName: string
    status: string
    createdAt: string
  }>
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingProof, setUploadingProof] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchInvoices()
    }
  }, [session])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Non payée</Badge>
      case 'PROOF_UPLOADED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Upload className="w-3 h-3 mr-1" />Preuve envoyée</Badge>
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

  const handleFileUpload = async (invoiceId: string, file: File) => {
    setUploadingProof(invoiceId)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('invoiceId', invoiceId)

      const response = await fetch('/api/payment-proofs', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Preuve de paiement téléchargée avec succès!')
        fetchInvoices() // Recharger les factures
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploadingProof(null)
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Factures</h1>
        <p className="text-gray-600">Gérez vos factures et téléchargez vos preuves de paiement</p>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune facture</h3>
          <p className="text-gray-600">Vous n'avez pas encore de factures.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{invoice.productName || invoice.formation?.title}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {getPaymentMethodLabel(invoice.paymentMethod)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Créée le {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {(invoice.totalAmount ?? invoice.amount ?? 0).toLocaleString()} {invoice.currency === 'DZD' ? 'DA' : '€'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Bouton pour télécharger une preuve de paiement */}
                    {(invoice.status === 'UNPAID' || invoice.status === 'PROOF_UPLOADED') && (
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(invoice.id, file)
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingProof === invoice.id}
                        />
                        <Button
                          variant="outline"
                          disabled={uploadingProof === invoice.id}
                          className="flex items-center gap-2"
                        >
                          {uploadingProof === invoice.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {invoice.paymentProofs.length > 0 ? 'Remplacer preuve' : 'Télécharger preuve'}
                        </Button>
                      </div>
                    )}

                    {/* Affichage des preuves téléchargées */}
                    {invoice.paymentProofs.length > 0 && (
                      <div className="text-sm">
                        <p className="text-green-600 font-medium">
                          Preuve téléchargée: {invoice.paymentProofs[0].fileName}
                        </p>
                        <p className="text-gray-500">
                          Status: {invoice.paymentProofs[0].status === 'PENDING' ? 'En attente de validation' : 
                                  invoice.paymentProofs[0].status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions pour les paiements en attente */}
              {invoice.status === 'UNPAID' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Action requise</h4>
                      <p className="text-sm text-yellow-700">
                        Effectuez le paiement selon la méthode choisie et téléchargez votre preuve de paiement.
                        Mentionnez le numéro de facture <span className="font-mono font-bold">{invoice.invoiceNumber}</span> lors du virement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}