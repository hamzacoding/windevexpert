'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag, Sparkles, Package, ArrowLeft, CreditCard, MapPin, User, Check, Shield, Truck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { getSessionParams } from '@/lib/utils/session'
import { Cart, CartItem } from '@/types/product'
import { useCart } from '@/contexts/cart-context'
import StripePayment from '@/components/payment/stripe-payment'

type Step = 'cart' | 'payment' | 'confirmation'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [currentStep, setCurrentStep] = useState<Step>('cart')
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''})
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session } = useSession()
  const { refreshCartCount } = useCart()

  // User info for digital products
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: session?.user?.email || '',
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || ''
  })

  useEffect(() => {
    loadCart()
  }, [session])

  const loadCart = async () => {
    setLoading(true)
    try {
      console.log('Session:', session) // Debug log
      const sessionParams = getSessionParams(session?.user?.id)
      console.log('Session params:', sessionParams) // Debug log
      const queryString = new URLSearchParams()
      
      if (sessionParams.userId) {
        queryString.append('userId', sessionParams.userId)
      }
      if (sessionParams.sessionId) {
        queryString.append('sessionId', sessionParams.sessionId)
      }
      
      console.log('Query string:', queryString.toString()) // Debug log
      
      const response = await fetch(`/api/cart?${queryString.toString()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Cart API response:', data) // Debug log
        setCart(data.cart)
      } else {
        console.error('Failed to load cart:', response.statusText)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error)
    } finally {
      setLoading(false)
    }
  }



  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000)
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(productId)
    
    try {
      const sessionParams = getSessionParams(session?.user?.id)
      const response = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
          ...sessionParams
        })
      })

      if (response.ok) {
        await loadCart()
        await refreshCartCount()
        showFeedback('success', 'Quantité mise à jour')
      } else {
        showFeedback('error', 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showFeedback('error', 'Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    setIsUpdating(productId)
    
    try {
      const sessionParams = getSessionParams(session?.user?.id)
      const queryString = new URLSearchParams()
      
      queryString.append('productId', productId)
      if (sessionParams.userId) {
        queryString.append('userId', sessionParams.userId)
      }
      if (sessionParams.sessionId) {
        queryString.append('sessionId', sessionParams.sessionId)
      }
      
      const response = await fetch(`/api/cart/items?${queryString.toString()}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCart()
        await refreshCartCount()
        showFeedback('success', 'Produit retiré du panier')
      } else {
        showFeedback('error', 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showFeedback('error', 'Erreur lors de la suppression')
    } finally {
      setIsUpdating(null)
    }
  }

  const clearCart = async () => {
    setIsProcessing(true)
    
    try {
      const sessionParams = getSessionParams(session?.user?.id)
      const queryString = new URLSearchParams()
      
      if (sessionParams.userId) {
        queryString.append('userId', sessionParams.userId)
      }
      if (sessionParams.sessionId) {
        queryString.append('sessionId', sessionParams.sessionId)
      }
      
      const response = await fetch(`/api/cart/clear?${queryString.toString()}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCart()
        await refreshCartCount()
        try { localStorage.setItem('cart_updated', Date.now().toString()) } catch {}
        showFeedback('success', 'Panier vidé avec succès')
      } else {
        showFeedback('error', 'Erreur lors du vidage du panier')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showFeedback('error', 'Erreur lors du vidage du panier')
    } finally {
      setIsProcessing(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setIsProcessing(true)
    
    try {
      // Simulate coupon application
      await new Promise(resolve => setTimeout(resolve, 1000))
      showFeedback('success', 'Code promo appliqué avec succès!')
    } catch (error) {
      showFeedback('error', 'Code promo invalide')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 'cart') {
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      setCurrentStep('confirmation')
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('cart')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment')
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentStep('confirmation')
      showFeedback('success', 'Paiement effectué avec succès!')
    } catch (error) {
      showFeedback('error', 'Erreur lors du paiement')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    const cc = (() => {
      try {
        const m = document.cookie.match(/(?:^|; )country_code=([^;]+)/)
        if (m && m[1]) return decodeURIComponent(m[1]).slice(0,2).toUpperCase()
      } catch {}
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        if (tz.toLowerCase() === 'africa/algiers') return 'DZ'
        const langs = (navigator.languages || [navigator.language]).filter(Boolean)
        const found = langs.find(l => /-dz$/i.test(l))
        if (found) return 'DZ'
      } catch {}
      return 'FR'
    })()
    const currency = cc === 'DZ' ? 'DZD' : 'EUR'
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Back button */}
            <Link href="/produits" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Retour aux produits</span>
            </Link>
            
            {/* Center - Logo and Steps */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <Image
                  src="/windevexpert-logo.svg"
                  alt="WindevExpert"
                  width={106}
                  height={60}
                  className="h-15 w-auto"
                />
              </Link>
              
              {/* Step Indicator */}
              <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'cart' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'cart' ? 'bg-blue-100 text-blue-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Panier</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'payment' ? 'bg-blue-100 text-blue-600' : currentStep === 'confirmation' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Paiement</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'confirmation' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Confirmation</span>
              </div>
              </div>
            </div>
            
            {/* Right side - Empty spacer for balance */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback.type && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Traitement en cours...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <ShoppingBag className="h-7 w-7 text-blue-600" />
                      Mon Panier
                      {cart?.items && cart.items.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {cart.items.length} produit{cart.items.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </h1>
                    {cart?.items && cart.items.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vider le panier
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {!cart?.items || cart.items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
                      <p className="text-gray-600 mb-6">Découvrez nos produits numériques et services professionnels</p>
                      <Link href="/produits">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105">
                          <Package className="h-5 w-5 mr-2" />
                          Découvrir nos produits
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="group bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 hover:shadow-md">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                {item.product.logo && typeof item.product.logo === 'string' && item.product.logo.trim().length > 0 ? (
                                  <Image
                                    src={item.product.logo.trim()}
                                    alt={item.product.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-blue-600" />
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.product.description}
                              </p>
                              
                              {/* Product Type Badge */}
                              <div className="flex items-center space-x-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.product.type === 'DIGITAL' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.product.type === 'DIGITAL' ? (
                                    <>
                                      <Package className="h-3 w-3 mr-1" />
                                      Produit numérique
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-3 w-3 mr-1" />
                                      Service
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Quantity and Price */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-gray-600">Quantité:</span>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                      disabled={item.quantity <= 1 || isUpdating === item.productId}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all duration-200"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-medium text-gray-900">
                                      {isUpdating === item.productId ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                                      ) : (
                                        item.quantity
                                      )}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                      disabled={isUpdating === item.productId}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all duration-200"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                  {item.quantity > 1 && (
                                    <div className="text-sm text-gray-500">
                                      {formatPrice(item.price)} × {item.quantity}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(item.productId)}
                                disabled={isUpdating === item.productId}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {cart?.items && cart.items.length > 0 && (
              <div className="space-y-6">
                {/* Coupon Code */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Code promo
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Entrez votre code promo"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 transform hover:scale-105"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Appliquer
                    </Button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total TTC</span>
                        <span className="text-blue-600">{formatPrice(cart.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      Paiement 100% sécurisé
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      Accès immédiat après paiement
                    </div>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 transition-all duration-200 transform hover:scale-105"
                  >
                    Procéder au paiement
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'payment' && cart && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="h-7 w-7 text-blue-600" />
                Choisissez votre mode de paiement
              </h2>
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Paiement Local (DZD) */}
              <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Paiement Local</h3>
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {formatPrice(cart.total)}
                    </div>
                    <p className="text-sm text-green-600">Paiement en dinars algériens</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Moyens de paiement disponibles</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Carte bancaire (Chargily/SlickPay)</p>
                        <p>• Virement CCP</p>
                        <p>• Virement bancaire</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        // Redirect to existing payment flow
                        window.location.href = '/formations/payment?cart=' + cart.id
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
                    >
                      Payer en DA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Paiement International (EUR) avec Stripe */}
              <StripePayment
                cart={cart}
                totalEUR={cart.total}
                onSuccess={() => {
                  setCurrentStep('confirmation')
                  showFeedback('success', 'Paiement Stripe effectué avec succès!')
                }}
                onError={(error) => {
                  showFeedback('error', error)
                }}
              />
            </div>

            {/* Order Summary */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Résumé de votre commande</h4>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {item.product.logo && typeof item.product.logo === 'string' && item.product.logo.trim().length > 0 && (
                          <Image
                            src={item.product.logo.trim()}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <div className="text-right">
                      <p className="text-blue-600">{formatPrice(cart.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h2>
              <p className="text-lg text-gray-600 mb-8">
                Merci pour votre achat. Vous recevrez un email de confirmation avec les liens de téléchargement.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-green-800 mb-2">Accès immédiat</h3>
                <p className="text-green-700 text-sm">
                  Vos produits numériques sont maintenant disponibles dans votre espace client.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Accéder à mon espace
                  </Button>
                </Link>
                <Link href="/boutique">
                  <Button variant="outline">
                    Continuer mes achats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
