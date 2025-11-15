export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  emailVerified: boolean
  phone?: string
  address?: Address
  preferences: UserPreferences
  subscription?: Subscription
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
  state?: string
}

export interface UserPreferences {
  language: 'fr' | 'en'
  timezone: string
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'system'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  marketing: boolean
  courseUpdates: boolean
  orderUpdates: boolean
}

export interface Subscription {
  id: string
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL'
  startDate: Date
  endDate?: Date
  autoRenew: boolean
  features: string[]
}

export interface UserProfile {
  bio?: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  skills: string[]
  experience: ExperienceLevel
  interests: string[]
}

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

export interface UserStats {
  coursesCompleted: number
  coursesInProgress: number
  totalWatchTime: number // in minutes
  certificatesEarned: number
  productsDownloaded: number
  forumPosts: number
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt: Date
  category: 'LEARNING' | 'COMMUNITY' | 'MILESTONE'
}

export interface UserActivity {
  id: string
  userId: string
  type: ActivityType
  description: string
  metadata?: Record<string, any>
  createdAt: Date
}

export type ActivityType = 
  | 'COURSE_STARTED'
  | 'COURSE_COMPLETED'
  | 'LESSON_COMPLETED'
  | 'PRODUCT_DOWNLOADED'
  | 'CERTIFICATE_EARNED'
  | 'FORUM_POST_CREATED'
  | 'PROFILE_UPDATED'
  | 'SUBSCRIPTION_CHANGED'