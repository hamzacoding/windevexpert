'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Github,
  Building,
  FileText,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import toast from 'react-hot-toast'

interface ContactSettings {
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
  openingHours?: any
  companyName?: string
  description?: string
}

interface OpeningHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

const defaultOpeningHours: OpeningHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '12:00', closed: false },
  sunday: { open: '09:00', close: '12:00', closed: true }
}

const dayLabels = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
}

export default function ContactSettingsPage() {
  const [settings, setSettings] = useState<ContactSettings>({})
  const [openingHours, setOpeningHours] = useState<OpeningHours>(defaultOpeningHours)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/contact-settings')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres')
      }
      
      const data = await response.json()
      setSettings(data)
      
      if (data.openingHours) {
        try {
          const parsedHours = typeof data.openingHours === 'string' 
            ? JSON.parse(data.openingHours) 
            : data.openingHours
          setOpeningHours(parsedHours)
        } catch (error) {
          console.error('Erreur lors du parsing des horaires:', error)
          setOpeningHours(defaultOpeningHours)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      
      const dataToSave = {
        ...settings,
        openingHours: openingHours
      }
      
      const response = await fetch('/api/admin/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }
      
      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' })
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOpeningHoursChange = (day: string, field: string, value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres de Contact</h1>
            <p className="text-gray-600 mt-1">
              Gérez les coordonnées et informations de contact affichées sur le site
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
        
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Informations Générales
            </CardTitle>
            <CardDescription>
              Nom de l'entreprise et description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={settings.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="WinDevExpert"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Expert en développement WinDev, WebDev et WinDev Mobile"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Coordonnées Principales
            </CardTitle>
            <CardDescription>
              Email, téléphone et adresse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@windevexpert.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={settings.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={settings.whatsapp || ''}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={settings.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Paris, France"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Réseaux sociaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Facebook className="h-5 w-5 mr-2" />
              Réseaux Sociaux
            </CardTitle>
            <CardDescription>
              Liens vers vos profils sociaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook" className="flex items-center">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Label>
              <Input
                id="facebook"
                value={settings.facebook || ''}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="https://facebook.com/windevexpert"
              />
            </div>
            <div>
              <Label htmlFor="twitter" className="flex items-center">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={settings.twitter || ''}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="https://twitter.com/windevexpert"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={settings.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/windevexpert"
              />
            </div>
            <div>
              <Label htmlFor="instagram" className="flex items-center">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={settings.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="https://instagram.com/windevexpert"
              />
            </div>
            <div>
              <Label htmlFor="youtube" className="flex items-center">
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </Label>
              <Input
                id="youtube"
                value={settings.youtube || ''}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@windevexpert"
              />
            </div>
            <div>
              <Label htmlFor="github" className="flex items-center">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Label>
              <Input
                id="github"
                value={settings.github || ''}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/windevexpert"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horaires d'ouverture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horaires d'Ouverture
            </CardTitle>
            <CardDescription>
              Définissez vos horaires d'ouverture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(dayLabels).map(([day, label]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">{label}</div>
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    checked={!openingHours[day]?.closed}
                    onCheckedChange={(checked) => 
                      handleOpeningHoursChange(day, 'closed', !checked)
                    }
                  />
                  {!openingHours[day]?.closed && (
                    <>
                      <Input
                        type="time"
                        value={openingHours[day]?.open || '09:00'}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">à</span>
                      <Input
                        type="time"
                        value={openingHours[day]?.close || '18:00'}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="w-24"
                      />
                    </>
                  )}
                  {openingHours[day]?.closed && (
                    <span className="text-gray-500 text-sm">Fermé</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}