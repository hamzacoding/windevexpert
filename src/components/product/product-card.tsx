'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product'
import { detectClientCountryCode, determineDisplayPrice } from '@/lib/client-geo'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Download, 
  ShoppingCart, 
  Eye, 
  Heart,
  ExternalLink,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
  className?: string
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false,
  className 
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async () => {
    if (!onAddToCart) return
    
    setIsLoading(true)
    try {
      await onAddToCart(product.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product.id)
    }
  }

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatPriceDA = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD'
    }).format(price)
  }

  const getAppTypeColor = (appType: string) => {
    const colors = {
      'WEB': 'bg-blue-100 text-blue-800 border-blue-200',
      'MOBILE': 'bg-green-100 text-green-800 border-green-200',
      'DESKTOP': 'bg-purple-100 text-purple-800 border-purple-200',
      'API': 'bg-orange-100 text-orange-800 border-orange-200',
      'PLUGIN': 'bg-pink-100 text-pink-800 border-pink-200',
      'TEMPLATE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'SERVICE': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[appType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      'Templates': 'bg-blue-100 text-blue-800 border-blue-200',
      'Composants': 'bg-green-100 text-green-800 border-green-200',
      'Plugins': 'bg-purple-100 text-purple-800 border-purple-200',
      'Thèmes': 'bg-pink-100 text-pink-800 border-pink-200',
      'Formations': 'bg-orange-100 text-orange-800 border-orange-200',
      'Applications': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Outils': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Services': 'bg-red-100 text-red-800 border-red-200'
    }
    
    // Fallback color based on hash of category name
    if (!colors[categoryName as keyof typeof colors]) {
      const hash = categoryName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      const colorIndex = Math.abs(hash) % 8
      const fallbackColors = [
        'bg-slate-100 text-slate-800 border-slate-200',
        'bg-gray-100 text-gray-800 border-gray-200',
        'bg-zinc-100 text-zinc-800 border-zinc-200',
        'bg-neutral-100 text-neutral-800 border-neutral-200',
        'bg-stone-100 text-stone-800 border-stone-200',
        'bg-amber-100 text-amber-800 border-amber-200',
        'bg-lime-100 text-lime-800 border-lime-200',
        'bg-emerald-100 text-emerald-800 border-emerald-200'
      ]
      return fallbackColors[colorIndex]
    }
    
    return colors[categoryName as keyof typeof colors]
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        )}
      />
    ))
  }

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col h-full',
      className
    )}>
      {/* Product Image */}
      <div className="relative aspect-video bg-gray-100">
        {(() => {
          const imageSrc = product.logo || (product.screenshots && product.screenshots.length > 0 ? product.screenshots[0] : null);
          // Validate that imageSrc is a non-empty string and not just whitespace
          const isValidImageSrc = imageSrc && typeof imageSrc === 'string' && imageSrc.trim().length > 0;
          
          return isValidImageSrc && !imageError ? (
            <Image
              src={imageSrc.trim()}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <FileText className="h-12 w-12" />
            </div>
          );
        })()}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFree && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              Gratuit
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Vedette
            </span>
          )}
          {!product.isFree && product.originalPriceDA && product.priceDA && product.originalPriceDA > product.priceDA && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Promo
            </span>
          )}
          {product.trialPeriod && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
              Essai {product.trialPeriod}j
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleFavorite && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleToggleFavorite}
            >
              <Heart className={cn(
                'h-4 w-4',
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
              )} />
            </Button>
          )}
          
          <Link href={`/produits/${product.slug}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
          </Link>

          {product.demoUrl && (
            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col h-full">
        {/* Category & Type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(product.category.name)}`}>
                {product.category.name}
              </span>
            )}
            {product.appType && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getAppTypeColor(product.appType)}`}>
                {product.appType}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {product.license}
          </span>
        </div>

        {/* Title */}
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Tagline */}
        {product.tagline && (
          <p className="text-xs text-blue-600 font-medium mb-2 line-clamp-1">
            {product.tagline}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
          {product.shortDescription || product.tagline || product.description}
        </p>

        {/* Rating & Downloads */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="h-3 w-3" />
            <span>{product.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price & Actions - Fixed at bottom */}
        <div className="mt-auto">
          {/* Price */}
          <div className="flex flex-col mb-3">
            {product.isFree ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  Gratuit
                </span>
                {product.trialPeriod && (
                  <span className="text-sm text-gray-500">
                    Essai {product.trialPeriod} jours
                  </span>
                )}
              </div>
            ) : (
              (() => {
                const pa = (product as any).prix_affiche as { valeur: number; devise: string } | undefined
                if (pa) {
                  const format = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: pa.devise as any })
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {format.format(pa.valeur)}
                      </span>
                    </div>
                  )
                }
                const cc = detectClientCountryCode()
                const disp = determineDisplayPrice(cc, { priceEUR: product.price, priceDZD: product.priceDA })
                const format = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: disp.devise })
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {format.format(disp.valeur)}
                    </span>
                  </div>
                )
              })()
            )}
          </div>

          {/* Add to Cart Button - Always at bottom */}
          {onAddToCart && (
            <Button
              size="sm"
              onClick={handleAddToCart}
              loading={isLoading}
              className="w-full flex items-center justify-center gap-1 cursor-pointer"
              variant={product.isFree ? "outline" : "default"}
            >
              {product.isFree ? (
                <>
                  <Download className="h-4 w-4" />
                  Télécharger
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {isLoading ? 'Ajout...' : 'Ajouter au panier'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Author */}
        {product.author && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {product.author.avatar && typeof product.author.avatar === 'string' && product.author.avatar.trim().length > 0 ? (
                <Image
                  src={product.author.avatar.trim()}
                  alt={product.author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {product.author.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-600">
                par {product.author.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
