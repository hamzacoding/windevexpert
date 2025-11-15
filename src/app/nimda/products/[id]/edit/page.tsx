'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductForm from '@/components/admin/ProductForm'
import { ProductService } from '@/lib/services/product-service'

interface Product {
  id: string
  name: string
  categoryId: string
  description: string
  keyBenefits: string[]
  features: string[]
  screenshots: string[]
  languages: string[]
  technologies: string[]
  pricingPlans: any[]
  paymentMethods: string[]
  supportChannels: string[]
  type: string
  isFree: boolean
  price: number
  status: string
  logo?: string
  version?: string
  tagline?: string
  shortDescription?: string
  targetAudience?: string
  problemSolved?: string
  demoUrl?: string
  appType?: string
  compatibility?: string
  installationRequirements?: string
  dataHosting?: string
  priceDA?: number
  trialPeriod?: number
  documentation?: string
  training?: string
  updatePolicy?: string
  termsOfService?: string
  privacyPolicy?: string
  legalNotices?: string
  license?: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const productId = params.id as string

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/nimda')
      return
    }

    fetchProduct()
  }, [session, productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${productId}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du produit')
      }

      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du produit')
      router.push('/nimda/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit')
      }

      toast.success('Produit mis à jour avec succès')
      router.push('/nimda/products')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du produit')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/nimda/products')
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
          <p className="text-gray-600 mb-4">Le produit demandé n'existe pas.</p>
          <Button onClick={() => router.push('/nimda/products')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/nimda/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Modifier le produit
            </h1>
            <p className="text-gray-600 mt-1">
              Modifiez les informations du produit "{product.name}"
            </p>
          </div>
        </div>
      </div>

      {/* Form - Full width without frame */}
      <div className="h-full">
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={saving}
        />
      </div>
    </div>
  )
}