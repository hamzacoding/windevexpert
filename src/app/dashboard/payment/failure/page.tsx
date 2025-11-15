'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowRight, Home, RefreshCw, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  currency: string
  productId?: string
  productName?: string
}

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  const invoiceId = searchParams.get('invoice')
  const formationParam = searchParams.get('formation')

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails()
    } else {
      setLoading(false)
    }
  }, [invoiceId])

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const targetFormationId = formationParam || invoice?.productId

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement échoué
          </h1>
          <p className="text-gray-600">
            Votre paiement n'a pas pu être traité.
          </p>
        </div>

        {invoice && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Détails de la tentative</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Facture :</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Formation :</span>
                <span className="font-medium">{invoice.productName ?? 'Formation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="font-medium">
                  {invoice.totalAmount.toLocaleString()} {invoice.currency === 'DZD' ? 'DA' : '€'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Que faire maintenant ?</h4>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• Vérifiez que votre carte a suffisamment de fonds</li>
              <li>• Assurez-vous que les informations de votre carte sont correctes</li>
              <li>• Contactez votre banque si le problème persiste</li>
              <li>• Essayez un autre mode de paiement (CCP, virement bancaire)</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {targetFormationId && (
              <Link href={`/formations/${targetFormationId}`}>
                <Button className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer le paiement
                </Button>
              </Link>
            )}
            
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Aucun montant n'a été débité de votre compte. Vous pouvez réessayer le paiement à tout moment.
          </p>
        </div>
      </Card>
    </div>
  )
}