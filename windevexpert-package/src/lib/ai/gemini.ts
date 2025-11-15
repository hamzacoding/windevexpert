import { prisma } from '@/lib/prisma'

export interface GeminiTextGenerationOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  type?: 'title' | 'description' | 'content' | 'email' | 'custom'
}

export class GeminiService {
  private apiKey: string | null = null

  constructor() {
    // Ne pas accéder à la base de données au chargement du module
    // Préférer les variables d'environnement si disponibles
    this.apiKey = process.env.GEMINI_API_KEY || null
  }

  private async initializeApiKey() {
    try {
      const settings = await prisma.appSettings.findFirst()
      this.apiKey = settings?.geminiApiKey || null
    } catch (error) {
      console.error('Failed to load Gemini API key:', error)
    }
  }

  private async ensureApiKey() {
    if (!this.apiKey) {
      await this.initializeApiKey()
    }
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add it in application settings.')
    }
  }

  async generateText(options: GeminiTextGenerationOptions): Promise<string> {
    await this.ensureApiKey()

    const systemPrompts = {
      title: 'Tu es un expert en création de titres accrocheurs et professionnels. Génère un titre concis et impactant.',
      description: 'Tu es un expert en rédaction de descriptions. Crée une description claire, engageante et informative.',
      content: 'Tu es un rédacteur web expert. Crée du contenu de qualité, bien structuré et engageant.',
      email: 'Tu es un expert en email marketing. Crée du contenu d\'email professionnel et persuasif.',
      custom: 'Tu es un assistant de rédaction expert. Réponds de manière précise et professionnelle.'
    }

    const systemPrompt = systemPrompts[options.type || 'custom']
    const fullPrompt = `${systemPrompt}\n\n${options.prompt}`

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 1000,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (error) {
      console.error('Gemini text generation error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()