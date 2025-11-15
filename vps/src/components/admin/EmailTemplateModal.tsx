'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, Sparkles } from 'lucide-react'
import { EmailTemplateType } from '@prisma/client'
import HtmlEditor from '@/components/ui/html-editor'
import { AIContentGenerator, QuickAIGenerator } from '@/components/ai/AIContentGenerator'

interface EmailTemplate {
  id?: string
  name: string
  slug: string
  subject: string
  htmlContent: string
  textContent?: string
  type: EmailTemplateType
  isActive: boolean
}

interface EmailTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  template?: EmailTemplate | null
}

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

const defaultTemplate = `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="text-align: center; padding: 20px; border-bottom: 2px solid #e9ecef;">
    <img src="{{LOGO_URL}}" alt="{{SITE_NAME}}" style="max-width: 200px; height: auto;">
  </div>
  
  <div style="padding: 40px 20px;">
    <h1 style="color: #333; margin-bottom: 20px;">Bonjour {{userName}} !</h1>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
      Votre contenu personnalisé ici...
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{actionUrl}}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        {{actionText}}
      </a>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Cordialement,<br>
      L'équipe {{SITE_NAME}}
    </p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d;">
    <p>&copy; {{CURRENT_YEAR}} {{SITE_NAME}}. Tous droits réservés.</p>
    <p>
      <a href="{{SITE_URL}}" style="color: #3b82f6;">Visiter notre site</a> |
      <a href="{{SITE_URL}}/contact" style="color: #3b82f6;">Nous contacter</a>
    </p>
  </div>
</div>
`.trim()

export default function EmailTemplateModal({ isOpen, onClose, onSave, template }: EmailTemplateModalProps) {
  const [formData, setFormData] = useState<EmailTemplate>({
    name: '',
    slug: '',
    subject: '',
    htmlContent: defaultTemplate,
    textContent: '',
    type: 'OTHER' as EmailTemplateType,
    isActive: true
  })
  const [loading, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html')
  const [showNameAI, setShowNameAI] = useState(false)
  const [showSubjectAI, setShowSubjectAI] = useState(false)
  const [showContentAI, setShowContentAI] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData(template)
    } else {
      setFormData({
        name: '',
        slug: '',
        subject: '',
        htmlContent: defaultTemplate,
        textContent: '',
        type: 'OTHER' as EmailTemplateType,
        isActive: true
      })
    }
  }, [template, isOpen])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !template ? generateSlug(name) : prev.slug
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.subject || !formData.htmlContent) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const url = template 
        ? `/api/admin/email-templates/${template.id}`
        : '/api/admin/email-templates'
      
      const method = template ? 'PUT' : 'POST'

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

  const getPreviewHtml = () => {
    return formData.htmlContent
      .replace(/{{userName}}/g, 'John Doe')
      .replace(/{{userEmail}}/g, 'john.doe@example.com')
      .replace(/{{actionUrl}}/g, '#')
      .replace(/{{actionText}}/g, 'Cliquez ici')
      .replace(/{{SITE_NAME}}/g, 'WinDevExpert')
      .replace(/{{SITE_URL}}/g, 'https://windevexpert.com')
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString())
      .replace(/{{LOGO_URL}}/g, '/windevexpert-logo.svg')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {template ? 'Modifier le template' : 'Nouveau template d\'email'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Prévisualiser'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Formulaire */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto border-r`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Nom du template *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNameAI(!showNameAI)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      IA
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Email de bienvenue"
                  />
                  {showNameAI && (
                    <div className="mt-2">
                      <QuickAIGenerator
                        contentType="title"
                        onContentGenerated={(content) => {
                          handleNameChange(content)
                          setShowNameAI(false)
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email-bienvenue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as EmailTemplateType }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Template actif</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Sujet de l'email *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSubjectAI(!showSubjectAI)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    IA
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Bienvenue sur {{SITE_NAME}} !"
                />
                {showSubjectAI && (
                  <div className="mt-2">
                    <QuickAIGenerator
                      contentType="title"
                      onContentGenerated={(content) => {
                        setFormData(prev => ({ ...prev, subject: content }))
                        setShowSubjectAI(false)
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Onglets pour HTML/Text */}
              <div>
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'html'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Contenu HTML *
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'text'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Version texte
                  </button>
                </div>

                {activeTab === 'html' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Contenu HTML</span>
                      <button
                        type="button"
                        onClick={() => setShowContentAI(!showContentAI)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        IA
                      </button>
                    </div>
                    {showContentAI && (
                      <div className="mb-4">
                        <AIContentGenerator
                          contentType="email"
                          placeholder="Décrivez le contenu de l'email que vous souhaitez créer..."
                          onContentGenerated={(content) => {
                            setFormData(prev => ({ ...prev, htmlContent: content }))
                            setShowContentAI(false)
                          }}
                        />
                      </div>
                    )}
                    <HtmlEditor
                      value={formData.htmlContent}
                      onChange={(content) => setFormData(prev => ({ ...prev, htmlContent: content }))}
                      placeholder="Contenu HTML de l'email..."
                      height={400}
                      showVariables={true}
                      variableType="email"
                    />
                  </div>
                ) : (
                  <textarea
                    value={formData.textContent || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, textContent: e.target.value }))}
                    className="w-full h-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Version texte de l'email (optionnel, sera générée automatiquement si vide)"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          {showPreview && (
            <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Prévisualisation</h3>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="border-b pb-2 mb-4">
                  <div className="text-sm text-gray-600">Sujet:</div>
                  <div className="font-medium">
                    {formData.subject
                      .replace(/{{SITE_NAME}}/g, 'WinDevExpert')
                      .replace(/{{userName}}/g, 'John Doe')
                    }
                  </div>
                </div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
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