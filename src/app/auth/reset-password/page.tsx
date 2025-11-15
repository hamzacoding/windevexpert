'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    // Vérifier la validité du token
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        setTokenValid(response.ok)
      } catch (error) {
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (response.ok) {
        toast.success('Mot de passe réinitialisé avec succès !')
        router.push('/auth/signin?message=password-reset-success')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification du lien...</p>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
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
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Lien invalide
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-white/20">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                Ce lien de réinitialisation est invalide ou a expiré.
                Veuillez demander un nouveau lien de réinitialisation.
              </p>
              <div className="space-y-4">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Demander un nouveau lien
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          Nouveau mot de passe
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-white/20 hover:shadow-xl transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                {...register('password')}
                type="password"
                label="Nouveau mot de passe"
                id="password"
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="new-password"
                autoFocus
              />
            </div>

            <div>
              <Input
                {...register('confirmPassword')}
                type="password"
                label="Confirmer le mot de passe"
                id="confirmPassword"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                Réinitialiser le mot de passe
              </Button>
            </div>

            <div className="text-center">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}