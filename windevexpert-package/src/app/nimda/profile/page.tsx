'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  User, 
  Shield, 
  Settings,
  Key,
  Bell,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileForm from '@/components/profile/ProfileForm'

export default function AdminProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil Administrateur</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos informations personnelles et vos préférences d'administration
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-600 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Administrateur
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm />
      
      {/* Admin-specific sections */}

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actions aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Niveau d'accès</p>
              <p className="text-2xl font-bold text-gray-900">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Sécurité
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
              <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
            </div>
            <Button variant="outline" size="sm">
              Configurer
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Changer le mot de passe</h3>
              <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
            </div>
            <Button variant="outline" size="sm">
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Préférences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-600">Recevoir les alertes importantes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-3 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Langue de l'interface</h3>
                <p className="text-sm text-gray-600">Français (France)</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Changer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}