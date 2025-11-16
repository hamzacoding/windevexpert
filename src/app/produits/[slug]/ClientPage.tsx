'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProductDetail } from '@/components/product/product-detail'
import { ProductService } from '@/lib/services/product-service'
import { PublicLayout } from '@/components/layout/public-layout'
import { Product } from '@/types/product'

export default function ProductClientPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await ProductService.getProductBySlug(slug)
        if (!productData) {
          setError('Produit non trouvé')
          return
        }
        setProduct(productData)
        try {
          const related = await ProductService.getRelatedProducts(productData.id, 4)
          setRelatedProducts(related)
        } catch {}
      } catch (err) {
        setError('Erreur lors du chargement du produit')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      loadProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du produit...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Produit non trouvé'}
              </h1>
              <p className="text-gray-600 mb-6">
                Le produit que vous recherchez n'existe pas ou n'est plus disponible.
              </p>
              <a 
                href="/produits" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir tous les produits
              </a>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <ProductDetail 
        product={product} 
        relatedProducts={relatedProducts}
      />
    </PublicLayout>
  )
}
