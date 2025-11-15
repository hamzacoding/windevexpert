'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Category, ProductFilter, ProductType, LicenseType, SupportLevel } from '@/types/product'
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  categories: Category[]
  currentFilters: ProductFilter
  onFilterChange: (filters: Partial<ProductFilter>) => void
  className?: string
}

export function ProductFilters({
  categories,
  currentFilters,
  onFilterChange,
  className
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceMin?.toString() || '',
    max: currentFilters.priceMax?.toString() || ''
  })

  const productTypes = [
    { value: ProductType.TEMPLATE, label: 'Templates' },
    { value: ProductType.COMPONENT, label: 'Composants' },
    { value: ProductType.PLUGIN, label: 'Plugins' },
    { value: ProductType.THEME, label: 'Thèmes' },
    { value: ProductType.SCRIPT, label: 'Scripts' },
    { value: ProductType.EBOOK, label: 'E-books' },
    { value: ProductType.COURSE, label: 'Cours' },
    { value: ProductType.SOFTWARE, label: 'Logiciels' }
  ]

  const licenseTypes = [
    { value: LicenseType.PERSONAL, label: 'Personnel' },
    { value: LicenseType.COMMERCIAL, label: 'Commercial' },
    { value: LicenseType.EXTENDED, label: 'Étendue' },
    { value: LicenseType.OPEN_SOURCE, label: 'Open Source' }
  ]

  const supportLevels = [
    { value: SupportLevel.NONE, label: 'Aucun' },
    { value: SupportLevel.BASIC, label: 'Basique' },
    { value: SupportLevel.STANDARD, label: 'Standard' },
    { value: SupportLevel.PREMIUM, label: 'Premium' }
  ]

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      categoryId: categoryId === currentFilters.categoryId ? undefined : categoryId
    })
  }

  const handleTypeChange = (type: ProductType) => {
    onFilterChange({
      type: type === currentFilters.type ? undefined : type
    })
  }

  const handleLicenseChange = (license: LicenseType) => {
    onFilterChange({
      license: license === currentFilters.license ? undefined : license
    })
  }

  const handleSupportChange = (support: SupportLevel) => {
    onFilterChange({
      support: support === currentFilters.support ? undefined : support
    })
  }

  const handlePriceChange = () => {
    const min = priceRange.min ? parseFloat(priceRange.min) : undefined
    const max = priceRange.max ? parseFloat(priceRange.max) : undefined
    
    onFilterChange({
      priceMin: min,
      priceMax: max
    })
  }

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    onFilterChange({
      categoryId: undefined,
      type: undefined,
      license: undefined,
      support: undefined,
      priceMin: undefined,
      priceMax: undefined,
      tags: undefined
    })
  }

  const hasActiveFilters = !!(
    currentFilters.categoryId ||
    currentFilters.type ||
    currentFilters.license ||
    currentFilters.support ||
    currentFilters.priceMin ||
    currentFilters.priceMax ||
    (currentFilters.tags && currentFilters.tags.length > 0)
  )

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={cn('', level > 0 && 'ml-4')}>
        <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2">
          <input
            type="radio"
            name="category"
            checked={currentFilters.categoryId === category.id}
            onChange={() => handleCategoryChange(category.id)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{category.name}</span>
        </label>
        {category.children && category.children.length > 0 && (
          <div className="ml-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 sticky top-4', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Actifs
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={cn(
        'space-y-6',
        !isExpanded && 'hidden lg:block'
      )}>
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2">
                <input
                  type="radio"
                  name="category"
                  checked={!currentFilters.categoryId}
                  onChange={() => handleCategoryChange('')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">Toutes les catégories</span>
              </label>
              {renderCategoryTree(categories)}
            </div>
          </div>
        )}

        {/* Product Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Type de produit</h4>
          <div className="space-y-1">
            {productTypes.map(type => (
              <label
                key={type.value}
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
              >
                <input
                  type="checkbox"
                  checked={currentFilters.type === type.value}
                  onChange={() => handleTypeChange(type.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Prix (€)</h4>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-20"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-20"
            />
            <Button
              size="sm"
              onClick={handlePriceChange}
              variant="outline"
            >
              OK
            </Button>
          </div>
        </div>

        {/* License Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Type de licence</h4>
          <div className="space-y-1">
            {licenseTypes.map(license => (
              <label
                key={license.value}
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
              >
                <input
                  type="checkbox"
                  checked={currentFilters.license === license.value}
                  onChange={() => handleLicenseChange(license.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{license.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Support Level */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Niveau de support</h4>
          <div className="space-y-1">
            {supportLevels.map(support => (
              <label
                key={support.value}
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
              >
                <input
                  type="checkbox"
                  checked={currentFilters.support === support.value}
                  onChange={() => handleSupportChange(support.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{support.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}