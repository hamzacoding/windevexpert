'use client'

import { useRef, useEffect, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Tag, User, Mail, Calendar, Globe, Building, Phone, MapPin } from 'lucide-react'
import { EMAIL_EDITOR_CONFIG, PAGE_EDITOR_CONFIG, TINYMCE_CONFIG, getTinyMCEScriptSrc } from '@/lib/tinymce-config'

interface HtmlEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  showVariables?: boolean
  variableType?: 'email' | 'page'
  uploadFolder?: string
}

// Variables disponibles pour les templates d'email
const emailVariables = [
  { key: '{{userName}}', label: 'Nom utilisateur', icon: User },
  { key: '{{userEmail}}', label: 'Email utilisateur', icon: Mail },
  { key: '{{SITE_NAME}}', label: 'Nom du site', icon: Globe },
  { key: '{{SITE_URL}}', label: 'URL du site', icon: Globe },
  { key: '{{LOGO_URL}}', label: 'URL du logo', icon: Building },
  { key: '{{CURRENT_YEAR}}', label: 'Année actuelle', icon: Calendar },
  { key: '{{orderNumber}}', label: 'Numéro de commande', icon: Tag },
  { key: '{{orderDate}}', label: 'Date de commande', icon: Calendar },
  { key: '{{orderAmount}}', label: 'Montant commande', icon: Tag },
  { key: '{{serviceName}}', label: 'Nom du service', icon: Building },
  { key: '{{actionUrl}}', label: 'URL d\'action', icon: Globe },
  { key: '{{actionText}}', label: 'Texte d\'action', icon: Tag }
]

// Variables disponibles pour les pages
const pageVariables = [
  { key: '{{SITE_NAME}}', label: 'Nom du site', icon: Globe },
  { key: '{{SITE_URL}}', label: 'URL du site', icon: Globe },
  { key: '{{LOGO_URL}}', label: 'URL du logo', icon: Building },
  { key: '{{CURRENT_YEAR}}', label: 'Année actuelle', icon: Calendar },
  { key: '{{CONTACT_EMAIL}}', label: 'Email de contact', icon: Mail },
  { key: '{{CONTACT_PHONE}}', label: 'Téléphone', icon: Phone },
  { key: '{{CONTACT_ADDRESS}}', label: 'Adresse', icon: MapPin }
]

export default function HtmlEditor({ 
  value, 
  onChange, 
  placeholder = 'Commencez à écrire...', 
  height = 400,
  showVariables = true,
  variableType = 'email',
  uploadFolder
}: HtmlEditorProps) {
  const editorRef = useRef<any>(null)
  const [scriptSrc, setScriptSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const variables = variableType === 'email' ? emailVariables : pageVariables

  // Charger l'URL du script TinyMCE avec la clé API
  useEffect(() => {
    const loadScriptSrc = async () => {
      try {
        setIsLoading(true)
        const src = await getTinyMCEScriptSrc()
        setScriptSrc(src)
        console.log('✅ TinyMCE script source loaded:', src)
      } catch (error) {
        console.error('❌ Erreur lors du chargement de la clé API TinyMCE:', error)
        // Utiliser la version gratuite en cas d'erreur
        setScriptSrc('https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadScriptSrc()
  }, [])

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(variable)
    }
  }

  // Configuration de l'éditeur basée sur le type
  const baseConfig = variableType === 'email' ? EMAIL_EDITOR_CONFIG : PAGE_EDITOR_CONFIG
  
  const editorConfig = {
    ...baseConfig,
    height,
    placeholder,
    setup: (editor: any) => {
      // Configuration de base
      if (baseConfig.setup) {
        baseConfig.setup(editor)
      }
      
      // Événement de changement
      editor.on('change', () => {
        onChange(editor.getContent())
      })
      
      // Événement de saisie pour une réactivité en temps réel
      editor.on('input', () => {
        onChange(editor.getContent())
      })
    },
    images_upload_handler: async (blobInfo: any, success: any, failure: any) => {
      try {
        if (uploadFolder) {
          const formData = new FormData()
          const blob = blobInfo.blob()
          const file = new File([blob], blobInfo.filename(), { type: blob.type })
          formData.append('file', file)
          formData.append('folder', uploadFolder)
          const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
          const data = await res.json()
          if (!res.ok || !data?.url) {
            throw new Error(data?.error || 'Upload d\'image échoué')
          }
          success(data.url)
        } else {
          // Fallback: insérer l'image en base64
          const reader = new FileReader()
          reader.onload = () => success(reader.result as string)
          reader.readAsDataURL(blobInfo.blob())
        }
      } catch (err: any) {
        failure(err?.message || 'Upload d\'image échoué')
      }
    }
  }

  // Afficher un indicateur de chargement si l'URL du script n'est pas encore chargée
  if (isLoading || !scriptSrc) {
    return (
      <div className="space-y-4">
        {showVariables && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Variables disponibles
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {variables.map((variable) => {
                const IconComponent = variable.icon
                return (
                  <button
                    key={variable.key}
                    onClick={() => insertVariable(variable.key)}
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
              Cliquez sur une variable pour l'insérer dans l'éditeur à la position du curseur.
            </div>
          </div>
        )}
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center p-8 bg-gray-50">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Chargement de l'éditeur...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showVariables && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Variables disponibles
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {variables.map((variable) => {
              const IconComponent = variable.icon
              return (
                <button
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
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
            Cliquez sur une variable pour l'insérer dans l'éditeur à la position du curseur.
          </div>
        </div>
      )}
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          tinymceScriptSrc={scriptSrc}
          onInit={(evt, editor) => editorRef.current = editor}
          value={value}
          init={editorConfig}
        />
      </div>
    </div>
  )
}