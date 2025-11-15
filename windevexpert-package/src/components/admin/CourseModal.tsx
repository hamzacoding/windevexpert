'use client'

import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react'
import { AIContentGenerator, QuickAIGenerator } from '../ai/AIContentGenerator'
import { ImageUpload } from '../ui/image-upload'

interface Lesson {
  id?: string
  title: string
  description: string
  videoUrl: string
  duration: number
  order: number
}

interface Course {
  id?: string
  title: string
  description: string
  duration: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  productId?: string
  product?: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    priceDA?: number
    categoryId: string
    category?: { id: string; name: string; slug?: string }
    logo?: string
  }
  lessons?: Lesson[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  course?: Course | null
}

const courseLevels = [
  { value: 'BEGINNER', label: 'Débutant' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire' },
  { value: 'ADVANCED', label: 'Avancé' }
]

export default function CourseModal({ isOpen, onClose, onSave, course }: CourseModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('')
  const [showTitleAI, setShowTitleAI] = useState(false)
  const [showDescriptionAI, setShowDescriptionAI] = useState(false)
  const [showProductDescriptionAI, setShowProductDescriptionAI] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    level: 'BEGINNER' as const,
    isActive: true,
    product: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      priceDA: 0,
      categoryId: '',
      logo: ''
    },
    lessons: [] as Lesson[]
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (course) {
        setFormData({
          title: course.title,
          description: course.description,
          duration: course.duration,
          level: course.level,
          isActive: course.isActive ?? true,
          product: {
            name: course.product?.name || '',
            slug: course.product?.slug || '',
            description: course.product?.description || '',
            price: course.product?.price || 0,
            priceDA: course.product?.priceDA || 0,
            categoryId: (course.product as any)?.categoryId || (course.product as any)?.category?.id || '',
            logo: (course as any)?.product?.logo || ''
          },
          lessons: course.lessons || []
        })
      } else {
        setFormData({
          title: '',
          description: '',
          duration: 0,
          level: 'BEGINNER',
          isActive: true,
          product: {
            name: '',
            slug: '',
            description: '',
            price: 0,
            priceDA: 0,
            categoryId: '',
            logo: ''
          },
          lessons: []
        })
      }
    }
  }, [isOpen, course])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Veuillez saisir un nom de catégorie')
      return
    }
    setCreatingCategory(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined,
          parentId: newCategoryParentId || undefined
        })
      })
      if (response.ok) {
        const data = await response.json()
        const created = data.category
        // Recharger la liste pour garantir la cohérence
        await fetchCategories()
        // Sélectionner la catégorie fraichement créée
        setFormData(prev => ({
          ...prev,
          product: { ...prev.product, categoryId: created?.id || prev.product.categoryId }
        }))
        // Réinitialiser le mini-formulaire
        setNewCategoryName('')
        setNewCategoryDescription('')
        setNewCategoryParentId('')
        setShowCategoryForm(false)
      } else {
        const err = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        alert(`Erreur lors de la création: ${err.error || 'Erreur inconnue'}`)
      }
    } catch (e) {
      console.error('Erreur création catégorie:', e)
      alert('Erreur lors de la création de la catégorie')
    } finally {
      setCreatingCategory(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleProductNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        name,
        slug: generateSlug(name)
      }
    }))
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: formData.lessons.length + 1
    }
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }))
  }

  const updateLesson = (index: number, lesson: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((l, i) => i === index ? { ...l, ...lesson } : l)
    }))
  }

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index).map((lesson, i) => ({
        ...lesson,
        order: i + 1
      }))
    }))
  }

  const moveLesson = (fromIndex: number, toIndex: number) => {
    const lessons = [...formData.lessons]
    const [movedLesson] = lessons.splice(fromIndex, 1)
    lessons.splice(toIndex, 0, movedLesson)
    
    // Réorganiser les ordres
    const reorderedLessons = lessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }))

    setFormData(prev => ({
      ...prev,
      lessons: reorderedLessons
    }))
  }

  const calculateTotalDuration = () => {
    return formData.lessons.reduce((total, lesson) => total + lesson.duration, 0)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.product.name || !formData.product.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const totalDuration = calculateTotalDuration()
      // Si aucune leçon n'est définie, utiliser une durée par défaut de 60 minutes
      const finalDuration = totalDuration > 0 ? totalDuration : (formData.duration > 0 ? formData.duration : 60)
      
      const courseData = {
        ...formData,
        duration: finalDuration,
        productData: formData.product
      }
      
      // Supprimer la propriété product pour éviter la confusion
      delete courseData.product

      const url = course 
        ? `/api/admin/courses/${course.id}`
        : '/api/admin/courses'
      
      const method = course ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
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
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {course ? 'Modifier la formation' : 'Nouvelle formation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Informations de la formation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Titre de la formation *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTitleAI(!showTitleAI)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      IA
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: WinDev - Les Fondamentaux"
                  />
                  {showTitleAI && (
                    <div className="mt-2">
                      <QuickAIGenerator
                        contentType="title"
                        onContentGenerated={(content) => {
                          setFormData(prev => ({ ...prev, title: content }))
                          setShowTitleAI(false)
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {courseLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes) {formData.lessons.length > 0 ? '(calculée automatiquement)' : '*'}
                  </label>
                  <input
                    type="number"
                    value={formData.lessons.length > 0 ? calculateTotalDuration() : formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    disabled={formData.lessons.length > 0}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.lessons.length > 0 ? 'bg-gray-100' : ''}`}
                    placeholder="60"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.lessons.length > 0 
                      ? 'La durée est calculée automatiquement à partir des leçons' 
                      : 'Durée estimée de la formation en minutes'
                    }
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Formation active</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Les formations inactives ne sont pas visibles sur le site public
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDescriptionAI(!showDescriptionAI)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    IA
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description détaillée de la formation..."
                />
                {showDescriptionAI && (
                  <div className="mt-2">
                    <AIContentGenerator
                      contentType="description"
                      placeholder="Décrivez le contenu et les objectifs de la formation..."
                      onContentGenerated={(content) => {
                        setFormData(prev => ({ ...prev, description: content }))
                        setShowDescriptionAI(false)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Informations produit */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Informations produit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.product.name}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Formation WinDev Débutant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (généré automatiquement)
                  </label>
                  <input
                    type="text"
                    value={formData.product.slug}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      product: { ...prev.product, slug: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                    placeholder="formation-windev-debutant"
                  />
                </div>
              </div>
              <div className="mt-4">
                <ImageUpload
                  label="Image de la formation (logo)"
                  value={formData.product.logo || ''}
                  onChange={(url) => setFormData(prev => ({
                    ...prev,
                    product: { ...prev.product, logo: url }
                  }))}
                  onRemove={() => setFormData(prev => ({
                    ...prev,
                    product: { ...prev.product, logo: '' }
                  }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.product.price}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      product: { ...prev.product, price: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="199.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (DA)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.product.priceDA}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      product: { ...prev.product, priceDA: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="29999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formData.product.categoryId}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      product: { ...prev.product, categoryId: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(v => !v)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showCategoryForm ? 'Annuler la création' : 'Créer une catégorie'}
                    </button>
                  </div>
                  {showCategoryForm && (
                    <div className="mt-3 p-3 border rounded-lg bg-white">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Développement WinDev"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optionnel)</label>
                          <select
                            value={newCategoryParentId}
                            onChange={(e) => setNewCategoryParentId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Aucune (catégorie racine)</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optionnel"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={creatingCategory}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {creatingCategory ? 'Création...' : 'Créer la catégorie'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowCategoryForm(false); setNewCategoryName(''); setNewCategoryDescription(''); setNewCategoryParentId('') }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description du produit
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowProductDescriptionAI(!showProductDescriptionAI)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    IA
                  </button>
                </div>
                <textarea
                  value={formData.product.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    product: { ...prev.product, description: e.target.value }
                  }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description pour la boutique..."
                />
                {showProductDescriptionAI && (
                  <div className="mt-2">
                    <AIContentGenerator
                      contentType="description"
                      placeholder="Décrivez les avantages et bénéfices de cette formation pour la boutique..."
                      onContentGenerated={(content) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          product: { ...prev.product, description: content }
                        }))
                        setShowProductDescriptionAI(false)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Leçons */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Leçons ({formData.lessons.length})
                  {formData.lessons.length > 0 && (
                    <span className="text-sm text-gray-600 ml-2">
                      - Durée totale: {Math.floor(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}min
                    </span>
                  )}
                </h3>
                <button
                  onClick={addLesson}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une leçon
                </button>
              </div>

              <div className="space-y-4">
                {formData.lessons.map((lesson, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-sm font-medium text-gray-600">
                          Leçon {lesson.order}
                        </span>
                      </div>
                      <button
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre de la leçon
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, { title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Introduction à WinDev"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durée (minutes)
                        </label>
                        <input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(index, { duration: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="60"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de la vidéo
                      </label>
                      <input
                        type="url"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(index, { videoUrl: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/videos/lesson1.mp4"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(index, { description: e.target.value })}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Description de la leçon..."
                      />
                    </div>
                  </div>
                ))}

                {formData.lessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune leçon ajoutée. Cliquez sur "Ajouter une leçon" pour commencer.
                  </div>
                )}
              </div>
            </div>
          </div>
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