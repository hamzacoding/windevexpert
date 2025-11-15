'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  Award,
  BarChart3,
  MessageSquare,
  Download,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
  ChevronDown,
  Heart,
  ShoppingBag,
  GraduationCap,
  ExternalLink,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble de votre progression'
  },
  {
    name: 'Mes Formations',
    href: '/dashboard/courses',
    icon: BookOpen,
    description: 'Formations en cours et terminées'
  },
  {
    name: 'Mon Profil',
    href: '/dashboard/profile',
    icon: User,
    description: 'Informations personnelles et préférences'
  },
  {
    name: 'Mes Succès',
    href: '/dashboard/achievements',
    icon: Award,
    description: 'Badges et récompenses obtenus'
  },
  {
    name: 'Statistiques',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Analyse de votre progression'
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    description: 'Communications et support'
  },
  {
    name: 'Téléchargements',
    href: '/dashboard/downloads',
    icon: Download,
    description: 'Ressources et fichiers téléchargés'
  },
  {
    name: 'Facturation',
    href: '/dashboard/billing',
    icon: CreditCard,
    description: 'Abonnements et factures'
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuration du compte'
  }
]

const exploreNavigation = [
  {
    name: 'Toutes les Formations',
    href: '/formations',
    icon: GraduationCap,
    description: 'Explorer le catalogue complet'
  },
  {
    name: 'Produits & Services',
    href: '/produits',
    icon: ShoppingBag,
    description: 'Découvrir nos offres'
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: FileText,
    description: 'Articles et actualités'
  }
]

// Composant pour l'avatar utilisateur
function UserAvatar({ session, size = 'w-10 h-10' }: { session: any; size?: string }) {
  const profileImage = session?.user?.profileImage || session?.user?.image
  const sanitizedImage = typeof profileImage === 'string' 
    ? profileImage.replace(/\)+$/, '') 
    : profileImage
  
  if (sanitizedImage) {
    return (
      <div className={`${size} rounded-full overflow-hidden shadow-lg ring-2 ring-white`}>
        <Image
          src={sanitizedImage}
          alt={session?.user?.name || 'Photo de profil'}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  return (
    <div className={`${size} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg`}>
      <User className="h-5 w-5 text-white" />
    </div>
  )
}

function UserMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const userMenuItems = [
    {
      name: 'Mon Profil',
      href: '/dashboard/profile',
      icon: User,
      description: 'Gérer mes informations personnelles'
    },
    {
      name: 'Mes Cours',
      href: '/dashboard/courses',
      icon: BookOpen,
      description: 'Formations en cours et terminées'
    },
    {
      name: 'Mes Achats',
      href: '/dashboard/billing',
      icon: ShoppingBag,
      description: 'Historique des achats et factures'
    },
    {
      name: 'Mes Certificats',
      href: '/dashboard/achievements',
      icon: GraduationCap,
      description: 'Certificats et badges obtenus'
    },
    {
      name: 'Mes Favoris',
      href: '/dashboard/favorites',
      icon: Heart,
      description: 'Formations et contenus favoris'
    },
    {
      name: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Configuration du compte'
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <UserAvatar session={session} />
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
            {session?.user?.name || 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-32">
            {session?.user?.email || ''}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <UserAvatar session={session} size="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {session?.user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {userMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <item.icon className="h-5 w-5 text-gray-500 mr-3 group-hover:text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-medium">Se déconnecter</p>
                <p className="text-xs text-red-500">Fermer la session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Sidebar({ isOpen, onClose, session }: { isOpen: boolean; onClose: () => void; session: any }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Header avec logo et profil utilisateur */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity flex-1">
          <Image
            src="/windevexpert-logo-106x60.png"
            alt="WindevExpert"
            width={120}
            height={68}
            className="object-contain mx-auto"
          />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-md transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Profil utilisateur */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <UserAvatar session={session} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Espace Client
            </p>
          </div>
        </div>
      </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
            {/* Section Mon Espace */}
            <div className="space-y-2">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mon Espace
              </h3>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-md'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                    `} />
                    <span className="flex-1 font-semibold">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Section Explorer */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Explorer
              </h3>
              {exploreNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-gray-900 hover:shadow-md'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}
                    `} />
                    <span className="flex-1 font-semibold">{item.name}</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-green-600" />
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white ml-1" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
  )
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    
    // Convert segment to readable name
    const name = segment === 'dashboard' ? 'Tableau de bord' :
                 segment === 'courses' ? 'Formations' :
                 segment === 'profile' ? 'Profil' :
                 segment === 'achievements' ? 'Succès' :
                 segment === 'analytics' ? 'Statistiques' :
                 segment === 'messages' ? 'Messages' :
                 segment === 'downloads' ? 'Téléchargements' :
                 segment === 'billing' ? 'Facturation' :
                 segment === 'settings' ? 'Paramètres' :
                 segment.charAt(0).toUpperCase() + segment.slice(1)
    
    return { name, href, isLast }
  })

  if (breadcrumbItems.length <= 1) return null

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {item.isLast ? (
              <span className="text-sm font-medium text-gray-900">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} session={session} />
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
              <Breadcrumb />
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Bell className="h-5 w-5" />
                  <span className="hidden xl:inline">Notifications</span>
                </div>
              </div>
              <Link
                href="/nimda"
                className="text-gray-500 hover:text-blue-600 text-sm font-medium"
              >
                Administration
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-600 text-sm font-medium"
              >
                Site Web
              </Link>
              <UserMenu session={session} />
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