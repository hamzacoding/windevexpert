import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Paramètres de filtrage
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construction des conditions where
    const where: any = {
      status: 'ACTIVE' // Seulement les produits actifs
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (type) {
      where.type = type
    }

    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin)
      if (priceMax) where.price.lte = parseFloat(priceMax)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Construction de l'ordre de tri
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Récupération des produits avec pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
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
      prisma.product.count({ where })
    ])

    // Transformation des données pour correspondre au format attendu
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      priceDA: product.priceDA,
      originalPriceDA: product.originalPriceDA,
      type: product.type,
      status: product.status,
      image: product.logo,
      logo: product.logo,
      screenshots: product.screenshots,
      isFree: product.isFree || false,
      isFeatured: product.isFeatured || false,
      trialPeriod: product.trialPeriod,
      features: product.features,
      category: product.category,
      categoryId: product.categoryId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      // Ajout de champs simulés pour la compatibilité
      license: 'COMMERCIAL', // Valeur par défaut
      supportLevel: 'STANDARD', // Valeur par défaut
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
      rating: 4.5, // Valeur par défaut
      downloads: Math.floor(Math.random() * 1000) + 100,
      isActive: product.status === 'ACTIVE'
    }))

    const totalPages = Math.ceil(totalCount / limit)

    // Récupération des catégories pour les filtres
    const categories = await prisma.category.findMany({
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

    return NextResponse.json({
      products: transformedProducts,
      total: totalCount,
      page,
      limit,
      totalPages,
      categories
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}