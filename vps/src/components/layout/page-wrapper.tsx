'use client'

import { useLoading } from '@/contexts/loading-context'
import { PageLoader } from '@/components/ui/page-loader'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const { isLoading } = useLoading()

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  )
}