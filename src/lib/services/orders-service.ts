import { prisma } from '@/lib/prisma'

// Types pour les commandes
export interface OrderData {
  id: string
  userId: string
  productId: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  amount: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  product: {
    id: string
    title: string
    type: string
    price: number
  }
}

export interface OrdersResponse {
  orders: OrderData[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
}

// Récupérer les commandes avec pagination et filtres
export async function getOrders(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  paymentStatus?: string,
  userId?: string
): Promise<OrdersResponse> {
  const skip = (page - 1) * limit

  // Construction des filtres
  const where: any = {}

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { product: { title: { contains: search, mode: 'insensitive' } } }
    ]
  }

  if (status && status !== 'all') {
    where.status = status
  }

  if (paymentStatus && paymentStatus !== 'all') {
    where.paymentStatus = paymentStatus
  }

  if (userId) {
    where.userId = userId
  }

  // Récupération des commandes
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    orders: orders.map(order => ({
      id: order.id,
      userId: order.userId,
      productId: order.productId,
      status: order.status as any,
      amount: order.amount,
      paymentStatus: order.paymentStatus as any,
      paymentMethod: order.paymentMethod || undefined,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user,
      product: order.product
    })),
    totalCount,
    totalPages,
    currentPage: page
  }
}

// Récupérer une commande par ID
export async function getOrderById(id: string): Promise<OrderData | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          title: true,
          type: true,
          price: true
        }
      }
    }
  })

  if (!order) return null

  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    status: order.status as any,
    amount: order.amount,
    paymentStatus: order.paymentStatus as any,
    paymentMethod: order.paymentMethod || undefined,
    notes: order.notes || undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user,
    product: order.product
  }
}

// Créer une nouvelle commande
export async function createOrder(data: {
  userId: string
  productId: string
  amount: number
  paymentMethod?: string
  notes?: string
}): Promise<OrderData> {
  // Vérifier que l'utilisateur et le produit existent
  const [user, product] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.userId } }),
    prisma.product.findUnique({ where: { id: data.productId } })
  ])

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  if (!product) {
    throw new Error('Produit non trouvé')
  }

  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: data.paymentMethod,
      notes: data.notes
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          title: true,
          type: true,
          price: true
        }
      }
    }
  })

  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    status: order.status as any,
    amount: order.amount,
    paymentStatus: order.paymentStatus as any,
    paymentMethod: order.paymentMethod || undefined,
    notes: order.notes || undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user,
    product: order.product
  }
}

// Mettre à jour une commande
export async function updateOrder(
  id: string,
  data: {
    status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
    paymentMethod?: string
    notes?: string
    amount?: number
  }
): Promise<OrderData> {
  const order = await prisma.order.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      product: {
        select: {
          id: true,
          title: true,
          type: true,
          price: true
        }
      }
    }
  })

  return {
    id: order.id,
    userId: order.userId,
    productId: order.productId,
    status: order.status as any,
    amount: order.amount,
    paymentStatus: order.paymentStatus as any,
    paymentMethod: order.paymentMethod || undefined,
    notes: order.notes || undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user,
    product: order.product
  }
}

// Supprimer une commande
export async function deleteOrder(id: string): Promise<void> {
  await prisma.order.delete({
    where: { id }
  })
}

// Récupérer les statistiques des commandes
export async function getOrderStats(): Promise<OrderStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    monthlyRevenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { amount: true }
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })
  ])

  const averageOrderValue = totalOrders > 0 
    ? (totalRevenue._sum.amount || 0) / totalOrders 
    : 0

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    averageOrderValue
  }
}

// Récupérer les statuts de commande disponibles
export function getOrderStatuses() {
  return [
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminée' },
    { value: 'CANCELLED', label: 'Annulée' }
  ]
}

// Récupérer les statuts de paiement disponibles
export function getPaymentStatuses() {
  return [
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID', label: 'Payé' },
    { value: 'FAILED', label: 'Échec' },
    { value: 'REFUNDED', label: 'Remboursé' }
  ]
}