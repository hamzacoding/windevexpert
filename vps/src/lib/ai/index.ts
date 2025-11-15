import { openaiService, OpenAITextGenerationOptions, OpenAIImageGenerationOptions } from './openai'
import { geminiService, GeminiTextGenerationOptions } from './gemini'

export type AIProvider = 'openai' | 'gemini'

export interface AITextGenerationOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  type?: 'title' | 'description' | 'content' | 'email' | 'custom'
  provider?: AIProvider
}

export interface AIImageGenerationOptions extends OpenAIImageGenerationOptions {
  category?: string
  filename?: string
}

export class AIService {
  async generateText(options: AITextGenerationOptions): Promise<string> {
    const provider = options.provider || 'openai'
    
    try {
      if (provider === 'openai') {
        return await openaiService.generateText(options as OpenAITextGenerationOptions)
      } else if (provider === 'gemini') {
        return await geminiService.generateText(options as GeminiTextGenerationOptions)
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`)
      }
    } catch (error) {
      console.error(`AI text generation error with ${provider}:`, error)
      throw error
    }
  }

  async generateImage(options: AIImageGenerationOptions): Promise<string[]> {
    try {
      const urls = await openaiService.generateImage(options)
      
      // If category is specified, download and save the images
      if (options.category && urls.length > 0) {
        const savedUrls = await Promise.all(
          urls.map((url, index) => {
            const filename = options.filename 
              ? `${options.filename}${urls.length > 1 ? `-${index + 1}` : ''}.png`
              : undefined
            return openaiService.downloadAndSaveImage(url, options.category!, filename)
          })
        )
        return savedUrls
      }
      
      return urls
    } catch (error) {
      console.error('AI image generation error:', error)
      throw error
    }
  }

  async generateTitle(prompt: string, provider?: AIProvider): Promise<string> {
    return this.generateText({
      prompt,
      type: 'title',
      maxTokens: 100,
      temperature: 0.8,
      provider
    })
  }

  async generateDescription(prompt: string, provider?: AIProvider): Promise<string> {
    return this.generateText({
      prompt,
      type: 'description',
      maxTokens: 300,
      temperature: 0.7,
      provider
    })
  }

  async generateContent(prompt: string, provider?: AIProvider): Promise<string> {
    return this.generateText({
      prompt,
      type: 'content',
      maxTokens: 1500,
      temperature: 0.7,
      provider
    })
  }

  async generateEmailContent(prompt: string, provider?: AIProvider): Promise<string> {
    return this.generateText({
      prompt,
      type: 'email',
      maxTokens: 800,
      temperature: 0.6,
      provider
    })
  }
}

export const aiService = new AIService()

// Export individual services for direct access if needed
export { openaiService, geminiService }
export type { OpenAITextGenerationOptions, OpenAIImageGenerationOptions, GeminiTextGenerationOptions }