'use client'

import { useLoading } from '@/contexts/loading-context'

export function PageLoader() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md pointer-events-none">
      <div className="text-center space-y-8">
        {/* Logo avec animation sophistiquée */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            
          </div>
        </div>

        {/* Texte élégant */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WindevExpert
          </h3>
          <p className="text-gray-600 font-medium">Préparation de votre espace...</p>
        </div>

        

        {/* Spinner moderne alternatif */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
