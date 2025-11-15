export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  children?: Category[]
  imageUrl?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  
  // 🏷️ 1. Informations Générales
  name: string
  slug: string
  logo?: string
  version?: string
  publishedAt?: Date
  
  // 💬 2. Description du Produit
  tagline?: string
  shortDescription?: string
  description: string
  targetAudience?: string
  problemSolved?: string
  keyBenefits?: string[] // Parsed from JSON
  
  // ⚙️ 3. Fonctionnalités Principales
  features?: string[] // Parsed from JSON
  screenshots?: string[] // Parsed from JSON
  demoUrl?: string
  videoUrl?: string
  
  // 🧰 4. Détails Techniques
  type: ProductType
  appType?: AppType
  compatibility?: string[] // Parsed from JSON
  languages?: string[] // Parsed from JSON
  technologies?: string[] // Parsed from JSON
  requirements?: string
  hosting?: string
  security?: string
  
  // 💵 5. Tarification
  price: number
  priceDA?: number
  isFree: boolean
  pricingPlans?: any[] // Parsed from JSON
  trialPeriod?: number
  paymentMethods?: string[] // Parsed from JSON
  
  // 👥 6. Assistance et Support
  supportTypes?: string[] // Parsed from JSON
  documentation?: string
  training?: string
  updatePolicy?: string
  
  // 📊 7. Témoignages et Références
  testimonials?: any[] // Parsed from JSON
  caseStudies?: any[] // Parsed from JSON
  partners?: string[] // Parsed from JSON
  
  // 🔐 8. Informations Légales
  termsOfUse?: string
  privacyPolicy?: string
  license?: string
  
  // Champs existants
  status: ProductStatus
  image?: string // Deprecated, use logo
  categoryId: string
  category?: Category
  
  // Computed fields
  rating: number
  enrollments: number
  downloads?: number
  reviewCount?: number
  isActive: boolean
  isFeatured?: boolean
  
  createdAt: Date
  updatedAt: Date
}

export enum ProductType {
  TEMPLATE = 'template',
  COMPONENT = 'component',
  PLUGIN = 'plugin',
  THEME = 'theme',
  SCRIPT = 'script',
  EBOOK = 'ebook',
  COURSE = 'course',
  SOFTWARE = 'software'
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum AppType {
  WEB_APP = 'WEB_APP',
  DESKTOP_APP = 'DESKTOP_APP',
  MOBILE_APP = 'MOBILE_APP',
  BROWSER_EXTENSION = 'BROWSER_EXTENSION',
  PLUGIN = 'PLUGIN',
  API = 'API',
  SAAS = 'SAAS',
  TEMPLATE = 'TEMPLATE',
  SCRIPT = 'SCRIPT',
  OTHER = 'OTHER'
}

export enum LicenseType {
  PERSONAL = 'personal',
  COMMERCIAL = 'commercial',
  EXTENDED = 'extended',
  OPEN_SOURCE = 'open_source'
}

export enum SupportLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

export interface ProductFilter {
  categoryId?: string
  type?: ProductType
  priceMin?: number
  priceMax?: number
  license?: LicenseType
  support?: SupportLevel
  tags?: string[]
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'downloads' | 'created'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  categories: Category[]
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  price: number
  addedAt: Date
}

export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  total: number
  currency: string
  createdAt: Date
  updatedAt: Date
}