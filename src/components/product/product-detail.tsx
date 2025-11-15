'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/cart-context'
import { 
  Star, 
  Download, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Eye,
  Shield,
  Award,
  Clock,
  Users,
  FileText,
  Play,
  Code,
  Zap,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Globe,
  Smartphone,
  Monitor,
  Server,
  CreditCard,
  HeadphonesIcon,
  BookOpen,
  Settings,
  Lock,
  Scale,
  Info,
  ExternalLink,
  Package,
  Layers,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react'
import { Product } from '@/types/product'

interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCartWithUpdate } = useCart()

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await addToCartWithUpdate(product.id, quantity, product.name)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const nextImage = () => {
    setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
  }

  const previousImage = () => {
    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
  }



  // Parse screenshots JSON string to array
  let screenshots: string[] = []
  try {
    if (product.screenshots && typeof product.screenshots === 'string') {
      screenshots = JSON.parse(product.screenshots)
    } else if (Array.isArray(product.screenshots)) {
      screenshots = product.screenshots
    }
  } catch (error) {
    console.warn('Failed to parse screenshots JSON:', error)
    screenshots = []
  }
  
  const images = [product.logo, ...screenshots].filter(img => img && typeof img === 'string' && img.trim().length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb - Compact */}
        <div className="mb-6">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="hover:text-blue-600 transition-colors cursor-pointer">Produits</span>
              <span className="text-gray-400">/</span>
              <span className="hover:text-blue-600 transition-colors cursor-pointer">{product.category?.name}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Left Side - Product Image (60% width) */}
          <div className="lg:col-span-3">
            {/* Hero Image Section */}
            <div className="relative w-full mb-6">
              {/* Main Hero Image */}
              <div className="relative w-full h-[400px] overflow-hidden rounded-lg bg-white shadow-lg">
                {images.length > 0 ? (
                  <Image
                    src={images[selectedImage] || '/api/placeholder/1200/600'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package className="h-24 w-24 mx-auto mb-6" />
                    <p className="text-2xl font-medium">Image du produit</p>
                  </div>
                )}

                {/* Image navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Image thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Image
                        src={image || '/api/placeholder/64/64'}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Under Image */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.isFree && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    🆓 Gratuit
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  {product.type}
                </span>
                {product.appType && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    {product.appType}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Tagline */}
              {product.tagline && (
                <p className="text-lg text-blue-600 font-medium">{product.tagline}</p>
              )}

              {/* Rating and stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(product.rating || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount || 0} avis)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Download className="h-4 w-4" />
                  <span>{product.downloadCount || 0} téléchargements</span>
                </div>
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Licence authentique</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Téléchargement instantané</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Support inclus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Mises à jour gratuites</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Purchase Info (40% width) */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {product.isFree ? 'Gratuit' : `${product.price}€`}
                  </div>
                  {!product.isFree && product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-lg text-gray-500 line-through">
                      {product.originalPrice}€
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">
                    Licence COMMERCIALE • Support inclus
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité:
                  </label>
                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg mb-3 transition-colors duration-200"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>

                {/* Wishlist and Share */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>

                {/* Demo Button */}
                {product.demoUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 border-blue-300 text-blue-600 hover:bg-blue-50"
                    asChild
                  >
                    <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4 mr-2" />
                      Voir la démo
                    </a>
                  </Button>
                )}
              </div>

              {/* Features List */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Inclus dans cette licence :</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Licence authentique</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Téléchargement instantané</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Support inclus</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">Mises à jour gratuites</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mb-16 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-10 hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 text-center">
              Produits similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct.id} className="group bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/20 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    {relatedProduct.logo && typeof relatedProduct.logo === 'string' && relatedProduct.logo.trim().length > 0 ? (
                      <Image
                        src={relatedProduct.logo.trim()}
                        alt={relatedProduct.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {relatedProduct.isFree ? 'Gratuit' : `${relatedProduct.price}€`}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}