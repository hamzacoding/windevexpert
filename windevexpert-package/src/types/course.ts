export interface Course {
  id: string
  title: string
  slug: string
  description: string
  longDescription?: string
  thumbnail: string
  trailer?: string
  instructor: Instructor
  category: CourseCategory
  level: CourseLevel
  language: string
  duration: number // in minutes
  price: number
  originalPrice?: number
  isPublished: boolean
  isFeatured: boolean
  isOnSale: boolean
  tags: string[]
  requirements: string[]
  whatYouWillLearn: string[]
  targetAudience: string[]
  rating: number
  reviewCount: number
  enrollmentCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  lastUpdatedAt?: Date
}

export interface CourseCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentId?: string
  children?: CourseCategory[]
  courseCount: number
}

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'

export interface Instructor {
  id: string
  name: string
  avatar?: string
  bio: string
  title: string
  rating: number
  studentCount: number
  courseCount: number
  experience: string
  expertise: string[]
  socialLinks: {
    website?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  }
}

export interface Lesson {
  id: string
  courseId: string
  chapterId?: string
  title: string
  slug: string
  description?: string
  type: LessonType
  content: LessonContent
  duration: number // in minutes
  order: number
  isPreview: boolean
  isPublished: boolean
  resources: LessonResource[]
  quiz?: Quiz
  createdAt: Date
  updatedAt: Date
}

export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'DOWNLOAD'

export interface LessonContent {
  video?: VideoContent
  text?: string
  downloadUrl?: string
  externalUrl?: string
}

export interface VideoContent {
  url: string
  duration: number
  quality: VideoQuality[]
  subtitles?: Subtitle[]
  thumbnail?: string
  drmProtected: boolean
}

export interface VideoQuality {
  resolution: string
  url: string
  size?: number
}

export interface Subtitle {
  language: string
  url: string
}

export interface LessonResource {
  id: string
  title: string
  type: 'PDF' | 'ZIP' | 'LINK' | 'CODE'
  url: string
  size?: number
  description?: string
}

export interface Chapter {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  duration: number // total duration of all lessons
  isPublished: boolean
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  passingScore: number
  timeLimit?: number // in minutes
  maxAttempts?: number
  showCorrectAnswers: boolean
}

export interface QuizQuestion {
  id: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: EnrollmentStatus
  progress: number // percentage 0-100
  completedLessons: string[]
  currentLesson?: string
  lastAccessedAt?: Date
  completedAt?: Date
  certificateIssued: boolean
  enrolledAt: Date
  expiresAt?: Date
}

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'EXPIRED'

export interface CourseProgress {
  courseId: string
  userId: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  timeSpent: number // in minutes
  lastAccessedLesson?: string
  lastAccessedAt?: Date
  quizScores: QuizScore[]
  certificates: Certificate[]
}

export interface QuizScore {
  quizId: string
  lessonId: string
  score: number
  maxScore: number
  attempts: number
  completedAt: Date
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  templateId: string
  certificateUrl: string
  issuedAt: Date
  verificationCode: string
  metadata: {
    courseName: string
    instructorName: string
    completionDate: Date
    grade?: string
  }
}

export interface CourseReview {
  id: string
  userId: string
  courseId: string
  rating: number
  title?: string
  comment?: string
  isVerifiedPurchase: boolean
  helpfulVotes: number
  createdAt: Date
  updatedAt: Date
  user: {
    name: string
    avatar?: string
  }
}

export interface CourseFilter {
  category?: string
  level?: CourseLevel
  instructor?: string
  priceRange?: {
    min: number
    max: number
  }
  duration?: {
    min: number
    max: number
  }
  rating?: number
  language?: string
  isFree?: boolean
  isFeatured?: boolean
  tags?: string[]
}

export interface CourseSearchResult {
  courses: Course[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: {
    categories: CourseCategory[]
    instructors: Instructor[]
    levels: CourseLevel[]
    languages: string[]
    priceRanges: { min: number; max: number; count: number }[]
  }
}