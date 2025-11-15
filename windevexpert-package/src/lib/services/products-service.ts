import { queryOne, queryMany, execute } from '@/lib/db'

export interface ProductData {
  // Informations de base
  name: string
  slug?: string
  description: string
  type: 'FORMATION' | 'SERVICE' | 'PRODUCT'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  categoryId: string
  
  // Informations générales
  logo?: string
  version?: string
  publishedAt?: Date
  
  // Description détaillée
  tagline?: string
  shortDescription?: string
  targetAudience?: string
  problemSolved?: string
  keyBenefits?: string[]
  
  // Fonctionnalités
  features?: string[]
  screenshots?: string[]
  demoUrl?: string
  videoUrl?: string
  
  // Détails techniques
  appType?: string
  compatibility?: string[]
  languages?: string[]
  technologies?: string[]
  requirements?: string
  hosting?: string
  security?: string
  
  // Tarification
  price: number
  priceDA?: number
  isFree: boolean
  pricingPlans?: any[]
  trialPeriod?: number
  paymentMethods?: string[]
  
  // Support
  supportTypes?: string[]
  documentation?: string
  training?: string
  updatePolicy?: string
  
  // Témoignages
  testimonials?: any[]
  caseStudies?: any[]
  partners?: string[]
  
  // Légal
  termsOfUse?: string
  privacyPolicy?: string
  license?: string
  
  // Deprecated
  image?: string
}

export interface ProductsResponse {
  products: any[]
  totalCount: number
  totalPages: number
  currentPage: number
}

