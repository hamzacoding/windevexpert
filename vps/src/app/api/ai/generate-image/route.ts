import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiService, AIImageGenerationOptions } from '@/lib/ai'

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
    const { 
      prompt, 
      size, 
      quality, 
      style, 
      n, 
      category, 
      filename 
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const options: AIImageGenerationOptions = {
      prompt,
      size: size || '1024x1024',
      quality: quality || 'standard',
      style: style || 'natural',
      n: n || 1,
      category,
      filename
    }

    const imageUrls = await aiService.generateImage(options)

    return NextResponse.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    })

  } catch (error: any) {
    console.error('AI image generation API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error.message 
      },
      { status: 500 }
    )
  }
}