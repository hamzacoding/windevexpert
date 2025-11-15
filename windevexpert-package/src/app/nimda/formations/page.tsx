"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { Edit3, BookOpen, PlusCircle, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'

type Formation = {
  id_formation: string
  titre: string
  description_complete: string
  langue: string
  categorie: string
  sous_categorie?: string | null
  type_acces: string
  prix_eur: number
  prix_dzd: number
  statut: string
  date_mise_a_jour: string
  url_slug: string
}

export default function AdminFormationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formations, setFormations] = useState<Formation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1'))
  const [limit] = useState<number>(20)
  const [search, setSearch] = useState<string>(searchParams.get('search') || '')
  const [statut, setStatut] = useState<string>(searchParams.get('statut') || 'all')
  const [savingById, setSavingById] = useState<Record<string, boolean>>({})
  const [flashById, setFlashById] = useState<Record<string, 'success' | 'error' | undefined>>({})
  const { showToast } = useToast()

  const fetchFormations = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (search.trim()) params.set('search', search.trim())
      if (statut && statut !== 'all') params.set('statut', statut)
      const res = await fetch(`/api/admin/formations?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erreur au chargement des formations')
      }
      const data = await res.json()
      setFormations(data.formations || [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statut])

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', String(limit))
    if (search.trim()) params.set('search', search.trim())
    if (statut && statut !== 'all') params.set('statut', statut)
    router.push(`/nimda/formations?${params.toString()}`)
    await fetchFormations()
    showToast({ type: 'success', title: 'Filtre appliqué', message: 'La liste a été mise à jour.' })
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const updateStatut = async (id: string, newStatut: string) => {
    setSavingById((s) => ({ ...s, [id]: true }))
    setFlashById((f) => ({ ...f, [id]: undefined }))
    try {
      const res = await fetch(`/api/admin/formations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Erreur lors de la mise à jour du statut')
      }
      const updated = await res.json()
      setFormations((list) => list.map((f) => f.id_formation === id ? { ...f, statut: updated.statut, date_mise_a_jour: updated.date_mise_a_jour } : f))
      setFlashById((f) => ({ ...f, [id]: 'success' }))
      showToast({ type: 'success', title: 'Statut mis à jour', message: `Nouveau statut: ${newStatut}` })
    } catch (e: any) {
      console.error(e)
      setFlashById((f) => ({ ...f, [id]: 'error' }))
      showToast({ type: 'error', title: 'Échec de mise à jour', message: e.message })
    } finally {
      setSavingById((s) => ({ ...s, [id]: false }))
      setTimeout(() => setFlashById((f) => ({ ...f, [id]: undefined })), 1200)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Formations</h1>
          <p className="text-sm text-gray-600">Gestion des formations (table Formations)</p>
        </div>
        <Link href="/nimda/formations/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle formation
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form onSubmit={onSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, slug..."
          />
          <Select value={statut} onValueChange={(val) => setStatut(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="BROUILLON">Brouillon</SelectItem>
              <SelectItem value="PUBLIE">Publié</SelectItem>
              <SelectItem value="ARCHIVE">Archivé</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Filtrage...</>) : 'Filtrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatut('all'); setPage(1); fetchFormations() }}>Réinitialiser</Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {error && (
          <div className="p-4 text-red-600">{error}</div>
        )}
        <Table>
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Titre</th>
              <th className="p-3 text-left">Langue</th>
              <th className="p-3 text-left">Catégorie</th>
              <th className="p-3 text-left">Accès</th>
              <th className="p-3 text-left">Prix EUR/DZD</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Mise à jour</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && formations.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-600">Aucune formation trouvée.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-600">Chargement...</td>
              </tr>
            )}
            {formations.map((f) => (
              <tr key={f.id_formation} className={`border-t transition-colors ${flashById[f.id_formation] === 'success' ? 'bg-green-50' : flashById[f.id_formation] === 'error' ? 'bg-red-50' : ''}`}>
                <td className="p-3">
                  <div className="font-medium">{f.titre}</div>
                  <div className="text-xs text-gray-500">{f.url_slug}</div>
                </td>
                <td className="p-3">{f.langue}</td>
                <td className="p-3">{f.categorie}{f.sous_categorie ? ` / ${f.sous_categorie}` : ''}</td>
                <td className="p-3">{f.type_acces}</td>
                <td className="p-3">€ {f.prix_eur} / DZD {f.prix_dzd}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Select
                      value={f.statut}
                      onValueChange={(val) => updateStatut(f.id_formation, val)}
                      disabled={!!savingById[f.id_formation]}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BROUILLON">Brouillon</SelectItem>
                        <SelectItem value="PUBLIE">Publié</SelectItem>
                        <SelectItem value="ARCHIVE">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                    {savingById[f.id_formation] ? (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : flashById[f.id_formation] === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : null}
                  </div>
                </td>
                <td className="p-3">{new Date(f.date_mise_a_jour).toLocaleString('fr-FR')}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/nimda/formations/${f.id_formation}`}>
                      <Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1" /> Éditer</Button>
                    </Link>
                    <Link href={`/nimda/formations/${f.id_formation}/lecons`}>
                      <Button variant="secondary" size="sm"><BookOpen className="h-4 w-4 mr-1" /> Leçons</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">{total} résultat(s)</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</Button>
            <div className="text-sm">Page {page} / {totalPages}</div>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}