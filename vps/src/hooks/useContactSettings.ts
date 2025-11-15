'use client'

import { useState, useEffect } from 'react'

export interface ContactSettings {
  id?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  github?: string
  openingHours?: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  companyName?: string
  description?: string
}

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/contact-settings')
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des paramètres de contact')
        }
        
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        console.error('Erreur lors du chargement des paramètres de contact:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error, refetch: () => setLoading(true) }
}