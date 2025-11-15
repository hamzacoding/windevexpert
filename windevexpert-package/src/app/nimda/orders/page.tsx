'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  X,
  Save,
  User,
  Euro,
  Calendar,
  AlertTriangle
} from 'lucide-react'

// Types pour les commandes
interface Order {
  id: string
  userId: string
  productId: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  amount: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  product: {
    id: string
    title: string
    type: string
    price: number
  }
}

interface OrdersResponse {
  orders: Order[]
  totalCount: number
  totalPages: number
  currentPage: number
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
}

// Composant Badge pour le statut
const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' }
      case 'CONFIRMED':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmée' }
      case 'IN_PROGRESS':
        return { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'En cours' }
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminée' }
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Annulée' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  )
}

// Composant Badge pour le statut de paiement
const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
  const getStatusConfig = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' }
      case 'PAID':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Payé' }
      case 'FAILED':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Échec' }
      case 'REFUNDED':
        return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, label: 'Remboursé' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  )
}

// Composant Card pour une commande
const OrderCard = ({ 
  order, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  order: Order
  onView: (id: string) => void
  onEdit: (order: Order) => void
  onDelete: (id: string) => void
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Commande #{order.id.slice(-8)}
          </h3>
          <p className="text-sm text-gray-600">
            {order.user.name} • {order.user.email}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onView(order.id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(order)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{order.product.title}</p>
          <p className="text-sm text-gray-600">{order.product.type}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <StatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{order.amount.toFixed(2)} €</p>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {order.paymentMethod && (
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 mr-1" />
            {order.paymentMethod}
          </div>
        )}

        {order.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {order.notes}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersManagement() {
  // États pour les données
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // États pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Fonction pour récupérer les commandes
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes')
      }

      const data = await response.json()
      setOrdersData(data)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/orders/stats')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Effet pour charger les données
  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter])

  useEffect(() => {
    fetchStats()
  }, [])

  // Gestionnaires d'événements
  const handleView = (id: string) => {
    // TODO: Implémenter la vue détaillée
    console.log('Voir commande:', id)
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      await fetchOrders()
      await fetchStats()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression de la commande')
    }
  }

  const handleAddOrder = () => {
    setEditingOrder(null)
    setIsModalOpen(true)
  }

  const handleSaveOrder = async (orderData: any) => {
    try {
      const url = editingOrder 
        ? `/api/admin/orders/${editingOrder.id}`
        : '/api/admin/orders'
      
      const method = editingOrder ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      setIsModalOpen(false)
      setEditingOrder(null)
      await fetchOrders()
      await fetchStats()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde de la commande')
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handlePaymentStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  // Données dérivées
  const orders = ordersData?.orders || []
  const totalPages = ordersData?.totalPages || 1

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
            <p className="text-gray-600 mt-2">
              Gérez toutes les commandes de votre plateforme
            </p>
          </div>
          <button
            onClick={handleAddOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} €</p>
              </div>
              <Euro className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par client, email ou produit..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminée</option>
            <option value="CANCELLED">Annulée</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={handlePaymentStatusFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les paiements</option>
            <option value="PENDING">En attente</option>
            <option value="PAID">Payé</option>
            <option value="FAILED">Échec</option>
            <option value="REFUNDED">Remboursé</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {ordersData?.totalCount || 0} commande(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Chargement des commandes...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Grille des commandes */}
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune commande trouvée</p>
              <button
                onClick={handleAddOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Créer une nouvelle commande
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal pour ajouter/modifier une commande */}
      {isModalOpen && (
        <OrderModal
          order={editingOrder}
          onSave={handleSaveOrder}
          onClose={() => {
            setIsModalOpen(false)
            setEditingOrder(null)
          }}
        />
      )}
    </div>
  )
}

// Composant Modal pour les commandes
const OrderModal = ({ 
  order, 
  onSave, 
  onClose 
}: { 
  order: Order | null
  onSave: (data: any) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState({
    userId: order?.userId || '',
    productId: order?.productId || '',
    amount: order?.amount || 0,
    status: order?.status || 'PENDING',
    paymentStatus: order?.paymentStatus || 'PENDING',
    paymentMethod: order?.paymentMethod || '',
    notes: order?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? 'Modifier la commande' : 'Nouvelle commande'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Utilisateur *
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID de l'utilisateur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Produit *
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de la commande
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut du paiement
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PENDING">En attente</option>
                <option value="PAID">Payé</option>
                <option value="FAILED">Échec</option>
                <option value="REFUNDED">Remboursé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <input
                type="text"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Carte bancaire, PayPal, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{order ? 'Modifier' : 'Créer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}