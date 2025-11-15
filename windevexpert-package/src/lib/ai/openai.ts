import { prisma } from '@/lib/prisma'

export interface OpenAITextGenerationOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  type?: 'title' | 'description' | 'content' | 'email' | 'custom'
}

export interface OpenAIImageGenerationOptions {
  prompt: string
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

export class OpenAIService {
  private apiKey: string | null = null

  constructor() {
    // Ne pas accéder à la base de données au chargement du module
    // Préférer les variables d'environnement si disponibles
    this.apiKey = process.env.OPENAI_API_KEY || null
  }

  private async initializeApiKey() {
    try {
      const settings = await prisma.appSettings.findFirst()
      this.apiKey = settings?.openaiApiKey || null
    } catch (error) {
      console.error('Failed to load OpenAI API key:', error)
    }
  }

  private async ensureApiKey() {
    if (!this.apiKey) {
      await this.initializeApiKey()
    }
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please add it in application settings.')
    }
  }

  async generateText(options: OpenAITextGenerationOptions): Promise<string> {
    await this.ensureApiKey()

    const systemPrompts = {
      title: 'Tu es un expert en création de titres accrocheurs et professionnels. Génère un titre concis et impactant.',
      description: 'Tu es un expert en rédaction de descriptions. Crée une description claire, engageante et informative.',
      content: 'Tu es un rédacteur web expert. Crée du contenu de qualité, bien structuré et engageant.',
      email: 'Tu es un expert en email marketing. Crée du contenu d\'email professionnel et persuasif.',
      custom: 'Tu es un assistant de rédaction expert. Réponds de manière précise et professionnelle.'
    }

    const systemPrompt = systemPrompts[options.type || 'custom']

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: options.prompt
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI text generation error:', error)
      throw error
    }
  }

  async generateImage(options: OpenAIImageGenerationOptions): Promise<string[]> {
    await this.ensureApiKey()

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: options.prompt,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          style: options.style || 'natural',
          n: options.n || 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return data.data?.map((item: any) => item.url) || []
    } catch (error) {
      console.error('OpenAI image generation error:', error)
      throw error
    }
  }

  async downloadAndSaveImage(imageUrl: string, category: string, filename?: string): Promise<string> {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to download image')
      }

      const buffer = await response.arrayBuffer()
      const finalFilename = filename || `ai-generated-${Date.now()}.png`
      const savePath = `/images/${category}/${finalFilename}`
      
      // In a real implementation, you would save the buffer to the file system
      // For now, we'll return the URL as-is since we're in a browser environment
      return imageUrl
    } catch (error) {
      console.error('Error downloading image:', error)
      throw error
    }
  }
}

export const openaiService = new OpenAIService()