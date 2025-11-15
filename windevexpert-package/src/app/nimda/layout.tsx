'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  MessageSquare,
  Shield,
  Menu,
  X,
  Home,
  ChevronRight,
  Loader2,
  Mail,
  Edit3,
  BookOpen,
  Quote,
  LogOut,
  User,
  ChevronDown,
  Phone,
  Banknote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/admin/NotificationBell'

const navigation = [
  {
    name: 'Vue d\'ensemble',
    href: '/nimda',
    icon: LayoutDashboard,
    description: 'Statistiques générales de la plateforme'
  },
  {
    name: 'Utilisateurs',
    href: '/nimda/users',
    icon: Users,
    description: 'Gestion des clients et comptes'
  },
  {
    name: 'Produits & Services',
    href: '/nimda/products',
    icon: Package,
    description: 'Catalogue et gestion des offres'
  },
  {
    name: 'Formations',
    href: '/nimda/formations',
    icon: BookOpen,
    description: 'Gestion des cours et formations'
  },
  {
    name: 'Commandes',
    href: '/nimda/orders',
    icon: CreditCard,
    description: 'Suivi des ventes et paiements'
  },
  {
    name: 'Projets',
    href: '/nimda/projects',
    icon: FileText,
    description: 'Gestion des projets clients'
  },
  {
    name: 'Demandes de devis',
    href: '/nimda/quotes',
    icon: Quote,
    description: 'Gestion des demandes de devis'
  },
  {
    name: 'Messages',
    href: '/nimda/messages',
    icon: MessageSquare,
    description: 'Support et communications'
  },
  {
    name: 'Templates d\'emails',
    href: '/nimda/email-templates',
    icon: Mail,
    description: 'Gestion des modèles d\'emails'
  },
  {
    name: 'Gestion du contenu',
    href: '/nimda/page-content',
    icon: FileText,
    description: 'CMS et gestion du contenu des pages'
  },
  {
    name: 'Paramètres de Contact',
    href: '/nimda/contact-settings',
    icon: Phone,
    description: 'Gestion des coordonnées et informations de contact'
  },
  {
    name: 'Analytics',
    href: '/nimda/analytics',
    icon: BarChart3,
    description: 'Rapports et analyses détaillées'
  },
  {
    name: 'Paramètres de Paiement',
    href: '/nimda/payment-settings',
    icon: Banknote,
    description: 'Configuration des méthodes de paiement'
  },
  {
    name: 'Gestion des Factures',
    href: '/nimda/invoices',
    icon: FileText,
    description: 'Validation des paiements et factures'
  },
  {
    name: 'Paramètres',
    href: '/nimda/settings',
    icon: Settings,
    description: 'Configuration de la plateforme'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Protection de l'accès admin
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        const target = event.target as Element
        if (!target.closest('[data-user-menu]')) {
          setUserMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  // Affichage du loader pendant la vérification
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification des permissions...
          </h2>
          <p className="text-gray-600">
            Accès au dashboard administrateur
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
            <Link href="/nimda" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image
                src="/windevexpert-logo-106x60.png"
                alt="WindevExpert Admin"
                width={106}
                height={60}
                className="h-8 w-auto brightness-0 invert object-contain"
              />
              <span className="text-sm font-medium text-white">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'Administrateur'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Propriétaire de la plateforme
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Accueil
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Administration</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-blue-600 text-sm font-medium"
              >
                Espace Client
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-600 text-sm font-medium"
              >
                Site Public
              </Link>
              
              {/* User Menu */}
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {session?.user?.name || 'Admin'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name || 'Administrateur'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.email || ''}
                      </p>
                    </div>
                    <Link
                      href="/nimda/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon Profil
                    </Link>
                    <Link
                      href="/nimda/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}