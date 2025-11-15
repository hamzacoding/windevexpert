import { Product, Category, ProductFilter, ProductSearchResult } from '@/types/product'

export class ProductService {
  private static readonly API_BASE_URL = '/api'

  // Category methods
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const categories = await response.json()
      return this.buildCategoryTree(categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await FirestoreService.getDocument<Category>(this.CATEGORIES_COLLECTION, id)
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await FirestoreService.queryDocuments<Category>(
        this.CATEGORIES_COLLECTION,
        { where: [{ field: 'slug', operator: '==', value: slug }] }
      )
      return categories[0] || null
    } catch (error) {
      console.error('Error fetching category by slug:', error)
      return null
    }
  }

  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const categoryData = {
        ...category,
        createdAt: now,
        updatedAt: now
      }
      return await FirestoreService.createDocument(this.CATEGORIES_COLLECTION, categoryData)
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error('Failed to create category')
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      await FirestoreService.updateDocument(this.CATEGORIES_COLLECTION, id, updateData)
    } catch (error) {
      console.error('Error updating category:', error)
      throw new Error('Failed to update category')
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category has children
      const children = await FirestoreService.queryDocuments<Category>(
        this.CATEGORIES_COLLECTION,
        { where: [{ field: 'parentId', operator: '==', value: id }] }
      )
      
      if (children.length > 0) {
        throw new Error('Cannot delete category with subcategories')
      }

      // Check if category has products
      const products = await FirestoreService.queryDocuments<Product>(
        this.PRODUCTS_COLLECTION,
        { where: [{ field: 'categoryId', operator: '==', value: id }] }
      )
      
      if (products.length > 0) {
        throw new Error('Cannot delete category with products')
      }

      await FirestoreService.deleteDocument(this.CATEGORIES_COLLECTION, id)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // Product methods
  static async getProducts(filter: ProductFilter = {}): Promise<ProductSearchResult> {
    try {
      const {
        categoryId,
        type,
        priceMin,
        priceMax,
        license,
        support,
        tags,
        search,
        sortBy = 'created',
        sortOrder = 'desc',
        page = 1,
        limit = 12
      } = filter

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      if (categoryId) params.append('categoryId', categoryId)
      if (type) params.append('type', type)
      if (priceMin !== undefined) params.append('priceMin', priceMin.toString())
      if (priceMax !== undefined) params.append('priceMax', priceMax.toString())
      if (search) params.append('search', search)

      // Fetch products from API
      const response = await fetch(`${this.API_BASE_URL}/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error('Failed to fetch products')
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/products/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch product')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/products/slug/${slug}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch product')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }
  }

  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      return await FirestoreService.queryDocuments<Product>(
        this.PRODUCTS_COLLECTION,
        {
          where: [
            { field: 'isActive', operator: '==', value: true },
            { field: 'isFeatured', operator: '==', value: true }
          ],
          orderBy: 'createdAt',
          orderDirection: 'desc',
          limit
        }
      )
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/products/${productId}/related?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch related products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching related products:', error)
      return []
    }
  }

  static async incrementDownloads(productId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/products/${productId}/download`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Failed to increment downloads')
      }
    } catch (error) {
      console.error('Error incrementing downloads:', error)
    }
  }

  // Helper methods
  private static buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build the tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children!.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    return rootCategories
  }
}