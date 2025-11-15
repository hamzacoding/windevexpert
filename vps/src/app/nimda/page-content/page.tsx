'use client'

import { useState, useEffect } from 'react'
import { Plus, FileText, Edit, Trash2, Search, Filter, Globe } from 'lucide-react'
import PageContentModal from '@/components/admin/PageContentModal'

interface PageContent {
  id: string
  pageSlug: string
  sectionKey: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

const availablePages = [
  { slug: 'home', name: 'Page d\'accueil' },
  { slug: 'about', name: 'À propos' },
  { slug: 'services', name: 'Services' },
  { slug: 'formations', name: 'Formations' },
  { slug: 'produits', name: 'Produits' },
  { slug: 'contact', name: 'Contact' },
  { slug: 'legal', name: 'Mentions légales' },
  { slug: 'privacy', name: 'Politique de confidentialité' }
]

export default function PageContentPage() {
  const [contents, setContents] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPage, setFilterPage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingContent, setEditingContent] = useState<PageContent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<PageContent | null>(null)

  useEffect(() => {
    fetchContents()
  }, [pagination.page, filterPage])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filterPage && { pageSlug: filterPage })
      })

      const response = await fetch(`/api/admin/page-content?${params}`)
      const data = await response.json()

      if (response.ok) {
        setContents(data.contents)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedContent(null)
    setIsModalOpen(true)
  }

  const handleEdit = (content: PageContent) => {
    setSelectedContent(content)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedContent(null)
  }

  const handleModalSave = () => {
    fetchContent()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return

    try {
      const response = await fetch(`/api/admin/page-content/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchContents()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.sectionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.pageSlug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPageName = (slug: string) => {
    return availablePages.find(page => page.slug === slug)?.name || slug
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenu des pages</h1>
          <p className="text-gray-600">Gérez le contenu dynamique de toutes les pages du site</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau contenu
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher du contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterPage}
              onChange={(e) => setFilterPage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les pages</option>
              {availablePages.map(page => (
                <option key={page.slug} value={page.slug}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste du contenu */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun contenu trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modifié
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.map((content) => (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {content.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {content.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {getPageName(content.pageSlug)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {content.sectionKey}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        content.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {content.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(content)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
              {pagination.total} résultats
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <PageContentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        content={selectedContent}
      />
    </div>
  )
}