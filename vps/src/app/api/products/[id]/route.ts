import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: {
        id,
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
      isActive: product.status === 'ACTIVE'
    }

    return NextResponse.json(transformedProduct)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}