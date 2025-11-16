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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Gestion des Formations
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos formations, catégories et accès</p>
          </div>
          <Link href="/nimda/formations/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <PlusCircle className="h-4 w-4 mr-2" /> Nouvelle formation
            </button>
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <form onSubmit={onSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par titre, slug..." />
          </div>
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
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
            <span className="text-sm text-gray-600">{total} formation(s) trouvée(s)</span>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Filtrage...</>) : 'Filtrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatut('all'); setPage(1); fetchFormations() }}>Réinitialiser</Button>
          </div>
        </form>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {error && <div className="p-4 text-red-600">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Langue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accès</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mise à jour</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                <tr key={f.id_formation} className={`hover:bg-gray-50 ${flashById[f.id_formation] === 'success' ? 'bg-green-50' : flashById[f.id_formation] === 'error' ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{f.titre}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{f.url_slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.langue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.categorie}{f.sous_categorie ? ` / ${f.sous_categorie}` : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.type_acces}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {f.prix_dzd ? (
                      <span className="font-medium text-blue-600">{Number(f.prix_dzd).toLocaleString()} DZD</span>
                    ) : f.prix_eur ? (
                      <span className="font-medium">{Number(f.prix_eur).toLocaleString()}€</span>
                    ) : (
                      <span className="text-green-600 font-medium">Gratuit</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${f.statut === 'PUBLIE' ? 'bg-green-100 text-green-800' : f.statut === 'BROUILLON' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{f.statut}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(f.date_mise_a_jour).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/nimda/formations/${f.id_formation}`}>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded" title="Modifier">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/nimda/formations/${f.id_formation}/lecons`}>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded" title="Leçons">
                          <BookOpen className="h-4 w-4" />
                        </button>
                      </Link>
                      <Select value={f.statut} onValueChange={(val) => updateStatut(f.id_formation, val)} disabled={!!savingById[f.id_formation]}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
            <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">{page}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  )
}
