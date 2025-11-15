'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon, Loader2, Crop as CropIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/contexts/toast-context'

interface FormationImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  maxSize?: number // MB
  className?: string
}

// Composant d'upload pour images de formation avec recadrage optionnel (16:9)
export function FormationImageUpload({
  value,
  onChange,
  label,
  maxSize = 5,
  className
}: FormationImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const { showToast } = useToast()

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Format non valide', message: 'Sélectionnez une image' })
      return
    }
    if (file.size > maxSize * 1024 * 1024) {
      showToast({ type: 'error', title: 'Fichier trop volumineux', message: `Max ${maxSize}MB` })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCropImageUrl(String(reader.result))
      setCropZoom(1)
      setOffset({ x: 0, y: 0 })
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }
  const onDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const onDragEnd = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const uploadBlob = async (blob: Blob, filenameHint = 'formation-image.jpg') => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      const file = new File([blob], filenameHint, { type: blob.type || 'image/jpeg' })
      formData.append('file', file)
      formData.append('folder', 'formations')

      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erreur lors de l\'upload')
      }
      const data = await res.json()
      onChange(data.url)
      showToast({ type: 'success', title: 'Image enregistrée', message: 'Upload réussi' })
    } catch (e: any) {
      console.error('Upload error', e)
      showToast({ type: 'error', title: 'Upload échoué', message: e.message })
    } finally {
      setIsUploading(false)
      setCropOpen(false)
      setCropImageUrl(null)
    }
  }

  const confirmCrop = async () => {
    if (!cropImageUrl) return
    // Paramètres du cadre de recadrage (16:9)
    const targetW = 1200
    const targetH = Math.round(targetW * 9 / 16)

    // Créer un canvas et dessiner l'image recadrée selon offset/zoom
    const img = new Image()
    img.src = cropImageUrl
    await new Promise((resolve) => { img.onload = resolve })

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!

    // Calculer l'échelle et l'origine pour dessiner dans le cadre
    const baseW = img.width
    const baseH = img.height
    const displayW = baseW * cropZoom
    const displayH = baseH * cropZoom

    // Centrer par défaut, appliquer offset (pixels) depuis centre
    const centerX = (targetW - displayW) / 2 + offset.x
    const centerY = (targetH - displayH) / 2 + offset.y

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetW, targetH)
    ctx.drawImage(img, centerX, centerY, displayW, displayH)

    canvas.toBlob((blob) => {
      if (!blob) return
      uploadBlob(blob, 'formation-cover.jpg')
    }, 'image/jpeg', 0.9)
  }

  const skipCropAndUploadOriginal = async () => {
    if (!cropImageUrl) return
    // Convertir dataURL en blob
    const res = await fetch(cropImageUrl)
    const blob = await res.blob()
    uploadBlob(blob, 'formation-cover-original.jpg')
  }

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img src={value} alt="Image de couverture" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={openFilePicker} disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-1" /> Remplacer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'relative w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDragEvents}
          onDragLeave={handleDragEvents}
          onDragOver={handleDragEvents}
          onDrop={handleDrop}
          onClick={openFilePicker}
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
                <p className="text-sm text-gray-600 mb-1">Glissez une image ici ou cliquez pour sélectionner</p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP jusqu'à {maxSize}MB</p>
              </>
            )}
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />

      {cropOpen && cropImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2"><CropIcon className="h-5 w-5" /><span className="font-semibold">Recadrer l'image (16:9)</span></div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setCropOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div
                className="relative mx-auto w-[640px] h-[360px] bg-gray-200 overflow-hidden rounded-lg border"
                onMouseDown={onDragStart}
                onMouseMove={onDragMove}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
              >
                <img
                  src={cropImageUrl}
                  alt="A recadrer"
                  className="select-none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${cropZoom})`,
                    transformOrigin: 'center center',
                    willChange: 'transform'
                  }}
                  draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-gray-300"></div>
              </div>
              <div className="flex items-center gap-3">
                <Label>Zoom</Label>
                <input type="range" min={1} max={2.5} step={0.01} value={cropZoom} onChange={(e) => setCropZoom(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={skipCropAndUploadOriginal} disabled={isUploading}>Ignorer et envoyer original</Button>
                <Button onClick={confirmCrop} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                  {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</>) : 'Valider le recadrage'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}