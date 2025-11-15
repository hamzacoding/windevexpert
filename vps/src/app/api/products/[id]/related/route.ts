import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    const { id } = await params

    // First, get the current product to find its category
    const currentProduct = await prisma.product.findUnique({
      where: {
        id,
        status: 'ACTIVE'
      },
      select: {
        categoryId: true,
        type: true
      }
    })

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Find related products in the same category and type, excluding the current product
    const relatedProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        id: {
          not: id
        },
        OR: [
          {
            categoryId: currentProduct.categoryId
          },
          {
            type: currentProduct.type
          }
        ]
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
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

    // Transform data to match expected format
    const transformedProducts = relatedProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceDA: product.priceDA,
      type: product.type,
      status: product.status,
      image: product.logo,
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
            return [];
          }
        }
        return [];
      })(),
      isActive: product.status === 'ACTIVE',
      isFeatured: product.type === 'TRAINING'
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}