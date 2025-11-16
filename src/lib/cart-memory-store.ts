import { Cart, CartItem, Product } from '@/types/product'

type Key = string
const mem = new Map<Key, Cart>()

function keyFor(userId?: string, sessionId?: string): Key {
  return userId ? `u:${userId}` : `s:${sessionId ?? 'guest'}`
}

function now(): Date { return new Date() }

export function getMemCart(userId?: string, sessionId?: string): Cart | null {
  const k = keyFor(userId, sessionId)
  return mem.get(k) || null
}

export function createMemCart(userId?: string, sessionId?: string): Cart {
  const id = `mem_${Math.random().toString(36).slice(2)}`
  const cart: Cart = {
    id,
    userId,
    sessionId,
    items: [],
    total: 0,
    currency: 'EUR',
    createdAt: now(),
    updatedAt: now(),
  }
  mem.set(keyFor(userId, sessionId), cart)
  return cart
}

export function addMemItem(
  userId: string | undefined,
  sessionId: string | undefined,
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price'>,
  quantity: number,
): Cart {
  const k = keyFor(userId, sessionId)
  const cart = mem.get(k) ?? createMemCart(userId, sessionId)
  const existing = cart.items.find((i) => i.productId === product.id)
  if (existing) {
    existing.quantity += quantity
    existing.addedAt = now()
  } else {
    const item: CartItem = {
      productId: product.id,
      product: {
        ...(product as any),
        isFree: product.price === 0,
        status: 'PUBLISHED',
        categoryId: cart.items[0]?.product.categoryId || 'unknown',
        rating: 4.5,
        enrollments: 0,
        createdAt: now(),
        updatedAt: now(),
        description: '',
        type: 'software',
        name: product.name || 'Produit',
        slug: product.slug || product.id,
      } as any,
      quantity,
      price: Number(product.price || 0),
      addedAt: now(),
    }
    cart.items.push(item)
  }
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  cart.updatedAt = now()
  mem.set(k, cart)
  return cart
}
