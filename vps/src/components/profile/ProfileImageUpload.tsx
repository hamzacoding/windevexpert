'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileImageUploadProps {
  currentImage?: string | null
  onImageUpdate: (imageUrl: string) => void
  className?: string
}

export default function ProfileImageUpload({
  currentImage,
  onImageUpdate,
  className = ''
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.')
      return
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Taille maximale: 2MB.')
      return
    }

    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload du fichier
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }

      toast.success('Photo de profil mise à jour avec succès')
      onImageUpdate(data.imageUrl)
      setPreviewUrl(data.imageUrl)

    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      // Restaurer l'image précédente en cas d'erreur
      setPreviewUrl(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    // Ici on pourrait ajouter une API pour supprimer l'image du serveur
    onImageUpdate('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        {/* Image de profil */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Photo de profil"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Overlay avec boutons */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <button
              onClick={handleClick}
              disabled={isUploading}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Changer la photo"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-gray-700" />
              )}
            </button>
            
            {previewUrl && (
              <button
                onClick={handleRemove}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Supprimer la photo"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Badge de chargement */}
        {isUploading && (
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Upload...
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instructions */}
      <p className="text-sm text-gray-500 mt-2 text-center">
        Cliquez pour changer la photo
        <br />
        <span className="text-xs">JPG, PNG ou WebP - Max 2MB</span>
      </p>
    </div>
  )
}