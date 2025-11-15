'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  Clock,
  Star,
  Eye,
  PlayCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  slug?: string
  description: string
  shortDescription?: string
  duration: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  isActive: boolean
  price?: number
  priceDA?: number | null
  categoryId?: string | null
  category?: {
    id: string
    name: string
  } | null
  logo?: string | null
  lessons: {
    id: string
    title: string
    order: number
  }[]
  enrollments: {
    id: string
    user: {
      name: string | null
      email: string
    }
  }[]
  createdAt: string
  updatedAt: string
}

interface CoursesResponse {
  courses: Course[]
  total: number
  totalPages: number
  currentPage: number
}

const levelLabels = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé'
}

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800'
}

export default function CoursesManagement() {
  const router = useRouter()
  const [coursesData, setCoursesData] = useState<CoursesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async (page = 1, search = '', level = 'all') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(level !== 'all' && { level })
      })

      const response = await fetch(`/api/admin/courses?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des formations')
      }
      
      const data = await response.json()
      setCoursesData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses(currentPage, searchTerm, levelFilter)
  }, [currentPage, searchTerm, levelFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleLevelFilter = (level: 'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
    setLevelFilter(level)
    setCurrentPage(1)
  }

  const handleEdit = (course: Course) => {
    router.push(`/nimda/courses/${course.id}`)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      await fetchCourses(currentPage, searchTerm, levelFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
    fetchCourses(currentPage, searchTerm, levelFilter)
  }

  if (loading && !coursesData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Formations</h1>
            <p className="text-blue-100">
              Gérez vos cours, leçons et inscriptions
            </p>
          </div>
          <Button
            onClick={() => router.push('/nimda/courses/new')}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Formation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Formations</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.total || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Formations Actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.courses.filter(c => c.isActive).length || 0}
              </p>
            </div>
            <PlayCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leçons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.courses.reduce((acc, course) => acc + (course as any)._count?.lessons ?? (course.lessons?.length || 0), 0) || 0}
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.courses.reduce((acc, course) => acc + (course as any)._count?.enrollments ?? (course.enrollments?.length || 0), 0) || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={levelFilter}
              onChange={(e) => handleLevelFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leçons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix (€ / DA)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursesData?.courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {course.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {course.category?.name || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[course.level]}`}>
                      {levelLabels[course.level]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {course.duration}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(course as any)._count?.lessons ?? (course.lessons?.length || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(course as any)._count?.enrollments ?? (course.enrollments?.length || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="font-medium">{course.price}€</div>
                      {course.priceDA && (
                        <div className="text-xs text-gray-600">
                          {course.priceDA.toLocaleString()} DA
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {coursesData && coursesData.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Précédent
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(coursesData.totalPages, currentPage + 1))}
                disabled={currentPage === coursesData.totalPages}
                variant="outline"
              >
                Suivant
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, coursesData.total)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{coursesData.total}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: coursesData.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edition plein écran: modal retirée, navigation vers pages dédiées */}
    </div>
  )
}