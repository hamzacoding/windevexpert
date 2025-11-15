import { FirestoreService } from '../firestore'
import { 
  Course, 
  CourseFilter, 
  CourseSearchResult, 
  Enrollment, 
  CourseProgress,
  Lesson,
  Chapter,
  CourseReview,
  Quiz,
  QuizScore,
  Certificate,
  CourseCategory
} from '@/types/course'

export class CourseService {
  private static readonly COLLECTION = 'courses'
  private static readonly ENROLLMENTS_COLLECTION = 'enrollments'
  private static readonly PROGRESS_COLLECTION = 'course_progress'
  private static readonly REVIEWS_COLLECTION = 'course_reviews'
  private static readonly CATEGORIES_COLLECTION = 'course_categories'

  // Course Management
  static async getCourses(filter: CourseFilter & {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<CourseSearchResult> {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = filter

    const query: any = { isPublished: true }

    // Apply filters
    if (filters.category) {
      query.categoryId = filters.category
    }
    if (filters.level) {
      query.level = filters.level
    }
    if (filters.instructor) {
      query['instructor.id'] = filters.instructor
    }
    if (filters.language) {
      query.language = filters.language
    }
    if (filters.isFree !== undefined) {
      query.price = filters.isFree ? 0 : { '!=': 0 }
    }
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured
    }
    if (filters.rating) {
      query.rating = { '>=': filters.rating }
    }
    if (filters.priceRange) {
      query.price = {
        '>=': filters.priceRange.min,
        '<=': filters.priceRange.max
      }
    }
    if (filters.duration) {
      query.duration = {
        '>=': filters.duration.min,
        '<=': filters.duration.max
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { 'array-contains-any': filters.tags }
    }

    const result = await FirestoreService.getDocuments(
      this.COLLECTION,
      query,
      { page, limit, sortBy, sortOrder }
    )

    // Get filter options
    const categories = await this.getCategories()
    const instructors = await this.getInstructors()

    return {
      courses: result.documents as Course[],
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      filters: {
        categories,
        instructors,
        levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
        languages: ['fr', 'en'],
        priceRanges: [
          { min: 0, max: 0, count: 0 }, // Free
          { min: 1, max: 50, count: 0 },
          { min: 51, max: 100, count: 0 },
          { min: 101, max: 200, count: 0 },
          { min: 201, max: 999999, count: 0 }
        ]
      }
    }
  }

  static async getCourseById(id: string): Promise<Course | null> {
    return await FirestoreService.getDocument(this.COLLECTION, id) as Course | null
  }

  static async getCourseBySlug(slug: string): Promise<Course | null> {
    const result = await FirestoreService.getDocuments(
      this.COLLECTION,
      { slug, isPublished: true },
      { limit: 1 }
    )
    return result.documents[0] as Course | null
  }

  static async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    const result = await FirestoreService.getDocuments(
      this.COLLECTION,
      { isFeatured: true, isPublished: true },
      { limit, sortBy: 'createdAt', sortOrder: 'desc' }
    )
    return result.documents as Course[]
  }

  static async getPopularCourses(limit: number = 6): Promise<Course[]> {
    const result = await FirestoreService.getDocuments(
      this.COLLECTION,
      { isPublished: true },
      { limit, sortBy: 'enrollmentCount', sortOrder: 'desc' }
    )
    return result.documents as Course[]
  }

  static async getRelatedCourses(courseId: string, limit: number = 4): Promise<Course[]> {
    const course = await this.getCourseById(courseId)
    if (!course) return []

    const result = await FirestoreService.getDocuments(
      this.COLLECTION,
      { 
        categoryId: course.category.id,
        isPublished: true,
        id: { '!=': courseId }
      },
      { limit, sortBy: 'rating', sortOrder: 'desc' }
    )
    return result.documents as Course[]
  }

  // Course Content Management
  static async getCourseChapters(courseId: string): Promise<Chapter[]> {
    const result = await FirestoreService.queryDocuments<Chapter>(
      'course_chapters',
      { 
        where: [
          { field: 'courseId', operator: '==', value: courseId },
          { field: 'isPublished', operator: '==', value: true }
        ],
        orderBy: 'order',
        orderDirection: 'asc'
      }
    )
    return result
  }

  static async getChapterLessons(chapterId: string): Promise<Lesson[]> {
    const result = await FirestoreService.queryDocuments<Lesson>(
      'course_lessons',
      { 
        where: [
          { field: 'chapterId', operator: '==', value: chapterId },
          { field: 'isPublished', operator: '==', value: true }
        ],
        orderBy: 'order',
        orderDirection: 'asc'
      }
    )
    return result
  }

  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    return await FirestoreService.getDocument('course_lessons', lessonId) as Lesson | null
  }

