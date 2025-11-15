'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Compte créé avec succès ! Vérifiez votre email.')
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
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

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/member' })
    } catch (error) {
      toast.error('Erreur lors de l\'inscription avec Google')
      setLoading(false)
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
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            href="/auth/signin"
            className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-white/20 hover:shadow-xl transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent mb-1">
                Nom complet
              </label>
              <Input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Votre nom complet"
                error={errors.name?.message}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent mb-1">
                Adresse email
              </label>
              <Input
                {...register('email')}
                type="email"
                id="email"
                placeholder="votre@email.com"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent mb-1">
                Mot de passe
              </label>
              <Input
                {...register('password')}
                type="password"
                id="password"
                placeholder="••••••••"
                error={errors.password?.message}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent mb-1">
                Confirmer le mot de passe
              </label>
              <Input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
              />
            </div>

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                Créer mon compte
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-gray-200 to-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 backdrop-blur-sm text-gray-500 font-medium">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-gray-50/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Continuer avec Google</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}