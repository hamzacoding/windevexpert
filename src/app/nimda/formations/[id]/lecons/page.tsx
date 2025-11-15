"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PlusCircle, Save, Trash2 } from 'lucide-react'

type Lesson = {
  id?: string
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  order?: number
}

export default function FormationLessonsPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const id = params?.id || ''
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/admin/formations/${id}/lessons`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || 'Erreur lors du chargement des leçons')
        }
        const data = await res.json()
        setLessons(Array.isArray(data.lessons) ? data.lessons : [])
      } catch (e: any) {
        setError(e.message || 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  const addLesson = () => {
    setLessons((ls) => ([...ls, { title: '', description: '', videoUrl: '', duration: 0, order: ls.length + 1 }]))
  }
  const updateLesson = (index: number, key: keyof Lesson, value: any) => {
    setLessons((ls) => ls.map((l, i) => i === index ? { ...l, [key]: value } : l))
  }
  const removeLesson = (index: number) => {
    setLessons((ls) => ls.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 })))
  }

  const saveAll = async () => {
    setSaving(true)
    setError(null)
    try {
      const normalized = lessons.map((l, idx) => ({
        id: l.id,
        title: String(l.title || '').trim(),
        description: l.description || undefined,
        videoUrl: l.videoUrl || undefined,
        duration: typeof l.duration === 'string' ? parseFloat(l.duration) : l.duration,
        order: typeof l.order === 'number' ? l.order : idx + 1,
      }))
      const res = await fetch(`/api/admin/formations/${id}/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: normalized }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erreur lors de l’enregistrement des leçons')
      }
      router.push('/nimda/formations')
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leçons de la formation</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/nimda/formations')}>Retour</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveAll} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
      {loading && <div>Chargement...</div>}
      {!loading && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Liste des leçons</h2>
            <Button variant="default" onClick={addLesson}><PlusCircle className="h-4 w-4 mr-2" /> Ajouter une leçon</Button>
          </div>
          <div className="space-y-6">
            {lessons.length === 0 && (
              <div className="text-gray-600">Aucune leçon. Ajoutez la première.</div>
            )}
            {lessons.map((l, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Titre</Label>
                    <Input value={l.title} onChange={(e) => updateLesson(index, 'title', e.target.value)} />
                  </div>
                  <div>
                    <Label>Vidéo URL</Label>
                    <Input value={l.videoUrl || ''} onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)} />
                  </div>
                  <div>
                    <Label>Durée (min)</Label>
                    <Input type="number" value={l.duration as any || 0} onChange={(e) => updateLesson(index, 'duration', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={l.description || ''} onChange={(e) => updateLesson(index, 'description', e.target.value)} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Ordre: {l.order || (index + 1)}</div>
                  <Button variant="destructive" onClick={() => removeLesson(index)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}