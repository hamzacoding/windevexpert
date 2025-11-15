'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import dynamic from 'next/dynamic'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export interface RichTextEditorRef {
  getEditor: () => Quill | null
  focus: () => void
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value = '', onChange, placeholder = 'Saisissez votre texte...', className = '', readOnly = false }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)
  const isUpdatingRef = useRef(false)
  const isInitializingRef = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)

    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current,
      focus: () => {
        if (quillRef.current) {
          quillRef.current.focus()
        }
      }
    }))

    useEffect(() => {
      if (!editorRef.current || quillRef.current || isInitializingRef.current) return

      isInitializingRef.current = true
      let cleanup: (() => void) | null = null

      // Charger Quill dynamiquement côté client
      const loadQuill = async () => {
        try {
          const QuillModule = await import('quill')
          const Quill = QuillModule.default
          
          // Importer les styles CSS
          await import('quill/dist/quill.snow.css')

          // Nettoyer complètement l'élément avant d'initialiser Quill
          if (editorRef.current) {
            // Vérifier s'il y a déjà une instance Quill
            const existingQuill = editorRef.current.querySelector('.ql-toolbar, .ql-container')
            if (existingQuill) {
              console.log('Instance Quill existante détectée, nettoyage...')
            }
            
            // Supprimer tous les enfants existants
            while (editorRef.current.firstChild) {
              editorRef.current.removeChild(editorRef.current.firstChild)
            }
            // Supprimer toutes les classes Quill existantes
            editorRef.current.className = editorRef.current.className
              .split(' ')
              .filter(cls => !cls.startsWith('ql-'))
              .join(' ')
            
            // Ajouter une classe de base
            editorRef.current.className += ' min-h-[200px] bg-white border border-gray-300 rounded-md'
          }

          // Configuration de Quill
          const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['blockquote', 'code-block'],
            ['clean']
          ]

          const quill = new Quill(editorRef.current, {
            theme: 'snow',
            readOnly,
            placeholder,
            modules: {
              toolbar: readOnly ? false : toolbarOptions,
              history: {
                delay: 1000,
                maxStack: 50,
                userOnly: true
              }
            },
            formats: [
              'header', 'bold', 'italic', 'underline', 'strike',
              'color', 'background', 'list', 'bullet', 'indent',
              'align', 'link', 'image', 'blockquote', 'code-block'
            ]
          })

          quillRef.current = quill

          // Définir le contenu initial après un court délai pour s'assurer que l'éditeur est prêt
          setTimeout(() => {
            if (value && quillRef.current) {
              isUpdatingRef.current = true
              quillRef.current.root.innerHTML = value
              isUpdatingRef.current = false
            }
          }, 100)

          // Écouter les changements
          const handleTextChange = () => {
            if (isUpdatingRef.current) return
            
            const html = quill.root.innerHTML
            if (onChange) {
              onChange(html)
            }
          }

          quill.on('text-change', handleTextChange)
          
          // Définir la fonction de cleanup
          cleanup = () => {
            if (quill) {
              quill.off('text-change', handleTextChange)
            }
          }
          
          setIsLoaded(true)
          isInitializingRef.current = false
        } catch (error) {
          console.error('Erreur lors du chargement de Quill:', error)
          isInitializingRef.current = false
        }
      }

      loadQuill()

      return () => {
        if (cleanup) {
          cleanup()
        }
        if (quillRef.current) {
          quillRef.current = null
        }
        isInitializingRef.current = false
        setIsLoaded(false)
      }
    }, [readOnly, placeholder])

    // Mettre à jour le contenu quand la prop value change
    useEffect(() => {
      if (quillRef.current && isLoaded) {
        const currentContent = quillRef.current.root.innerHTML
        if (value !== currentContent) {
          isUpdatingRef.current = true
          quillRef.current.root.innerHTML = value || ''
          isUpdatingRef.current = false
        }
      } else if (value && !quillRef.current) {
        // Si l'éditeur n'est pas encore prêt mais qu'on a une valeur, attendre un peu
        setTimeout(() => {
          if (quillRef.current && value) {
            isUpdatingRef.current = true
            quillRef.current.root.innerHTML = value
            isUpdatingRef.current = false
          }
        }, 200)
      }
    }, [value, isLoaded])

    return (
      <div className={`rich-text-editor ${className}`}>
        {!isLoaded && (
          <div className="min-h-[200px] bg-gray-50 border border-gray-300 rounded-md flex items-center justify-center">
            <div className="text-gray-500">Chargement de l'éditeur...</div>
          </div>
        )}
        <div 
          ref={editorRef}
          className={`min-h-[200px] bg-white border border-gray-300 rounded-md ${!isLoaded ? 'hidden' : ''}`}
        />
        <style jsx global>{`
          .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: none;
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
            background: #f9fafb;
          }
          
          .ql-container {
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-top: none;
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
            font-family: inherit;
          }
          
          .ql-editor {
            min-height: 200px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
          
          .ql-toolbar .ql-stroke {
            fill: none;
            stroke: #374151;
          }
          
          .ql-toolbar .ql-fill {
            fill: #374151;
            stroke: none;
          }
          
          .ql-toolbar .ql-picker {
            color: #374151;
          }
          
          .ql-toolbar button:hover,
          .ql-toolbar button:focus,
          .ql-toolbar button.ql-active {
            color: #2563eb;
          }
          
          .ql-toolbar button:hover .ql-stroke,
          .ql-toolbar button:focus .ql-stroke,
          .ql-toolbar button.ql-active .ql-stroke {
            stroke: #2563eb;
          }
          
          .ql-toolbar button:hover .ql-fill,
          .ql-toolbar button:focus .ql-fill,
          .ql-toolbar button.ql-active .ql-fill {
            fill: #2563eb;
          }
        `}</style>
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor