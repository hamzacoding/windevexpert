'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/loading-context'

export function usePageTransition() {
  const router = useRouter()
  const { startPageTransition } = useLoading()

  const navigateWithTransition = (href: string) => {
    startPageTransition()
    // Navigation immédiate pour affichage instantané du loader
    router.push(href)
  }

  const replaceWithTransition = (href: string) => {
    startPageTransition()
    router.replace(href)
  }

  const backWithTransition = () => {
    startPageTransition()
    router.back()
  }

  return {
    push: navigateWithTransition,
    replace: replaceWithTransition,
    back: backWithTransition,
  }
}