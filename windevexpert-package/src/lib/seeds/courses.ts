import { PrismaClient, CourseLevel } from '@prisma/client'

const prisma = new PrismaClient()

export const defaultCourses = [
  {
    title: 'WinDev - Les Fondamentaux',
    slug: 'formation-windev-debutant',
    description: 'Apprenez les bases du développement avec WinDev. Ce cours couvre les concepts essentiels pour débuter avec cet environnement de développement.',
    duration: 480, // 8 heures
    level: CourseLevel.BEGINNER,
    price: 199.99,
    features: JSON.stringify([
      'Accès à vie au contenu',
      'Exercices pratiques',
      'Support par email',
      'Certificat de completion'
    ]),
    lessons: [
      {
        title: 'Introduction à WinDev',
        description: 'Découverte de l\'environnement WinDev et de ses possibilités',
        videoUrl: 'https://example.com/videos/windev-intro.mp4',
        duration: 60,
        order: 1
      },
      {
        title: 'Premier projet WinDev',
        description: 'Création de votre première application avec WinDev',
        videoUrl: 'https://example.com/videos/premier-projet.mp4',
        duration: 90,
        order: 2
      },
      {
        title: 'Les fenêtres et contrôles',
        description: 'Maîtrisez la création d\'interfaces utilisateur',
        videoUrl: 'https://example.com/videos/fenetres-controles.mp4',
        duration: 120,
        order: 3
      },
      {
        title: 'Gestion des données',
        description: 'Apprenez à manipuler les données avec HyperFileSQL',
        videoUrl: 'https://example.com/videos/gestion-donnees.mp4',
        duration: 150,
        order: 4
      },
      {
        title: 'Déploiement d\'application',
        description: 'Comment déployer votre application WinDev',
        videoUrl: 'https://example.com/videos/deploiement.mp4',
        duration: 60,
        order: 5
      }
    ]
  },
  {
    title: 'WinDev Avancé - Techniques Professionnelles',
    slug: 'formation-windev-avance',
    description: 'Perfectionnez vos compétences WinDev avec des techniques avancées utilisées par les professionnels.',
    duration: 720, // 12 heures
    level: CourseLevel.ADVANCED,
    price: 399.99,
    features: JSON.stringify([
      'Accès à vie au contenu',
      'Projets réels',
      'Support prioritaire',
      'Certificat professionnel',
      'Accès à la communauté privée'
    ]),
    lessons: [
      {
        title: 'Architecture avancée',
        description: 'Structurer vos applications pour la performance et la maintenabilité',
        videoUrl: 'https://example.com/videos/architecture-avancee.mp4',
        duration: 120,
        order: 1
      },
      {
        title: 'Optimisation des performances',
        description: 'Techniques pour optimiser vos applications WinDev',
        videoUrl: 'https://example.com/videos/optimisation.mp4',
        duration: 90,
        order: 2
      },
      {
        title: 'Intégration Web Services',
        description: 'Connecter vos applications à des services web',
        videoUrl: 'https://example.com/videos/web-services.mp4',
        duration: 150,
        order: 3
      },
      {
        title: 'Sécurité et cryptage',
        description: 'Sécuriser vos applications et données',
        videoUrl: 'https://example.com/videos/securite.mp4',
        duration: 120,
        order: 4
      },
      {
        title: 'Tests automatisés',
        description: 'Mettre en place des tests automatisés',
        videoUrl: 'https://example.com/videos/tests-automatises.mp4',
        duration: 90,
        order: 5
      },
      {
        title: 'Déploiement en production',
        description: 'Stratégies de déploiement professionnel',
        videoUrl: 'https://example.com/videos/deploiement-pro.mp4',
        duration: 150,
        order: 6
      }
    ]
  },
  {
    title: 'WebDev - Développement Web Moderne',
    slug: 'formation-webdev-complet',
    description: 'Maîtrisez WebDev pour créer des applications web modernes et performantes.',
    duration: 600, // 10 heures
    level: CourseLevel.INTERMEDIATE,
    price: 299.99,
    features: JSON.stringify([
      'Accès à vie au contenu',
      'Projets web complets',
      'Support technique',
      'Certificat de completion',
      'Code source des projets'
    ]),
    lessons: [
      {
        title: 'Introduction à WebDev',
        description: 'Découverte de WebDev et du développement web',
        videoUrl: 'https://example.com/videos/webdev-intro.mp4',
        duration: 60,
        order: 1
      },
      {
        title: 'Création de pages dynamiques',
        description: 'Créer des pages web interactives avec WebDev',
        videoUrl: 'https://example.com/videos/pages-dynamiques.mp4',
        duration: 120,
        order: 2
      },
      {
        title: 'Gestion des sessions et cookies',
        description: 'Maîtriser la gestion des sessions utilisateur',
        videoUrl: 'https://example.com/videos/sessions-cookies.mp4',
        duration: 90,
        order: 3
      },
      {
        title: 'Base de données web',
        description: 'Connecter votre site à une base de données',
        videoUrl: 'https://example.com/videos/bdd-web.mp4',
        duration: 150,
        order: 4
      },
      {
        title: 'Responsive Design',
        description: 'Créer des sites adaptatifs pour tous les écrans',
        videoUrl: 'https://example.com/videos/responsive.mp4',
        duration: 120,
        order: 5
      },
      {
        title: 'Déploiement et hébergement',
        description: 'Mettre en ligne votre application WebDev',
        videoUrl: 'https://example.com/videos/deploiement-web.mp4',
        duration: 60,
        order: 6
      }
    ]
  }
]

export async function seedCourses() {
  console.log('🌱 Ajout des cours par défaut...')

  for (const courseData of defaultCourses) {
    // Trouver une catégorie pour les cours
    const category = await prisma.category.findFirst({
      where: { slug: 'developpement-web' }
    })

    if (!category) {
      console.log('⚠️ Aucune catégorie trouvée pour les cours')
      continue
    }

    // Vérifier si le cours existe déjà par slug
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseData.slug }
    })

    if (!existingCourse) {
      // Créer le cours standalone
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          duration: courseData.duration,
          level: courseData.level,
          categoryId: category.id,
          price: courseData.price,
          features: courseData.features
        }
      })

      // Créer les leçons
      for (const lessonData of courseData.lessons) {
        await prisma.lesson.create({
          data: {
            ...lessonData,
            courseId: course.id
          }
        })
      }

      console.log(`✅ Cours créé: ${course.title} avec ${courseData.lessons.length} leçons`)
    } else {
      console.log(`✅ Cours existant: ${existingCourse.title}`)
    }
  }

  console.log('✅ Cours par défaut ajoutés avec succès')
}