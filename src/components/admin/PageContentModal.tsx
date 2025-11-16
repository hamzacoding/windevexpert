'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye } from 'lucide-react'
import { RichHtmlEditor } from '@/components/ui/rich-html-editor'
import { Tag, Globe, Building, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { getDefaultContent, getDefaultTitle, hasDefaultContent } from '@/lib/services/default-page-content'

interface PageContent {
  id?: string
  pageSlug: string
  sectionKey: string
  title: string
  content: string
  isActive: boolean
}

interface PageContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  content?: PageContent | null
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

const commonSections = [
  { key: 'hero', name: 'Section héro' },
  { key: 'about', name: 'À propos' },
  { key: 'features', name: 'Fonctionnalités' },
  { key: 'services', name: 'Services' },
  { key: 'testimonials', name: 'Témoignages' },
  { key: 'cta', name: 'Appel à l\'action' },
  { key: 'footer', name: 'Pied de page' },
  { key: 'meta-title', name: 'Titre de la page (SEO)' },
  { key: 'meta-description', name: 'Description (SEO)' }
]

export default function PageContentModal({ isOpen, onClose, onSave, content }: PageContentModalProps) {
  const [formData, setFormData] = useState<PageContent>({
    pageSlug: 'home',
    sectionKey: '',
    title: '',
    content: '',
    isActive: true
  })
  const [loading, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    if (content) {
      setFormData(content)
    } else {
      setFormData({
        pageSlug: 'home',
        sectionKey: '',
        title: '',
        content: '',
        isActive: true
      })
    }
  }, [content, isOpen])

  const generateSectionKey = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      sectionKey: !content ? generateSectionKey(title) : prev.sectionKey
    }))
  }

  const handleSectionChange = (sectionKey: string) => {
    if (!content && sectionKey) {
      // Pré-remplir avec le contenu par défaut si disponible
      const defaultContent = getDefaultContent(formData.pageSlug, sectionKey)
      const defaultTitle = getDefaultTitle(formData.pageSlug, sectionKey)
      
      setFormData(prev => ({
        ...prev,
        sectionKey,
        title: defaultTitle || prev.title,
        content: defaultContent || prev.content
      }))
    } else {
      setFormData(prev => ({ ...prev, sectionKey }))
    }
  }

  const handlePageChange = (pageSlug: string) => {
    setFormData(prev => {
      // Si on change de page et qu'on a une section sélectionnée, 
      // essayer de pré-remplir avec le nouveau contenu par défaut
      if (!content && prev.sectionKey) {
        const defaultContent = getDefaultContent(pageSlug, prev.sectionKey)
        const defaultTitle = getDefaultTitle(pageSlug, prev.sectionKey)
        
        return {
          ...prev,
          pageSlug,
          title: defaultTitle || prev.title,
          content: defaultContent || prev.content
        }
      }
      
      return { ...prev, pageSlug }
    })
  }

  const handleSave = async () => {
    if (!formData.pageSlug || !formData.sectionKey || !formData.title || !formData.content) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const url = content 
        ? `/api/admin/page-content/${content.id}`
        : '/api/admin/page-content'
      
      const method = content ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const data = await response.json()
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {content ? 'Modifier le contenu' : 'Nouveau contenu de page'}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-sm ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Édition
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-sm ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Aperçu
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="h-[calc(90vh-140px)]">
          {activeTab === 'edit' ? (
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page *
                    </label>
                    <select
                      value={formData.pageSlug}
                      onChange={(e) => handlePageChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availablePages.map(page => (
                        <option key={page.slug} value={page.slug}>
                          {page.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section suggérée
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSectionChange(e.target.value)
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir une section...</option>
                      {commonSections.map(section => {
                        const hasDefault = hasDefaultContent(formData.pageSlug, section.key)
                        return (
                          <option key={section.key} value={section.key}>
                            {section.name}{hasDefault ? ' ✨' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Section héro de la page d'accueil"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clé de section *
                    </label>
                    <input
                      type="text"
                      value={formData.sectionKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, sectionKey: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="hero-accueil"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Contenu actif</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu *
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 mb-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Variables disponibles
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {pageVariables.map((variable) => {
                        const IconComponent = variable.icon as any
                        return (
                          <button
                            key={variable.key}
                            onClick={() => insertVariableAtCaret(variable.key)}
                            className="flex items-center gap-2 p-2 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            title={`Insérer ${variable.label}`}
                          >
                            <IconComponent className="w-3 h-3 text-gray-500" />
                            <span className="truncate">{variable.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Cliquez sur une variable pour l'insérer à la position du curseur.
                    </div>
                  </div>
                  <RichHtmlEditor
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Contenu HTML de la section..."
                    height={400}
                    uploadFolder="pages"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto h-full bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Aperçu du contenu</h3>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="border-b pb-4 mb-6">
                  <div className="text-sm text-gray-600 mb-1">
                    Page: {availablePages.find(p => p.slug === formData.pageSlug)?.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Section: {formData.sectionKey}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formData.title}
                  </h2>
                </div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
const pageVariables = [
  { key: '{{SITE_NAME}}', label: 'Nom du site', icon: Globe },
  { key: '{{SITE_URL}}', label: 'URL du site', icon: Globe },
  { key: '{{LOGO_URL}}', label: 'URL du logo', icon: Building },
  { key: '{{CURRENT_YEAR}}', label: 'Année actuelle', icon: Calendar },
  { key: '{{CONTACT_EMAIL}}', label: 'Email de contact', icon: Mail },
  { key: '{{CONTACT_PHONE}}', label: 'Téléphone', icon: Phone },
  { key: '{{CONTACT_ADDRESS}}', label: 'Adresse', icon: MapPin }
]

function insertVariableAtCaret(variable: string) {
  try {
    const editable = document.querySelector('.rich-html-editor__editable') as HTMLElement | null
    if (editable) {
      editable.focus()
    }
    document.execCommand('insertText', false, variable)
  } catch {}
}
