import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiService, AITextGenerationOptions } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, type, maxTokens, temperature, provider } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const options: AITextGenerationOptions = {
      prompt,
      type: type || 'custom',
      maxTokens: maxTokens || 1000,
      temperature: temperature || 0.7,
      provider: provider || 'openai'
    }

    const generatedText = await aiService.generateText(options)

    return NextResponse.json({
      success: true,
      text: generatedText,
      provider: options.provider
    })

  } catch (error: any) {
    console.error('AI text generation API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate text',
        details: error.message 
      },
      { status: 500 }
    )
  }
}