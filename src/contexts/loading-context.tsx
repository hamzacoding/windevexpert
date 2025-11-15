'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startPageTransition: () => void
  finishPageTransition: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const startPageTransition = () => {
    setIsLoading(true)
  }

  const finishPageTransition = () => {
    // Délai optimisé pour une transition fluide mais réactive
    setTimeout(() => {
      setIsLoading(false)
    }, 600)
  }

  // Gérer les changements de route
  useEffect(() => {
    const handleComplete = () => {
      finishPageTransition()
    }

    // Délai réduit pour une meilleure réactivité
    const timeoutId = setTimeout(handleComplete, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  // Loader initial au chargement de la page (réduit)
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const value = {
    isLoading,
    setLoading,
    startPageTransition,
    finishPageTransition,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}