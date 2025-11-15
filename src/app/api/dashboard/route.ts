import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, queryMany } from '@/lib/db'

export const runtime = 'nodejs'

// Types de réponse
interface DashboardStats {
  coursesEnrolled: number
  coursesCompleted: number
  lessonsCompleted: number
  totalWatchTime: number // minutes
  achievements: number
  rank: 'Bronze' | 'Silver' | 'Gold'
  points: number
}

interface RecentCourseItem {
  id: string
  title: string
  progress: number
  lastAccessed: string
  thumbnail?: string | null
  instructor?: string
  nextLesson?: string | null
}

interface AchievementItem {
  id: string
  title: string
  description: string
  icon: string
  earnedAt: string
  points: number
}

interface UpcomingEventItem {
  id: string
  title: string
  date: string
  time: string
  type: 'webinar' | 'qa' | 'milestone' | 'event'
  instructor?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({
        stats: defaultStats(),
        recentCourses: [],
        recentAchievements: [],
        upcomingEvents: []
      })
    }

    // 1) Statistiques de base
    const [enrolledRow, completedRow, lessonsRow, watchRow] = await Promise.all([
      queryOne('SELECT COUNT(*) AS count FROM Enrollment WHERE userId = ?', [userId]),
      queryOne(
        'SELECT COUNT(*) AS count FROM Enrollment WHERE userId = ? AND (progress = 100 OR completedAt IS NOT NULL)',
        [userId]
      ),
      queryOne('SELECT COUNT(*) AS count FROM Progress WHERE userId = ? AND completed = 1', [userId]),
      queryOne('SELECT COALESCE(SUM(watchTime), 0) AS total FROM Progress WHERE userId = ?', [userId])
    ])

    const coursesEnrolled = Number(enrolledRow?.count || 0)
    const coursesCompleted = Number(completedRow?.count || 0)
    const lessonsCompleted = Number(lessonsRow?.count || 0)
    const totalWatchTimeMinutes = Math.floor(Number(watchRow?.total || 0) / 60)

    // Points et rang dérivés
    const points = lessonsCompleted * 5 + totalWatchTimeMinutes + coursesCompleted * 50
    const rank: DashboardStats['rank'] = points >= 2000 ? 'Gold' : points >= 1000 ? 'Silver' : 'Bronze'

    const stats: DashboardStats = {
      coursesEnrolled,
      coursesCompleted,
      lessonsCompleted,
      totalWatchTime: totalWatchTimeMinutes,
      achievements: Math.max(coursesCompleted, Math.floor(lessonsCompleted / 25)),
      rank,
      points
    }

    // 2) Formations récentes
    const enrollments = await queryMany(
      `SELECT 
         e.id AS enrollmentId,
         e.courseId,
         c.title,
         c.logo,
         COALESCE(
           ROUND(
             (
               SELECT COUNT(*) FROM Progress p2 
               WHERE p2.enrollmentId = e.id AND p2.completed = 1
             ) / NULLIF(
               (SELECT COUNT(*) FROM Lesson l WHERE l.courseId = e.courseId),
               0
             ) * 100
           ),
           0
         ) AS progress,
         COALESCE(MAX(p.updatedAt), e.enrolledAt) AS lastAccessed
       FROM Enrollment e
       JOIN Course c ON c.id = e.courseId
       LEFT JOIN Progress p ON p.enrollmentId = e.id
       WHERE e.userId = ?
       GROUP BY e.id, e.courseId, c.title, c.logo, e.enrolledAt
       ORDER BY lastAccessed DESC
       LIMIT 3`,
      [userId]
    )

    const recentCourses: RecentCourseItem[] = []
    for (const row of enrollments) {
      // Déterminer la prochaine leçon non terminée
      let nextLessonTitle: string | null = null
      try {
        const nextLesson = await queryOne(
          `SELECT l.title
           FROM Lesson l
           WHERE l.courseId = ?
             AND l.id NOT IN (
               SELECT lessonId FROM Progress WHERE enrollmentId = ? AND completed = 1
             )
           ORDER BY l.order ASC
           LIMIT 1`,
          [row.courseId, row.enrollmentId]
        )
        nextLessonTitle = nextLesson?.title || null
      } catch {}

      recentCourses.push({
        id: String(row.courseId),
        title: String(row.title),
        progress: Number(row.progress || 0),
        lastAccessed: new Date(row.lastAccessed).toISOString().slice(0, 10),
        thumbnail: row.logo || null,
        instructor: 'Équipe WindevExpert',
        nextLesson: nextLessonTitle
      })
    }

    // 3) Succès/achievements (dérivés)
    const achievements: AchievementItem[] = []

    if (coursesCompleted > 0) {
      const lastCompleted = await queryOne(
        `SELECT COALESCE(completedAt, enrolledAt) AS date
         FROM Enrollment
         WHERE userId = ? AND (progress = 100 OR completedAt IS NOT NULL)
         ORDER BY COALESCE(completedAt, enrolledAt) DESC
         LIMIT 1`,
        [userId]
      )
      achievements.push({
        id: 'achv-1',
        title: 'Première formation terminée',
        description: 'Félicitations pour avoir terminé votre première formation !',
        icon: '🎓',
        earnedAt: new Date(lastCompleted?.date || Date.now()).toISOString(),
        points: 100
      })
    }

    if (lessonsCompleted >= 50) {
      const lastLesson = await queryOne(
        `SELECT MAX(updatedAt) AS lastDate FROM Progress WHERE userId = ? AND completed = 1`,
        [userId]
      )
      achievements.push({
        id: 'achv-2',
        title: '50 leçons terminées',
        description: 'Un excellent rythme d’apprentissage, continuez !',
        icon: '🔥',
        earnedAt: new Date(lastLesson?.lastDate || Date.now()).toISOString(),
        points: 75
      })
    }

    if (totalWatchTimeMinutes >= 300) { // 5h
      const lastWatch = await queryOne(
        `SELECT MAX(updatedAt) AS lastDate FROM Progress WHERE userId = ?`,
        [userId]
      )
      achievements.push({
        id: 'achv-3',
        title: '5 heures d’étude',
        description: 'Vous avez consacré 5 heures à votre apprentissage.',
        icon: '🧠',
        earnedAt: new Date(lastWatch?.lastDate || Date.now()).toISOString(),
        points: 50
      })
    }

    // 4) Événements à venir (milestones des projets client)
    const upcomingRows = await queryMany(
      `SELECT m.id, m.title, m.dueDate, p.title AS projectTitle
       FROM Milestone m
       JOIN Project p ON p.id = m.projectId
       WHERE p.clientId = ? AND m.dueDate IS NOT NULL AND m.completed = 0 AND m.dueDate >= NOW()
       ORDER BY m.dueDate ASC
       LIMIT 3`,
      [userId]
    )

    const upcomingEvents: UpcomingEventItem[] = upcomingRows.map((r: any) => ({
      id: String(r.id),
      title: `${r.title} (Projet: ${r.projectTitle})`,
      date: new Date(r.dueDate).toISOString().slice(0, 10),
      time: new Date(r.dueDate).toISOString().slice(11, 16),
      type: 'milestone',
      instructor: 'Chef de projet'
    }))

    return NextResponse.json({
      stats,
      recentCourses,
      recentAchievements: achievements,
      upcomingEvents
    })
  } catch (error) {
    console.error('Erreur API /api/dashboard:', error)
    return NextResponse.json(
      {
        stats: defaultStats(),
        recentCourses: [],
        recentAchievements: [],
        upcomingEvents: []
      },
      { status: 200 }
    )
  }
}

function defaultStats(): DashboardStats {
  return {
    coursesEnrolled: 0,
    coursesCompleted: 0,
    lessonsCompleted: 0,
    totalWatchTime: 0,
    achievements: 0,
    rank: 'Bronze',
    points: 0
  }
}