'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle, XCircle, ShoppingCart } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'cart'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  showCartSuccess: (productName?: string) => void
  showCartError: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 3000)
  }

  const showCartSuccess = (productName?: string) => {
    showToast({
      type: 'cart',
      title: 'Produit ajouté au panier !',
      message: productName ? `${productName} a été ajouté à votre panier` : undefined,
      duration: 3000
    })
  }

  const showCartError = () => {
    showToast({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible d\'ajouter le produit au panier',
      duration: 4000
    })
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const value: ToastContextType = {
    showToast,
    showCartSuccess,
    showCartError
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastComponent 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

interface ToastComponentProps {
  toast: Toast
  onRemove: () => void
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'cart':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'cart':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div 
      className={`
        ${getBgColor()}
        border rounded-lg p-4 shadow-lg max-w-sm w-full
        animate-in slide-in-from-right-full duration-300
        cursor-pointer hover:shadow-xl transition-shadow
      `}
      onClick={onRemove}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-1">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}