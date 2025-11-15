'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, CreditCard } from 'lucide-react'

export default function PaymentSimulationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const sessionId = searchParams.get('session_id')

  const simulatePaymentSuccess = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to success page
    router.push(`/payment/success?session_id=${sessionId}&simulated=true`)
  }

  const simulatePaymentFailure = () => {
    router.push('/panier?payment_error=simulation_cancelled')
  }

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Session de paiement invalide.</p>
            <Button 
              onClick={() => router.push('/panier')} 
              className="mt-4"
            >
              Retour au panier
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Simulation de Paiement Stripe</CardTitle>
          <CardDescription>
            Mode test avec clés factices - Choisissez le résultat du paiement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Mode Simulation :</strong> Vous utilisez des clés Stripe de test factices. 
              Cette page simule le processus de paiement pour les tests de développement.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={simulatePaymentSuccess}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isProcessing ? 'Traitement...' : 'Simuler Paiement Réussi'}
            </Button>

            <Button
              onClick={simulatePaymentFailure}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Simuler Paiement Échoué
            </Button>
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={() => router.push('/panier')}
              variant="ghost"
              className="text-gray-500"
            >
              Retour au panier
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Session ID: {sessionId}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}