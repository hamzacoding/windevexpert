'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, MessageCircle, XCircle, CheckCircle, Search, Mail } from 'lucide-react'

interface Thread {
  projectId: string
  title: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED'
  client: { id: string; name: string; email: string; phone?: string | null }
  totalMessages: number
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null
  createdAt: string
  updatedAt: string
}

interface Msg {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { id: string; name: string; email: string; phone?: string | null }
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [active, setActive] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }
    fetchThreads()
  }, [session, status])

  const fetchThreads = async () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    const res = await fetch(`/api/admin/messages/threads?${params}`)
    if (!res.ok) return
    const data = await res.json()
    setThreads(data.threads || [])
    if (!active && data.threads?.length) selectThread(data.threads[0])
  }

  const selectThread = async (t: Thread) => {
    setActive(t)
    const res = await fetch(`/api/admin/messages/threads/${t.projectId}`)
    if (!res.ok) return
    const data = await res.json()
    setMessages(data.messages || [])
  }

  const sendMessage = async () => {
    if (!active || !input.trim()) return
    setLoading(true)
    const res = await fetch(`/api/admin/messages/threads/${active.projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input })
    })
    setLoading(false)
    if (!res.ok) return
    setInput('')
    selectThread(active)
    fetchThreads()
  }

  const toggleClose = async (closed: boolean) => {
    if (!active) return
    const res = await fetch(`/api/admin/messages/threads/${active.projectId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed })
    })
    if (!res.ok) return
    await fetchThreads()
  }

  const statusBadge = (s: Thread['status']) => {
    if (s === 'CANCELLED') return <Badge className="bg-gray-100 text-gray-800">Clôturée</Badge>
    if (s === 'COMPLETED') return <Badge className="bg-green-100 text-green-800">Terminée</Badge>
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
  }

  const waLink = (phone?: string | null) => phone ? `https://wa.me/${phone.replace(/\D/g,'')}` : undefined
  const msgrLink = (_user?: { email?: string }) => undefined
  const telLink = (phone?: string | null) => phone ? `tel:${phone}` : undefined

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Discussions</CardTitle>
          <CardDescription>Historique par projet/client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" placeholder="Rechercher" />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {threads.map((t)=> (
              <button key={t.projectId} onClick={()=>selectThread(t)} className={`w-full text-left p-3 rounded-lg border ${active?.projectId===t.projectId?'border-blue-600 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <div className="font-medium">{t.title || 'Projet'}</div>
                  <div className="text-xs text-gray-500">{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="text-sm text-gray-600">{t.client.name} • {t.client.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(t.status)}
                  <Badge variant="outline">{t.totalMessages} messages</Badge>
                </div>
                {t.lastMessage && (
                  <div className="text-xs text-gray-500 mt-1 truncate">{t.lastMessage.content}</div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          {active && (
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {active.client.email}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <a href={waLink(active.client.phone)} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded-lg inline-flex items-center gap-2 disabled:opacity-50" aria-disabled={!waLink(active.client.phone)}>
                  <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
                </a>
                <a href={msgrLink(active.client)} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded-lg inline-flex items-center gap-2 disabled:opacity-50" aria-disabled={!msgrLink(active.client)}>
                  <MessageCircle className="h-4 w-4 text-blue-600" /> Messenger
                </a>
                <a href={telLink(active.client.phone)} className="px-3 py-2 border rounded-lg inline-flex items-center gap-2 disabled:opacity-50" aria-disabled={!telLink(active.client.phone)}>
                  <Phone className="h-4 w-4" /> Téléphone
                </a>
              </div>

              <div className="max-h-[50vh] overflow-y-auto border rounded-lg p-3">
                {messages.map((m)=> (
                  <div key={m.id} className={`mb-3 ${m.senderId===session?.user?.id?'text-right':'text-left'}`}>
                    <div className={`inline-block px-3 py-2 rounded-lg ${m.senderId===session?.user?.id?'bg-blue-600 text-white':'bg-gray-100 text-gray-900'}`}>{m.content}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Votre message..." />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>Envoyer</Button>
                {active.status==='CANCELLED' ? (
                  <Button variant="outline" onClick={()=>toggleClose(false)} className="inline-flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Réactiver</Button>
                ) : (
                  <Button variant="outline" onClick={()=>toggleClose(true)} className="inline-flex items-center gap-1"><XCircle className="h-4 w-4" /> Clôturer</Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Sélectionnez une discussion</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
