'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

export type ContentType = 'title' | 'description' | 'content' | 'email' | 'custom'
export type AIProvider = 'openai' | 'gemini'

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void
  contentType?: ContentType
  placeholder?: string
  buttonText?: string
  showProviderSelect?: boolean
  showTypeSelect?: boolean
  className?: string
  disabled?: boolean
}

export function AIContentGenerator({
  onContentGenerated,
  contentType = 'custom',
  placeholder = 'Décrivez le contenu que vous souhaitez générer...',
  buttonText = 'Générer avec IA',
  showProviderSelect = true,
  showTypeSelect = false,
  className = '',
  disabled = false
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedType, setSelectedType] = useState<ContentType>(contentType)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai')
  const [isGenerating, setIsGenerating] = useState(false)

  const contentTypeLabels = {
    title: 'Titre',
    description: 'Description',
    content: 'Contenu',
    email: 'Email',
    custom: 'Personnalisé'
  }

  const providerLabels = {
    openai: 'ChatGPT (OpenAI)',
    gemini: 'Gemini (Google)'
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir un prompt')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: selectedType,
          provider: selectedProvider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erreur lors de la génération')
      }

      if (data.success && data.text) {
        onContentGenerated(data.text)
        toast.success(`Contenu généré avec ${providerLabels[selectedProvider]}`)
        setPrompt('')
      } else {
        throw new Error('Aucun contenu généré')
      }
    } catch (error: any) {
      console.error('Error generating content:', error)
      toast.error(error.message || 'Erreur lors de la génération du contenu')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-blue-600">🤖</span>
        <span className="text-sm font-medium text-gray-700">Génération par IA</span>
      </div>

      <div className="space-y-3">
        {showTypeSelect && (
          <div>
            <Label htmlFor="content-type">Type de contenu</Label>
            <Select value={selectedType} onValueChange={(value: ContentType) => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(contentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showProviderSelect && (
          <div>
            <Label htmlFor="ai-provider">Fournisseur IA</Label>
            <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providerLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="ai-prompt">Prompt</Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            disabled={disabled || isGenerating}
          />
        </div>

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
      </div>
    </div>
  )
}

// Composant simplifié pour les cas d'usage rapides
interface QuickAIGeneratorProps {
  onContentGenerated: (content: string) => void
  contentType: ContentType
  provider?: AIProvider
  className?: string
}

export function QuickAIGenerator({
  onContentGenerated,
  contentType,
  provider = 'openai',
  className = ''
}: QuickAIGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // Vérification que onContentGenerated est bien une fonction
    if (typeof onContentGenerated !== 'function') {
      console.error('onContentGenerated is not a function:', onContentGenerated)
      toast.error('Erreur de configuration du composant')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: contentType,
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erreur lors de la génération')
      }

      if (data.success && data.text) {
        onContentGenerated(data.text)
        setPrompt('')
        toast.success('Contenu généré')
      } else {
        throw new Error('Aucun contenu généré')
      }
    } catch (error: any) {
      console.error('Error generating content:', error)
      toast.error(error.message || 'Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Prompt pour l'IA..."
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        disabled={isGenerating}
      />
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        size="sm"
      >
        {isGenerating ? '⏳' : '🤖'}
      </Button>
    </div>
  )
}