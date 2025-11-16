'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Upload, Sparkles } from 'lucide-react'
import { ProductType, AppType } from '@/types/product'
import { ImageUpload } from '@/components/ui/image-upload'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import { RichHtmlEditor } from '@/components/ui/rich-html-editor'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

interface ProductFormData {
  // Informations générales
  name: string
  categoryId: string
  logo?: string
  version?: string
  
  // Description du produit
  tagline?: string
  shortDescription?: string
  description: string
  targetAudience?: string
  problemSolved?: string
  keyBenefits: string[]
  
  // Fonctionnalités principales
  features: string[]
  screenshots: string[]
  demoUrl?: string
  
  // Détails techniques
  type: ProductType
  appType?: AppType
  compatibility?: string
  languages: string[]
  technologies: string[]
  installationRequirements?: string
  dataHosting?: string
  
  // Tarification
  isFree: boolean
  price: number
  priceDA?: number
  pricingPlans: any[]
  trialPeriod?: number
  paymentMethods: string[]
  
  // Assistance et support
  supportChannels: string[]
  documentation?: string
  training?: string
  updatePolicy?: string
  
  // Informations légales
  termsOfService?: string
  privacyPolicy?: string
  legalNotices?: string
  license?: string
  
  // Autres
  status: string
}

interface ProductFormProps {
  product?: any
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    description: '',
    keyBenefits: [],
    features: [],
    screenshots: [],
    languages: [],
    technologies: [],
    pricingPlans: [],
    paymentMethods: [],
    supportChannels: [],
    type: ProductType.SOFTWARE,
    isFree: false,
    price: 0,
    status: 'DRAFT'
  })

  // États pour les champs dynamiques
  const [newBenefit, setNewBenefit] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newScreenshot, setNewScreenshot] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newTechnology, setNewTechnology] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState('')
  const [newSupportChannel, setNewSupportChannel] = useState('')

  // Helper function pour parser les JSON en toute sécurité
  const safeJsonParse = (value: any, fallback: any[] = []) => {
    if (!value) return fallback
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch (error) {
        console.warn('Erreur lors du parsing JSON:', error)
        return fallback
      }
    }
    return Array.isArray(value) ? value : fallback
  }

  useEffect(() => {
    fetchCategories()
    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || '',
        logo: product.logo || '',
        version: product.version || '',
        tagline: product.tagline || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        targetAudience: product.targetAudience || '',
        problemSolved: product.problemSolved || '',
        keyBenefits: safeJsonParse(product.keyBenefits),
        features: safeJsonParse(product.features),
        screenshots: safeJsonParse(product.screenshots),
        demoUrl: product.demoUrl || '',
        type: product.type || ProductType.SOFTWARE,
        appType: product.appType || undefined,
        compatibility: product.compatibility || '',
        languages: safeJsonParse(product.languages),
        technologies: safeJsonParse(product.technologies),
        installationRequirements: product.installationRequirements || '',
        dataHosting: product.dataHosting || '',
        isFree: product.isFree || false,
        price: product.price || 0,
        priceDA: product.priceDA || undefined,
        pricingPlans: safeJsonParse(product.pricingPlans),
        trialPeriod: product.trialPeriod || undefined,
        paymentMethods: safeJsonParse(product.paymentMethods),
        supportChannels: safeJsonParse(product.supportChannels),
        documentation: product.documentation || '',
        training: product.training || '',
        updatePolicy: product.updatePolicy || '',
        termsOfService: product.termsOfService || '',
        privacyPolicy: product.privacyPolicy || '',
        legalNotices: product.legalNotices || '',
        license: product.license || '',
        status: product.status || 'DRAFT'
      })
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addToArray = (field: keyof ProductFormData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[]
      handleInputChange(field, [...currentArray, value.trim()])
      setter('')
    }
  }

  const removeFromArray = (field: keyof ProductFormData, index: number) => {
    const currentArray = formData[field] as string[]
    handleInputChange(field, currentArray.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const generateWithAI = async (field: string) => {
    // Placeholder pour la génération IA
    console.log(`Génération IA pour le champ: ${field}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* 1. Informations Générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏷️ Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du produit *</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Formation React Avancée"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => generateWithAI('name')}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryId">Catégorie *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <ImageUpload
                label="Logo/Image de présentation"
                value={formData.logo || ''}
                onChange={(url) => handleInputChange('logo', url)}
                placeholder="Glissez votre logo ici ou cliquez pour sélectionner"
                maxSize={2}
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version || ''}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder="Ex: 2.1.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Description du Produit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Description du Produit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tagline">Accroche marketing</Label>
            <Input
              id="tagline"
              value={formData.tagline || ''}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="Phrase d'introduction percutante"
            />
          </div>

          <div>
            <Label htmlFor="shortDescription">Description courte</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription || ''}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="2 à 3 lignes maximum pour les catalogues"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Description détaillée *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <RichHtmlEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Présentation complète du produit, ses bénéfices, et son objectif"
                  height={300}
                  uploadFolder="products"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => generateWithAI('description')}
                className="self-start mt-1"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAudience">Public cible</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience || ''}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="Ex: coachs sportifs, gérants de salle"
              />
            </div>

            <div>
              <Label htmlFor="problemSolved">Problème résolu</Label>
              <Input
                id="problemSolved"
                value={formData.problemSolved || ''}
                onChange={(e) => handleInputChange('problemSolved', e.target.value)}
                placeholder="Quelle douleur utilisateur le produit supprime"
              />
            </div>
          </div>

          <div>
            <Label>Bénéfices clés</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Ajouter un bénéfice"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('keyBenefits', newBenefit, setNewBenefit))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('keyBenefits', newBenefit, setNewBenefit)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keyBenefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {benefit}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('keyBenefits', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Fonctionnalités Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Fonctionnalités Principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Liste des fonctionnalités</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ajouter une fonctionnalité"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('features', newFeature, setNewFeature))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('features', newFeature, setNewFeature)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('features', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <MultiImageUpload
              label="Captures d'écran"
              value={formData.screenshots}
              onChange={(urls) => handleInputChange('screenshots', urls)}
              placeholder="Glissez vos captures d'écran ici ou cliquez pour sélectionner"
              maxImages={8}
              maxSize={3}
            />
          </div>

          <div>
            <Label htmlFor="demoUrl">Démo en ligne</Label>
            <Input
              id="demoUrl"
              value={formData.demoUrl || ''}
              onChange={(e) => handleInputChange('demoUrl', e.target.value)}
              placeholder="Lien vers une version d'essai ou sandbox"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Détails Techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧰 Détails Techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de produit *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as ProductType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductType.SOFTWARE}>Logiciel</SelectItem>
                  <SelectItem value={ProductType.SERVICE}>Service</SelectItem>
                  <SelectItem value={ProductType.TRAINING}>Formation</SelectItem>
                  <SelectItem value={ProductType.EBOOK}>E-book</SelectItem>
                  <SelectItem value={ProductType.TEMPLATE}>Template</SelectItem>
                  <SelectItem value={ProductType.PLUGIN}>Plugin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appType">Type d'application</Label>
              <Select value={formData.appType || ''} onValueChange={(value) => handleInputChange('appType', value as AppType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppType.WEB}>Application Web</SelectItem>
                  <SelectItem value={AppType.DESKTOP}>Application Desktop</SelectItem>
                  <SelectItem value={AppType.MOBILE}>Application Mobile</SelectItem>
                  <SelectItem value={AppType.MULTIPLATFORM}>Multiplateforme</SelectItem>
                  <SelectItem value={AppType.BROWSER_EXTENSION}>Extension Navigateur</SelectItem>
                  <SelectItem value={AppType.API}>API</SelectItem>
                  <SelectItem value={AppType.SAAS}>SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="compatibility">Compatibilité / navigateurs supportés</Label>
            <Input
              id="compatibility"
              value={formData.compatibility || ''}
              onChange={(e) => handleInputChange('compatibility', e.target.value)}
              placeholder="Ex: Chrome 90+, Firefox 88+, Safari 14+"
            />
          </div>

          <div>
            <Label>Langues disponibles</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Ajouter une langue"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('languages', newLanguage, setNewLanguage))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('languages', newLanguage, setNewLanguage)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((language, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('languages', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Technologies utilisées</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                placeholder="Ajouter une technologie"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technologies', newTechnology, setNewTechnology))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('technologies', newTechnology, setNewTechnology)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('technologies', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="installationRequirements">Conditions d'installation</Label>
              <Textarea
                id="installationRequirements"
                value={formData.installationRequirements || ''}
                onChange={(e) => handleInputChange('installationRequirements', e.target.value)}
                placeholder="Prérequis techniques"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="dataHosting">Hébergement / sécurité des données</Label>
              <Textarea
                id="dataHosting"
                value={formData.dataHosting || ''}
                onChange={(e) => handleInputChange('dataHosting', e.target.value)}
                placeholder="Informations sur l'hébergement et la sécurité"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Tarification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💵 Tarification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) => handleInputChange('isFree', checked)}
            />
            <Label htmlFor="isFree">Produit gratuit</Label>
          </div>

          {!formData.isFree && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (EUR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required={!formData.isFree}
                />
              </div>

              <div>
                <Label htmlFor="priceDA">Prix (DZD)</Label>
                <Input
                  id="priceDA"
                  type="number"
                  step="0.01"
                  value={formData.priceDA || ''}
                  onChange={(e) => handleInputChange('priceDA', parseFloat(e.target.value) || undefined)}
                />
              </div>

              <div>
                <Label htmlFor="trialPeriod">Période d'essai gratuite (jours)</Label>
                <Input
                  id="trialPeriod"
                  type="number"
                  value={formData.trialPeriod || ''}
                  onChange={(e) => handleInputChange('trialPeriod', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Moyens de paiement acceptés</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="Ex: Carte bancaire, PayPal"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('paymentMethods', newPaymentMethod, setNewPaymentMethod))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('paymentMethods', newPaymentMethod, setNewPaymentMethod)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.paymentMethods.map((method, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {method}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('paymentMethods', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Assistance et Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 Assistance et Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Canaux de support</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSupportChannel}
                onChange={(e) => setNewSupportChannel(e.target.value)}
                placeholder="Ex: Email, Chat, Téléphone"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('supportChannels', newSupportChannel, setNewSupportChannel))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray('supportChannels', newSupportChannel, setNewSupportChannel)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.supportChannels.map((channel, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {channel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('supportChannels', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentation">Documentation / FAQ</Label>
              <Input
                id="documentation"
                value={formData.documentation || ''}
                onChange={(e) => handleInputChange('documentation', e.target.value)}
                placeholder="Lien vers la documentation"
              />
            </div>

            <div>
              <Label htmlFor="training">Formation / onboarding</Label>
              <Input
                id="training"
                value={formData.training || ''}
                onChange={(e) => handleInputChange('training', e.target.value)}
                placeholder="Informations sur la formation"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="updatePolicy">Politique de mise à jour et maintenance</Label>
            <Textarea
              id="updatePolicy"
              value={formData.updatePolicy || ''}
              onChange={(e) => handleInputChange('updatePolicy', e.target.value)}
              placeholder="Politique de mise à jour"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* 8. Informations Légales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Informations Légales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="termsOfService">Conditions générales d'utilisation</Label>
              <Input
                id="termsOfService"
                value={formData.termsOfService || ''}
                onChange={(e) => handleInputChange('termsOfService', e.target.value)}
                placeholder="Lien vers les CGU"
              />
            </div>

            <div>
              <Label htmlFor="privacyPolicy">Politique de confidentialité</Label>
              <Input
                id="privacyPolicy"
                value={formData.privacyPolicy || ''}
                onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
                placeholder="Lien vers la politique de confidentialité"
              />
            </div>

            <div>
              <Label htmlFor="legalNotices">Mentions légales</Label>
              <Input
                id="legalNotices"
                value={formData.legalNotices || ''}
                onChange={(e) => handleInputChange('legalNotices', e.target.value)}
                placeholder="Lien vers les mentions légales"
              />
            </div>

            <div>
              <Label htmlFor="license">Licence d'utilisation</Label>
              <Input
                id="license"
                value={formData.license || ''}
                onChange={(e) => handleInputChange('license', e.target.value)}
                placeholder="Type de licence"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du produit</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="INACTIVE">Inactif</SelectItem>
              <SelectItem value="ARCHIVED">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
      </div>
    </form>
  )
}
