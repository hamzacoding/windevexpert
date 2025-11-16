'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { getSessionParams, getSessionId } from '@/lib/utils/session'
import { useToast } from './toast-context'

interface CartContextType {
  itemCount: number
  refreshCartCount: () => Promise<void>
  addToCartWithUpdate: (productId: string, quantity?: number, productName?: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0)
  const { data: session } = useSession()
  const { showCartSuccess, showCartError } = useToast()

  const loadCartCount = async () => {
    try {
      const sid = getSessionId()
      const response = await fetch(`/api/cart/count?sessionId=${sid}`)
      
      if (!response.ok) {
        throw new Error('Failed to load cart count')
      }
      
      const data = await response.json()
      console.log('[Cart] Count response', data)
      setItemCount(data.count || 0)
    } catch (error) {
      console.error('Error loading cart count:', error)
      setItemCount(0)
    }
  }

  const addToCartWithUpdate = async (productId: string, quantity: number = 1, productName?: string): Promise<void> => {
    const sessionParams = getSessionParams(session?.user?.id)
    const start = performance.now?.() || Date.now()
    let attempts = 0
    const maxAttempts = 3
    const baseDelay = 200

    // Optimistic UI: incrément immédiat
    setItemCount((prev) => prev + (quantity || 1))

    const tryPost = async (): Promise<Response> => {
      attempts++
      console.log('[Cart] POST /api/cart body', { productId, quantity, ...sessionParams })
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, ...sessionParams }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error(`[Cart] POST /api/cart failed (attempt ${attempts}/${maxAttempts}) status=${res.status} body=${text}`)
        throw new Error(`Add to cart failed: ${res.status}`)
      }
      return res
    }

    try {
      let lastError: any = null
      for (let i = 0; i < maxAttempts; i++) {
        try {
          await tryPost()
          // Sync count (server truth)
          await loadCartCount()
          try { localStorage.setItem('cart_updated', Date.now().toString()) } catch {}
          const elapsed = (performance.now?.() || Date.now()) - start
          if (elapsed > 500) {
            console.log(`[Cart] UI responded immediately; server completed in ${Math.round(elapsed)}ms`)
          }
          showCartSuccess(productName)
          return
        } catch (err) {
          lastError = err
          const delay = baseDelay * Math.pow(2, i)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }
      throw lastError
    } catch (error) {
      // Rollback optimistic UI
      setItemCount((prev) => Math.max(0, prev - (quantity || 1)))
      console.error('[Cart] Error adding to cart:', error)
      showCartError()
      throw error
    }
  }

  useEffect(() => {
    loadCartCount()
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sessionId' || e.key === 'cart_updated') {
        loadCartCount()
      }
    }
    try { window.addEventListener('storage', onStorage) } catch {}
    return () => {
      try { window.removeEventListener('storage', onStorage) } catch {}
    }
  }, [session])

  const value: CartContextType = {
    itemCount,
    refreshCartCount: loadCartCount,
    addToCartWithUpdate
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
