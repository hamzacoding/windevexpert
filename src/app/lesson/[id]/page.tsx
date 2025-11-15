'use client'

import VideoLesson from '@/components/video/video-lesson'

// Mock lesson data - in a real app, this would come from your database
const mockLesson = {
  id: 'lesson-1',
  title: 'Introduction à WinDev - Les bases du développement',
  description: `Dans cette première leçon, nous allons découvrir les fondamentaux de WinDev. 
  
  Vous apprendrez :
  • L'interface de développement WinDev
  • La création de votre premier projet
  • Les concepts de base : fenêtres, champs, et événements
  • Les bonnes pratiques de développement
  
  Cette leçon est essentielle pour bien commencer votre apprentissage de WinDev. Prenez le temps de bien assimiler chaque concept avant de passer à la suite.`,
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 596, // 9:56 in seconds
  courseId: 'course-windev-basics',
  courseName: 'WinDev - Formation Complète',
  chapterTitle: 'Chapitre 1 : Prise en main',
  resources: [
    {
      id: 'resource-1',
      title: 'Guide de démarrage WinDev',
      type: 'pdf' as const,
      url: '/resources/windev-starter-guide.pdf',
      size: '2.5 MB'
    },
    {
      id: 'resource-2',
      title: 'Projet exemple - Première application',
      type: 'zip' as const,
      url: '/resources/first-app-example.zip',
      size: '1.2 MB'
    },
    {
      id: 'resource-3',
      title: 'Documentation officielle WinDev',
      type: 'link' as const,
      url: 'https://doc.windev.com'
    }
  ],
  transcript: `Bonjour et bienvenue dans cette formation complète sur WinDev.

Je suis ravi de vous accompagner dans votre apprentissage de cet outil de développement puissant et polyvalent.

Dans cette première leçon, nous allons découvrir ensemble l'interface de WinDev et créer notre tout premier projet.

WinDev est un environnement de développement intégré qui permet de créer des applications Windows, des sites web, et des applications mobiles avec un seul et même code source.

Commençons par ouvrir WinDev et explorer son interface...

[La transcription complète serait beaucoup plus longue dans un vrai cours]`,
  nextLessonId: 'lesson-2',
  previousLessonId: undefined
}

interface PageProps {
  params: {
    id: string
  }
}

export default function LessonPage({ params }: PageProps) {
  const handleLessonComplete = (lessonId: string) => {
    console.log('Lesson completed:', lessonId)
    // In a real app, you would update the user's progress in the database
  }

  const handleNavigate = (lessonId: string) => {
    console.log('Navigate to lesson:', lessonId)
    // In a real app, you would navigate to the new lesson
    // router.push(`/lesson/${lessonId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VideoLesson
        lesson={mockLesson}
        onLessonComplete={handleLessonComplete}
        onNavigate={handleNavigate}
      />
    </div>
  )
}