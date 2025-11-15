import { prisma } from '@/lib/prisma'

// Types pour les projets
export interface ProjectData {
  id: string
  title: string
  description: string
  status: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  clientId: string
  startDate: string
  endDate?: string
  budget?: number
  progress: number
  tags: string[]
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name: string
    email: string
  }
  deliverables: DeliverableData[]
  timeline: TimelineEventData[]
}

export interface DeliverableData {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  completedAt?: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export interface TimelineEventData {
  id: string
  projectId: string
  title: string
  description?: string
  type: 'MILESTONE' | 'TASK' | 'MEETING' | 'DELIVERY' | 'NOTE'
  date: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectsResponse {
  projects: ProjectData[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  averageProgress: number
  totalBudget: number
}

// Récupérer les projets avec pagination et filtres
export async function getProjects(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  priority?: string,
  clientId?: string
): Promise<ProjectsResponse> {
  const skip = (page - 1) * limit

  // Construction des filtres
  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } }
    ]
  }

  if (status && status !== 'all') {
    where.status = status
  }

  if (priority && priority !== 'all') {
    where.priority = priority
  }

  if (clientId) {
    where.clientId = clientId
  }

  // Récupération des projets
  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        deliverables: {
          orderBy: { dueDate: 'asc' }
        },
        timeline: {
          orderBy: { date: 'desc' },
          take: 5 // Limiter les événements de timeline pour la liste
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.project.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    projects: projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as any,
      priority: project.priority as any,
      clientId: project.clientId,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString(),
      budget: project.budget || undefined,
      progress: project.progress,
      tags: project.tags,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client: project.client,
      deliverables: project.deliverables.map(d => ({
        id: d.id,
        projectId: d.projectId,
        title: d.title,
        description: d.description || undefined,
        status: d.status as any,
        dueDate: d.dueDate?.toISOString(),
        completedAt: d.completedAt?.toISOString(),
        fileUrl: d.fileUrl || undefined,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString()
      })),
      timeline: project.timeline.map(t => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description || undefined,
        type: t.type as any,
        date: t.date.toISOString(),
        completed: t.completed,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      }))
    })),
    totalCount,
    totalPages,
    currentPage: page
  }
}

// Récupérer un projet par ID
export async function getProjectById(id: string): Promise<ProjectData | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      deliverables: {
        orderBy: { dueDate: 'asc' }
      },
      timeline: {
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!project) return null

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status as any,
    priority: project.priority as any,
    clientId: project.clientId,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate?.toISOString(),
    budget: project.budget || undefined,
    progress: project.progress,
    tags: project.tags,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    client: project.client,
    deliverables: project.deliverables.map(d => ({
      id: d.id,
      projectId: d.projectId,
      title: d.title,
      description: d.description || undefined,
      status: d.status as any,
      dueDate: d.dueDate?.toISOString(),
      completedAt: d.completedAt?.toISOString(),
      fileUrl: d.fileUrl || undefined,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString()
    })),
    timeline: project.timeline.map(t => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description || undefined,
      type: t.type as any,
      date: t.date.toISOString(),
      completed: t.completed,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))
  }
}

// Créer un nouveau projet
export async function createProject(data: {
  title: string
  description: string
  clientId: string
  startDate: string
  endDate?: string
  budget?: number
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags?: string[]
}): Promise<ProjectData> {
  try {
    // Vérifier que le client existe
    const client = await prisma.user.findUnique({ 
      where: { id: data.clientId },
      select: { id: true, name: true, email: true }
    })

    if (!client) {
      throw new Error('Client non trouvé')
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget,
        priority: data.priority || 'MEDIUM',
        status: 'DRAFT',
        progress: 0,
        tags: data.tags || []
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        deliverables: true,
        timeline: true
      }
    })

    // Créer un événement de timeline pour la création du projet
    await prisma.timelineEvent.create({
      data: {
        projectId: project.id,
        title: 'Projet créé',
        description: `Le projet "${project.title}" a été créé`,
        type: 'NOTE',
        date: new Date(),
        completed: true
      }
    })

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as any,
      priority: project.priority as any,
      clientId: project.clientId,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString(),
      budget: project.budget || undefined,
      progress: project.progress,
      tags: project.tags,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client: project.client,
      deliverables: [],
      timeline: []
    }
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    throw new Error('Impossible de créer le projet')
  }
}

