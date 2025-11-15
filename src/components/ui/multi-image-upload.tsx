'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  placeholder?: string
  accept?: string
  maxSize?: number // en MB
  maxImages?: number
  className?: string
  disabled?: boolean
}

export function MultiImageUpload({
  value = [],
  onChange,
  label,
  placeholder = "Glissez des images ici ou cliquez pour sélectionner",
  accept = "image/*",
  maxSize = 5,
  maxImages = 10,
  className,
  disabled = false
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (value.length + files.length > maxImages) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxImages} images`)
      return
    }

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Vérification de la taille
        if (file.size > maxSize * 1024 * 1024) {
          alert(`Le fichier ${file.name} est trop volumineux. Taille maximale: ${maxSize}MB`)
          continue
        }

        // Vérification du type
        if (!file.type.startsWith('image/')) {
          alert(`Le fichier ${file.name} n'est pas une image valide`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Erreur lors de l'upload de ${file.name}`)
        }

        const data = await response.json()
        newUrls.push(data.url)
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload des images')
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

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  const canAddMore = value.length < maxImages

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}
      
      {/* Images existantes */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => removeImage(index)}
                    disabled={disabled || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Image {index + 1}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
        <div
          className={cn(
            "relative w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {value.length === 0 ? placeholder : "Ajouter d'autres images"}
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF jusqu'à {maxSize}MB ({value.length}/{maxImages})
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
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}