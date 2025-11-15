'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Eye, 
  EyeOff, 
  CreditCard, 
  Building2, 
  Banknote,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PaymentSettings {
  id?: string
  // Comptes algériens
  ccpAccount?: string
  ccpAccountName?: string
  bankAccount?: string
  bankAccountName?: string
  bankName?: string
  
  // Paramètres Stripe
  stripeEnabled: boolean
  stripePublicKey?: string
  stripeSecretKey?: string
  stripeTestMode: boolean
  stripeWebhookSecret?: string
  
  // Paramètres Chargily
  chargilyEnabled?: boolean
  chargilyApiKey?: string
  chargilySecretKey?: string
  chargilyTestMode?: boolean
  
  isActive: boolean
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    ccpAccount: '',
    ccpAccountName: '',
    bankAccount: '',
    bankAccountName: '',
    bankName: '',
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeTestMode: true,
    stripeWebhookSecret: '',
    // Chargily
    chargilyEnabled: false,
    chargilyApiKey: '',
    chargilySecretKey: '',
    chargilyTestMode: true,
    isActive: true
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showStripePublicKey, setShowStripePublicKey] = useState(false)
  const [showStripeSecretKey, setShowStripeSecretKey] = useState(false)
  const [showStripeWebhookSecret, setShowStripeWebhookSecret] = useState(false)
  const [showChargilyApiKey, setShowChargilyApiKey] = useState(false)
  const [showChargilySecretKey, setShowChargilySecretKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payment-settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setSettings(data)
        }
      } else {
        console.error('Erreur HTTP lors du chargement:', response.status, response.statusText)
        let errorMessage = 'Erreur lors du chargement des paramètres'
        
        try {
          const errorData = await response.json()
          console.error('Erreur API lors du chargement:', errorData)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Erreur de parsing JSON lors du chargement:', parseError)
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        
        setMessage({ type: 'error', text: errorMessage })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      console.log('Données à sauvegarder:', settings)

      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Sauvegarde réussie:', result)
        setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' })
      } else {
        console.error('Erreur HTTP:', response.status, response.statusText)
        let errorMessage = 'Erreur lors de la sauvegarde'
        
        try {
          const errorData = await response.json()
          console.error('Erreur API:', errorData)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError)
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde des paramètres' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof PaymentSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de Paiement</h1>
          <p className="text-gray-600 mt-1">
            Configuration des méthodes de paiement pour l'Algérie
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Message de statut */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs pour organiser les paramètres */}
      <Tabs defaultValue="traditional" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traditional" className="flex items-center">
            <Banknote className="h-4 w-4 mr-2" />
            Paiements Traditionnels
          </TabsTrigger>
          <TabsTrigger value="chargily" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Paiement Chargily
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Paiement Stripe
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Paramètres Généraux
          </TabsTrigger>
        </TabsList>

        {/* Paiements traditionnels (CCP + Banque) */}
        <TabsContent value="traditional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compte CCP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Compte CCP
                </CardTitle>
                <CardDescription>
                  Paramètres du compte Chèques Postaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ccpAccount">Numéro de compte CCP</Label>
                  <Input
                    id="ccpAccount"
                    value={settings.ccpAccount || ''}
                    onChange={(e) => handleInputChange('ccpAccount', e.target.value)}
                    placeholder="Ex: 123456789 Clé: 12"
                  />
                </div>
                <div>
                  <Label htmlFor="ccpAccountName">Nom du titulaire</Label>
                  <Input
                    id="ccpAccountName"
                    value={settings.ccpAccountName || ''}
                    onChange={(e) => handleInputChange('ccpAccountName', e.target.value)}
                    placeholder="Nom complet du titulaire du compte"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Compte Bancaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-600" />
                  Compte Bancaire
                </CardTitle>
                <CardDescription>
                  Paramètres du compte bancaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input
                    id="bankName"
                    value={settings.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Ex: BNA, CPA, BADR..."
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Numéro de compte</Label>
                  <Input
                    id="bankAccount"
                    value={settings.bankAccount || ''}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    placeholder="Numéro de compte bancaire"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountName">Nom du titulaire</Label>
                  <Input
                    id="bankAccountName"
                    value={settings.bankAccountName || ''}
                    onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                    placeholder="Nom complet du titulaire du compte"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Paramètres SlickPay */}
        <TabsContent value="slickpay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Paramètres SlickPay
              </CardTitle>
              <CardDescription>
                Configuration pour les paiements par carte bancaire via SlickPay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="slickPayEnabled"
                    checked={settings.slickPayEnabled}
                    onCheckedChange={(checked) => handleInputChange('slickPayEnabled', checked)}
                  />
                  <div>
                    <Label htmlFor="slickPayEnabled" className="text-sm font-medium">
                      Activer les paiements SlickPay
                    </Label>
                    <p className="text-xs text-gray-500">
                      Permettre les paiements par carte bancaire via SlickPay
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  settings.slickPayEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.slickPayEnabled ? 'Activé' : 'Désactivé'}
                </div>
              </div>

              {settings.slickPayEnabled && (
                <>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="slickPayTestMode"
                        checked={settings.slickPayTestMode}
                        onCheckedChange={(checked) => handleInputChange('slickPayTestMode', checked)}
                      />
                      <div>
                        <Label htmlFor="slickPayTestMode" className="text-sm font-medium">
                          Mode test
                        </Label>
                        <p className="text-xs text-gray-500">
                          Utiliser l'environnement de test SlickPay
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      settings.slickPayTestMode 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {settings.slickPayTestMode ? 'Test' : 'Production'}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slickPayPublicKey">Clé publique SlickPay</Label>
                    <div className="relative">
                      <Input
                        id="slickPayPublicKey"
                        type={showPublicKey ? 'text' : 'password'}
                        value={settings.slickPayPublicKey || ''}
                        onChange={(e) => handleInputChange('slickPayPublicKey', e.target.value)}
                        placeholder="Votre clé publique SlickPay"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPublicKey(!showPublicKey)}
                      >
                        {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slickPaySecretKey">Clé secrète SlickPay</Label>
                    <div className="relative">
                      <Input
                        id="slickPaySecretKey"
                        type={showSecretKey ? 'text' : 'password'}
                        value={settings.slickPaySecretKey || ''}
                        onChange={(e) => handleInputChange('slickPaySecretKey', e.target.value)}
                        placeholder="Votre clé secrète SlickPay"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slickPayWebhookUrl">URL de webhook</Label>
                    <Input
                      id="slickPayWebhookUrl"
                      value={settings.slickPayWebhookUrl || ''}
                      onChange={(e) => handleInputChange('slickPayWebhookUrl', e.target.value)}
                      placeholder="https://votre-domaine.com/api/webhooks/slickpay"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL pour recevoir les notifications de paiement de SlickPay
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>URLs SlickPay :</strong><br />
                      • Mode test : https://api.slick-pay.com/sandbox<br />
                      • Mode production : https://api.slick-pay.com/v1
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiement Chargily */}
        <TabsContent value="chargily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Configuration Chargily
              </CardTitle>
              <CardDescription>
                Paramètres pour les paiements par carte CIB/EDAHABIA via Chargily
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="chargilyEnabled"
                    checked={!!settings.chargilyEnabled}
                    onCheckedChange={(checked) => handleInputChange('chargilyEnabled', checked)}
                  />
                  <div>
                    <Label htmlFor="chargilyEnabled" className="text-sm font-medium">
                      Activer Chargily
                    </Label>
                    <p className="text-xs text-gray-500">
                      Autoriser les paiements locaux via CIB/EDAHABIA
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  settings.chargilyEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.chargilyEnabled ? 'Activé' : 'Désactivé'}
                </div>
              </div>

              {settings.chargilyEnabled && (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="chargilyTestMode"
                        checked={!!settings.chargilyTestMode}
                        onCheckedChange={(checked) => handleInputChange('chargilyTestMode', checked)}
                      />
                      <div>
                        <Label htmlFor="chargilyTestMode" className="text-sm font-medium">
                          Mode test
                        </Label>
                        <p className="text-xs text-gray-500">
                          Utiliser l'environnement de test Chargily
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      settings.chargilyTestMode 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {settings.chargilyTestMode ? 'Test' : 'Production'}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="chargilyApiKey">API Key Chargily</Label>
                    <div className="relative">
                      <Input
                        id="chargilyApiKey"
                        type={showChargilyApiKey ? 'text' : 'password'}
                        value={settings.chargilyApiKey || ''}
                        onChange={(e) => handleInputChange('chargilyApiKey', e.target.value)}
                        placeholder="CHARGILY_API_KEY"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowChargilyApiKey(!showChargilyApiKey)}
                      >
                        {showChargilyApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="chargilySecretKey">Secret Key Chargily</Label>
                    <div className="relative">
                      <Input
                        id="chargilySecretKey"
                        type={showChargilySecretKey ? 'text' : 'password'}
                        value={settings.chargilySecretKey || ''}
                        onChange={(e) => handleInputChange('chargilySecretKey', e.target.value)}
                        placeholder="CHARGILY_SECRET_KEY"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowChargilySecretKey(!showChargilySecretKey)}
                      >
                        {showChargilySecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Les clés sont stockées côté serveur dans `.env.local` et affichées masquées.
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Endpoints Chargily :</strong><br />
                      • Test : https://pay.chargily.com/test/api<br />
                      • Production : https://pay.chargily.com/api<br />
                      Configurez aussi le webhook dans votre tableau de bord Chargily.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiement Stripe */}
        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Configuration Stripe
              </CardTitle>
              <CardDescription>
                Paramètres pour les paiements internationaux via Stripe (EUR)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="stripeEnabled"
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) => handleInputChange('stripeEnabled', checked)}
                  />
                  <div>
                    <Label htmlFor="stripeEnabled" className="text-sm font-medium">
                      Activer Stripe
                    </Label>
                    <p className="text-xs text-gray-500">
                      Permettre les paiements en EUR via Stripe
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  settings.stripeEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.stripeEnabled ? 'Activé' : 'Désactivé'}
                </div>
              </div>

              {settings.stripeEnabled && (
                <>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="stripeTestMode"
                        checked={settings.stripeTestMode}
                        onCheckedChange={(checked) => handleInputChange('stripeTestMode', checked)}
                      />
                      <div>
                        <Label htmlFor="stripeTestMode" className="text-sm font-medium">
                          Mode test
                        </Label>
                        <p className="text-xs text-gray-500">
                          Utiliser l'environnement de test Stripe
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      settings.stripeTestMode 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {settings.stripeTestMode ? 'Test' : 'Production'}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stripePublicKey">Clé publique Stripe</Label>
                    <div className="relative">
                      <Input
                        id="stripePublicKey"
                        type={showStripePublicKey ? 'text' : 'password'}
                        value={settings.stripePublicKey || ''}
                        onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                        placeholder="pk_test_... ou pk_live_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowStripePublicKey(!showStripePublicKey)}
                      >
                        {showStripePublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stripeSecretKey">Clé secrète Stripe</Label>
                    <div className="relative">
                      <Input
                        id="stripeSecretKey"
                        type={showStripeSecretKey ? 'text' : 'password'}
                        value={settings.stripeSecretKey || ''}
                        onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                        placeholder="sk_test_... ou sk_live_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowStripeSecretKey(!showStripeSecretKey)}
                      >
                        {showStripeSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stripeWebhookSecret">Secret de webhook Stripe</Label>
                    <div className="relative">
                      <Input
                        id="stripeWebhookSecret"
                        type={showStripeWebhookSecret ? 'text' : 'password'}
                        value={settings.stripeWebhookSecret || ''}
                        onChange={(e) => handleInputChange('stripeWebhookSecret', e.target.value)}
                        placeholder="whsec_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowStripeWebhookSecret(!showStripeWebhookSecret)}
                      >
                        {showStripeWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Secret pour vérifier les webhooks Stripe
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Configuration Stripe :</strong><br />
                      • URL webhook : https://votre-domaine.com/api/webhooks/stripe<br />
                      • Événements : payment_intent.succeeded, payment_intent.payment_failed<br />
                      • Devise supportée : EUR (Euro)
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-gray-600" />
                Paramètres Généraux
              </CardTitle>
              <CardDescription>
                Configuration générale du système de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={settings.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      Système de paiement actif
                    </Label>
                    <p className="text-xs text-gray-500">
                      Activer ou désactiver tous les paiements sur la plateforme
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  settings.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {settings.isActive ? 'Actif' : 'Inactif'}
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Lorsque le système est désactivé, les clients ne pourront pas effectuer de nouveaux paiements.
                  Les paiements en cours ne seront pas affectés.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}