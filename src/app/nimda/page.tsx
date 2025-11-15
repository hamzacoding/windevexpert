'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp,
  Eye,
  ShoppingCart,
  FileText,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
  }>
  usersByRole: {
    CLIENT: number
    ADMIN: number
  }
  monthlyGrowth: {
    users: number
    products: number
  }
  monthlyTrend: Array<{ month: string; users: number; products: number }>
}

// Composants de statistiques
function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'blue' 
}: {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: any
  color?: string
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Composant de graphique simple (placeholder)
function SimpleChart({ title, data }: { title: string, data: Array<{ month: string; users: number; products: number }> }) {
  const maxValue = data.length
    ? Math.max(...data.map(d => Math.max(d.users, d.products)))
    : 0

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">Aucune donnée disponible</p>
            </div>
          </div>
        ) : (
          data.map(({ month, users, products }) => {
            const usersWidth = maxValue ? Math.round((users / maxValue) * 100) : 0
            const productsWidth = maxValue ? Math.round((products / maxValue) * 100) : 0
            return (
              <div key={month} className="">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">{month}</span>
                  <span className="text-xs text-gray-400">Users: {users} • Products: {products}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-blue-100 rounded relative overflow-hidden">
                    <div className="h-2 bg-blue-500" style={{ width: `${usersWidth}%` }} />
                  </div>
                  <div className="h-2 bg-purple-100 rounded relative overflow-hidden">
                    <div className="h-2 bg-purple-500" style={{ width: `${productsWidth}%` }} />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Composant de liste d'activités récentes
function RecentActivity({ recentUsers }: { recentUsers: AdminStats['recentUsers'] }) {
  const getIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Users className="h-4 w-4" />
      case 'CLIENT': return <Users className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-500 bg-red-50'
      case 'CLIENT': return 'text-blue-500 bg-blue-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure'
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs Récents</h3>
      <div className="space-y-4">
        {recentUsers.length > 0 ? (
          recentUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getColor(user.role)}`}>
                {getIcon(user.role)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'Utilisateur sans nom'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user.email} • {user.role}
                </p>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(user.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucun utilisateur récent
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrateur</h1>
        <p className="text-blue-100">
          Bienvenue dans votre espace de gestion de la plateforme WindevExpert
        </p>
        <div className="flex items-center mt-4 text-blue-100">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs Totaux"
          value={stats.totalUsers.toString()}
          change={`+${stats.monthlyGrowth.users} ce mois`}
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts.toString()}
          change={`+${stats.monthlyGrowth.products} ce mois`}
          changeType="increase"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Catégories"
          value={stats.totalCategories.toString()}
          change="Stable"
          changeType="increase"
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Admins"
          value={stats.usersByRole.ADMIN.toString()}
          change={`${stats.usersByRole.CLIENT} clients`}
          changeType="increase"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart title="Statistiques Utilisateurs" data={stats.monthlyTrend} />
        <RecentActivity recentUsers={stats.recentUsers} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/nimda/users" className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group block text-center">
            <Users className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Gérer les Utilisateurs
            </p>
          </Link>
          <Link href="/nimda/products" className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group block text-center">
            <Package className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-green-600">
              Gérer les Produits
            </p>
          </Link>
          <Link href="/nimda/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group block text-center">
            <TrendingUp className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
              Analytics
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}