'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Loader2, Globe, Euro } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<any> | null = null

interface StripePaymentProps {
  cart: {
    id: string
    items: Array<{
      id: string
      quantity: number
      product: {
        id: string
        name: string
        price: number
        image?: string
      }
    }>
  }
  totalEUR: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function StripePayment({ cart, totalEUR, onSuccess, onError }: StripePaymentProps) {
  const [loading, setLoading] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      setSettingsLoading(true)
      const response = await fetch('/api/payment-settings')
      if (response.ok) {
        const settings = await response.json()
        setPaymentSettings(settings)
        
        // Initialize Stripe if enabled and public key is available
        if (settings.stripeEnabled && settings.stripePublicKey) {
          stripePromise = loadStripe(settings.stripePublicKey)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de paiement:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Show loading while fetching settings
  if (settingsLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-purple-800">Chargement des paramètres de paiement...</p>
        </CardContent>
      </Card>
    )
  }

  // Check if Stripe is configured
  if (!paymentSettings?.stripeEnabled || !paymentSettings?.stripePublicKey) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-yellow-800">
            <Globe className="w-6 h-6" />
            Paiement International
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">Paiement Stripe non disponible</p>
            <p className="text-yellow-700 text-sm mt-1">
              {!paymentSettings?.stripeEnabled 
                ? "Les paiements Stripe sont désactivés dans les paramètres d'administration."
                : "Les clés Stripe doivent être configurées dans les paramètres d'administration."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleStripePayment = async () => {
    if (!cart || cart.items.length === 0) {
      onError?.('Panier vide')
      return
    }

    setLoading(true)

    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe non disponible')
      }

      // Create checkout session
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          userId: session?.user?.id,
          sessionId: !session ? localStorage.getItem('sessionId') : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement')
      }

      // Redirect to Stripe Checkout using the URL from the session
      if (data.url) {
        // Use window.location.href instead of deprecated redirectToCheckout
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout non disponible')
      }

      onSuccess?.()

    } catch (error) {
      console.error('Stripe payment error:', error)
      onError?.(error instanceof Error ? error.message : 'Erreur de paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
          <Globe className="w-6 h-6" />
          Paiement International
        </CardTitle>
        <div className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-1">
          <Euro className="w-8 h-8" />
          {totalEUR.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-blue-600">Paiement sécurisé par Stripe</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Moyens de paiement acceptés
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Cartes Visa, Mastercard, American Express</p>
            <p>• Paiements 3D Secure</p>
            <p>• Facturation et livraison en Europe</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="text-sm text-green-700">
              <p className="font-medium">Paiement sécurisé</p>
              <p>Vos données sont protégées par le chiffrement SSL et les standards PCI DSS</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStripePayment}
          disabled={loading || !cart || cart.items.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirection vers Stripe...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer avec Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          En cliquant sur "Payer avec Stripe", vous serez redirigé vers la page de paiement sécurisée de Stripe
        </p>
      </CardContent>
    </Card>
  )
}