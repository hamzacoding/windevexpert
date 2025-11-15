'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Loader2,
  X,
  Save,
  Ban,
  CheckCircle
} from 'lucide-react'

// Types
interface User {
  id: string
  name: string | null
  email: string
  role: 'CLIENT' | 'ADMIN'
  isBlocked: boolean
  blockedAt: string | null
  blockedReason: string | null
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  users: User[]
  totalCount: number
  totalPages: number
  currentPage: number
}

// Composant Badge de rôle
function RoleBadge({ role }: { role: User['role'] }) {
  const styles = {
    CLIENT: 'bg-blue-100 text-blue-800 border-blue-200',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const labels = {
    CLIENT: 'Client',
    ADMIN: 'Administrateur'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[role]}`}>
      {labels[role]}
    </span>
  )
}

// Composant Badge de statut de blocage
function BlockedBadge({ isBlocked }: { isBlocked: boolean }) {
  if (!isBlocked) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
        Actif
      </span>
    )
  }

  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
      Bloqué
    </span>
  )
}

// Modal pour ajouter/éditer un utilisateur
function UserModal({ 
  onClose, 
  user, 
  onSave 
}: { 
  onClose: () => void
  user?: User | null
  onSave: (userData: any) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'CLIENT'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'CLIENT'
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  // Le modal est toujours affiché quand le composant est rendu

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'ADMIN' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {user ? 'Modifier' : 'Ajouter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



export default function UsersManagement() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'CLIENT' | 'ADMIN'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Charger les utilisateurs
  const fetchUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        role: role === 'all' ? '' : role
      })

      const response = await fetch(`/api/admin/users?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }
      
      const data = await response.json()
      setUsersData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter)
  }, [currentPage, searchTerm, roleFilter])

  // Handlers
  const handleView = (user: User) => {
    console.log('Voir utilisateur:', user)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name || user.email} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Recharger les utilisateurs
      fetchUsers(currentPage, searchTerm, roleFilter)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const handleBlock = async (user: User) => {
    const reason = prompt(`Pourquoi voulez-vous bloquer ${user.name || user.email} ?`, 'Violation des conditions d\'utilisation')
    
    if (reason === null) return // Utilisateur a annulé
    
    if (!confirm(`Êtes-vous sûr de vouloir bloquer l'utilisateur ${user.name || user.email} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du blocage')
      }

      // Recharger les utilisateurs
      fetchUsers(currentPage, searchTerm, roleFilter)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du blocage')
    }
  }

  const handleUnblock = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir débloquer l'utilisateur ${user.name || user.email} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/unblock`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erreur lors du déblocage')
      }

      // Recharger les utilisateurs
      fetchUsers(currentPage, searchTerm, roleFilter)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du déblocage')
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleSaveUser = async (userData: any) => {
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users'
      
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      // Recharger les utilisateurs
      fetchUsers(currentPage, searchTerm, roleFilter)
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (err) {
      throw err // Relancer l'erreur pour que le modal puisse l'afficher
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset à la première page lors d'une recherche
  }

  const handleRoleFilter = (role: 'all' | 'CLIENT' | 'ADMIN') => {
    setRoleFilter(role)
    setCurrentPage(1) // Reset à la première page lors d'un filtre
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erreur: {error}</p>
        <button 
          onClick={() => fetchUsers(currentPage, searchTerm, roleFilter)}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  const users = usersData?.users || []
  const totalPages = usersData?.totalPages || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les comptes utilisateurs de votre plateforme
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value as 'all' | 'CLIENT' | 'ADMIN')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière mise à jour
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Nom non défini'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BlockedBadge isBlocked={user.isBlocked} />
                    {user.isBlocked && user.blockedReason && (
                      <div className="text-xs text-gray-500 mt-1" title={user.blockedReason}>
                        {user.blockedReason.length > 30 ? `${user.blockedReason.substring(0, 30)}...` : user.blockedReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.role === 'CLIENT' && (
                        user.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Débloquer"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(user)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Bloquer"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500">
              Aucun utilisateur ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter/modifier un utilisateur */}
       {isModalOpen && (
         <UserModal
           user={editingUser}
           onSave={handleSaveUser}
           onClose={() => {
             setIsModalOpen(false)
             setEditingUser(null)
           }}
         />
       )}
    </div>
  )
}