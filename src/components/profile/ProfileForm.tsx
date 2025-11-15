'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import ProfileImageUpload from './ProfileImageUpload'
import AddressFields from './AddressFields'

interface ProfileData {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  postalCode?: string
  city?: string
  country?: string
  wilayaId?: string
  communeId?: string
  profileImage?: string
  wilaya?: { name: string; nameAr: string }
  commune?: { name: string; nameAr: string }
}

interface ProfileFormProps {
  initialData?: ProfileData
  onUpdate?: (data: ProfileData) => void
}

export default function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
  const { update: updateSession } = useSession()
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    wilayaId: '',
    communeId: '',
    profileImage: '',
    ...initialData
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Charger les données de profil au montage
  useEffect(() => {
    if (!initialData) {
      loadProfileData()
    }
  }, [initialData])

  const loadProfileData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/update')
      const data = await response.json()
      
      if (response.ok) {
        // S'assurer que les valeurs null sont converties en chaînes vides
        const userData = {
          ...data.user,
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          postalCode: data.user.postalCode || '',
          city: data.user.city || '',
          country: data.user.country || '',
          wilayaId: data.user.wilayaId || '',
          communeId: data.user.communeId || '',
          profileImage: data.user.profileImage || ''
        }
        setFormData(userData)
      } else {
        toast.error('Erreur lors du chargement du profil')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpdate = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageUrl
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Préparer les données en filtrant les champs vides
      const updateData: any = {}
      
      if (formData.firstName?.trim()) updateData.firstName = formData.firstName.trim()
      if (formData.lastName?.trim()) updateData.lastName = formData.lastName.trim()
      if (formData.phone?.trim()) updateData.phone = formData.phone.trim()
      if (formData.address?.trim()) updateData.address = formData.address.trim()
      if (formData.postalCode?.trim()) updateData.postalCode = formData.postalCode.trim()
      if (formData.city?.trim()) updateData.city = formData.city.trim()
      if (formData.country?.trim()) updateData.country = formData.country.trim()
      if (formData.wilayaId?.trim()) updateData.wilayaId = formData.wilayaId.trim()
      if (formData.communeId?.trim()) updateData.communeId = formData.communeId.trim()

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Profil mis à jour avec succès')
      
      // S'assurer que les valeurs null sont converties en chaînes vides
      const userData = {
        ...data.user,
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
        postalCode: data.user.postalCode || '',
        city: data.user.city || '',
        country: data.user.country || '',
        wilayaId: data.user.wilayaId || '',
        communeId: data.user.communeId || '',
        profileImage: data.user.profileImage || ''
      }
      
      setFormData(userData)
      onUpdate?.(userData)
      
      // Forcer le rafraîchissement de la session pour mettre à jour l'avatar
      await updateSession()

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    )
  }

  return (
    <div className="w-full -m-4 sm:-m-6 xl:-m-8 p-4 sm:p-6 xl:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <User className="w-6 h-6 mr-2" />
            Mon Profil
          </h1>
          <p className="text-blue-100 mt-1">
            Gérez vos informations personnelles et votre photo de profil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Colonne gauche - Photo de profil */}
            <div className="xl:col-span-1">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Photo de profil
                </h3>
                <ProfileImageUpload
                  currentImage={formData.profileImage}
                  onImageUpdate={handleImageUpdate}
                  className="flex justify-center"
                />
              </div>
            </div>

            {/* Colonne droite - Informations */}
            <div className="xl:col-span-3 space-y-6">
              {/* Informations de base */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations personnelles
                </h3>
                
                {/* Email (lecture seule) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="Votre numéro de téléphone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Adresse
                </h3>
                <AddressFields
                  address={formData.address}
                  postalCode={formData.postalCode}
                  city={formData.city}
                  country={formData.country}
                  wilayaId={formData.wilayaId}
                  communeId={formData.communeId}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}