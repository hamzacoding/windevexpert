import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache } from '@/lib/cache'
import { detectCountryCode, buildPrixAffiche } from '@/lib/geo'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cacheKey = `product_slug_${slug}`
    const cached = getCache<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
    }
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: 'ACTIVE'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform data to match expected format
    const countryCode = detectCountryCode(request)
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceDA: product.priceDA,
      type: product.type,
      status: product.status,
      image: product.logo,
      logo: product.logo, // Add logo field for ProductDetail component
      screenshots: product.screenshots, // Add screenshots field for ProductDetail component
      features: product.features,
      category: product.category,
      categoryId: product.categoryId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
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
      ...buildPrixAffiche(countryCode, {
        priceEUR: product.price ?? null,
        priceDZD: product.priceDA ?? null,
      })
    }

    setCache(cacheKey, transformedProduct, 60_000)
    const res = NextResponse.json(transformedProduct, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
    try { res.cookies.set('country_code', countryCode, { maxAge: 60 * 60, path: '/', sameSite: 'lax' }) } catch {}
    return res

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
