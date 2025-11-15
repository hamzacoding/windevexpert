'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, Clock, FileText, Download, MessageSquare, Star } from 'lucide-react'
import VideoPlayer from './video-player'
import { useVideoProgress } from '@/hooks/use-video-progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface VideoLessonProps {
  lesson: {
    id: string
    title: string
    description: string
    videoUrl: string
    duration: number
    courseId: string
    courseName: string
    chapterTitle?: string
    resources?: Array<{
      id: string
      title: string
      type: 'pdf' | 'doc' | 'zip' | 'link'
      url: string
      size?: string
    }>
    transcript?: string
    nextLessonId?: string
    previousLessonId?: string
  }
  onLessonComplete?: (lessonId: string) => void
  onNavigate?: (lessonId: string) => void
}

interface Note {
  id: string
  timestamp: number
  content: string
  createdAt: string
}

export default function VideoLesson({ lesson, onLessonComplete, onNavigate }: VideoLessonProps) {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [rating, setRating] = useState(0)

  const {
    progress,
    analytics,
    updateProgress,
    markCompleted,
    getCourseProgress
  } = useVideoProgress({
    courseId: lesson.courseId,
    lessonId: lesson.id
  })

  // Load notes from localStorage
  useEffect(() => {
    if (!session?.user?.id) return

    const notesKey = `lesson_notes_${lesson.id}_${session.user.id}`
    const savedNotes = localStorage.getItem(notesKey)
    
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }
  }, [lesson.id, session?.user?.id])

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    if (!session?.user?.id) return

    const notesKey = `lesson_notes_${lesson.id}_${session.user.id}`
    localStorage.setItem(notesKey, JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  const handleVideoProgress = (currentTime: number, duration: number) => {
    setCurrentTimestamp(currentTime)
    updateProgress(currentTime, duration)
  }

  const handleVideoComplete = () => {
    markCompleted()
    if (onLessonComplete) {
      onLessonComplete(lesson.id)
    }
  }

  const addNote = () => {
    if (!newNote.trim() || !session?.user?.id) return

    const note: Note = {
      id: Date.now().toString(),
      timestamp: currentTimestamp,
      content: newNote.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedNotes = [...notes, note].sort((a, b) => a.timestamp - b.timestamp)
    saveNotes(updatedNotes)
    setNewNote('')
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    saveNotes(updatedNotes)
  }

  const jumpToTimestamp = (timestamp: number) => {
    // This would need to be implemented in the VideoPlayer component
    // For now, we'll just scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const downloadResource = (resource: any) => {
    // In a real app, this would handle secure downloads
    window.open(resource.url, '_blank')
  }

  const courseProgress = getCourseProgress()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{lesson.courseName}</span>
          {lesson.chapterTitle && (
            <>
              <span>•</span>
              <span>{lesson.chapterTitle}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(lesson.duration)}</span>
          </div>
          {progress && (
            <div className="flex items-center space-x-1">
              <CheckCircle className={cn(
                "h-4 w-4",
                progress.completed ? "text-green-500" : "text-gray-400"
              )} />
              <span>{Math.round(progress.percentage)}% terminé</span>
            </div>
          )}
        </div>
      </div>

      {/* Course Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progrès du cours</span>
            <span className="text-sm text-gray-600">{Math.round(courseProgress)}%</span>
          </div>
          <Progress value={courseProgress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            src={lesson.videoUrl}
            title={lesson.title}
            courseId={lesson.courseId}
            lessonId={lesson.id}
            userId={session?.user?.id}
            onProgressUpdate={handleVideoProgress}
            onComplete={handleVideoComplete}
            className="aspect-video"
          />

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={!lesson.previousLessonId}
              onClick={() => lesson.previousLessonId && onNavigate?.(lesson.previousLessonId)}
            >
              Leçon précédente
            </Button>
            <Button
              disabled={!lesson.nextLessonId}
              onClick={() => lesson.nextLessonId && onNavigate?.(lesson.nextLessonId)}
            >
              Leçon suivante
            </Button>
          </div>

          {/* Lesson Content Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
              <TabsTrigger value="transcript">Transcription</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>À propos de cette leçon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ajouter une note à ce moment de la vidéo..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Timestamp: {formatTime(currentTimestamp)}
                      </span>
                      <Button onClick={addNote} disabled={!newNote.trim()}>
                        Ajouter la note
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Aucune note pour cette leçon
                      </p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <button
                              onClick={() => jumpToTimestamp(note.timestamp)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {formatTime(note.timestamp)}
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </Button>
                          </div>
                          <p className="text-gray-700">{note.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transcription</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.transcript ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {lesson.transcript}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Transcription non disponible pour cette leçon
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ressources téléchargeables</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.resources && lesson.resources.length > 0 ? (
                    <div className="space-y-3">
                      {lesson.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              <p className="text-sm text-gray-600">
                                {resource.type.toUpperCase()}
                                {resource.size && ` • ${resource.size}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResource(resource)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucune ressource disponible pour cette leçon
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Stats */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps de visionnage</span>
                  <span className="text-sm font-medium">
                    {Math.round(analytics.totalWatchTime / 60)}min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sessions</span>
                  <span className="text-sm font-medium">{analytics.watchSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dernière visite</span>
                  <span className="text-sm font-medium">
                    {new Date(analytics.lastWatchedDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lesson Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Évaluer cette leçon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "p-1 rounded",
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    )}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Votre évaluation nous aide à améliorer le contenu
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Poser une question
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Télécharger la vidéo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}