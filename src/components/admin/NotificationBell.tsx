'use client'

import { useState, useEffect } from 'react'
import { Bell, Quote, CreditCard, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'quote' | 'order' | 'message'
  title: string
  message: string
  link: string
  createdAt: string
  read: boolean
}

interface NotificationStats {
  newQuotes: number
  newOrders: number
  newMessages: number
  total: number
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    newQuotes: 0,
    newOrders: 0,
    newMessages: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setStats(data.stats || { newQuotes: 0, newOrders: 0, newMessages: 0, total: 0 })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const isAdminContext = pathname?.startsWith('/nimda') || session?.user?.role === 'ADMIN'
    if (!isAdminContext) {
      setLoading(false)
      return
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [pathname, session?.user?.role])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
      
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }))
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH'
      })
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      
      setStats(prev => ({
        ...prev,
        total: 0
      }))
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <Quote className="h-4 w-4 text-blue-600" />
      case 'order':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
        <Bell className="h-5 w-5" />
        {stats.total > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {stats.total > 99 ? '99+' : stats.total}
          </Badge>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {stats.total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex gap-4 mt-3 text-sm">
            {stats.newQuotes > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Quote className="h-3 w-3" />
                <span>{stats.newQuotes} devis</span>
              </div>
            )}
            {stats.newOrders > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CreditCard className="h-3 w-3" />
                <span>{stats.newOrders} commandes</span>
              </div>
            )}
            {stats.newMessages > 0 && (
              <div className="flex items-center gap-1 text-purple-600">
                <MessageSquare className="h-3 w-3" />
                <span>{stats.newMessages} messages</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 mx-auto mb-2" />
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <Link
                    href={notification.link}
                    onClick={() => {
                      markAsRead(notification.id)
                      setIsOpen(false)
                    }}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 10 && (
          <div className="p-3 border-t text-center">
            <Link
              href="/nimda/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Voir toutes les notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
