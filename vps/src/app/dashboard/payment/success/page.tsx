'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Home, BookOpen } from 'lucide-react'
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

export default function PaymentSuccessPage() {
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

  // Redirection rapide si le paramètre formation est présent
  useEffect(() => {
    const targetFormation = formationParam || invoice?.productId
    if (targetFormation) {
      const timer = setTimeout(() => {
        router.push(`/formations/${targetFormation}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [formationParam, invoice, router])

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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès.
          </p>
        </div>

        {invoice && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Détails de votre achat</h3>
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
            <p className="text-sm text-gray-500 mt-4">Redirection automatique vers la formation dans quelques secondes...</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-600">
            Vous avez maintenant accès à votre formation. Vous pouvez commencer à apprendre dès maintenant !
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {targetFormationId && (
              <Link href={`/formations/${targetFormationId}`}>
                <Button className="w-full sm:w-auto">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Accéder à la formation
                </Button>
              </Link>
            )}
            
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
            Un email de confirmation vous a été envoyé avec tous les détails de votre achat.
          </p>
        </div>
      </Card>
    </div>
  )
}