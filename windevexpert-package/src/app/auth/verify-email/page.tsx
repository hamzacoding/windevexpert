'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'resend'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('resend')
      setMessage('Aucun token de vérification fourni')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?verified=true')
        }, 3000)
      } else {
        if (response.status === 400 && data.message.includes('expiré')) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
        setMessage(data.message)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Une erreur est survenue lors de la vérification')
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error('Veuillez saisir votre adresse email')
      return
    }

    setResending(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Email de vérification renvoyé avec succès')
        setStatus('loading')
        setMessage('Vérifiez votre boîte email pour le nouveau lien de vérification')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email')
    } finally {
      setResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500" />
      case 'resend':
        return <Mail className="w-16 h-16 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
      case 'expired':
        return 'text-red-600'
      case 'resend':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
        <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Vérification d'email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>

            <h3 className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Vérification en cours...'}
              {status === 'success' && 'Email vérifié !'}
              {status === 'error' && 'Erreur de vérification'}
              {status === 'expired' && 'Lien expiré'}
              {status === 'resend' && 'Renvoyer la vérification'}
            </h3>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Votre compte est maintenant actif ! Vous allez être redirigé vers la page de connexion...
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Se connecter maintenant
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'expired' || status === 'resend') && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm mb-3">
                    Saisissez votre adresse email pour recevoir un nouveau lien de vérification :
                  </p>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    onClick={resendVerificationEmail}
                    disabled={resending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renvoyer l'email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Besoin d'aide ?{' '}
                <Link
                  href="/contact"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Contactez-nous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}