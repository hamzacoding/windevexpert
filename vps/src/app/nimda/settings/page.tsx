'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Mail, 
  Save, 
  TestTube, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Info,
  Code,
  Globe
} from 'lucide-react'

interface SMTPSettings {
  id?: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
  isActive: boolean
  isDefault: boolean
}

interface AppSettings {
  id?: string
  tinymceApiKey?: string
  openaiApiKey?: string
  geminiApiKey?: string
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
}

export default function AdminSettings() {
  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    isActive: true,
    isDefault: true
  })

  const [appSettings, setAppSettings] = useState<AppSettings>({
    tinymceApiKey: '',
    openaiApiKey: '',
    geminiApiKey: '',
    siteName: '',
    siteDescription: '',
    maintenanceMode: false
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingApp, setSavingApp] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [appMessage, setAppMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [hasExistingPassword, setHasExistingPassword] = useState(false)

  useEffect(() => {
    fetchSMTPSettings()
    fetchAppSettings()
  }, [])

  const fetchSMTPSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/smtp-settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings && data.settings.length > 0) {
          // Prendre les paramètres par défaut ou le premier élément
          const defaultSettings = data.settings.find((s: any) => s.isDefault) || data.settings[0]
          setSMTPSettings(prevSettings => ({
            ...prevSettings,
            ...defaultSettings,
            password: '' // Ne pas afficher le mot de passe, toujours garder une chaîne vide
          }))
          // Indiquer si un mot de passe existe
          setHasExistingPassword(defaultSettings.hasPassword || false)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres SMTP:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' })
    } finally {
      setLoading(false)
    }
  }

  const fetchAppSettings = async () => {
    try {
      const response = await fetch('/api/admin/app-settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setAppSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres de l\'application:', error)
      setAppMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres de l\'application' })
    }
  }

  const handleAppSave = async () => {
    try {
      setSavingApp(true)
      setAppMessage(null)

      const response = await fetch('/api/admin/app-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appSettings)
      })

      const data = await response.json()

      if (response.ok) {
        setAppSettings(data.settings)
        setAppMessage({ type: 'success', text: 'Paramètres de l\'application sauvegardés avec succès' })
      } else {
        setAppMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setAppMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' })
    } finally {
      setSavingApp(false)
    }
  }

  const handleAppInputChange = (field: keyof AppSettings, value: any) => {
    setAppSettings(prev => ({
      ...prev,
      [field]: value ?? (typeof prev[field] === 'string' ? '' : value)
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const method = smtpSettings.id ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/smtp-settings', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smtpSettings)
      })

      const data = await response.json()

      if (response.ok) {
        // Préserver le mot de passe dans l'état local car l'API ne le retourne pas
        setSMTPSettings(prev => ({
          ...prev,
          ...data.settings,
          password: prev.password // Garder le mot de passe actuel
        }))
        setMessage({ type: 'success', text: 'Paramètres SMTP sauvegardés avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Veuillez saisir une adresse email pour le test' })
      return
    }

    try {
      setTesting(true)
      setMessage(null)

      const response = await fetch('/api/admin/smtp-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          testEmail,
          smtpSettings: {
            host: smtpSettings.host,
            port: smtpSettings.port,
            secure: smtpSettings.secure,
            username: smtpSettings.username,
            password: smtpSettings.password,
            fromEmail: smtpSettings.fromEmail,
            fromName: smtpSettings.fromName
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email de test envoyé avec succès !' })
      } else {
        let errorText = data.error || 'Erreur lors du test'
        
        // Ajouter les suggestions si disponibles
        if (data.suggestions && data.suggestions.length > 0) {
          errorText += '\n\nSuggestions :\n' + data.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
        }
        
        setMessage({ type: 'error', text: errorText })
      }
    } catch (error) {
      console.error('Erreur lors du test:', error)
      setMessage({ type: 'error', text: 'Erreur lors du test de connexion' })
    } finally {
      setTesting(false)
    }
  }

  const handleInputChange = (field: keyof SMTPSettings, value: any) => {
    setSMTPSettings(prev => ({
      ...prev,
      [field]: value ?? (typeof prev[field] === 'string' ? '' : value)
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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              Paramètres de la Plateforme
            </h1>
            <p className="text-gray-600 mt-1">
              Configuration des services et paramètres système
            </p>
          </div>
        </div>
      </div>

      {/* Message d'alerte */}
      {message && (
        <div className={`rounded-xl p-4 border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : message.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <Info className="h-5 w-5 mr-2" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Message d'alerte pour les paramètres de l'application */}
      {appMessage && (
        <div className={`rounded-xl p-4 border ${
          appMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : appMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            {appMessage.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {appMessage.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
            {appMessage.type === 'info' && <Info className="h-5 w-5 mr-2" />}
            <span>{appMessage.text}</span>
          </div>
        </div>
      )}

      {/* Paramètres de l'Application */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Paramètres de l'Application</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Configuration générale de la plateforme et des services tiers
          </p>
        </div>

        <form className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du site */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du site
              </label>
              <input
                type="text"
                value={appSettings.siteName}
                onChange={(e) => handleAppInputChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de votre site"
              />
            </div>

            {/* Description du site */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du site
              </label>
              <input
                type="text"
                value={appSettings.siteDescription}
                onChange={(e) => handleAppInputChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description de votre site"
              />
            </div>

            {/* Clé API TinyMCE */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="h-4 w-4 inline mr-1" />
                Clé API TinyMCE
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={appSettings.tinymceApiKey || ''}
                  onChange={(e) => handleAppInputChange('tinymceApiKey', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre clé API TinyMCE (optionnel)"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Clé API pour accéder aux fonctionnalités premium de TinyMCE (correction orthographique, etc.)
              </p>
            </div>

            {/* Clé API OpenAI */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="h-4 w-4 inline mr-1" />
                Clé API OpenAI (ChatGPT)
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={appSettings.openaiApiKey || ''}
                  onChange={(e) => handleAppInputChange('openaiApiKey', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Clé API pour la génération de contenu et d'images avec ChatGPT et DALL-E
              </p>
            </div>

            {/* Clé API Gemini */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="h-4 w-4 inline mr-1" />
                Clé API Google Gemini
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={appSettings.geminiApiKey || ''}
                  onChange={(e) => handleAppInputChange('geminiApiKey', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AIza..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Clé API pour la génération de contenu avec Google Gemini
              </p>
            </div>

            {/* Mode maintenance */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={appSettings.maintenanceMode}
                  onChange={(e) => handleAppInputChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                  Mode maintenance
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Activer le mode maintenance pour empêcher l'accès au site
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleAppSave}
              disabled={savingApp}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {savingApp ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </button>
          </div>
        </form>
      </div>

      {/* Configuration SMTP */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Configuration SMTP</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Paramètres du serveur de messagerie pour l'envoi d'emails
          </p>
        </div>

        <form autoComplete="off" noValidate>
          <div className="p-6 space-y-6">
            {/* Informations du serveur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serveur SMTP *
              </label>
              <input
                type="text"
                value={smtpSettings.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={smtpSettings.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Authentification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                value={smtpSettings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="votre-email@gmail.com"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                name="smtp-username"
                id="smtp-username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
                {hasExistingPassword && (
                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    ✓ Configuré
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={smtpSettings.password}
                  onChange={(e) => {
                    handleInputChange('password', e.target.value)
                    // Si l'utilisateur tape quelque chose, on considère qu'il y a un nouveau mot de passe
                    if (e.target.value.length > 0) {
                      setHasExistingPassword(true)
                    }
                  }}
                  placeholder={hasExistingPassword ? "Laisser vide pour conserver le mot de passe actuel" : "Mot de passe ou mot de passe d'application"}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="smtp-password"
                  id="smtp-password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {hasExistingPassword && (
                <p className="text-xs text-gray-500 mt-1">
                  Laissez ce champ vide pour conserver le mot de passe actuel, ou saisissez un nouveau mot de passe pour le remplacer.
                </p>
              )}
            </div>
          </div>

          {/* Expéditeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email expéditeur *
              </label>
              <input
                type="email"
                value={smtpSettings.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="noreply@windevexpert.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom expéditeur *
              </label>
              <input
                type="text"
                value={smtpSettings.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="WindevExpert"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="secure"
                checked={smtpSettings.secure}
                onChange={(e) => handleInputChange('secure', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="secure" className="ml-2 block text-sm text-gray-700">
                Connexion sécurisée (SSL/TLS)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={smtpSettings.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Configuration active
              </label>
            </div>
          </div>

          {/* Test de connexion */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Test de connexion</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleTest}
                disabled={testing || !testEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Tester
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Envoyez un email de test pour vérifier la configuration
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </button>
          </div>
          </div>
        </form>
      </div>

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Informations importantes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pour Gmail, utilisez un mot de passe d'application au lieu de votre mot de passe habituel</li>
              <li>• Port 587 avec STARTTLS ou port 465 avec SSL sont recommandés</li>
              <li>• Testez toujours la configuration avant de l'activer</li>
              <li>• Les mots de passe sont chiffrés avant d'être stockés en base de données</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}