'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail, Edit, Trash2, Send, Eye, Search, Filter } from 'lucide-react'
import { EmailTemplateType } from '@prisma/client'
import EmailTemplateModal from '@/components/admin/EmailTemplateModal'

interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  htmlContent: string
  textContent?: string
  type: EmailTemplateType
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

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<EmailTemplateType | ''>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState<EmailTemplate | null>(null)

  const templateTypes = [
    { value: 'WELCOME', label: 'Bienvenue' },
    { value: 'ORDER_CONFIRMATION', label: 'Confirmation de commande' },
    { value: 'COURSE_ENROLLMENT', label: 'Inscription cours' },
    { value: 'PASSWORD_RESET', label: 'Réinitialisation mot de passe' },
    { value: 'NEWSLETTER', label: 'Newsletter' },
    { value: 'NOTIFICATION', label: 'Notification' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'SUPPORT', label: 'Support' },
    { value: 'OTHER', label: 'Autre' }
  ]

  useEffect(() => {
    fetchTemplates()
  }, [pagination.page, filterType])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filterType && { type: filterType })
      })

      const response = await fetch(`/api/admin/email-templates?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTemplates(data.templates)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleSendTest = async (template: EmailTemplate) => {
    const email = prompt('Adresse email pour le test :')
    if (!email) return

    try {
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          templateSlug: template.slug,
          templateData: {
            userName: 'Test User',
            userEmail: email
          }
        })
      })

      const data = await response.json()
      if (response.ok) {
        alert('Email de test envoyé avec succès !')
      } else {
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du test:', error)
      alert('Erreur lors de l\'envoi du test')
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates d'emails</h1>
          <p className="text-gray-600">Gérez vos templates d'emails pour toutes les communications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
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
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EmailTemplateType | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {templateTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des templates */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun template trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sujet
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
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {templateTypes.find(t => t.value === template.type)?.label || template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {template.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowPreview(template)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendTest(template)}
                          className="text-green-600 hover:text-green-900"
                          title="Envoyer un test"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
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

      {/* Modal de création/édition */}
      <EmailTemplateModal
        isOpen={showCreateModal || editingTemplate !== null}
        onClose={() => {
          setShowCreateModal(false)
          setEditingTemplate(null)
        }}
        onSave={() => {
          fetchTemplates()
          setShowCreateModal(false)
          setEditingTemplate(null)
        }}
        template={editingTemplate}
      />

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Prévisualisation - {showPreview.name}</h2>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="border-b pb-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Sujet:</div>
                <div className="font-medium text-lg">{showPreview.subject}</div>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: showPreview.htmlContent
                    .replace(/{{userName}}/g, 'John Doe')
                    .replace(/{{userEmail}}/g, 'john.doe@example.com')
                    .replace(/{{SITE_NAME}}/g, 'WinDevExpert')
                    .replace(/{{SITE_URL}}/g, 'https://windevexpert.com')
                    .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString())
                    .replace(/{{LOGO_URL}}/g, '/windevexpert-logo.svg')
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}