// Mettre à jour un projet
export async function updateProject(
  id: string,
  data: {
    title?: string
    description?: string
    status?: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    startDate?: string
    endDate?: string
    budget?: number
    progress?: number
    tags?: string[]
  }
): Promise<ProjectData> {
  const updateData: any = {
    ...data,
    updatedAt: new Date()
  }

  if (data.startDate) {
    updateData.startDate = new Date(data.startDate)
  }

  if (data.endDate) {
    updateData.endDate = new Date(data.endDate)
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      deliverables: {
        orderBy: { dueDate: 'asc' }
      },
      timeline: {
        orderBy: { date: 'desc' }
      }
    }
  })

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status as any,
    priority: project.priority as any,
    clientId: project.clientId,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate?.toISOString(),
    budget: project.budget || undefined,
    progress: project.progress,
    tags: project.tags,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    client: project.client,
    deliverables: project.deliverables.map(d => ({
      id: d.id,
      projectId: d.projectId,
      title: d.title,
      description: d.description || undefined,
      status: d.status as any,
      dueDate: d.dueDate?.toISOString(),
      completedAt: d.completedAt?.toISOString(),
      fileUrl: d.fileUrl || undefined,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString()
    })),
    timeline: project.timeline.map(t => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description || undefined,
      type: t.type as any,
      date: t.date.toISOString(),
      completed: t.completed,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))
  }
}

// Supprimer un projet
export async function deleteProject(id: string): Promise<void> {
  // Supprimer d'abord les livrables et événements de timeline
  await Promise.all([
    prisma.deliverable.deleteMany({ where: { projectId: id } }),
    prisma.timelineEvent.deleteMany({ where: { projectId: id } })
  ])

  // Puis supprimer le projet
  await prisma.project.delete({
    where: { id }
  })
}

// Récupérer les statistiques des projets
export async function getProjectStats(): Promise<ProjectStats> {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    progressData,
    budgetData
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.project.count({ where: { status: 'ON_HOLD' } }),
    prisma.project.aggregate({
      _avg: { progress: true }
    }),
    prisma.project.aggregate({
      _sum: { budget: true }
    })
  ])

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    averageProgress: progressData._avg.progress || 0,
    totalBudget: budgetData._sum.budget || 0
  }
}

// Ajouter un livrable à un projet
export async function addDeliverable(data: {
  projectId: string
  title: string
  description?: string
  dueDate?: string
}): Promise<DeliverableData> {
  const deliverable = await prisma.deliverable.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'PENDING'
    }
  })

  return {
    id: deliverable.id,
    projectId: deliverable.projectId,
    title: deliverable.title,
    description: deliverable.description || undefined,
    status: deliverable.status as any,
    dueDate: deliverable.dueDate?.toISOString(),
    completedAt: deliverable.completedAt?.toISOString(),
    fileUrl: deliverable.fileUrl || undefined,
    createdAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString()
  }
}

// Ajouter un événement à la timeline
export async function addTimelineEvent(data: {
  projectId: string
  title: string
  description?: string
  type: 'MILESTONE' | 'TASK' | 'MEETING' | 'DELIVERY' | 'NOTE'
  date: string
}): Promise<TimelineEventData> {
  const event = await prisma.timelineEvent.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      type: data.type,
      date: new Date(data.date),
      completed: false
    }
  })

  return {
    id: event.id,
    projectId: event.projectId,
    title: event.title,
    description: event.description || undefined,
    type: event.type as any,
    date: event.date.toISOString(),
    completed: event.completed,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }
}

// Récupérer les statuts de projet disponibles
export function getProjectStatuses() {
  return [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'ON_HOLD', label: 'En pause' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'CANCELLED', label: 'Annulé' }
  ]
}

// Récupérer les priorités disponibles
export function getProjectPriorities() {
  return [
    { value: 'LOW', label: 'Faible' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH', label: 'Élevée' },
    { value: 'URGENT', label: 'Urgente' }
  ]
}