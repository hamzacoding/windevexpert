'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  DollarSign,
  FileText,
  Target,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIContentGenerator, QuickAIGenerator } from '@/components/ai/AIContentGenerator'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  image?: string
  projectsCount: number
  ordersCount: number
}

interface Milestone {
  id?: string
  title: string
  description?: string
  dueDate?: string
  completed: boolean
}

interface Project {
  id: string
  title: string
  description: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  progress: number
  startDate?: string
  endDate?: string
  budget?: number
  client: {
    id: string
    name: string
    email: string
  }
  milestones?: Milestone[]
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: Project | null
  onSuccess?: () => void
}

export default function ProjectModal({ isOpen, onClose, project, onSuccess }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    status: 'PLANNING' as const,
    progress: 0,
    startDate: '',
    endDate: '',
    budget: ''
  })
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTitleAI, setShowTitleAI] = useState(false)
  const [showDescriptionAI, setShowDescriptionAI] = useState(false)

  // Charger les clients au montage du composant
  useEffect(() => {
    if (isOpen) {
      fetchClients()
    }
  }, [isOpen])

  // Remplir le formulaire si on édite un projet
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        clientId: project.client.id,
        status: project.status,
        progress: project.progress,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget?.toString() || ''
      })
      setMilestones(project.milestones || [])
    } else {
      // Réinitialiser le formulaire pour un nouveau projet
      setFormData({
        title: '',
        description: '',
        clientId: '',
        status: 'PLANNING',
        progress: 0,
        startDate: '',
        endDate: '',
        budget: ''
      })
      setMilestones([])
    }
    setErrors({})
  }, [project, isOpen])

  // Récupérer la liste des clients
  const fetchClients = async () => {
    try {
      setLoadingClients(true)
      const response = await fetch('/api/admin/clients')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients')
      }

      const data = await response.json()
      setClients(data.clients)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des clients')
    } finally {
      setLoadingClients(false)
    }
  }

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Le client est requis'
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'La date de fin doit être après la date de début'
      }
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Le budget doit être positif'
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Le progrès doit être entre 0 et 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Gestion des changements de formulaire
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Supprimer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Ajouter un milestone
  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      title: '',
      description: '',
      dueDate: '',
      completed: false
    }])
  }

  // Supprimer un milestone
  const removeMilestone = (index: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== index))
  }

  // Modifier un milestone
  const updateMilestone = (index: number, field: keyof Milestone, value: string | boolean) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    ))
  }

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        progress: parseInt(formData.progress.toString()),
        milestones: milestones.filter(m => m.title.trim())
      }

      const url = project 
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects'
      
      const method = project ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(project ? 'Projet modifié avec succès' : 'Projet créé avec succès')
      onSuccess?.()
      onClose()

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Titre du projet *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTitleAI(!showTitleAI)}
                      className="text-xs"
                    >
                      🤖 IA
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Système de gestion commerciale"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                  {showTitleAI && (
                    <div className="mt-2">
                      <QuickAIGenerator
                        onContentGenerated={(content) => {
                          handleInputChange('title', content)
                          setShowTitleAI(false)
                        }}
                        contentType="title"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => handleInputChange('clientId', value)}
                  >
                    <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingClients ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Chargement...</span>
                        </div>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-gray-500">{client.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.clientId && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientId}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDescriptionAI(!showDescriptionAI)}
                    className="text-xs"
                  >
                    🤖 IA
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez le projet en détail..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
                {showDescriptionAI && (
                  <div className="mt-2">
                    <AIContentGenerator
                      onContentGenerated={(content) => {
                        handleInputChange('description', content)
                        setShowDescriptionAI(false)
                      }}
                      contentType="description"
                      placeholder="Décrivez le type de projet pour générer une description détaillée..."
                      buttonText="Générer Description"
                      showProviderSelect={true}
                      showTypeSelect={false}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statut et progrès */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Statut et progrès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planification</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="progress">Progrès (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                    className={errors.progress ? 'border-red-500' : ''}
                  />
                  {errors.progress && (
                    <p className="text-sm text-red-500 mt-1">{errors.progress}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates et budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planning et budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget">Budget (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && (
                    <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Jalons du projet
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un jalon
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun jalon défini. Cliquez sur "Ajouter un jalon" pour commencer.
                </p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Jalon {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Titre du jalon</Label>
                          <Input
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            placeholder="Ex: Analyse des besoins"
                          />
                        </div>
                        
                        <div>
                          <Label>Date d'échéance</Label>
                          <Input
                            type="date"
                            value={milestone.dueDate || ''}
                            onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label>Description</Label>
                        <Textarea
                          value={milestone.description || ''}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Description détaillée du jalon..."
                          rows={2}
                        />
                      </div>

                      {project && (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`milestone-${index}`}
                            checked={milestone.completed}
                            onChange={(e) => updateMilestone(index, 'completed', e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor={`milestone-${index}`}>Jalon terminé</Label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {project ? 'Modifier' : 'Créer'} le projet
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}