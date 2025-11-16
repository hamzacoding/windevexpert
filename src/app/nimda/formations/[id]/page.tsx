"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RichHtmlEditor } from '@/components/ui/rich-html-editor'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { FormationImageUpload } from '@/components/ui/formation-image-upload'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'

const LANGUES = ['FRANCAIS', 'ANGLAIS']
const CATEGORIES = ['DEVELOPPEMENT_WEB', 'MARKETING']
const SOUS_CATEGORIES = ['JAVASCRIPT', 'SEO']
const NIVEAUX = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']
const TYPES_ACCES = ['ACCES_A_VIE', 'ABONNEMENT_1_AN']
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE']

export default function EditFormationPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const id = params?.id || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<any | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/admin/formations/${id}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || 'Erreur lors du chargement de la formation')
        }
        const data = await res.json()
        setForm({ ...data })
      } catch (e: any) {
        setError(e.message || 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  const update = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      ;['duree_totale_heures','nombre_modules','nombre_lecons','prix_usd','prix_eur','prix_dzd','prix_afr','garantie_remboursement_jours'].forEach((k) => {
        payload[k] = typeof payload[k] === 'string' ? parseFloat(payload[k]) : payload[k]
      })
      const res = await fetch(`/api/admin/formations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erreur lors de la mise à jour')
      }
      showToast({ type: 'success', title: 'Formation mise à jour', message: 'Les modifications ont été enregistrées.' })
      router.push('/nimda/formations')
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
      showToast({ type: 'error', title: 'Échec de la sauvegarde', message: e.message || 'Veuillez réessayer.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }
  if (error && !form) {
    return <div className="p-6 text-red-600">{error}</div>
  }
  if (!form) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Éditer la formation</h1>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Titre</Label>
              <Input value={form.titre} onChange={(e) => update('titre', e.target.value)} required />
            </div>
            <div>
              <Label>Sous-titre</Label>
              <Input value={form.sous_titre || ''} onChange={(e) => update('sous_titre', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description courte</Label>
              <Textarea value={form.description_courte || ''} onChange={(e) => update('description_courte', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description complète</Label>
              <RichHtmlEditor
                value={form.description_complete}
                onChange={(html) => update('description_complete', html)}
                uploadFolder="formations"
                height={400}
                placeholder="Saisissez la description complète..."
              />
            </div>
            <div>
              <Label>Langue</Label>
              <Select value={form.langue} onValueChange={(v) => update('langue', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la langue" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUES.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={(v) => update('categorie', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sous-catégorie</Label>
              <Select value={form.sous_categorie || ''} onValueChange={(v) => update('sous_categorie', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la sous-catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {SOUS_CATEGORIES.map((sc) => (<SelectItem key={sc} value={sc}>{sc}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Objectifs d'apprentissage (JSON/HTML)</Label>
              <Textarea value={form.objectifs_apprentissage || ''} onChange={(e) => update('objectifs_apprentissage', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Contenu pédagogique</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Durée totale (heures)</Label>
              <Input type="number" step="0.1" value={form.duree_totale_heures} onChange={(e) => update('duree_totale_heures', e.target.value)} />
            </div>
            <div>
              <Label>Nombre de modules</Label>
              <Input type="number" value={form.nombre_modules} onChange={(e) => update('nombre_modules', e.target.value)} />
            </div>
            <div>
              <Label>Nombre de leçons</Label>
              <Input type="number" value={form.nombre_lecons} onChange={(e) => update('nombre_lecons', e.target.value)} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.certificat_fin_formation} onChange={(e) => update('certificat_fin_formation', e.target.checked)} />
                Certificat de fin de formation
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Public cible & prérequis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Niveau requis</Label>
              <Select value={form.niveau_requis} onValueChange={(v) => update('niveau_requis', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau" />
                </SelectTrigger>
                <SelectContent>
                  {NIVEAUX.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label>Prérequis</Label>
              <Textarea value={form.prerequis || ''} onChange={(e) => update('prerequis', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Public cible</Label>
              <Textarea value={form.public_cible || ''} onChange={(e) => update('public_cible', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Informations commerciales</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Prix USD</Label>
              <Input type="number" step="0.01" value={form.prix_usd} onChange={(e) => update('prix_usd', e.target.value)} />
            </div>
            <div>
              <Label>Prix EUR</Label>
              <Input type="number" step="0.01" value={form.prix_eur} onChange={(e) => update('prix_eur', e.target.value)} />
            </div>
            <div>
              <Label>Prix DZD</Label>
              <Input type="number" step="0.01" value={form.prix_dzd} onChange={(e) => update('prix_dzd', e.target.value)} />
            </div>
            <div>
              <Label>Prix AFR</Label>
              <Input type="number" step="0.01" value={form.prix_afr} onChange={(e) => update('prix_afr', e.target.value)} />
            </div>
            <div>
              <Label>Type d'accès</Label>
              <Select value={form.type_acces} onValueChange={(v) => update('type_acces', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type d'accès" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_ACCES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Garantie (jours)</Label>
              <Input type="number" value={form.garantie_remboursement_jours} onChange={(e) => update('garantie_remboursement_jours', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Lien de paiement</Label>
              <Input value={form.lien_paiement || ''} onChange={(e) => update('lien_paiement', e.target.value)} placeholder="URL vers la page de paiement" />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Médias & SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormationImageUpload
                label="Image de couverture"
                value={form.image_couverture_url || ''}
                onChange={async (url) => {
                  update('image_couverture_url', url)
                  try {
                    const res = await fetch(`/api/admin/formations/${id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ image_couverture_url: url })
                    })
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}))
                      throw new Error(err?.error || 'Impossible de sauvegarder l\'image')
                    }
                    showToast({ type: 'success', title: 'Image enregistrée', message: 'L\'image de couverture a été sauvegardée.' })
                  } catch (e: any) {
                    showToast({ type: 'error', title: 'Échec de la sauvegarde', message: e.message || 'Veuillez réessayer.' })
                  }
                }}
              />
            </div>
            <div>
              <Label>Vidéo de présentation URL</Label>
              <Input value={form.video_presentation_url || ''} onChange={(e) => update('video_presentation_url', e.target.value)} />
            </div>
            <div>
              <Label>Mots-clés</Label>
              <Input value={form.mots_cles || ''} onChange={(e) => update('mots_cles', e.target.value)} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={form.url_slug} onChange={(e) => update('url_slug', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(v) => update('statut', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/nimda/formations')}>Annuler</Button>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>) : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
