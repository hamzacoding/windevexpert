'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Order {
  id: string
  status: string
  paymentStatus: string
  totalAmount: number
  currency: string
  items: Array<{
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      downloadUrl?: string
    }
  }>
}

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('Session de paiement non trouvée')
      setLoading(false)
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/stripe/verify?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la vérification du paiement')
        }

        setOrder(data.order)
      } catch (error) {
        console.error('Payment verification error:', error)
        setError(error instanceof Error ? error.message : 'Erreur de vérification')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/panier')} className="w-full">
              Retour au panier
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Paiement réussi !</h1>
          <p className="text-lg text-gray-600">
            Merci pour votre achat. Votre commande a été confirmée.
          </p>
        </div>

        {order && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Numéro de commande</span>
                    <span className="font-mono font-medium">{order.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confirmée
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total payé</span>
                    <span className="text-xl font-bold text-green-600">
                      {order.totalAmount.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: order.currency
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits achetés</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {(item.product.price * item.quantity).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: order.currency
                          })}
                        </p>
                        {item.product.downloadUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            asChild
                          >
                            <a href={item.product.downloadUrl} download>
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Prochaines étapes</h2>
                <div className="space-y-3 text-blue-800">
                  <p className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    Vous recevrez un email de confirmation avec les détails de votre commande
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    Les liens de téléchargement sont disponibles dans votre espace client
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    Conservez ce numéro de commande pour toute assistance
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Button asChild className="flex items-center gap-2">
                  <Link href="/dashboard">
                    Aller à mon espace client
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="flex items-center gap-2">
                  <Link href="/auth/signin">
                    Se connecter pour accéder aux produits
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" asChild>
                <Link href="/produits">
                  Continuer mes achats
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}