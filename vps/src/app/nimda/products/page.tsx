'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  BookOpen,
  Code,
  Briefcase,
  Loader2,
  X,
  Freeze,
  Play,
  Pause
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface Product {
  id: string
  name: string
  description: string
  type: string
  price: number
  status: string
  category: {
    name: string
  }
  logo?: string
  tagline?: string
  shortDescription?: string
  features?: string[]
  demoUrl?: string
  isFree: boolean
  createdAt: Date
  updatedAt: Date
  rating?: number
  enrollments?: number
  title?: string
  image?: string
}

interface ProductsResponse {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
}

// Composant Badge de statut
function StatusBadge({ status }: { status: Product['status'] }) {
  const statusConfig = {
    ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800' },
    INACTIVE: { label: 'Inactif', color: 'bg-red-100 text-red-800' },
    DRAFT: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' }
  }

  const config = statusConfig[status] || { 
    label: status || 'Inconnu', 
    color: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

// Composant Badge de type
function TypeBadge({ type }: { type: Product['type'] }) {
  const typeConfig = {
    TRAINING: { label: 'Formation', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    SERVICE: { label: 'Service', color: 'bg-purple-100 text-purple-800', icon: Briefcase },
    SOFTWARE: { label: 'Logiciel', color: 'bg-green-100 text-green-800', icon: Code },
    COMPONENT: { label: 'Composant', color: 'bg-orange-100 text-orange-800', icon: Package }
  }

  const config = typeConfig[type] || { 
    label: type || 'Inconnu', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Package 
  }
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  )
}

export default function ProductsManagement() {
  // États
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Authentification
  const { data: session, status } = useSession()
  const router = useRouter()

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

  // Récupération des produits
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/products?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits')
      }

      const data = await response.json()
      setProductsData(data)
    } catch (error) {
      console.error('Erreur:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Effet pour charger les produits
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [session, currentPage, searchTerm, typeFilter, statusFilter])

  // Gestionnaires d'événements
  const handleView = (product: Product) => {
    // Ouvrir la page de détail du produit
    window.open(`/produits/${product.id}`, '_blank')
  }

  const handleEdit = (product: Product) => {
    router.push(`/nimda/products/${product.id}/edit`)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    setActionLoading(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Produit supprimé avec succès')
      await fetchProducts() // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression du produit')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    setActionLoading(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut')
      }

      toast.success(`Produit ${newStatus === 'ACTIVE' ? 'activé' : 'désactivé'} avec succès`)
      await fetchProducts() // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddProduct = () => {
    // TODO: Implémenter l'ajout
    toast('Fonctionnalité d\'ajout en cours de développement')
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // Données pour l'affichage
  const products = productsData?.products || []
  const totalPages = productsData?.totalPages || 1

  // Affichage de chargement pendant l'authentification
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Si pas de session ou pas admin, ne rien afficher (redirection en cours)
  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Gestion des Produits & Services
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos formations, services et produits
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="TRAINING">Formations</option>
            <option value="SERVICE">Services</option>
            <option value="SOFTWARE">Logiciels</option>
            <option value="COMPONENT">Composants</option>
          </select>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="DRAFT">Brouillons</option>
          </select>

          {/* Statistiques */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
            <span className="text-sm text-gray-600">
              {productsData?.totalCount || 0} produit(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Chargement des produits...</span>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {error && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={fetchProducts}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.shortDescription || product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={product.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.isFree ? (
                        <span className="text-green-600 font-medium">Gratuit</span>
                      ) : (
                        <span className="font-medium">{product.price.toLocaleString()}€</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          disabled={actionLoading === product.id}
                          className={`p-1 rounded ${
                            product.status === 'ACTIVE' 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={product.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        >
                          {actionLoading === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : product.status === 'ACTIVE' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={actionLoading === product.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer"
                        >
                          {actionLoading === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun produit */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">
                Aucun produit ne correspond à vos critères de recherche.
              </p>
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center mx-auto transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier produit
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}