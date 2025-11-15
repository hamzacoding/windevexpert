'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, Mail } from 'lucide-react'

export default function BlockedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Redirection automatique après 10 secondes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleRedirectNow = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center group">
          <div className="relative">
            <Image
              src="/windevexpert-logo-106x60.png"
              alt="WindevExpert"
              width={106}
              height={60}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-red-200 hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            {/* Icône d'alerte */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Accès bloqué
            </h2>

            {/* Message principal */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm leading-relaxed">
                Votre compte a été temporairement suspendu. 
                Pour plus d'informations ou pour résoudre cette situation, 
                veuillez contacter l'administrateur du site.
              </p>
            </div>

            {/* Informations de contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Contact administrateur</span>
              </div>
              <p className="text-blue-700 text-sm">
                Email : admin@windevexpert.com
              </p>
            </div>

            {/* Compteur de redirection */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">
                Redirection automatique vers l'accueil dans :
              </p>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300">
                <span className="text-xl font-bold text-gray-700">{countdown}</span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                onClick={handleRedirectNow}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Retourner à l'accueil maintenant
              </Button>

              <Link href="mailto:admin@windevexpert.com" className="block">
                <Button
                  variant="outline"
                  className="w-full border-2 border-blue-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:bg-blue-50/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter l'administrateur
                </Button>
              </Link>
            </div>

            {/* Note légale */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cette mesure est prise conformément à nos conditions d'utilisation 
                pour assurer la sécurité et la qualité de nos services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}