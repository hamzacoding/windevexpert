'use client'

import { useState, useEffect } from 'react'
import { MapPin, Globe } from 'lucide-react'

interface Wilaya {
  id: string
  code: string
  name: string
  nameAr: string
}

interface Commune {
  id: string
  code: string
  name: string
  nameAr: string
  wilayaId: string
}

interface AddressFieldsProps {
  address?: string
  postalCode?: string
  city?: string
  country?: string
  wilayaId?: string
  communeId?: string
  onChange: (field: string, value: string) => void
  className?: string
}

export default function AddressFields({
  address = '',
  postalCode = '',
  city = '',
  country = '',
  wilayaId = '',
  communeId = '',
  onChange,
  className = ''
}: AddressFieldsProps) {
  // S'assurer que toutes les valeurs sont des chaînes et non null/undefined
  const safeAddress = address || ''
  const safePostalCode = postalCode || ''
  const safeCity = city || ''
  const safeCountry = country || ''
  const safeWilayaId = wilayaId || ''
  const safeCommuneId = communeId || ''
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loadingWilayas, setLoadingWilayas] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)

  const isAlgeria = safeCountry === 'DZ' || safeCountry === 'Algeria'

  // Charger les wilayas au montage du composant
  useEffect(() => {
    loadWilayas()
  }, [])

  // Charger les communes quand une wilaya est sélectionnée
  useEffect(() => {
    if (safeWilayaId && isAlgeria) {
      loadCommunes(safeWilayaId)
    } else {
      setCommunes([])
      if (safeCommuneId) {
        onChange('communeId', '')
      }
    }
  }, [safeWilayaId, isAlgeria])

  // Réinitialiser les champs algériens quand le pays change
  useEffect(() => {
    if (!isAlgeria) {
      if (safeWilayaId) onChange('wilayaId', '')
      if (safeCommuneId) onChange('communeId', '')
    }
  }, [isAlgeria])

  const loadWilayas = async () => {
    setLoadingWilayas(true)
    try {
      const response = await fetch('/api/geography')
      const data = await response.json()
      if (response.ok) {
        setWilayas(data.wilayas || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des wilayas:', error)
    } finally {
      setLoadingWilayas(false)
    }
  }

  const loadCommunes = async (selectedWilayaId: string) => {
    setLoadingCommunes(true)
    try {
      const response = await fetch(`/api/geography?wilayaId=${selectedWilayaId}`)
      const data = await response.json()
      if (response.ok) {
        setCommunes(data.communes || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error)
    } finally {
      setLoadingCommunes(false)
    }
  }

  const handleCountryChange = (value: string) => {
    onChange('country', value)
    // Si on change pour l'Algérie, réinitialiser ville et code postal
    if (value === 'DZ' || value === 'Algeria') {
      onChange('city', '')
      onChange('postalCode', '')
    }
  }

  const handleWilayaChange = (value: string) => {
    onChange('wilayaId', value)
    // Réinitialiser la commune quand on change de wilaya
    onChange('communeId', '')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4 inline mr-1" />
          Adresse
        </label>
        <textarea
          value={safeAddress}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Entrez votre adresse complète"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Pays */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Globe className="w-4 h-4 inline mr-1" />
          Pays *
        </label>
        <select
          value={safeCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionnez un pays</option>
          <option value="DZ">🇩🇿 Algérie</option>
          <option value="FR">🇫🇷 France</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="MA">🇲🇦 Maroc</option>
          <option value="TN">🇹🇳 Tunisie</option>
          <option value="BE">🇧🇪 Belgique</option>
          <option value="CH">🇨🇭 Suisse</option>
          <option value="DE">🇩🇪 Allemagne</option>
          <option value="GB">🇬🇧 Royaume-Uni</option>
          <option value="US">🇺🇸 États-Unis</option>
          <option value="other">Autre</option>
        </select>
      </div>

      {/* Champs spécifiques à l'Algérie */}
      {isAlgeria && (
        <>
          {/* Wilaya */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wilaya *
            </label>
            <select
              value={safeWilayaId}
              onChange={(e) => handleWilayaChange(e.target.value)}
              disabled={loadingWilayas}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {loadingWilayas ? 'Chargement...' : 'Sélectionnez une wilaya'}
              </option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.id} value={wilaya.id}>
                  {wilaya.code} - {wilaya.name} ({wilaya.nameAr})
                </option>
              ))}
            </select>
          </div>

          {/* Commune */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commune
            </label>
            <select
              value={safeCommuneId}
              onChange={(e) => onChange('communeId', e.target.value)}
              disabled={!safeWilayaId || loadingCommunes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {!safeWilayaId 
                  ? 'Sélectionnez d\'abord une wilaya'
                  : loadingCommunes 
                  ? 'Chargement...' 
                  : 'Sélectionnez une commune (optionnel)'
                }
              </option>
              {communes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {commune.name} ({commune.nameAr})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Champs pour les autres pays */}
      {!isAlgeria && safeCountry && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              type="text"
              value={safeCity}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="Entrez votre ville"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Code postal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code postal
            </label>
            <input
              type="text"
              value={safePostalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              placeholder="Code postal"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Message d'aide */}
      <div className="text-sm text-gray-500">
        {isAlgeria ? (
          <p>🇩🇿 Pour l'Algérie, sélectionnez votre wilaya et commune.</p>
        ) : safeCountry ? (
          <p>🌍 Pour les adresses internationales, indiquez la ville et le code postal.</p>
        ) : (
          <p>Sélectionnez d'abord votre pays pour afficher les champs appropriés.</p>
        )}
      </div>
    </div>
  )
}