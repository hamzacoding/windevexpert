'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { LoadingProvider } from '@/contexts/loading-context'
import { CartProvider } from '@/contexts/cart-context'
import { ToastProvider } from '@/contexts/toast-context'

export function Providers({ children, initialSession }: { children: React.ReactNode, initialSession?: Session | null }) {
  return (
    <SessionProvider session={initialSession} refetchOnWindowFocus={false}>
      <LoadingProvider>
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </LoadingProvider>
    </SessionProvider>
  )
}