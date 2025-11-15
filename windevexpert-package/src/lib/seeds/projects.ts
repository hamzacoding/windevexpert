import { PrismaClient, ProjectStatus } from '@prisma/client'

const prisma = new PrismaClient()

export const defaultProjects = [
  {
    title: 'Système de Gestion Commerciale',
    description: 'Développement d\'un système complet de gestion commerciale avec WinDev incluant la gestion des clients, produits, commandes et facturation.',
    status: ProjectStatus.COMPLETED,
    progress: 100,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-30'),
    milestones: [
      {
        title: 'Analyse des besoins',
        description: 'Définition des spécifications fonctionnelles et techniques',
        dueDate: new Date('2024-01-30'),
        completed: true
      },
      {
        title: 'Conception de la base de données',
        description: 'Modélisation et création de la structure de données',
        dueDate: new Date('2024-02-15'),
        completed: true
      },
      {
        title: 'Développement des modules principaux',
        description: 'Implémentation des fonctionnalités de base',
        dueDate: new Date('2024-03-15'),
        completed: true
      },
      {
        title: 'Tests et déploiement',
        description: 'Phase de tests et mise en production',
        dueDate: new Date('2024-03-30'),
        completed: true
      }
    ]
  },
  {
    title: 'Application Mobile de Suivi de Stock',
    description: 'Développement d\'une application mobile avec WinDev Mobile pour le suivi en temps réel des stocks en entrepôt.',
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-05-15'),
    milestones: [
      {
        title: 'Maquettage et design',
        description: 'Création des maquettes et du design de l\'application',
        dueDate: new Date('2024-02-20'),
        completed: true
      },
      {
        title: 'Développement interface utilisateur',
        description: 'Implémentation de l\'interface mobile',
        dueDate: new Date('2024-03-20'),
        completed: true
      },
      {
        title: 'Intégration API backend',
        description: 'Connexion avec les services backend',
        dueDate: new Date('2024-04-15'),
        completed: false
      },
      {
        title: 'Tests et optimisation',
        description: 'Phase de tests sur différents appareils',
        dueDate: new Date('2024-05-15'),
        completed: false
      }
    ]
  },
  {
    title: 'Site Web E-commerce avec WebDev',
    description: 'Création d\'une plateforme e-commerce complète avec WebDev incluant catalogue produits, panier, paiement et administration.',
    status: ProjectStatus.PLANNING,
    progress: 15,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-07-30'),
    milestones: [
      {
        title: 'Cahier des charges',
        description: 'Rédaction du cahier des charges détaillé',
        dueDate: new Date('2024-03-15'),
        completed: true
      },
      {
        title: 'Architecture technique',
        description: 'Définition de l\'architecture et des technologies',
        dueDate: new Date('2024-04-01'),
        completed: false
      },
      {
        title: 'Développement frontend',
        description: 'Création des pages et interfaces utilisateur',
        dueDate: new Date('2024-05-30'),
        completed: false
      },
      {
        title: 'Intégration paiement',
        description: 'Mise en place des solutions de paiement',
        dueDate: new Date('2024-06-30'),
        completed: false
      },
      {
        title: 'Tests et mise en ligne',
        description: 'Tests complets et déploiement en production',
        dueDate: new Date('2024-07-30'),
        completed: false
      }
    ]
  },
  {
    title: 'Système de Gestion RH',
    description: 'Développement d\'un système de gestion des ressources humaines avec gestion des employés, congés, paies et évaluations.',
    status: ProjectStatus.ON_HOLD,
    progress: 30,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-06-30'),
    milestones: [
      {
        title: 'Étude de faisabilité',
        description: 'Analyse de faisabilité et étude de marché',
        dueDate: new Date('2024-01-25'),
        completed: true
      },
      {
        title: 'Prototype initial',
        description: 'Développement d\'un prototype fonctionnel',
        dueDate: new Date('2024-02-28'),
        completed: true
      },
      {
        title: 'Module gestion employés',
        description: 'Développement du module de gestion des employés',
        dueDate: new Date('2024-04-15'),
        completed: false
      },
      {
        title: 'Module gestion congés',
        description: 'Implémentation de la gestion des congés',
        dueDate: new Date('2024-05-30'),
        completed: false
      },
      {
        title: 'Finalisation et tests',
        description: 'Finalisation du système et tests complets',
        dueDate: new Date('2024-06-30'),
        completed: false
      }
    ]
  }
]

export async function seedProjects() {
  console.log('🌱 Ajout des projets par défaut...')

  // Récupérer l'utilisateur admin comme client par défaut
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@windevexpert.com' }
  })

  if (!adminUser) {
    console.log('⚠️ Utilisateur admin non trouvé pour les projets')
    return
  }

  for (const projectData of defaultProjects) {
    // Vérifier si le projet existe déjà
    const existingProject = await prisma.project.findFirst({
      where: { title: projectData.title }
    })

    if (!existingProject) {
      // Créer le projet
      const project = await prisma.project.create({
        data: {
          title: projectData.title,
          description: projectData.description,
          status: projectData.status,
          progress: projectData.progress,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          clientId: adminUser.id
        }
      })

      // Créer les milestones
      for (const milestoneData of projectData.milestones) {
        await prisma.milestone.create({
          data: {
            title: milestoneData.title,
            description: milestoneData.description,
            dueDate: milestoneData.dueDate,
            completed: milestoneData.completed,
            projectId: project.id
          }
        })
      }

      console.log(`✅ Projet créé: ${project.title} avec ${projectData.milestones.length} milestones`)
    } else {
      console.log(`✅ Projet existant: ${existingProject.title}`)
    }
  }

  console.log('✅ Projets par défaut ajoutés avec succès')
}