import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryMany, queryOne } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const statusFilter = searchParams.get('status') || '';
    const categoryFilter = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'last_accessed';

    if (!userId) {
      return NextResponse.json({
        courses: [],
        stats: {
          totalCourses: 0,
          inProgress: 0,
          completed: 0,
          totalWatchTime: 0,
          averageProgress: 0,
          certificates: 0,
        },
      });
    }

    // Base enrollments query with computed aggregates
    const rows = await queryMany(
      `
      SELECT 
        e.id AS enrollmentId,
        e.courseId,
        e.enrolledAt,
        e.completedAt,
        c.title,
        c.description,
        c.logo,
        c.level,
        c.categoryId,
        cat.name AS category,
        
        -- computed aggregates per course/enrollment
        COALESCE(
          ROUND(
            (
              (SELECT COUNT(*) FROM Progress p2 WHERE p2.enrollmentId = e.id AND p2.completed = 1)
              /
              NULLIF((SELECT COUNT(*) FROM Lesson l WHERE l.courseId = e.courseId), 0)
            ) * 100
          ),
          0
        ) AS progress_percent,

        (SELECT COUNT(*) FROM Lesson l WHERE l.courseId = e.courseId) AS total_lessons,
        (SELECT COUNT(*) FROM Progress p3 WHERE p3.enrollmentId = e.id AND p3.completed = 1) AS completed_lessons,
        (SELECT COALESCE(SUM(l.duration), 0) FROM Lesson l WHERE l.courseId = e.courseId) AS total_duration,
        COALESCE((SELECT SUM(p4.watchTime) FROM Progress p4 WHERE p4.enrollmentId = e.id), 0) AS watched_time,
        COALESCE((SELECT MAX(p5.updatedAt) FROM Progress p5 WHERE p5.enrollmentId = e.id), e.enrolledAt) AS last_accessed
      FROM Enrollment e
      JOIN Course c ON c.id = e.courseId
      LEFT JOIN Category cat ON cat.id = c.categoryId
      WHERE e.userId = ?
      `,
      [userId]
    );

    // Map rows to courses, apply filtering, compute next lesson and stats
    const courses = [] as any[];

    for (const row of rows as any[]) {
      const status = row.completedAt || row.progress_percent >= 100
        ? 'COMPLETED'
        : row.progress_percent > 0
          ? 'IN_PROGRESS'
          : 'NOT_STARTED';

      // Next upcoming lesson (first not completed, ordered by lesson order index ascending)
      const nextLesson = await queryOne(
        `
        SELECT l.id, l.title, l.duration
        FROM Lesson l
        WHERE l.courseId = ?
          AND NOT EXISTS (
            SELECT 1 FROM Progress p WHERE p.enrollmentId = ? AND p.lessonId = l.id AND p.completed = 1
          )
        ORDER BY l.order ASC
        LIMIT 1
        `,
        [row.courseId, row.enrollmentId]
      );

      // Basic text search filter (on title and description)
      const matchesSearch = search
        ? (
            (row.title && row.title.toLowerCase().includes(search.toLowerCase())) ||
            (row.description && row.description.toLowerCase().includes(search.toLowerCase()))
          )
        : true;

      // Status filter
      const matchesStatus = statusFilter ? status === statusFilter : true;

      // Category filter
      const matchesCategory = categoryFilter ? (row.category === categoryFilter) : true;

      if (matchesSearch && matchesStatus && matchesCategory) {
        courses.push({
          id: row.courseId,
          title: row.title,
          description: row.description,
          thumbnail: row.logo,
          instructor: 'Équipe WindevExpert',
          progress: Number(row.progress_percent) || 0,
          totalLessons: Number(row.total_lessons) || 0,
          completedLessons: Number(row.completed_lessons) || 0,
          duration: Number(row.total_duration) || 0, // minutes
          watchedTime: Number(row.watched_time) || 0, // minutes
          lastAccessed: row.last_accessed,
          status,
          rating: 4.8, // default fallback
          enrolledAt: row.enrolledAt,
          category: row.category || null,
          level: row.level || null,
          nextLesson: nextLesson
            ? { title: nextLesson.title, duration: nextLesson.duration }
            : null,
        });
      }
    }

    // Sorting
    if (sort === 'progress') {
      courses.sort((a, b) => b.progress - a.progress);
    } else if (sort === 'title') {
      courses.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // last_accessed default
      courses.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
    }

    // Stats aggregation
    const totalCourses = courses.length;
    const completed = courses.filter(c => c.status === 'COMPLETED').length;
    const inProgress = courses.filter(c => c.status === 'IN_PROGRESS').length;
    const totalWatchTime = Math.round(courses.reduce((acc, c) => acc + (c.watchedTime || 0), 0));
    const averageProgress = totalCourses
      ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCourses)
      : 0;

    const stats = {
      totalCourses,
      inProgress,
      completed,
      totalWatchTime,
      averageProgress,
      certificates: completed, // fallback: certificates equal to completed courses
    };

    return NextResponse.json({ courses, stats });
  } catch (error: any) {
    console.error('[GET /api/dashboard/courses] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses data' },
      { status: 500 }
    );
  }
}