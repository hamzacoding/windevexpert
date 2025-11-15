import { NextRequest, NextResponse } from 'next/server'
import { PageContentService } from '@/lib/services/page-content-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('pageSlug')
    const sectionKey = searchParams.get('sectionKey')

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'pageSlug est requis' },
        { status: 400 }
      )
    }

    // Si sectionKey est fourni, récupérer une section spécifique
    if (sectionKey) {
      const content = await PageContentService.getPageContent(pageSlug, sectionKey)
      return NextResponse.json({ content })
    }

    // Sinon, récupérer tout le contenu de la page
    const allContent = await PageContentService.getAllPageContent(pageSlug)
    return NextResponse.json({ content: allContent })

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}