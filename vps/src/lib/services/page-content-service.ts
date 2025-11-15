import { prisma } from '@/lib/prisma'

export interface PageContentData {
  id: string
  pageSlug: string
  sectionKey: string
  title: string
  content: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class PageContentService {
  /**
   * Récupère le contenu d'une section spécifique d'une page
   */
  static async getPageContent(pageSlug: string, sectionKey: string): Promise<string | null> {
    try {
      const content = await prisma.pageContent.findFirst({
        where: {
          pageSlug,
          sectionKey,
          isActive: true
        }
      })

      return content?.content || null
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error)
      return null
    }
  }

  /**
   * Récupère tout le contenu d'une page
   */
  static async getAllPageContent(pageSlug: string): Promise<Record<string, string>> {
    try {
      const contents = await prisma.pageContent.findMany({
        where: {
          pageSlug,
          isActive: true
        }
      })

      const contentMap: Record<string, string> = {}
      contents.forEach(content => {
        contentMap[content.sectionKey] = content.content
      })

      return contentMap
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu de la page:', error)
      return {}
    }
  }

  /**
   * Récupère le contenu avec fallback vers une valeur par défaut
   */
  static async getContentWithFallback(
    pageSlug: string, 
    sectionKey: string, 
    fallback: string
  ): Promise<string> {
    const content = await this.getPageContent(pageSlug, sectionKey)
    return content || fallback
  }

  /**
   * Récupère les métadonnées SEO d'une page
   */
  static async getPageSEO(pageSlug: string): Promise<{
    title?: string
    description?: string
  }> {
    try {
      const [title, description] = await Promise.all([
        this.getPageContent(pageSlug, 'meta-title'),
        this.getPageContent(pageSlug, 'meta-description')
      ])

      return {
        title: title || undefined,
        description: description || undefined
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées SEO:', error)
      return {}
    }
  }

  /**
   * Vérifie si une page a du contenu personnalisé
   */
  static async hasCustomContent(pageSlug: string): Promise<boolean> {
    try {
      const count = await prisma.pageContent.count({
        where: {
          pageSlug,
          isActive: true
        }
      })

      return count > 0
    } catch (error) {
      console.error('Erreur lors de la vérification du contenu:', error)
      return false
    }
  }

  /**
   * Récupère la liste des pages avec du contenu personnalisé
   */
  static async getPagesWithContent(): Promise<string[]> {
    try {
      const pages = await prisma.pageContent.findMany({
        where: {
          isActive: true
        },
        select: {
          pageSlug: true
        },
        distinct: ['pageSlug']
      })

      return pages.map(page => page.pageSlug)
    } catch (error) {
      console.error('Erreur lors de la récupération des pages:', error)
      return []
    }
  }
}

// Hook React pour utiliser le contenu des pages côté client
export function usePageContent(pageSlug: string, sectionKey: string, fallback: string = '') {
  const [content, setContent] = useState<string>(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/page-content?pageSlug=${pageSlug}&sectionKey=${sectionKey}`)
        if (response.ok) {
          const data = await response.json()
          setContent(data.content || fallback)
        } else {
          setContent(fallback)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error)
        setContent(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [pageSlug, sectionKey, fallback])

  return { content, loading }
}