// Récupérer tous les produits avec pagination et filtres
export async function getProducts(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  type: string = '',
  status: string = '',
  category: string = ''
): Promise<ProductsResponse> {
  const offset = (page - 1) * limit

  try {
    // Construire la requête WHERE
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (type && type !== 'all') {
      whereClause += ' AND p.type = ?'
      params.push(type)
    }

    if (status && status !== 'all') {
      whereClause += ' AND p.status = ?'
      params.push(status)
    }

    if (category && category !== 'all') {
      whereClause += ' AND p.categoryId = ?'
      params.push(category)
    }

    // Requête pour récupérer les produits avec les informations de catégorie
    const productsQuery = `
      SELECT p.*, 
             c.id as category_id, c.name as category_name,
             (SELECT COUNT(*) FROM OrderItem oi WHERE oi.productId = p.id) as orderItems_count,
             (SELECT COUNT(*) FROM Review r WHERE r.productId = p.id) as reviews_count
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      ${whereClause}
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `

    // Requête pour compter le total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Product p
      ${whereClause}
    `

    const [products, countResult] = await Promise.all([
      queryMany(productsQuery, [...params, limit, offset]),
      queryOne(countQuery, params)
    ])

    const totalCount = countResult?.total || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      products: products.map(product => ({
        ...product,
        category: product.category_id ? {
          id: product.category_id,
          name: product.category_name
        } : null,
        enrollments: product.orderItems_count || 0,
        reviewCount: product.reviews_count || 0,
        rating: 4.5, // TODO: Calculer la moyenne des notes des reviews
        // Parse JSON fields
        features: product.features ? JSON.parse(product.features) : [],
        keyBenefits: product.keyBenefits ? JSON.parse(product.keyBenefits) : [],
        screenshots: product.screenshots ? JSON.parse(product.screenshots) : [],
        compatibility: product.compatibility ? JSON.parse(product.compatibility) : [],
        languages: product.languages ? JSON.parse(product.languages) : [],
        technologies: product.technologies ? JSON.parse(product.technologies) : [],
        pricingPlans: product.pricingPlans ? JSON.parse(product.pricingPlans) : [],
        paymentMethods: product.paymentMethods ? JSON.parse(product.paymentMethods) : [],
        supportTypes: product.supportTypes ? JSON.parse(product.supportTypes) : [],
        testimonials: product.testimonials ? JSON.parse(product.testimonials) : [],
        caseStudies: product.caseStudies ? JSON.parse(product.caseStudies) : [],
        partners: product.partners ? JSON.parse(product.partners) : []
      })),
      totalCount,
      totalPages,
      currentPage: page
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw new Error('Impossible de récupérer les produits')
  }
}

// Récupérer un produit par ID
export async function getProductById(id: string) {
  try {
    const productQuery = `
      SELECT p.*, 
             c.id as category_id, c.name as category_name,
             (SELECT COUNT(*) FROM OrderItem oi WHERE oi.productId = p.id) as orderItems_count,
             (SELECT COUNT(*) FROM Review r WHERE r.productId = p.id) as reviews_count
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ?
    `

    const product = await queryOne(productQuery, [id])

    if (!product) {
      throw new Error('Produit non trouvé')
    }

    return {
      ...product,
      category: product.category_id ? {
        id: product.category_id,
        name: product.category_name
      } : null,
      enrollments: product.orderItems_count || 0,
      reviewCount: product.reviews_count || 0,
      rating: 4.5, // TODO: Calculer la moyenne des notes des reviews
      // Parse JSON fields
      features: product.features ? JSON.parse(product.features) : [],
      keyBenefits: product.keyBenefits ? JSON.parse(product.keyBenefits) : [],
      screenshots: product.screenshots ? JSON.parse(product.screenshots) : [],
      compatibility: product.compatibility ? JSON.parse(product.compatibility) : [],
      languages: product.languages ? JSON.parse(product.languages) : [],
      technologies: product.technologies ? JSON.parse(product.technologies) : [],
      pricingPlans: product.pricingPlans ? JSON.parse(product.pricingPlans) : [],
      paymentMethods: product.paymentMethods ? JSON.parse(product.paymentMethods) : [],
      supportTypes: product.supportTypes ? JSON.parse(product.supportTypes) : [],
      testimonials: product.testimonials ? JSON.parse(product.testimonials) : [],
      caseStudies: product.caseStudies ? JSON.parse(product.caseStudies) : [],
      partners: product.partners ? JSON.parse(product.partners) : []
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    throw new Error('Impossible de récupérer le produit')
  }
}

// Créer un nouveau produit
export async function createProduct(data: ProductData) {
  try {
    const insertQuery = `
      INSERT INTO Product (
        name, slug, description, type, status, categoryId,
        logo, version, publishedAt,
        tagline, shortDescription, targetAudience, problemSolved, keyBenefits,
        features, screenshots, demoUrl, videoUrl,
        appType, compatibility, languages, technologies, requirements, hosting, security,
        price, priceDA, isFree, pricingPlans, trialPeriod, paymentMethods,
        supportTypes, documentation, training, updatePolicy,
        testimonials, caseStudies, partners,
        termsOfUse, privacyPolicy, license,
        image, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, NOW(), NOW()
      )
    `

    const params = [
      data.name,
      data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      data.description,
      data.type,
      data.status,
      data.categoryId,
      
      // Informations générales
      data.logo || null,
      data.version || null,
      data.publishedAt || null,
      
      // Description détaillée
      data.tagline || null,
      data.shortDescription || null,
      data.targetAudience || null,
      data.problemSolved || null,
      data.keyBenefits ? JSON.stringify(data.keyBenefits) : null,
      
      // Fonctionnalités
      data.features ? JSON.stringify(data.features) : null,
      data.screenshots ? JSON.stringify(data.screenshots) : null,
      data.demoUrl || null,
      data.videoUrl || null,
      
      // Détails techniques
      data.appType || null,
      data.compatibility ? JSON.stringify(data.compatibility) : null,
      data.languages ? JSON.stringify(data.languages) : null,
      data.technologies ? JSON.stringify(data.technologies) : null,
      data.requirements || null,
      data.hosting || null,
      data.security || null,
      
      // Tarification
      data.price,
      data.priceDA || null,
      data.isFree,
      data.pricingPlans ? JSON.stringify(data.pricingPlans) : null,
      data.trialPeriod || null,
      data.paymentMethods ? JSON.stringify(data.paymentMethods) : null,
      
      // Support
      data.supportTypes ? JSON.stringify(data.supportTypes) : null,
      data.documentation || null,
      data.training || null,
      data.updatePolicy || null,
      
      // Témoignages
      data.testimonials ? JSON.stringify(data.testimonials) : null,
      data.caseStudies ? JSON.stringify(data.caseStudies) : null,
      data.partners ? JSON.stringify(data.partners) : null,
      
      // Légal
      data.termsOfUse || null,
      data.privacyPolicy || null,
      data.license || null,
      
      // Deprecated
      data.image || null
    ]

    const result = await execute(insertQuery, params)
    
    // Récupérer le produit créé
    return await getProductById(result.insertId.toString())
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error)
    throw new Error('Impossible de créer le produit')
  }
}

// Mettre à jour un produit
export async function updateProduct(id: string, data: Partial<ProductData>) {
  try {
    const updateFields: string[] = []
    const params: any[] = []
    
    // Informations de base
    if (data.name !== undefined) {
      updateFields.push('name = ?')
      params.push(data.name)
    }
    if (data.slug !== undefined) {
      updateFields.push('slug = ?')
      params.push(data.slug)
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?')
      params.push(data.description)
    }
    if (data.type !== undefined) {
      updateFields.push('type = ?')
      params.push(data.type)
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?')
      params.push(data.status)
    }
    if (data.categoryId !== undefined) {
      updateFields.push('categoryId = ?')
      params.push(data.categoryId)
    }
    
    // Informations générales
    if (data.logo !== undefined) {
      updateFields.push('logo = ?')
      params.push(data.logo)
    }
    if (data.version !== undefined) {
      updateFields.push('version = ?')
      params.push(data.version)
    }
    if (data.publishedAt !== undefined) {
      updateFields.push('publishedAt = ?')
      params.push(data.publishedAt)
    }
    
    // Description détaillée
    if (data.tagline !== undefined) {
      updateFields.push('tagline = ?')
      params.push(data.tagline)
    }
    if (data.shortDescription !== undefined) {
      updateFields.push('shortDescription = ?')
      params.push(data.shortDescription)
    }
    if (data.targetAudience !== undefined) {
      updateFields.push('targetAudience = ?')
      params.push(data.targetAudience)
    }
    if (data.problemSolved !== undefined) {
      updateFields.push('problemSolved = ?')
      params.push(data.problemSolved)
    }
    if (data.keyBenefits !== undefined) {
      updateFields.push('keyBenefits = ?')
      params.push(data.keyBenefits ? JSON.stringify(data.keyBenefits) : null)
    }
    
    // Fonctionnalités
    if (data.features !== undefined) {
      updateFields.push('features = ?')
      params.push(data.features ? JSON.stringify(data.features) : null)
    }
    if (data.screenshots !== undefined) {
      updateFields.push('screenshots = ?')
      params.push(data.screenshots ? JSON.stringify(data.screenshots) : null)
    }
    if (data.demoUrl !== undefined) {
      updateFields.push('demoUrl = ?')
      params.push(data.demoUrl)
    }
    if (data.videoUrl !== undefined) {
      updateFields.push('videoUrl = ?')
      params.push(data.videoUrl)
    }
    
    // Détails techniques
    if (data.appType !== undefined) {
      updateFields.push('appType = ?')
      params.push(data.appType)
    }
    if (data.compatibility !== undefined) {
      updateFields.push('compatibility = ?')
      params.push(data.compatibility ? JSON.stringify(data.compatibility) : null)
    }
    if (data.languages !== undefined) {
      updateFields.push('languages = ?')
      params.push(data.languages ? JSON.stringify(data.languages) : null)
    }
    if (data.technologies !== undefined) {
      updateFields.push('technologies = ?')
      params.push(data.technologies ? JSON.stringify(data.technologies) : null)
    }
    if (data.requirements !== undefined) {
      updateFields.push('requirements = ?')
      params.push(data.requirements)
    }
    if (data.hosting !== undefined) {
      updateFields.push('hosting = ?')
      params.push(data.hosting)
    }
    if (data.security !== undefined) {
      updateFields.push('security = ?')
      params.push(data.security)
    }
    
    // Tarification
    if (data.price !== undefined) {
      updateFields.push('price = ?')
      params.push(data.price)
    }
    if (data.priceDA !== undefined) {
      updateFields.push('priceDA = ?')
      params.push(data.priceDA)
    }
    if (data.isFree !== undefined) {
      updateFields.push('isFree = ?')
      params.push(data.isFree)
    }
    if (data.pricingPlans !== undefined) {
      updateFields.push('pricingPlans = ?')
      params.push(data.pricingPlans ? JSON.stringify(data.pricingPlans) : null)
    }
    if (data.trialPeriod !== undefined) {
      updateFields.push('trialPeriod = ?')
      params.push(data.trialPeriod)
    }
    if (data.paymentMethods !== undefined) {
      updateFields.push('paymentMethods = ?')
      params.push(data.paymentMethods ? JSON.stringify(data.paymentMethods) : null)
    }
    
    // Support
    if (data.supportTypes !== undefined) {
      updateFields.push('supportTypes = ?')
      params.push(data.supportTypes ? JSON.stringify(data.supportTypes) : null)
    }
    if (data.documentation !== undefined) {
      updateFields.push('documentation = ?')
      params.push(data.documentation)
    }
    if (data.training !== undefined) {
      updateFields.push('training = ?')
      params.push(data.training)
    }
    if (data.updatePolicy !== undefined) {
      updateFields.push('updatePolicy = ?')
      params.push(data.updatePolicy)
    }
    
    // Témoignages
    if (data.testimonials !== undefined) {
      updateFields.push('testimonials = ?')
      params.push(data.testimonials ? JSON.stringify(data.testimonials) : null)
    }
    if (data.caseStudies !== undefined) {
      updateFields.push('caseStudies = ?')
      params.push(data.caseStudies ? JSON.stringify(data.caseStudies) : null)
    }
    if (data.partners !== undefined) {
      updateFields.push('partners = ?')
      params.push(data.partners ? JSON.stringify(data.partners) : null)
    }
    
    // Légal
    if (data.termsOfUse !== undefined) {
      updateFields.push('termsOfUse = ?')
      params.push(data.termsOfUse)
    }
    if (data.privacyPolicy !== undefined) {
      updateFields.push('privacyPolicy = ?')
      params.push(data.privacyPolicy)
    }
    if (data.license !== undefined) {
      updateFields.push('license = ?')
      params.push(data.license)
    }
    
    // Deprecated
    if (data.image !== undefined) {
      updateFields.push('image = ?')
      params.push(data.image)
    }

    // Ajouter updatedAt
    updateFields.push('updatedAt = NOW()')
    
    if (updateFields.length === 1) { // Seulement updatedAt
      throw new Error('Aucune donnée à mettre à jour')
    }

    const updateQuery = `UPDATE Product SET ${updateFields.join(', ')} WHERE id = ?`
    params.push(id)

    await execute(updateQuery, params)
    
    // Récupérer le produit mis à jour
    return await getProductById(id)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    throw new Error('Impossible de mettre à jour le produit')
  }
}

// Supprimer un produit
export async function deleteProduct(id: string) {
  try {
    // Vérifier s'il y a des commandes liées à ce produit
    const orderItemsCount = await queryOne(
      'SELECT COUNT(*) as count FROM OrderItem WHERE productId = ?',
      [id]
    )

    if (orderItemsCount && orderItemsCount.count > 0) {
      throw new Error('Impossible de supprimer un produit qui a des commandes associées')
    }

    await execute('DELETE FROM Product WHERE id = ?', [id])

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    throw new Error('Impossible de supprimer le produit')
  }
}

// Récupérer les statistiques des produits
export async function getProductStats() {
  try {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      totalRevenue,
      productsByType
    ] = await Promise.all([
      queryOne('SELECT COUNT(*) as count FROM Product'),
      queryOne('SELECT COUNT(*) as count FROM Product WHERE status = ?', ['ACTIVE']),
      queryOne('SELECT COUNT(*) as count FROM Product WHERE status = ?', ['DRAFT']),
      queryOne('SELECT SUM(amount) as total FROM `Order` WHERE status = ?', ['COMPLETED']),
      queryMany('SELECT type, COUNT(*) as count FROM Product GROUP BY type')
    ])

    return {
      totalProducts: totalProducts?.count || 0,
      activeProducts: activeProducts?.count || 0,
      draftProducts: draftProducts?.count || 0,
      totalRevenue: totalRevenue?.total || 0,
      productsByType: productsByType.reduce((acc, item) => {
        acc[item.type] = item.count
        return acc
      }, {} as Record<string, number>)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw new Error('Impossible de récupérer les statistiques des produits')
  }
}

// Récupérer les catégories uniques
export async function getProductCategories() {
  try {
    const categories = await queryMany(
      'SELECT id, name FROM Category ORDER BY name ASC'
    )

    return categories
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    throw new Error('Impossible de récupérer les catégories')
  }
}