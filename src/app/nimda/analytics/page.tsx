'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Euro,
  Eye,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  ShoppingCart,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// Types
interface MetricCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: any
  color: string
}

interface ChartData {
  name: string
  value: number
  color: string
}

// Données d'exemple
const metricsData: MetricCard[] = [
  {
    title: 'Revenus Totaux',
    value: '€45,678',
    change: '+15.3%',
    changeType: 'increase',
    icon: Euro,
    color: 'green'
  },
  {
    title: 'Nouveaux Utilisateurs',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase',
    icon: Users,
    color: 'blue'
  },
  {
    title: 'Taux de Conversion',
    value: '3.4%',
    change: '-0.5%',
    changeType: 'decrease',
    icon: Target,
    color: 'purple'
  },
  {
    title: 'Commandes',
    value: '156',
    change: '+12.1%',
    changeType: 'increase',
    icon: ShoppingCart,
    color: 'orange'
  }
]

const revenueData: ChartData[] = [
  { name: 'Jan', value: 4000, color: '#3B82F6' },
  { name: 'Fév', value: 3000, color: '#3B82F6' },
  { name: 'Mar', value: 5000, color: '#3B82F6' },
  { name: 'Avr', value: 4500, color: '#3B82F6' },
  { name: 'Mai', value: 6000, color: '#3B82F6' },
  { name: 'Juin', value: 5500, color: '#3B82F6' }
]

const topProducts = [
  { name: 'Formation React Avancé', sales: 156, revenue: 46680 },
  { name: 'Service E-commerce', sales: 23, revenue: 57500 },
  { name: 'Template Dashboard', sales: 89, revenue: 7921 },
  { name: 'Formation Node.js', sales: 67, revenue: 13333 }
]

// Composant de carte métrique
function MetricCard({ metric }: { metric: MetricCard }) {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  const Icon = metric.icon

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
          <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
          <div className="flex items-center mt-2">
            {metric.changeType === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Composant de graphique simple
function SimpleBarChart({ data, title }: { data: ChartData[], title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
          <Download className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-600 font-medium">
              {item.name}
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
            <div className="w-16 text-sm text-gray-900 font-semibold text-right">
              €{item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant de tableau des top produits
function TopProductsTable() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Produits les Plus Vendus</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.sales} ventes</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    €{product.revenue.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(product.sales / 156) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((product.sales / 156) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Composant d'activité récente
function RecentActivity() {
  const activities = [
    {
      type: 'sale',
      message: 'Nouvelle vente',
      details: 'Formation React Avancé - €299',
      time: 'Il y a 5 min',
      color: 'text-green-600'
    },
    {
      type: 'user',
      message: 'Nouvel utilisateur',
      details: 'Jean Dupont s\'est inscrit',
      time: 'Il y a 15 min',
      color: 'text-blue-600'
    },
    {
      type: 'goal',
      message: 'Objectif atteint',
      details: '100 ventes ce mois',
      time: 'Il y a 1h',
      color: 'text-purple-600'
    },
    {
      type: 'review',
      message: 'Nouvel avis',
      details: '5 étoiles sur Formation React',
      time: 'Il y a 2h',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.message}</p>
              <p className="text-sm text-gray-500">{activity.details}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporter les données')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
              Analytics & Rapports
            </h1>
            <p className="text-gray-600 mt-1">
              Analysez les performances de votre plateforme
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart data={revenueData} title="Revenus Mensuels" />
        <RecentActivity />
      </div>

      {/* Tableau des top produits */}
      <TopProductsTable />

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trafic</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pages vues</span>
              <span className="text-sm font-semibold text-gray-900">12,456</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visiteurs uniques</span>
              <span className="text-sm font-semibold text-gray-900">3,421</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux de rebond</span>
              <span className="text-sm font-semibold text-gray-900">34.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Temps moyen</span>
              <span className="text-sm font-semibold text-gray-900">4m 32s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pages par session</span>
              <span className="text-sm font-semibold text-gray-900">2.8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux de retour</span>
              <span className="text-sm font-semibold text-gray-900">68.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Note moyenne</span>
              <span className="text-sm font-semibold text-gray-900">4.7/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Satisfaction client</span>
              <span className="text-sm font-semibold text-gray-900">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Recommandations</span>
              <span className="text-sm font-semibold text-gray-900">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}