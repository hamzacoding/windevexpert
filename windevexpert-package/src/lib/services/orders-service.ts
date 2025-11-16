import { prisma } from '@/lib/prisma'

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

function mapUiStatusFromOrderStatus(status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'): OrderData['status'] {
  switch (status) {
    case 'PENDING':
      return 'PENDING'
    case 'PAID':
      return 'COMPLETED'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'REFUNDED':
      return 'CANCELLED'
    default:
      return 'PENDING'
  }
}

function mapPaymentStatusFromOrderStatus(status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'): OrderData['paymentStatus'] {
  switch (status) {
    case 'PENDING':
      return 'PENDING'
    case 'PAID':
      return 'PAID'
    case 'CANCELLED':
      return 'FAILED'
    case 'REFUNDED':
      return 'REFUNDED'
    default:
      return 'PENDING'
  }
}

function mapOrderStatusFilter(uiStatus?: string): 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | undefined {
  if (!uiStatus || uiStatus === 'all') return undefined
  if (uiStatus === 'PENDING') return 'PENDING'
  if (uiStatus === 'COMPLETED') return 'PAID'
  if (uiStatus === 'CANCELLED') return 'CANCELLED'
  if (uiStatus === 'CONFIRMED' || uiStatus === 'IN_PROGRESS') return 'PENDING'
  return undefined
}

function mapOrderStatusFromPaymentFilter(payment?: string): 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | undefined {
  if (!payment || payment === 'all') return undefined
  if (payment === 'PENDING') return 'PENDING'
  if (payment === 'PAID') return 'PAID'
  if (payment === 'FAILED') return 'CANCELLED'
  if (payment === 'REFUNDED') return 'REFUNDED'
  return undefined
}

export async function getOrders(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  paymentStatus?: string,
  userId?: string
): Promise<OrdersResponse> {
  const skip = (page - 1) * limit

  const where: any = {}

  const statusFilter = mapOrderStatusFilter(status)
  const paymentFilter = mapOrderStatusFromPaymentFilter(paymentStatus)

  if (statusFilter) where.status = statusFilter
  if (paymentFilter) where.status = paymentFilter
  if (userId) where.userId = userId
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { items: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } }
    ]
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, type: true, price: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    orders: orders.map((order) => {
      const firstItem = order.items[0]
      return {
        id: order.id,
        userId: order.userId,
        productId: firstItem?.productId || '',
        status: mapUiStatusFromOrderStatus(order.status),
        amount: Number(order.total || 0),
        paymentStatus: mapPaymentStatusFromOrderStatus(order.status),
        paymentMethod: order.paymentMethod || undefined,
        notes: undefined,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user as any,
        product: {
          id: firstItem?.product?.id || '',
          title: firstItem?.product?.name || '',
          type: String(firstItem?.product?.type || ''),
          price: Number(firstItem?.price ?? firstItem?.product?.price ?? 0)
        }
      }
    }),
    totalCount,
    totalPages,
    currentPage: page
  }
}

export async function getOrderById(id: string): Promise<OrderData | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, name: true, type: true, price: true } } } }
    }
  })

  if (!order) return null

  const firstItem = order.items[0]
  return {
    id: order.id,
    userId: order.userId,
    productId: firstItem?.productId || '',
    status: mapUiStatusFromOrderStatus(order.status),
    amount: Number(order.total || 0),
    paymentStatus: mapPaymentStatusFromOrderStatus(order.status),
    paymentMethod: order.paymentMethod || undefined,
    notes: undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user as any,
    product: {
      id: firstItem?.product?.id || '',
      title: firstItem?.product?.name || '',
      type: String(firstItem?.product?.type || ''),
      price: Number(firstItem?.price ?? firstItem?.product?.price ?? 0)
    }
  }
}

export async function createOrder(data: {
  userId: string
  productId: string
  amount: number
  paymentMethod?: string
  notes?: string
}): Promise<OrderData> {
  const [user, product] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.userId } }),
    prisma.product.findUnique({ where: { id: data.productId } })
  ])

  if (!user) throw new Error('Utilisateur non trouvé')
  if (!product) throw new Error('Produit non trouvé')

  const linePrice = Number(product.price ?? data.amount)

  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      total: Number(data.amount),
      status: 'PENDING',
      paymentMethod: data.paymentMethod
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, name: true, type: true, price: true } } } }
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: data.productId,
      quantity: 1,
      price: linePrice
    }
  })

  const created = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, name: true, type: true, price: true } } } }
    }
  })

  const firstItem = created!.items[0]
  return {
    id: created!.id,
    userId: created!.userId,
    productId: firstItem?.productId || '',
    status: mapUiStatusFromOrderStatus(created!.status),
    amount: Number(created!.total || 0),
    paymentStatus: mapPaymentStatusFromOrderStatus(created!.status),
    paymentMethod: created!.paymentMethod || undefined,
    notes: undefined,
    createdAt: created!.createdAt.toISOString(),
    updatedAt: created!.updatedAt.toISOString(),
    user: created!.user as any,
    product: {
      id: firstItem?.product?.id || '',
      title: firstItem?.product?.name || '',
      type: String(firstItem?.product?.type || ''),
      price: Number(firstItem?.price ?? firstItem?.product?.price ?? 0)
    }
  }
}

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
  const toUpdate: any = {}
  if (data.amount != null) toUpdate.total = Number(data.amount)
  if (data.paymentMethod != null) toUpdate.paymentMethod = data.paymentMethod
  if (data.status) {
    if (data.status === 'PENDING') toUpdate.status = 'PENDING'
    else if (data.status === 'COMPLETED') toUpdate.status = 'PAID'
    else if (data.status === 'CANCELLED') toUpdate.status = 'CANCELLED'
  }

  const order = await prisma.order.update({
    where: { id },
    data: toUpdate,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, name: true, type: true, price: true } } } }
    }
  })

  const firstItem = order.items[0]
  return {
    id: order.id,
    userId: order.userId,
    productId: firstItem?.productId || '',
    status: mapUiStatusFromOrderStatus(order.status),
    amount: Number(order.total || 0),
    paymentStatus: mapPaymentStatusFromOrderStatus(order.status),
    paymentMethod: order.paymentMethod || undefined,
    notes: undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user as any,
    product: {
      id: firstItem?.product?.id || '',
      title: firstItem?.product?.name || '',
      type: String(firstItem?.product?.type || ''),
      price: Number(firstItem?.price ?? firstItem?.product?.price ?? 0)
    }
  }
}

export async function deleteOrder(id: string): Promise<void> {
  await prisma.order.delete({ where: { id } })
}

export async function getOrderStats(): Promise<OrderStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalOrders, pendingOrders, completedOrders, totalRevenue, monthlyRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } })
  ])

  const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    monthlyRevenue: monthlyRevenue._sum.total || 0,
    averageOrderValue
  }
}

export function getOrderStatuses() {
  return [
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminée' },
    { value: 'CANCELLED', label: 'Annulée' }
  ]
}

export function getPaymentStatuses() {
  return [
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID', label: 'Payé' },
    { value: 'FAILED', label: 'Échec' },
    { value: 'REFUNDED', label: 'Remboursé' }
  ]
}
