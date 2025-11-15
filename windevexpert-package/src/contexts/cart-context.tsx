'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { getSessionParams } from '@/lib/utils/session'
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
      const sessionParams = getSessionParams(session?.user?.id)
      
      const response = await fetch(`/api/cart/count?sessionId=${sessionParams.sessionId || ''}`)
      
      if (!response.ok) {
        throw new Error('Failed to load cart count')
      }
      
      const data = await response.json()
      setItemCount(data.count || 0)
    } catch (error) {
      console.error('Error loading cart count:', error)
      setItemCount(0)
    }
  }

  const addToCartWithUpdate = async (productId: string, quantity: number = 1, productName?: string): Promise<void> => {
    try {
      const sessionParams = getSessionParams(session?.user?.id)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          ...sessionParams
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      // Refresh cart count after successful addition
      await loadCartCount()
      
      // Show success toast
      showCartSuccess(productName)
    } catch (error) {
      console.error('Error adding to cart:', error)
      showCartError()
    }
  }

  useEffect(() => {
    loadCartCount()
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