import { prisma } from '@/lib/prisma'
import { Product } from '@/types/product'

export class ProductServiceServer {
  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          courses: true
        }
      })

      if (!product) {
        return null
      }

      // Transform Prisma result to match Product type
      return {
        id: product.id,
        name: product.name,
        title: product.name, // Use name as title for consistency
        description: product.description,
        shortDescription: product.description.substring(0, 150) + '...', // Create short description
        price: product.price,
        originalPrice: product.priceDA || product.price,
        slug: product.slug,
        images: product.logo ? [{
          id: '1',
          url: product.logo,
          alt: product.name,
          isPrimary: true
        }] : [],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
          parentId: product.category.parentId,
          isActive: product.category.isActive,
          createdAt: product.category.createdAt,
          updatedAt: product.category.updatedAt
        } : undefined,
        categoryId: product.categoryId,
        tags: product.features ? JSON.parse(product.features) : [],
        isActive: product.status === 'ACTIVE',
        isFeatured: product.type === 'TRAINING', // Consider training as featured
        stock: 999, // Unlimited for digital products
        sku: product.id,
        weight: null,
        dimensions: null,
        variants: [],
        seoTitle: product.name,
        seoDescription: product.description,
        seoKeywords: product.features ? JSON.parse(product.features).join(', ') : '',
        reviews: [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }
  }

  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          type: 'TRAINING' // Consider training as featured
        },
        include: {
          category: true,
          courses: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return products.map(product => ({
        id: product.id,
        name: product.name,
        title: product.name,
        description: product.description,
        shortDescription: product.description.substring(0, 150) + '...',
        price: product.price,
        originalPrice: product.priceDA || product.price,
        slug: product.slug,
        images: product.logo ? [{
          id: '1',
          url: product.logo,
          alt: product.name,
          isPrimary: true
        }] : [],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
          parentId: product.category.parentId,
          isActive: product.category.isActive,
          createdAt: product.category.createdAt,
          updatedAt: product.category.updatedAt
        } : undefined,
        categoryId: product.categoryId,
        tags: product.features ? JSON.parse(product.features) : [],
        isActive: product.status === 'ACTIVE',
        isFeatured: product.type === 'TRAINING',
        stock: 999,
        sku: product.id,
        weight: null,
        dimensions: null,
        variants: [],
        seoTitle: product.name,
        seoDescription: product.description,
        seoKeywords: product.features ? JSON.parse(product.features).join(', ') : '',
        reviews: [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  static async getRelatedProducts(productId: string, categoryId?: string, limit: number = 4): Promise<Product[]> {
    try {
      const whereClause: any = {
        status: 'ACTIVE',
        id: { not: productId }
      }

      if (categoryId) {
        whereClause.categoryId = categoryId
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          courses: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return products.map(product => ({
        id: product.id,
        name: product.name,
        title: product.name,
        description: product.description,
        shortDescription: product.description.substring(0, 150) + '...',
        price: product.price,
        originalPrice: product.priceDA || product.price,
        slug: product.slug,
        images: product.logo ? [{
          id: '1',
          url: product.logo,
          alt: product.name,
          isPrimary: true
        }] : [],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
          parentId: product.category.parentId,
          isActive: product.category.isActive,
          createdAt: product.category.createdAt,
          updatedAt: product.category.updatedAt
        } : undefined,
        categoryId: product.categoryId,
        tags: product.features ? JSON.parse(product.features) : [],
        isActive: product.status === 'ACTIVE',
        isFeatured: product.type === 'TRAINING',
        stock: 999,
        sku: product.id,
        weight: null,
        dimensions: null,
        variants: [],
        seoTitle: product.name,
        seoDescription: product.description,
        seoKeywords: product.features ? JSON.parse(product.features).join(', ') : '',
        reviews: [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
    } catch (error) {
      console.error('Error fetching related products:', error)
      return []
    }
  }
}