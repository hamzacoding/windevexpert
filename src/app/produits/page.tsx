import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/product-grid'
import { prisma } from '@/lib/prisma'
import { headers, cookies } from 'next/headers'
import { buildPrixAffiche } from '@/lib/geo'
import { PublicLayout } from '@/components/layout/public-layout'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Produits - WindevExpert',
  description: 'Découvrez notre catalogue de produits WinDev, WebDev et WinDev Mobile : templates, composants, plugins et bien plus.',
  alternates: {
    canonical: '/produits',
  },
}

async function getInitialProducts() {
  try {
    const page = 1
    const limit = 12
    const skip = (page - 1) * limit

    const [products, totalCount, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE'
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ])

    const hdrs = headers()
    const cookieStore = cookies()
    const headerCC = hdrs.get('x-country-code')?.slice(0,2).toUpperCase() || null
    const cookieCC = cookieStore.get('country_code')?.value?.slice(0,2).toUpperCase() || null
    const countryCode = headerCC || cookieCC || 'FR'

    // Transform products to match expected format
    const transformedProducts = products.map(product => {
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        priceDA: product.priceDA,
        type: product.type,
        status: product.status,
        image: product.logo,
        logo: product.logo,
        screenshots: product.screenshots,
        images: product.images || [],
        features: Array.isArray(product.features) ? product.features : [],
        requirements: Array.isArray(product.requirements) ? product.requirements : [],
        compatibility: Array.isArray(product.compatibility) ? product.compatibility : [],
        category: product.category,
        categoryId: product.categoryId,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        // Add fields expected by ProductCard component
        isFree: product.isFree || false,
        isFeatured: product.isFeatured || false,
        originalPriceDA: product.originalPriceDA || null,
        trialPeriod: product.trialPeriod || null,
        // Add simulated fields for compatibility
        license: 'COMMERCIAL',
        supportLevel: 'STANDARD',
        tags: (() => {
          if (Array.isArray(product.features)) {
            return product.features.slice(0, 3).filter(Boolean);
          }
          if (typeof product.features === 'string') {
            try {
              const parsed = JSON.parse(product.features);
              return Array.isArray(parsed) ? parsed.slice(0, 3).filter(Boolean) : [];
            } catch {
              return product.features.split(',').map(f => f.trim()).slice(0, 3).filter(Boolean);
            }
          }
          return [];
        })(),
        rating: 4.5,
        downloads: Math.floor(Math.random() * 1000) + 100,
        isActive: product.status === 'ACTIVE',
        ...buildPrixAffiche(countryCode, { priceEUR: product.price ?? null, priceDZD: product.priceDA ?? null })
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return {
      products: transformedProducts,
      total: totalCount,
      page,
      limit,
      totalPages,
      categories
    }
  } catch (error) {
    console.error('Error loading initial products:', error)
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      categories: []
    }
  }
}

export default async function ProduitsPage() {
  const initialProducts = await getInitialProducts()
  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Catalogue de Produits
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez notre collection de templates, composants, plugins et thèmes 
              pour WinDev, WebDev et WinDev Mobile
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }>
            <ProductGrid initialProducts={initialProducts} />
          </Suspense>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}
