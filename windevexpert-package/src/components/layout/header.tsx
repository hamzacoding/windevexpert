'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, BookOpen, Briefcase } from 'lucide-react'
import { CartIcon } from '@/components/cart/cart-icon'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Formations', href: '/formations' },
    { name: 'Produits', href: '/produits' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo à gauche */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group">
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

          {/* Menu centré */}
          <div className="hidden sm:flex sm:space-x-8 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/lesson/lesson-1"
              className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              Démo Vidéo
            </Link>
          </div>

          {/* Boutons à droite */}

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-20 rounded-xl"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <CartIcon />
                
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/nimda"
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:scale-110 hover:shadow-lg"
                  >
                    <Briefcase className="h-5 w-5" />
                  </Link>
                )}
                
                <Link
                  href="/espace-membre"
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-xl transition-all duration-300 hover:bg-blue-50 hover:scale-110 hover:shadow-lg"
                >
                  <User className="h-5 w-5" />
                </Link>
                
                <button
                  onClick={() => signOut()}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-blue-50 hover:scale-105"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg mt-2 mx-2 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="border-transparent text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-600 block pl-3 pr-4 py-2 border-l-4 text-base font-medium rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg mt-2 mx-2 p-4">
              {session ? (
                <div className="space-y-1">
                  <Link
                    href="/espace-membre"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Espace Membre
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/nimda"
                      className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/auth/signin"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}