  // Enrollment Management
  static async enrollInCourse(userId: string, courseId: string): Promise<Enrollment> {
    const enrollmentData: Omit<Enrollment, 'id'> = {
      userId,
      courseId,
      status: 'ACTIVE',
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date(),
      certificateIssued: false
    }

    const enrollmentId = await FirestoreService.createDocument(
      this.ENROLLMENTS_COLLECTION,
      enrollmentData
    )

    // Update course enrollment count
    const course = await this.getCourseById(courseId)
    if (course) {
      await FirestoreService.updateDocument(this.COLLECTION, courseId, {
        enrollmentCount: (course.enrollmentCount || 0) + 1
      })
    }

    return { id: enrollmentId, ...enrollmentData }
  }

  static async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const result = await FirestoreService.queryDocuments<Enrollment>(
      this.ENROLLMENTS_COLLECTION,
      { 
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: 'enrolledAt',
        orderDirection: 'desc'
      }
    )
    return result
  }

  static async getUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    const result = await FirestoreService.queryDocuments<Enrollment>(
      this.ENROLLMENTS_COLLECTION,
      { 
        where: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'courseId', operator: '==', value: courseId }
        ],
        limit: 1
      }
    )
    return result[0] || null
  }

  static async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.getUserEnrollment(userId, courseId)
    return enrollment !== null && enrollment.status === 'ACTIVE'
  }

  // Progress Tracking
  static async updateLessonProgress(
    userId: string, 
    courseId: string, 
    lessonId: string,
    completed: boolean = true
  ): Promise<void> {
    const enrollment = await this.getUserEnrollment(userId, courseId)
    if (!enrollment) throw new Error('User not enrolled in course')

    const completedLessons = completed 
      ? [...new Set([...enrollment.completedLessons, lessonId])]
      : enrollment.completedLessons.filter(id => id !== lessonId)

    // Get total lessons count
    const chapters = await this.getCourseChapters(courseId)
    let totalLessons = 0
    for (const chapter of chapters) {
      const lessons = await this.getChapterLessons(chapter.id)
      totalLessons += lessons.length
    }

    const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0

    await FirestoreService.updateDocument(this.ENROLLMENTS_COLLECTION, enrollment.id, {
      completedLessons,
      progress,
      currentLesson: lessonId,
      lastAccessedAt: new Date(),
      ...(progress >= 100 && { 
        status: 'COMPLETED',
        completedAt: new Date()
      })
    })

    // Update progress collection
    await this.updateCourseProgress(userId, courseId, lessonId)
  }

  static async updateCourseProgress(
    userId: string, 
    courseId: string, 
    lessonId: string
  ): Promise<void> {
    const progressId = `${userId}_${courseId}`
    const enrollment = await this.getUserEnrollment(userId, courseId)
    if (!enrollment) return

    const progressData: Partial<CourseProgress> = {
      courseId,
      userId,
      completedLessons: enrollment.completedLessons.length,
      progressPercentage: enrollment.progress,
      lastAccessedLesson: lessonId,
      lastAccessedAt: new Date()
    }

    await FirestoreService.updateDocument(
      this.PROGRESS_COLLECTION,
      progressId,
      progressData,
      { upsert: true }
    )
  }

  static async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    const progressId = `${userId}_${courseId}`
    return await FirestoreService.getDocument(
      this.PROGRESS_COLLECTION, 
      progressId
    ) as CourseProgress | null
  }

  // Quiz Management
  static async submitQuizAnswer(
    userId: string,
    courseId: string,
    lessonId: string,
    quizId: string,
    answers: Record<string, any>,
    timeSpent: number
  ): Promise<QuizScore> {
    const lesson = await this.getLessonById(lessonId)
    if (!lesson?.quiz) throw new Error('Quiz not found')

    const quiz = lesson.quiz
    let score = 0
    let maxScore = 0

    // Calculate score
    for (const question of quiz.questions) {
      maxScore += question.points
      const userAnswer = answers[question.id]
      
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        if (userAnswer === question.correctAnswer) {
          score += question.points
        }
      } else if (question.type === 'FILL_BLANK') {
        if (Array.isArray(question.correctAnswer)) {
          const correctAnswers = question.correctAnswer as string[]
          if (correctAnswers.some(correct => 
            userAnswer?.toLowerCase().trim() === correct.toLowerCase().trim()
          )) {
            score += question.points
          }
        }
      }
    }

    const quizScore: QuizScore = {
      quizId,
      lessonId,
      score,
      maxScore,
      attempts: 1,
      completedAt: new Date()
    }

    // Save quiz score
    await FirestoreService.createDocument('quiz_scores', {
      userId,
      courseId,
      ...quizScore,
      answers,
      timeSpent
    })

    // Update lesson progress if passed
    const passingScore = (quiz.passingScore / 100) * maxScore
    if (score >= passingScore) {
      await this.updateLessonProgress(userId, courseId, lessonId, true)
    }

    return quizScore
  }

  // Reviews Management
  static async createReview(
    userId: string,
    courseId: string,
    rating: number,
    title?: string,
    comment?: string
  ): Promise<CourseReview> {
    const reviewData: Omit<CourseReview, 'id'> = {
      userId,
      courseId,
      rating,
      title,
      comment,
      isVerifiedPurchase: await this.isUserEnrolled(userId, courseId),
      helpfulVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        name: '', // Will be populated from user service
        avatar: undefined
      }
    }

    const reviewId = await FirestoreService.createDocument(
      this.REVIEWS_COLLECTION,
      reviewData
    )

    // Update course rating
    await this.updateCourseRating(courseId)

    return { id: reviewId, ...reviewData }
  }

  static async getCourseReviews(courseId: string, page: number = 1, limit: number = 10) {
    return await FirestoreService.getDocuments(
      this.REVIEWS_COLLECTION,
      { courseId },
      { page, limit, sortBy: 'createdAt', sortOrder: 'desc' }
    )
  }

  private static async updateCourseRating(courseId: string): Promise<void> {
    const reviews = await FirestoreService.getDocuments(
      this.REVIEWS_COLLECTION,
      { courseId }
    )

    if (reviews.documents.length === 0) return

    const totalRating = reviews.documents.reduce(
      (sum, review: any) => sum + review.rating, 
      0
    )
    const averageRating = totalRating / reviews.documents.length

    await FirestoreService.updateDocument(this.COLLECTION, courseId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.documents.length
    })
  }

  // Categories Management
  static async getCategories(): Promise<CourseCategory[]> {
    const result = await FirestoreService.getDocuments(
      this.CATEGORIES_COLLECTION,
      {},
      { sortBy: 'name', sortOrder: 'asc' }
    )
    return result.documents as CourseCategory[]
  }

  static async getCategoryTree(): Promise<CourseCategory[]> {
    const categories = await this.getCategories()
    const categoryMap = new Map<string, CourseCategory>()
    const rootCategories: CourseCategory[] = []

    // Create map and initialize children arrays
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children!.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    return rootCategories
  }

  // Helper methods
  private static async getInstructors() {
    // This would typically come from a separate instructors collection
    // For now, return empty array
    return []
  }

  // Certificate Management
  static async generateCertificate(
    userId: string,
    courseId: string
  ): Promise<Certificate> {
    const enrollment = await this.getUserEnrollment(userId, courseId)
    if (!enrollment || enrollment.status !== 'COMPLETED') {
      throw new Error('Course not completed')
    }

    const course = await this.getCourseById(courseId)
    if (!course) throw new Error('Course not found')

    const certificateData: Omit<Certificate, 'id'> = {
      userId,
      courseId,
      templateId: 'default',
      certificateUrl: '', // Will be generated
      issuedAt: new Date(),
      verificationCode: this.generateVerificationCode(),
      metadata: {
        courseName: course.title,
        instructorName: course.instructor.name,
        completionDate: enrollment.completedAt!,
      }
    }

    const certificateId = await FirestoreService.createDocument(
      'certificates',
      certificateData
    )

    // Update enrollment
    await FirestoreService.updateDocument(
      this.ENROLLMENTS_COLLECTION,
      enrollment.id,
      { certificateIssued: true }
    )

    return { id: certificateId, ...certificateData }
  }

  private static generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}