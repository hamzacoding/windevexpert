'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './product-card'
import { ProductFilters } from './product-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product, ProductFilter, ProductSearchResult } from '@/types/product'
import { ProductService } from '@/lib/services/product-service'
import { useCart } from '@/contexts/cart-context'
import { 
  Search, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  initialProducts?: ProductSearchResult
  categoryId?: string
  className?: string
}

export function ProductGrid({ 
  initialProducts, 
  categoryId,
  className 
}: ProductGridProps) {
  const [products, setProducts] = useState<ProductSearchResult>(
    initialProducts || {
      products: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      categories: []
    }
  )
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProductFilter>({
    categoryId,
    page: 1,
    limit: 12,
    sortBy: 'created',
    sortOrder: 'desc'
  })

  // Load products when filters change
  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const result = await ProductService.getProducts({
        ...filters,
        search: searchTerm || undefined
      })
      setProducts(result)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }))
    loadProducts()
  }

  const handleFilterChange = (newFilters: Partial<ProductFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { addToCartWithUpdate } = useCart()

  const handleAddToCart = async (productId: string) => {
    // Find product name for better toast message
    const product = products.products.find(p => p.id === productId)
    await addToCartWithUpdate(productId, 1, product?.name)
  }

  const getSessionId = () => {
    // Simple session ID generation for demo
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  const renderPagination = () => {
    if (products.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    const startPage = Math.max(1, products.page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(products.totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(products.page - 1)}
          disabled={products.page === 1}
          className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              1
            </Button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages.map(page => (
          <Button
            key={page}
            variant={page === products.page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              page === products.page 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : ''
            }`}
          >
            {page}
          </Button>
        ))}

        {endPage < products.totalPages && (
          <>
            {endPage < products.totalPages - 1 && <span className="text-gray-500">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(products.totalPages)}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {products.totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(products.page + 1)}
          disabled={products.page === products.totalPages}
          className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 focus:shadow-xl focus:bg-white"
          />
        </div>
        <Button 
          onClick={handleSearch}
          className="rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Rechercher
        </Button>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <ProductFilters
            categories={products.categories}
            currentFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Mobile Filters */}
          <div className="lg:hidden">
            <ProductFilters
              categories={products.categories}
              currentFilters={filters}
              onFilterChange={handleFilterChange}
              className="mb-6"
            />
          </div>

      {/* Results Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600 font-medium">
            {products.total} produit{products.total !== 1 ? 's' : ''} trouvé{products.total !== 1 ? 's' : ''}
          </p>
          
          {/* Sort Options */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any })
            }}
            className="text-sm border-0 rounded-xl shadow-lg px-4 py-2 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 focus:shadow-xl focus:bg-white"
          >
            <option value="created-desc">Plus récents</option>
            <option value="created-asc">Plus anciens</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating-desc">Mieux notés</option>
            <option value="downloads-desc">Plus téléchargés</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : ''
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              viewMode === 'list' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : ''
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && (
        <>
          {products.products.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {products.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 hover:shadow-xl transition-all duration-300">
                <p className="text-gray-500 text-lg font-medium">Aucun produit trouvé</p>
                <p className="text-gray-400 text-sm mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && renderPagination()}
        </div>
      </div>
    </div>
  )
}