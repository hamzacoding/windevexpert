"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Table,
  Eye,
  FileCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichHtmlEditorProps {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
  uploadFolder?: string // destination folder for images under /public/uploads
  className?: string
  disabled?: boolean
  height?: number // content area height in px
}

function safeExec(command: string, value?: string) {
  try {
    document.execCommand(command, false, value)
  } catch {}
}

async function uploadImage(file: File, folder = 'formations'): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
    if (!res.ok) return null
    const json = await res.json()
    return json?.url || null
  } catch {
    return null
  }
}

export function RichHtmlEditor({
  value,
  onChange,
  label,
  placeholder,
  uploadFolder = 'formations',
  className,
  disabled,
  height = 320,
}: RichHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isHtmlView, setIsHtmlView] = useState(false)
  const [html, setHtml] = useState<string>(value || '')

  useEffect(() => {
    setHtml(value || '')
    if (editorRef.current && !isHtmlView) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (!editorRef.current) return
    const nextHtml = editorRef.current.innerHTML
    setHtml(nextHtml)
    onChange(nextHtml)
  }

  const insertLink = () => {
    const url = window.prompt('Entrez l\'URL du lien:')
    if (!url) return
    safeExec('createLink', url)
    // enforce target and rel on the new link
    const selection = window.getSelection()
    if (selection && selection.anchorNode) {
      const anchor = (selection.anchorNode as HTMLElement).closest('a')
      if (anchor) {
        anchor.setAttribute('target', '_blank')
        anchor.setAttribute('rel', 'noopener noreferrer')
      }
    }
    handleInput()
  }

  const pickImage = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, uploadFolder)
    if (!url) {
      alert('Échec de l\'upload de l\'image.')
      return
    }
    const imgHtml = `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px" />`
    safeExec('insertHTML', imgHtml)
    handleInput()
    // reset input
    e.target.value = ''
  }

  const insertTable = () => {
    const rows = parseInt(window.prompt('Nombre de lignes ?', '2') || '2', 10)
    const cols = parseInt(window.prompt('Nombre de colonnes ?', '2') || '2', 10)
    const clamp = (v: number) => Math.max(1, Math.min(12, v))
    const r = clamp(rows), c = clamp(cols)
    let t = '<table style="border-collapse:collapse;width:100%;margin:12px 0">\n<thead><tr>'
    for (let i = 0; i < c; i++) t += '<th style="border:1px solid #e5e7eb;padding:8px;text-align:left">En-tête</th>'
    t += '</tr></thead><tbody>'
    for (let i = 0; i < r; i++) {
      t += '<tr>'
      for (let j = 0; j < c; j++) t += '<td style="border:1px solid #e5e7eb;padding:8px">Cellule</td>'
      t += '</tr>'
    }
    t += '</tbody></table>'
    safeExec('insertHTML', t)
    handleInput()
  }

  const toggleView = () => {
    setIsHtmlView((v) => !v)
    if (!isHtmlView && editorRef.current) {
      // switching to HTML view, ensure html state is current
      setHtml(editorRef.current.innerHTML)
    } else if (isHtmlView && editorRef.current) {
      // switching back to WYSIWYG
      editorRef.current.innerHTML = html
      onChange(html)
    }
  }

  const toolbarButton = (
    {
      icon: Icon,
      label,
      onClick,
      disabled = false,
    }: { icon: any; label: string; onClick: () => void; disabled?: boolean }
  ) => (
    <Button type="button" variant="ghost" size="sm" title={label} onClick={onClick} disabled={disabled} className="h-8 w-8 p-0">
      <Icon className="h-4 w-4" />
    </Button>
  )

  const editorPlaceholder = useMemo(() => {
    return (value?.trim()?.length ?? 0) === 0 ? (placeholder || 'Saisissez votre contenu…') : ''
  }, [value, placeholder])

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 rounded border bg-white p-1">
        {toolbarButton({ icon: Bold, label: 'Gras', onClick: () => safeExec('bold'), disabled })}
        {toolbarButton({ icon: Italic, label: 'Italique', onClick: () => safeExec('italic'), disabled })}
        {toolbarButton({ icon: Underline, label: 'Souligné', onClick: () => safeExec('underline'), disabled })}
        {toolbarButton({ icon: Strikethrough, label: 'Barré', onClick: () => safeExec('strikeThrough'), disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: Heading1, label: 'Titre H1', onClick: () => safeExec('formatBlock', 'h1'), disabled })}
        {toolbarButton({ icon: Heading2, label: 'Titre H2', onClick: () => safeExec('formatBlock', 'h2'), disabled })}
        {toolbarButton({ icon: Code, label: 'Bloc code', onClick: () => safeExec('formatBlock', 'pre'), disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: List, label: 'Liste à puces', onClick: () => safeExec('insertUnorderedList'), disabled })}
        {toolbarButton({ icon: ListOrdered, label: 'Liste numérotée', onClick: () => safeExec('insertOrderedList'), disabled })}
        {toolbarButton({ icon: Quote, label: 'Citation', onClick: () => safeExec('formatBlock', 'blockquote'), disabled })}
        {toolbarButton({ icon: Minus, label: 'Séparateur', onClick: () => safeExec('insertHorizontalRule'), disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: AlignLeft, label: 'Aligner à gauche', onClick: () => safeExec('justifyLeft'), disabled })}
        {toolbarButton({ icon: AlignCenter, label: 'Centrer', onClick: () => safeExec('justifyCenter'), disabled })}
        {toolbarButton({ icon: AlignRight, label: 'Aligner à droite', onClick: () => safeExec('justifyRight'), disabled })}
        {toolbarButton({ icon: AlignJustify, label: 'Justifier', onClick: () => safeExec('justifyFull'), disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: LinkIcon, label: 'Insérer un lien', onClick: insertLink, disabled })}
        {toolbarButton({ icon: ImageIcon, label: 'Insérer une image', onClick: pickImage, disabled })}
        {toolbarButton({ icon: Table, label: 'Insérer un tableau', onClick: insertTable, disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: Undo, label: 'Annuler', onClick: () => safeExec('undo'), disabled })}
        {toolbarButton({ icon: Redo, label: 'Rétablir', onClick: () => safeExec('redo'), disabled })}
        <span className="mx-1 h-6 w-px bg-gray-200" />
        {toolbarButton({ icon: Eye, label: isHtmlView ? 'WYSIWYG' : 'HTML', onClick: toggleView, disabled })}
      </div>

      {/* Hidden file input for image uploads */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Editor Area */}
      {!isHtmlView ? (
        <div
          ref={editorRef}
          className={cn(
            'rounded-md border bg-white p-3 text-sm leading-relaxed focus:outline-none',
            disabled ? 'opacity-50 pointer-events-none' : 'outline-none'
          )}
          style={{ minHeight: height, overflowY: 'auto' }}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          suppressContentEditableWarning
          data-placeholder={editorPlaceholder}
        >
        </div>
      ) : (
        <textarea
          className={cn('w-full rounded-md border bg-white p-3 text-sm', disabled ? 'opacity-50' : '')}
          style={{ minHeight: height }}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          onBlur={() => onChange(html)}
        />
      )}

      {/* Helper: placeholder overlay */}
      {!isHtmlView && editorPlaceholder && (
        <div className="pointer-events-none -mt-[calc(320px)] select-none text-sm text-gray-400"></div>
      )}
    </div>
  )
}