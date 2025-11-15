'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function MemberPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      // Not authenticated, redirect to signin
      router.push('/auth/signin')
      return
    }

    // Authenticated, redirect based on role
    if (session.user?.role === 'ADMIN') {
      router.push('/nimda')
    } else {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirection en cours...
        </h2>
        <p className="text-gray-600">
          Vous allez être redirigé vers votre espace membre
        </p>
      </div>
    </div>
  )
}