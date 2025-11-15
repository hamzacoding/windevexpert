'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Building2, Smartphone, Globe, MapPin, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  formation: {
    id: string
    title: string
    priceEuro: number
    priceDA: number
    lien_paiement?: string | null
  } | null
}

export function PaymentModal({ isOpen, onClose, formation }: PaymentModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      fetchPaymentSettings()
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setSelectedMethod(null)
        setInvoice(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings')
      if (response.ok) {
        const settings = await response.json()
        setPaymentSettings(settings)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
    }
  }

  const handlePaymentMethod = async (currency: 'DZD' | 'EUR', method: string) => {
    if (!formation || !session) {
      toast.error('Vous devez être connecté pour effectuer un paiement')
      return
    }

    setLoading(true)
    setSelectedMethod(method)

    try {
      // Paiement en ligne via CIB/EDAHABIA via Chargily
      if (method === 'CIB') {
        try {
          const res = await fetch('/api/payments/chargily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formationId: formation.id,
              currency: 'DZD',
              mode: 'EDAHABIA',
            }),
          })
          if (res.ok) {
            const data = await res.json()
            const url = data?.chargily?.checkout_url
            if (url) {
              toast.success('Redirection vers le paiement sécurisé...')
              window.location.href = url
              onClose()
              setLoading(false)
              return
            }
          }
          // Fallback vers l'ancien lien si disponible
          if (formation.lien_paiement) {
            toast.info("API Chargily indisponible, utilisation du lien enregistré.")
            window.location.href = formation.lien_paiement
            onClose()
          } else {
            const err = await res.json().catch(() => ({}))
            toast.error(err?.error || 'Erreur lors de la création du paiement Chargily')
          }
        } catch (e) {
          if (formation.lien_paiement) {
            toast.info("API Chargily indisponible, utilisation du lien enregistré.")
            window.location.href = formation.lien_paiement
            onClose()
          } else {
            toast.error('Erreur réseau vers Chargily')
          }
        }
        setLoading(false)
        return
      }

      // Pour Stripe, rediriger vers Stripe
      if (method === 'STRIPE') {
        // TODO: Intégrer Stripe
        toast.info('Redirection vers Stripe...')
        setLoading(false)
        return
      }

      // Pour les paiements manuels (CCP, BANK_TRANSFER), créer une facture
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formationId: formation.id,
          paymentMethod: method,
          currency,
          amount: currency === 'DZD' ? formation.priceDA : formation.priceEuro
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
        toast.success('Facture créée avec succès!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création de la facture')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement du paiement')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers!')
  }

  if (!isVisible || !formation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay avec animation */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal avec animation */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choisir votre mode de paiement</h2>
            <p className="text-gray-600 mt-1">{formation.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {invoice ? (
            // Affichage des détails de la facture
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Facture créée avec succès!</h3>
                <p className="text-gray-600">Numéro de facture: <span className="font-mono font-bold">{invoice.invoiceNumber}</span></p>
              </div>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h4 className="font-bold text-lg mb-4 text-blue-800">Détails du paiement</h4>
                  <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produit/formation:</span>
                    <span className="font-semibold">{invoice.productName ?? formation.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-bold text-lg">
                      {(invoice.amount ?? invoice.totalAmount ?? (invoice.currency === 'DZD' ? formation.priceDA : formation.priceEuro)).toLocaleString()} {invoice.currency === 'DZD' ? 'DA' : '€'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-semibold">
                      {invoice.paymentMethod === 'CCP' ? 'Virement CCP' : 'Virement bancaire'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Informations de paiement */}
              {invoice.paymentMethod === 'CCP' && paymentSettings?.ccpAccount && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <h4 className="font-bold text-lg mb-4 text-green-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Informations CCP
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Numéro de compte CCP</p>
                        <p className="font-mono font-bold text-lg">{paymentSettings.ccpAccount}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(paymentSettings.ccpAccount)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {invoice.paymentMethod === 'BANK_TRANSFER' && paymentSettings?.bankAccount && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <h4 className="font-bold text-lg mb-4 text-green-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Informations bancaires
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Numéro de compte bancaire</p>
                        <p className="font-mono font-bold text-lg">{paymentSettings.bankAccount}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(paymentSettings.bankAccount)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-800 mb-2">Instructions importantes</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Effectuez le virement avec le montant exact</li>
                      <li>• Mentionnez le numéro de facture: <span className="font-mono font-bold">{invoice.invoiceNumber}</span></li>
                      <li>• Conservez votre reçu de paiement</li>
                      <li>• Téléchargez la preuve de paiement dans votre espace client</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => window.location.href = '/dashboard/invoices'}
                  className="flex-1"
                >
                  Voir mes factures
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            // Affichage des options de paiement
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
          {/* Prix en Dinars Algériens - À GAUCHE */}
          <Card className="p-6 border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-green-800">Prix Algérie</h3>
              </div>
              <div className="text-3xl font-bold text-green-700 mb-2">
                {formation.priceDA.toLocaleString()} DA
              </div>
              <p className="text-green-600 text-sm">Paiement en dinars algériens</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 mb-3">Modes de paiement disponibles :</h4>

              {/* Paiement en ligne via CIB/EDAHABIA */}
              <Button
                onClick={() => handlePaymentMethod('DZD', 'CIB')}
                disabled={loading && selectedMethod === 'CIB'}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {loading && selectedMethod === 'CIB' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                <span>Paiement en ligne via CIB - EDAHABIA</span>
              </Button
              >
              {/* Paiement par guichet (CCP) */}
              <Button
                onClick={() => handlePaymentMethod('DZD', 'CCP')}
                disabled={loading && selectedMethod === 'CCP'}
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {loading && selectedMethod === 'CCP' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
                <span>Paiement par CCP Guichet</span>
              </Button>
            </div>
          </Card>

              {/* Prix International - À DROITE */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-3">
                    <Globe className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-blue-800">Prix International</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {formation.priceEuro.toLocaleString()}€
                  </div>
                  <p className="text-blue-600 text-sm">Paiement en euros</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Modes de paiement disponibles :</h4>
                  
                  {/* Stripe */}
                  {paymentSettings?.stripeEnabled && (
                    <Button
                      onClick={() => handlePaymentMethod('EUR', 'STRIPE')}
                      disabled={loading && selectedMethod === 'STRIPE'}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      {loading && selectedMethod === 'STRIPE' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      <span>Stripe (CB/Visa/Mastercard)</span>
                    </Button>
                  )}

                  {/* Virement bancaire EUR */}
                  <Button
                    onClick={() => handlePaymentMethod('EUR', 'BANK_TRANSFER')}
                    disabled={loading && selectedMethod === 'BANK_TRANSFER'}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    {loading && selectedMethod === 'BANK_TRANSFER' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                    <span>Virement bancaire</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {!invoice && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                🔒 Tous les paiements sont sécurisés et cryptés. Vos données bancaires sont protégées.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}