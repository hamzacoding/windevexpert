import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface VideoProgressData {
  currentTime: number
  duration: number
  percentage: number
  lastWatched: string
  completed: boolean
  watchTime: number // Total time watched (for analytics)
}

interface UseVideoProgressProps {
  courseId: string
  lessonId: string
  videoId?: string
}

interface VideoAnalytics {
  totalWatchTime: number
  completionRate: number
  averageSessionTime: number
  lastWatchedDate: string
  watchSessions: number
}

export function useVideoProgress({ courseId, lessonId, videoId }: UseVideoProgressProps) {
  const { data: session } = useSession()
  const [progress, setProgress] = useState<VideoProgressData | null>(null)
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id

  // Generate storage keys
  const progressKey = `video_progress_${courseId}_${lessonId}_${userId}`
  const analyticsKey = `video_analytics_${courseId}_${lessonId}_${userId}`

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    if (!userId) return

    try {
      const savedProgress = localStorage.getItem(progressKey)
      const savedAnalytics = localStorage.getItem(analyticsKey)

      if (savedProgress) {
        const progressData = JSON.parse(savedProgress)
        setProgress(progressData)
      }

      if (savedAnalytics) {
        const analyticsData = JSON.parse(savedAnalytics)
        setAnalytics(analyticsData)
      } else {
        // Initialize analytics
        const initialAnalytics: VideoAnalytics = {
          totalWatchTime: 0,
          completionRate: 0,
          averageSessionTime: 0,
          lastWatchedDate: new Date().toISOString(),
          watchSessions: 0
        }
        setAnalytics(initialAnalytics)
        localStorage.setItem(analyticsKey, JSON.stringify(initialAnalytics))
      }
    } catch (error) {
      console.error('Error loading video progress:', error)
      setError('Erreur lors du chargement du progrès')
    } finally {
      setIsLoading(false)
    }
  }, [userId, progressKey, analyticsKey])

  // Save progress to localStorage and potentially to server
  const saveProgress = useCallback(async (progressData: VideoProgressData) => {
    if (!userId) return

    try {
      // Save to localStorage
      localStorage.setItem(progressKey, JSON.stringify(progressData))
      setProgress(progressData)

      // Update analytics
      if (analytics) {
        const updatedAnalytics: VideoAnalytics = {
          ...analytics,
          totalWatchTime: progressData.watchTime,
          completionRate: progressData.percentage,
          lastWatchedDate: progressData.lastWatched,
          averageSessionTime: progressData.watchTime / Math.max(analytics.watchSessions, 1)
        }
        
        localStorage.setItem(analyticsKey, JSON.stringify(updatedAnalytics))
        setAnalytics(updatedAnalytics)
      }

      // TODO: Save to database when API is ready
      // await saveProgressToServer(progressData)
    } catch (error) {
      console.error('Error saving video progress:', error)
      setError('Erreur lors de la sauvegarde du progrès')
    }
  }, [userId, progressKey, analyticsKey, analytics])

  // Update progress with new time data
  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (!userId || duration === 0) return

    const percentage = (currentTime / duration) * 100
    const completed = percentage >= 90 // Consider completed at 90%
    const now = new Date().toISOString()

    const progressData: VideoProgressData = {
      currentTime,
      duration,
      percentage,
      lastWatched: now,
      completed,
      watchTime: (progress?.watchTime || 0) + 1 // Increment watch time
    }

    saveProgress(progressData)
  }, [userId, progress, saveProgress])

  // Mark video as completed
  const markCompleted = useCallback(() => {
    if (!progress) return

    const completedProgress: VideoProgressData = {
      ...progress,
      completed: true,
      percentage: 100,
      lastWatched: new Date().toISOString()
    }

    saveProgress(completedProgress)
  }, [progress, saveProgress])

  // Reset progress
  const resetProgress = useCallback(() => {
    if (!userId) return

    try {
      localStorage.removeItem(progressKey)
      setProgress(null)
    } catch (error) {
      console.error('Error resetting progress:', error)
    }
  }, [userId, progressKey])

  // Get completion percentage for course
  const getCourseProgress = useCallback(() => {
    if (!userId) return 0

    try {
      const allKeys = Object.keys(localStorage)
      const courseKeys = allKeys.filter(key => 
        key.startsWith(`video_progress_${courseId}_`) && 
        key.endsWith(`_${userId}`)
      )

      if (courseKeys.length === 0) return 0

      let totalCompleted = 0
      courseKeys.forEach(key => {
        const progressData = JSON.parse(localStorage.getItem(key) || '{}')
        if (progressData.completed) {
          totalCompleted++
        }
      })

      return (totalCompleted / courseKeys.length) * 100
    } catch (error) {
      console.error('Error calculating course progress:', error)
      return 0
    }
  }, [userId, courseId])

  // Start new watch session
  const startWatchSession = useCallback(() => {
    if (!analytics) return

    const updatedAnalytics: VideoAnalytics = {
      ...analytics,
      watchSessions: analytics.watchSessions + 1,
      lastWatchedDate: new Date().toISOString()
    }

    localStorage.setItem(analyticsKey, JSON.stringify(updatedAnalytics))
    setAnalytics(updatedAnalytics)
  }, [analytics, analyticsKey])

  // Load progress on mount
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Auto-save progress every 30 seconds during playback
  useEffect(() => {
    if (!progress) return

    const interval = setInterval(() => {
      // This would be called by the video player component
      // when video is playing to update watch time
    }, 30000)

    return () => clearInterval(interval)
  }, [progress])

  return {
    progress,
    analytics,
    isLoading,
    error,
    updateProgress,
    markCompleted,
    resetProgress,
    getCourseProgress,
    startWatchSession,
    saveProgress
  }
}

// Helper function to format watch time
export function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

// Helper function to get progress color based on percentage
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-500'
  if (percentage >= 70) return 'text-blue-500'
  if (percentage >= 40) return 'text-yellow-500'
  return 'text-gray-500'
}

// Helper function to calculate estimated time remaining
export function getEstimatedTimeRemaining(
  currentTime: number, 
  duration: number, 
  playbackRate: number = 1
): string {
  const remaining = (duration - currentTime) / playbackRate
  const minutes = Math.ceil(remaining / 60)
  
  if (minutes < 60) {
    return `${minutes} min restantes`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m restantes`
  }
}