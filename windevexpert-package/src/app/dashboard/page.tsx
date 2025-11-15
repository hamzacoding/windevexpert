'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Play,
  Star,
  Calendar,
  Target,
  Award,
  BarChart3,
  Users,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data - will be replaced with real data from services// Mock data
const mockStats = {
  coursesEnrolled: 12,
  coursesCompleted: 8,
  lessonsCompleted: 156,
  totalWatchTime: 2340, // minutes
  achievements: 15,
  rank: 'Gold',
  points: 2450
}

const mockRecentCourses = [
  {
    id: '1',
    title: 'WinDev Mobile Avancé',
    progress: 75,
    lastAccessed: '2024-01-15',
    thumbnail: '/courses/windev-mobile.jpg',
    instructor: 'Pierre Martin',
    nextLesson: 'Gestion des notifications push'
  },
  {
    id: '2',
    title: 'WebDev et API REST',
    progress: 45,
    lastAccessed: '2024-01-14',
    thumbnail: '/courses/webdev-api.jpg',
    instructor: 'Marie Dubois',
    nextLesson: 'Authentification JWT'
  },
  {
    id: '3',
    title: 'HyperFileSQL Optimisation',
    progress: 90,
    lastAccessed: '2024-01-13',
    thumbnail: '/courses/hfsql.jpg',
    instructor: 'Laurent Petit',
    nextLesson: 'Index et performances'
  }
]

const mockRecentAchievements = [
  {
    id: '1',
    title: 'Première formation terminée',
    description: 'Félicitations pour avoir terminé votre première formation !',
    icon: '🎓',
    earnedAt: '2024-01-15',
    points: 100
  },
  {
    id: '2',
    title: 'Série de 7 jours',
    description: 'Vous avez étudié 7 jours consécutifs',
    icon: '🔥',
    earnedAt: '2024-01-14',
    points: 50
  },
  {
    id: '3',
    title: 'Expert Quiz',
    description: '100% de réussite sur 5 quiz consécutifs',
    icon: '🧠',
    earnedAt: '2024-01-12',
    points: 75
  }
]

const mockUpcomingEvents = [
  {
    id: '1',
    title: 'Webinaire : Nouveautés WinDev 29',
    date: '2024-01-20',
    time: '14:00',
    type: 'webinar',
    instructor: 'Pierre Martin'
  },
  {
    id: '2',
    title: 'Session Q&A : WebDev Mobile',
    date: '2024-01-22',
    time: '16:00',
    type: 'qa',
    instructor: 'Marie Dubois'
  }
]

function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 xl:mb-8">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-0 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Formations suivies</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.coursesEnrolled ?? 0}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-emerald-600 font-medium">
            <TrendingUp className="h-4 w-4 mr-1" />
            +2 ce mois
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-0 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Formations terminées</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.coursesCompleted ?? 0}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-emerald-600 font-medium">
            <Target className="h-4 w-4 mr-1" />
            67% de réussite
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-0 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Temps d'étude</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{Math.floor((stats?.totalWatchTime ?? 0) / 60)}h</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-purple-600 font-medium">
            <BarChart3 className="h-4 w-4 mr-1" />
            +5h cette semaine
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-0 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Points</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.points ?? 0}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-amber-600 font-medium">
            <Star className="h-4 w-4 mr-1" />
            Niveau {stats?.rank ?? 'Bronze'}
          </div>
        </div>
      </div>
    </div>
  )
}

function WelcomeSection({ session, stats }: { session: any, stats: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 sm:p-8 text-white mb-6 xl:mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Bonjour, {session?.user?.name || 'Utilisateur'} ! 👋
          </h1>
          <p className="text-blue-100 mb-4 text-sm sm:text-base">
            Prêt à continuer votre apprentissage ? Bienvenue sur votre tableau de bord !
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">{stats?.points ?? 0} points</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">Niveau {stats?.rank ?? 'Bronze'}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">{stats?.achievements ?? 0} succès</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:block ml-6">
          <div className="w-24 h-24 xl:w-32 xl:h-32 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="h-12 w-12 xl:h-16 xl:w-16 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentCourses({ courses }: { courses: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Formations en cours</h2>
        <Button variant="outline" size="sm" className="border-gray-200 hover:border-blue-300 hover:bg-blue-50">
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Play className="h-7 w-7 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{course.title}</h3>
              <p className="text-sm text-gray-600 font-medium">par {course.instructor}</p>
              <p className="text-sm text-gray-500">Prochaine leçon : {course.nextLesson}</p>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progression</span>
                  <span className="font-bold text-gray-800">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
            
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
              Continuer
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentAchievements({ achievements }: { achievements: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Succès récents</h2>
        <Button variant="outline" size="sm" className="border-gray-200 hover:border-yellow-300 hover:bg-yellow-50">
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 hover:shadow-md">
            <div className="text-3xl bg-white rounded-xl p-2 shadow-md">{achievement.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
              <p className="text-sm text-gray-600 font-medium">{achievement.description}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(achievement.earnedAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="text-right bg-white rounded-xl p-3 shadow-md">
              <div className="text-lg font-bold text-yellow-600">+{achievement.points}</div>
              <div className="text-sm text-gray-500 font-medium">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpcomingEvents({ events }: { events: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Événements à venir</h2>
        <Button variant="outline" size="sm" className="border-gray-200 hover:border-green-300 hover:bg-green-50">
          Calendrier
        </Button>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all duration-300 hover:shadow-md">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{event.title}</h3>
              <p className="text-sm text-gray-600 font-medium">par {event.instructor}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 shadow-md">
              S'inscrire
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-0">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <BookOpen className="h-7 w-7" />
          <span className="text-sm font-medium">Parcourir les formations</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <Download className="h-7 w-7 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Télécharger des ressources</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <Users className="h-7 w-7 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">Communauté</span>
        </Button>
        
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <Trophy className="h-7 w-7 text-yellow-600" />
          <span className="text-sm font-medium text-gray-700">Mes succès</span>
        </Button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const [stats, setStats] = useState<any>(null)
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [recentAchievements, setRecentAchievements] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Erreur lors du chargement du dashboard')
        const data = await res.json()
        setStats(data?.stats ?? null)
        setRecentCourses(data?.recentCourses ?? [])
        setRecentAchievements(data?.recentAchievements ?? [])
        setUpcomingEvents(data?.upcomingEvents ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  
  return (
    <div className="space-y-6 xl:space-y-8">
      <WelcomeSection session={session} stats={stats ?? { points: 0, rank: 'Bronze', achievements: 0 }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        <div className="lg:col-span-2 space-y-6 xl:space-y-8">
          <DashboardStats stats={stats ?? { coursesEnrolled: 0, coursesCompleted: 0, totalWatchTime: 0, points: 0, rank: 'Bronze' }} />
          <RecentCourses courses={recentCourses} />
        </div>
        
        <div className="space-y-6 xl:space-y-8">
          <RecentAchievements achievements={recentAchievements} />
          <UpcomingEvents events={upcomingEvents} />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}