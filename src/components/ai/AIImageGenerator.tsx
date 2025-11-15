'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
export type ImageQuality = 'standard' | 'hd'
export type ImageStyle = 'vivid' | 'natural'
export type ImageCategory = 'pages' | 'emails' | 'projects' | 'courses' | 'products' | 'users' | 'categories' | 'ai-generated'

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrls: string[]) => void
  category?: ImageCategory
  placeholder?: string
  buttonText?: string
  showAdvancedOptions?: boolean
  className?: string
  disabled?: boolean
  maxImages?: number
}

export function AIImageGenerator({
  onImageGenerated,
  category = 'ai-generated',
  placeholder = 'Décrivez l\'image que vous souhaitez générer...',
  buttonText = 'Générer Image IA',
  showAdvancedOptions = true,
  className = '',
  disabled = false,
  maxImages = 1
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<ImageSize>('1024x1024')
  const [quality, setQuality] = useState<ImageQuality>('standard')
  const [style, setStyle] = useState<ImageStyle>('natural')
  const [numberOfImages, setNumberOfImages] = useState(1)
  const [filename, setFilename] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const sizeLabels = {
    '256x256': '256x256 (Carré petit)',
    '512x512': '512x512 (Carré moyen)',
    '1024x1024': '1024x1024 (Carré grand)',
    '1792x1024': '1792x1024 (Paysage)',
    '1024x1792': '1024x1792 (Portrait)'
  }

  const qualityLabels = {
    standard: 'Standard',
    hd: 'Haute Définition'
  }

  const styleLabels = {
    natural: 'Naturel',
    vivid: 'Vif'
  }

  const categoryLabels = {
    pages: 'Pages',
    emails: 'Emails',
    projects: 'Projets',
    courses: 'Cours',
    products: 'Produits',
    users: 'Utilisateurs',
    categories: 'Catégories',
    'ai-generated': 'Généré par IA'
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir un prompt')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          quality,
          style,
          n: Math.min(numberOfImages, maxImages),
          category,
          filename: filename.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erreur lors de la génération')
      }

      if (data.success && data.images) {
        setGeneratedImages(data.images)
        onImageGenerated(data.images)
        toast.success(`${data.images.length} image(s) générée(s) avec succès`)
      } else {
        throw new Error('Aucune image générée')
      }
    } catch (error: any) {
      console.error('Error generating image:', error)
      toast.error(error.message || 'Erreur lors de la génération de l\'image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearImages = () => {
    setGeneratedImages([])
  }

  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-purple-600">🎨</span>
        <span className="text-sm font-medium text-gray-700">Génération d'Images par IA</span>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="image-prompt">Description de l'image</Label>
          <Textarea
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            disabled={disabled || isGenerating}
          />
        </div>

        {showAdvancedOptions && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="image-size">Taille</Label>
                <Select value={size} onValueChange={(value: ImageSize) => setSize(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sizeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image-quality">Qualité</Label>
                <Select value={quality} onValueChange={(value: ImageQuality) => setQuality(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la qualité" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(qualityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="image-style">Style</Label>
                <Select value={style} onValueChange={(value: ImageStyle) => setStyle(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le style" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(styleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number-of-images">Nombre d'images</Label>
                <Select 
                  value={numberOfImages.toString()} 
                  onValueChange={(value) => setNumberOfImages(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(maxImages, 4) }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="filename">Nom de fichier (optionnel)</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="nom-du-fichier"
                disabled={disabled || isGenerating}
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={(value: ImageCategory) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Génération en cours...
            </>
          ) : (
            buttonText
          )}
        </Button>

        {generatedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Images générées</Label>
              <Button onClick={handleClearImages} variant="outline" size="sm">
                Effacer
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    onClick={() => window.open(imageUrl, '_blank')}
                    className="absolute top-1 right-1 p-1 h-6 w-6"
                    size="sm"
                  >
                    🔗
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant simplifié pour les cas d'usage rapides
interface QuickImageGeneratorProps {
  onImageGenerated: (imageUrls: string[]) => void
  category?: ImageCategory
  className?: string
}

export function QuickImageGenerator({
  onImageGenerated,
  category = 'ai-generated',
  className = ''
}: QuickImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
        }),
      })

      const data = await response.json()

      if (data.success && data.images) {
        onImageGenerated(data.images)
        setPrompt('')
        toast.success('Image générée')
      }
    } catch (error) {
      toast.error('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Prompt pour l'image..."
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        disabled={isGenerating}
      />
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        size="sm"
      >
        {isGenerating ? '⏳' : '🎨'}
      </Button>
    </div>
  )
}