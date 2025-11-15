'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  placeholder?: string
  accept?: string
  maxSize?: number // en MB
  className?: string
  multiple?: boolean
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  placeholder = "Glissez une image ici ou cliquez pour sélectionner",
  accept = "image/*",
  maxSize = 5,
  className,
  multiple = false,
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Vérification de la taille
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Le fichier est trop volumineux. Taille maximale: ${maxSize}MB`)
      return
    }

    // Vérification du type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      {value ? (
        // Affichage de l'image uploadée
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Image uploadée"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleClick}
                  disabled={disabled || isUploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Remplacer
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Zone de drop pour upload
        <div
          className={cn(
            "relative w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF jusqu'à {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}