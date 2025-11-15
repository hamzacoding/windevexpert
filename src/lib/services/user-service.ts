import { FirestoreService } from '../firestore'
import { 
  User, 
  UserProfile, 
  UserPreferences, 
  UserStats,
  Achievement,
  UserActivity,
  ActivityType,
  Subscription
} from '@/types/user'

export class UserService {
  private static readonly COLLECTION = 'users'
  private static readonly PROFILES_COLLECTION = 'user_profiles'
  private static readonly ACTIVITIES_COLLECTION = 'user_activities'
  private static readonly ACHIEVEMENTS_COLLECTION = 'user_achievements'
  private static readonly SUBSCRIPTIONS_COLLECTION = 'subscriptions'

  // User Management
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: Omit<User, 'id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const userId = await FirestoreService.createDocument(this.COLLECTION, user)

    // Create default profile
    await this.createUserProfile(userId, {
      bio: '',
      website: '',
      location: '',
      experienceLevel: 'BEGINNER',
      interests: [],
      skills: [],
      socialLinks: {},
      isPublic: false,
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
          courseUpdates: true,
          newCourses: true,
          achievements: true,
          reminders: true
        },
        privacy: {
          showProfile: false,
          showProgress: false,
          showAchievements: false,
          allowMessages: true
        },
        learning: {
          autoplay: true,
          playbackSpeed: 1,
          subtitles: true,
          quality: 'auto'
        }
      }
    })

    return { id: userId, ...user }
  }

  static async getUserById(id: string): Promise<User | null> {
    return await FirestoreService.getDocument(this.COLLECTION, id) as User | null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await FirestoreService.queryDocuments<User>(
      this.COLLECTION,
      { 
        where: [{ field: 'email', operator: '==', value: email }],
        limit: 1 
      }
    )
    return result[0] || null
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await FirestoreService.updateDocument(this.COLLECTION, id, {
      ...updates,
      updatedAt: new Date()
    })
  }

  static async deleteUser(id: string): Promise<void> {
    // Delete user profile
    await this.deleteUserProfile(id)
    
    // Delete user activities
    const activities = await FirestoreService.queryDocuments(
      this.ACTIVITIES_COLLECTION,
      { where: [{ field: 'userId', operator: '==', value: id }] }
    )
    for (const activity of activities) {
      await FirestoreService.deleteDocument(this.ACTIVITIES_COLLECTION, activity.id)
    }

    // Delete user achievements
    const achievements = await FirestoreService.queryDocuments(
      this.ACHIEVEMENTS_COLLECTION,
      { where: [{ field: 'userId', operator: '==', value: id }] }
    )
    for (const achievement of achievements) {
      await FirestoreService.deleteDocument(this.ACHIEVEMENTS_COLLECTION, achievement.id)
    }

    // Delete user
    await FirestoreService.deleteDocument(this.COLLECTION, id)
  }

  // Profile Management
  static async createUserProfile(
    userId: string, 
    profileData: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> {
    const profile: Omit<UserProfile, 'id'> = {
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await FirestoreService.createDocument(this.PROFILES_COLLECTION, profile, userId)
    return { id: userId, ...profile }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await FirestoreService.getDocument(
      this.PROFILES_COLLECTION, 
      userId
    ) as UserProfile | null
  }

  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<void> {
    await FirestoreService.updateDocument(this.PROFILES_COLLECTION, userId, {
      ...updates,
      updatedAt: new Date()
    })
  }

  static async deleteUserProfile(userId: string): Promise<void> {
    await FirestoreService.deleteDocument(this.PROFILES_COLLECTION, userId)
  }

  // Preferences Management
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const profile = await this.getUserProfile(userId)
    if (!profile) throw new Error('User profile not found')

    const updatedPreferences = {
      ...profile.preferences,
      ...preferences
    }

    await this.updateUserProfile(userId, { preferences: updatedPreferences })
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const profile = await this.getUserProfile(userId)
    return profile?.preferences || null
  }

  // Activity Tracking
  static async logActivity(
    userId: string,
    type: ActivityType,
    details: Record<string, any> = {},
    metadata?: Record<string, any>
  ): Promise<void> {
    const activity: Omit<UserActivity, 'id'> = {
      userId,
      type,
      details,
      metadata,
      timestamp: new Date()
    }

    await FirestoreService.createDocument(this.ACTIVITIES_COLLECTION, activity)

    // Update user stats
    await this.updateUserStats(userId, type)
  }

  static async getUserActivities(
    userId: string,
    type?: ActivityType,
    limit: number = 50
  ): Promise<UserActivity[]> {
    const whereConditions = [{ field: 'userId', operator: '==', value: userId }]
    if (type) {
      whereConditions.push({ field: 'type', operator: '==', value: type })
    }

    const result = await FirestoreService.queryDocuments<UserActivity>(
      this.ACTIVITIES_COLLECTION,
      { 
        where: whereConditions,
        limit,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      }
    )

    return result
  }

  static async getRecentActivities(
    userId: string,
    days: number = 7,
    limit: number = 20
  ): Promise<UserActivity[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const result = await FirestoreService.queryDocuments<UserActivity>(
      this.ACTIVITIES_COLLECTION,
      { 
        where: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'timestamp', operator: '>=', value: since }
        ],
        limit,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      }
    )

    return result
  }

  // Stats Management
  static async getUserStats(userId: string): Promise<UserStats | null> {
    return await FirestoreService.getDocument('user_stats', userId) as UserStats | null
  }

  static async updateUserStats(userId: string, activityType: ActivityType): Promise<void> {
    const stats = await this.getUserStats(userId) || {
      totalCourses: 0,
      completedCourses: 0,
      totalLessons: 0,
      completedLessons: 0,
      totalWatchTime: 0,
      streakDays: 0,
      lastActivityDate: new Date(),
      joinDate: new Date(),
      achievements: 0,
      points: 0
    }

    // Update stats based on activity type
    switch (activityType) {
      case 'COURSE_ENROLLED':
        stats.totalCourses += 1
        stats.points += 10
        break
      case 'COURSE_COMPLETED':
        stats.completedCourses += 1
        stats.points += 100
        break
      case 'LESSON_COMPLETED':
        stats.completedLessons += 1
        stats.points += 5
        break
      case 'VIDEO_WATCHED':
        stats.totalLessons += 1
        stats.points += 2
        break
      case 'QUIZ_COMPLETED':
        stats.points += 15
        break
      case 'ACHIEVEMENT_EARNED':
        stats.achievements += 1
        stats.points += 50
        break
    }

    // Update streak
    const today = new Date()
    const lastActivity = new Date(stats.lastActivityDate)
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      stats.streakDays += 1
    } else if (daysDiff > 1) {
      stats.streakDays = 1
    }

    stats.lastActivityDate = today

    await FirestoreService.updateDocument('user_stats', userId, stats, { upsert: true })

    // Check for achievements
    await this.checkAchievements(userId, stats)
  }

  // Achievements Management
  static async checkAchievements(userId: string, stats: UserStats): Promise<void> {
    const userAchievements = await this.getUserAchievements(userId)
    const earnedIds = userAchievements.map(a => a.achievementId)

    const achievementsToCheck = [
      { id: 'first_course', condition: () => stats.totalCourses >= 1 },
      { id: 'course_completionist', condition: () => stats.completedCourses >= 1 },
      { id: 'dedicated_learner', condition: () => stats.completedCourses >= 5 },
      { id: 'course_master', condition: () => stats.completedCourses >= 10 },
      { id: 'lesson_starter', condition: () => stats.completedLessons >= 10 },
      { id: 'lesson_enthusiast', condition: () => stats.completedLessons >= 50 },
      { id: 'lesson_master', condition: () => stats.completedLessons >= 100 },
      { id: 'streak_week', condition: () => stats.streakDays >= 7 },
      { id: 'streak_month', condition: () => stats.streakDays >= 30 },
      { id: 'point_collector', condition: () => stats.points >= 1000 },
      { id: 'point_master', condition: () => stats.points >= 5000 }
    ]

    for (const achievement of achievementsToCheck) {
      if (!earnedIds.includes(achievement.id) && achievement.condition()) {
        await this.awardAchievement(userId, achievement.id)
      }
    }
  }

  static async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const achievement: Omit<Achievement, 'id'> = {
      userId,
      achievementId,
      earnedAt: new Date(),
      progress: 100
    }

    await FirestoreService.createDocument(this.ACHIEVEMENTS_COLLECTION, achievement)
    await this.logActivity(userId, 'ACHIEVEMENT_EARNED', { achievementId })
  }

  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    const result = await FirestoreService.queryDocuments<Achievement>(
      this.ACHIEVEMENTS_COLLECTION,
      { 
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: 'earnedAt',
        orderDirection: 'desc'
      }
    )
    return result
  }

  // Subscription Management
  static async createSubscription(
    userId: string,
    subscriptionData: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Subscription> {
    const subscription: Omit<Subscription, 'id'> = {
      userId,
      ...subscriptionData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const subscriptionId = await FirestoreService.createDocument(
      this.SUBSCRIPTIONS_COLLECTION,
      subscription
    )

    return { id: subscriptionId, ...subscription }
  }

  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    const result = await FirestoreService.queryDocuments<Subscription>(
      this.SUBSCRIPTIONS_COLLECTION,
      { 
        where: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'status', operator: '==', value: 'ACTIVE' }
        ],
        limit: 1,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      }
    )
    return result[0] || null
  }

  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<void> {
    await FirestoreService.updateDocument(this.SUBSCRIPTIONS_COLLECTION, subscriptionId, {
      ...updates,
      updatedAt: new Date()
    })
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.updateSubscription(subscriptionId, {
      status: 'CANCELLED',
      cancelledAt: new Date()
    })
  }

  static async isUserSubscribed(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    return subscription !== null && 
           subscription.status === 'ACTIVE' && 
           subscription.endDate > new Date()
  }

  // Search and Discovery
  static async searchUsers(
    query: string,
    filters: {
      experienceLevel?: string
      location?: string
      skills?: string[]
    } = {},
    page: number = 1,
    limit: number = 20
  ) {
    // This would implement full-text search
    // For now, return empty results
    return {
      users: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    }
  }

  static async getPublicProfiles(limit: number = 10): Promise<UserProfile[]> {
    const result = await FirestoreService.queryDocuments<UserProfile>(
      this.PROFILES_COLLECTION,
      { 
        where: [{ field: 'isPublic', operator: '==', value: true }],
        limit,
        orderBy: 'updatedAt',
        orderDirection: 'desc'
      }
    )
    return result
  }

  // Analytics
  static async getUserAnalytics(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    const activities = await FirestoreService.getDocuments(
      this.ACTIVITIES_COLLECTION,
      {
        userId,
        timestamp: { '>=': startDate, '<=': endDate }
      }
    )

    const stats = await this.getUserStats(userId)
    
    return {
      period,
      activities: activities.documents.length,
      activityBreakdown: this.groupActivitiesByType(activities.documents as UserActivity[]),
      stats,
      progress: {
        coursesStarted: activities.documents.filter((a: any) => a.type === 'COURSE_ENROLLED').length,
        coursesCompleted: activities.documents.filter((a: any) => a.type === 'COURSE_COMPLETED').length,
        lessonsCompleted: activities.documents.filter((a: any) => a.type === 'LESSON_COMPLETED').length,
        quizzesCompleted: activities.documents.filter((a: any) => a.type === 'QUIZ_COMPLETED').length
      }
    }
  }

  private static groupActivitiesByType(activities: UserActivity[]) {
    return activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<ActivityType, number>)
  }

  // Utility methods
  static async updateLastSeen(userId: string): Promise<void> {
    await this.updateUser(userId, { lastSeenAt: new Date() })
  }

  static async getUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return []
    
    const users: User[] = []
    for (const id of userIds) {
      const user = await this.getUserById(id)
      if (user) users.push(user)
    }
    return users
  }
}