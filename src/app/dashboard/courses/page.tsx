import { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { 
  BookOpen, 
  Clock, 
  Play,
  CheckCircle,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Download,
  Star,
  Users,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const metadata: Metadata = {
  title: 'Mes Formations - WinDevExpert',
  description: 'Gérez et suivez vos formations en cours et terminées'
}

// Mock data - will be replaced with real data from services
const mockEnrolledCourses = [
  {
    id: '1',
    title: 'WinDev Mobile Avancé',
    description: 'Maîtrisez le développement d\'applications mobiles avec WinDev Mobile',
    instructor: 'Pierre Martin',
    thumbnail: '/courses/windev-mobile.jpg',
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    duration: 480, // minutes
    watchedTime: 360,
    lastAccessed: '2024-01-15',
    status: 'IN_PROGRESS',
    rating: 4.8,
    enrolledAt: '2024-01-01',
    nextLesson: {
      id: 'lesson-19',
      title: 'Gestion des notifications push',
      duration: 25
    },
    category: 'Mobile',
    level: 'Avancé',
    certificate: null
  },
  {
    id: '2',
    title: 'WebDev et API REST',
    description: 'Créez des APIs REST robustes avec WebDev',
    instructor: 'Marie Dubois',
    thumbnail: '/courses/webdev-api.jpg',
    progress: 45,
    totalLessons: 18,
    completedLessons: 8,
    duration: 360,
    watchedTime: 162,
    lastAccessed: '2024-01-14',
    status: 'IN_PROGRESS',
    rating: 4.6,
    enrolledAt: '2024-01-05',
    nextLesson: {
      id: 'lesson-9',
      title: 'Authentification JWT',
      duration: 30
    },
    category: 'Web',
    level: 'Intermédiaire',
    certificate: null
  },
  {
    id: '3',
    title: 'HyperFileSQL Optimisation',
    description: 'Optimisez vos bases de données HyperFileSQL',
    instructor: 'Laurent Petit',
    thumbnail: '/courses/hfsql.jpg',
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    duration: 300,
    watchedTime: 300,
    lastAccessed: '2024-01-13',
    status: 'COMPLETED',
    rating: 4.9,
    enrolledAt: '2023-12-15',
    completedAt: '2024-01-10',
    nextLesson: null,
    category: 'Base de données',
    level: 'Avancé',
    certificate: {
      id: 'cert-1',
      url: '/certificates/hfsql-cert.pdf',
      issuedAt: '2024-01-10'
    }
  },
  {
    id: '4',
    title: 'WinDev Débutant',
    description: 'Les bases du développement avec WinDev',
    instructor: 'Sophie Bernard',
    thumbnail: '/courses/windev-basics.jpg',
    progress: 100,
    totalLessons: 20,
    completedLessons: 20,
    duration: 400,
    watchedTime: 400,
    lastAccessed: '2023-12-20',
    status: 'COMPLETED',
    rating: 4.7,
    enrolledAt: '2023-11-01',
    completedAt: '2023-12-20',
    nextLesson: null,
    category: 'Développement',
    level: 'Débutant',
    certificate: {
      id: 'cert-2',
      url: '/certificates/windev-basics-cert.pdf',
      issuedAt: '2023-12-20'
    }
  }
]

const mockStats = {
  totalCourses: 4,
  inProgress: 2,
  completed: 2,
  totalWatchTime: 1222, // minutes
  averageProgress: 80,
  certificates: 2
}

function CourseStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Total formations</p>
            <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">En cours</p>
            <p className="text-3xl font-bold text-gray-800">{stats.inProgress}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Play className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Terminées</p>
            <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600">Temps total</p>
            <p className="text-3xl font-bold text-gray-800">{Math.floor((stats.totalWatchTime || 0) / 60)}h</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseFilters({ initialFilters }: { initialFilters: { search?: string; status?: string; category?: string; sort?: string } }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
      <form method="get" className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="search"
              defaultValue={initialFilters.search || ''}
              placeholder="Rechercher dans mes formations..."
              className="pl-10 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select name="status" defaultValue={initialFilters.status || ''} className="px-4 py-2 border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-blue-200 shadow-sm">
            <option value="">Tous les statuts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminées</option>
            <option value="NOT_STARTED">Non commencées</option>
          </select>
          
          <select name="category" defaultValue={initialFilters.category || ''} className="px-4 py-2 border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-blue-200 shadow-sm">
            <option value="">Toutes les catégories</option>
            <option value="Mobile">Mobile</option>
            <option value="Web">Web</option>
            <option value="Base de données">Base de données</option>
            <option value="Développement">Développement</option>
          </select>

          <select name="sort" defaultValue={initialFilters.sort || 'last_accessed'} className="px-4 py-2 border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-blue-200 shadow-sm">
            <option value="last_accessed">Plus récent</option>
            <option value="progress">Progression</option>
            <option value="title">Titre</option>
          </select>
          
          <Button type="submit" variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </form>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminée
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
            <Play className="h-3 w-3 mr-1" />
            En cours
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg">
            Non commencée
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-16 w-16 text-white/80" />
        </div>
        <div className="absolute top-4 left-4">
          {getStatusBadge(course.status)}
        </div>
        {course.certificate && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-xl text-xs font-semibold flex items-center shadow-lg">
              <Award className="h-3 w-3 mr-1" />
              Certifié
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-700 ml-1">{course.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Users className="h-4 w-4 mr-1" />
          <span className="mr-4 font-medium">{course.instructor}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span className="font-medium">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Progression</span>
            <span className="font-bold text-gray-800">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span className="font-medium">{course.completedLessons}/{course.totalLessons} leçons</span>
            <span className="font-medium">{Math.floor(course.watchedTime / 60)}h regardées</span>
          </div>
        </div>
        
        {course.nextLesson && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100">
            <p className="text-sm font-bold text-gray-800">Prochaine leçon :</p>
            <p className="text-sm text-gray-700 font-medium">{course.nextLesson.title}</p>
            <p className="text-xs text-gray-500 font-medium">{course.nextLesson.duration} minutes</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <Calendar className="h-3 w-3 inline mr-1" />
            <span className="font-medium">Dernière activité : {new Date(course.lastAccessed).toLocaleDateString('fr-FR')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {course.certificate && (
              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-1" />
                Certificat
              </Button>
            )}
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg">
              {course.status === 'COMPLETED' ? 'Revoir' : 'Continuer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CoursesList({ courses }: { courses: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

function ProgressOverview({ stats }: { stats: any }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Aperçu de votre progression</h2>
        <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Voir les détails
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{stats.averageProgress}%</div>
          <div className="text-sm font-semibold text-gray-600">Progression moyenne</div>
        </div>
        
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">{stats.certificates}</div>
          <div className="text-sm font-semibold text-gray-600">Certificats obtenus</div>
        </div>
        
        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {Math.floor((stats.totalWatchTime || 0) / 60)}h
          </div>
          <div className="text-sm font-semibold text-gray-600">Temps d'apprentissage</div>
        </div>
      </div>
    </div>
  )
}

export default async function MyCoursesPage({ searchParams }: { searchParams: { search?: string; status?: string; category?: string; sort?: string } }) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set('search', searchParams.search);
  if (searchParams?.status) params.set('status', searchParams.status);
  if (searchParams?.category) params.set('category', searchParams.category);
  if (searchParams?.sort) params.set('sort', searchParams.sort);

  const host = headers().get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const query = params.toString();
  const url = `${baseUrl}/api/dashboard/courses${query ? `?${query}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load courses');
  const data = await res.json();
  const courses = data.courses || [];
  const stats = data.stats || { totalCourses: 0, inProgress: 0, completed: 0, totalWatchTime: 0, averageProgress: 0, certificates: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Mes Formations</h1>
          <p className="text-gray-700 text-lg font-medium">
            Suivez votre progression et continuez votre apprentissage
          </p>
        </div>
        
        <CourseStats stats={stats} />
        <ProgressOverview stats={stats} />
        <CourseFilters initialFilters={{
          search: searchParams?.search || '',
          status: searchParams?.status || '',
          category: searchParams?.category || '',
          sort: searchParams?.sort || 'last_accessed',
        }} />
        
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }>
          <CoursesList courses={courses} />
        </Suspense>
      </div>
    </div>
  )
}