import { queryOne, queryMany } from '@/lib/db'

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    role: string
    createdAt: Date
  }>
  usersByRole: {
    CLIENT: number
    ADMIN: number
  }
  monthlyGrowth: {
    users: number
    products: number
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Statistiques générales
    const [totalUsersResult, totalProductsResult, totalCategoriesResult] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM User'),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Product'),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM Category')
    ])

    const totalUsers = totalUsersResult?.count || 0
    const totalProducts = totalProductsResult?.count || 0
    const totalCategories = totalCategoriesResult?.count || 0

    // Utilisateurs récents (derniers 5)
    const recentUsersData = await queryMany<{
      id: string
      name: string | null
      email: string
      role: string
      createdAt: Date
    }>(
      `
      SELECT id, name, email, role, createdAt
      FROM User 
      ORDER BY createdAt DESC 
      LIMIT 5
    `)

    const recentUsers = recentUsersData.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }))

    // Répartition par rôle
    const roleData = await queryMany<{ role: string; count: number }>(`
      SELECT role, COUNT(*) as count 
      FROM User 
      GROUP BY role
    `)

    const roleStats = {
      CLIENT: roleData.find(r => r.role === 'CLIENT')?.count || 0,
      ADMIN: roleData.find(r => r.role === 'ADMIN')?.count || 0
    }

    // Croissance mensuelle (utilisateurs créés ce mois)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    const currentMonthStr = currentMonth.toISOString().slice(0, 19).replace('T', ' ')

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 19).replace('T', ' ')

    const [monthlyUsersResult, monthlyProductsResult, usersMonthly, productsMonthly] = await Promise.all([
      queryOne<{ count: number }>(
        `
        SELECT COUNT(*) as count 
        FROM User 
        WHERE createdAt >= ?
      `,
        [currentMonthStr]
      ),
      queryOne<{ count: number }>(
        `
        SELECT COUNT(*) as count 
        FROM Product 
        WHERE createdAt >= ?
      `,
        [currentMonthStr]
      ),
      queryMany<{ month: string; count: number }>(
        `
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count 
        FROM User 
        WHERE createdAt >= ? 
        GROUP BY month 
        ORDER BY month ASC
      `,
        [sixMonthsAgoStr]
      ),
      queryMany<{ month: string; count: number }>(
        `
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count 
        FROM Product 
        WHERE createdAt >= ? 
        GROUP BY month 
        ORDER BY month ASC
      `,
        [sixMonthsAgoStr]
      )
    ])

    const monthlyUsers = monthlyUsersResult?.count || 0
    const monthlyProducts = monthlyProductsResult?.count || 0

    const months: string[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo)
      d.setMonth(sixMonthsAgo.getMonth() + i)
      const m = d.toISOString().slice(0, 7) // YYYY-MM
      months.push(m)
    }

    const userMap = Object.fromEntries(usersMonthly.map(r => [r.month, r.count])) as Record<string, number>
    const productMap = Object.fromEntries(productsMonthly.map(r => [r.month, r.count])) as Record<string, number>

    const monthlyTrend = months.map(month => ({
      month,
      users: userMap[month] || 0,
      products: productMap[month] || 0
    }))

    return {
      totalUsers,
      totalProducts,
      totalCategories,
      recentUsers,
      usersByRole: roleStats,
      monthlyGrowth: {
        users: monthlyUsers,
        products: monthlyProducts
      },
      monthlyTrend
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin:', error)
    throw new Error('Impossible de récupérer les statistiques')
  }
}

export async function getUsersWithPagination(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit

    const [usersData, totalCountResult] = await Promise.all([
      queryMany<{
        id: string
        name: string | null
        email: string
        role: string
        is_blocked: boolean
        blocked_at: Date | null
        blocked_reason: string | null
        created_at: Date
        updated_at: Date
      }>(`
        SELECT id, name, email, role, is_blocked, blocked_at, blocked_reason, created_at, updated_at
        FROM user 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM user')
    ])

    const users = usersData.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.is_blocked,
      blockedAt: user.blocked_at,
      blockedReason: user.blocked_reason,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }))

    const totalCount = totalCountResult?.count || 0

    return {
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    throw new Error('Impossible de récupérer les utilisateurs')
  }
}

export async function getProductsWithPagination(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit

    const [productsData, totalCountResult] = await Promise.all([
      queryMany<{
        id: string
        name: string
        description: string | null
        price: number
        category_id: string
        category_name: string | null
        created_at: Date
        updated_at: Date
      }>(`
        SELECT p.id, p.name, p.description, p.price, p.category_id, c.name as category_name, p.created_at, p.updated_at
        FROM product p
        LEFT JOIN category c ON p.category_id = c.id
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM product')
    ])

    const products = productsData.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.category_id,
      category: product.category_name ? { name: product.category_name } : null,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))

    const totalCount = totalCountResult?.count || 0

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw new Error('Impossible de récupérer les produits')
  }
}