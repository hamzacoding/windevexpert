import { prisma } from '@/lib/prisma'

export interface AppSettings {
  id?: string
  tinymceApiKey?: string | null
  openaiApiKey?: string | null
  geminiApiKey?: string | null
  siteName: string
  siteDescription?: string | null
  maintenanceMode: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AppSettingsUpdate {
  tinymceApiKey?: string | null
  openaiApiKey?: string | null
  geminiApiKey?: string | null
  siteName?: string
  siteDescription?: string | null
  maintenanceMode?: boolean
}

export class AppSettingsService {
  /**
   * Récupère les paramètres de l'application
   * Crée un enregistrement par défaut s'il n'existe pas
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      let settings = await prisma.appSettings.findFirst()
      
      if (!settings) {
        // Créer les paramètres par défaut s'ils n'existent pas
        settings = await prisma.appSettings.create({
          data: {
            siteName: 'WindevExpert Platform',
            maintenanceMode: false
          }
        })
      }
      
      return settings
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des paramètres:', error)
      throw new Error('Impossible de récupérer les paramètres de l\'application')
    }
  }

  /**
   * Met à jour les paramètres de l'application
   */
  static async updateSettings(updates: AppSettingsUpdate): Promise<AppSettings> {
    try {
      // Récupérer les paramètres existants ou créer s'ils n'existent pas
      let existingSettings = await prisma.appSettings.findFirst()
      
      if (!existingSettings) {
        // Créer avec les nouvelles valeurs
        existingSettings = await prisma.appSettings.create({
          data: {
            siteName: updates.siteName || 'WindevExpert Platform',
            siteDescription: updates.siteDescription,
            tinymceApiKey: updates.tinymceApiKey,
            openaiApiKey: updates.openaiApiKey,
            geminiApiKey: updates.geminiApiKey,
            maintenanceMode: updates.maintenanceMode || false
          }
        })
      } else {
        // Mettre à jour les paramètres existants
        existingSettings = await prisma.appSettings.update({
          where: { id: existingSettings.id },
          data: {
            ...(updates.siteName !== undefined && { siteName: updates.siteName }),
            ...(updates.siteDescription !== undefined && { siteDescription: updates.siteDescription }),
            ...(updates.tinymceApiKey !== undefined && { tinymceApiKey: updates.tinymceApiKey }),
            ...(updates.openaiApiKey !== undefined && { openaiApiKey: updates.openaiApiKey }),
            ...(updates.geminiApiKey !== undefined && { geminiApiKey: updates.geminiApiKey }),
            ...(updates.maintenanceMode !== undefined && { maintenanceMode: updates.maintenanceMode }),
            updatedAt: new Date()
          }
        })
      }
      
      return existingSettings
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres:', error)
      throw new Error('Impossible de mettre à jour les paramètres de l\'application')
    }
  }

  /**
   * Récupère uniquement la clé API TinyMCE
   */
  static async getTinymceApiKey(): Promise<string | null> {
    try {
      const settings = await this.getSettings()
      return settings.tinymceApiKey || null
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la clé API TinyMCE:', error)
      return null
    }
  }

  /**
   * Met à jour uniquement la clé API TinyMCE
   */
  static async updateTinymceApiKey(apiKey: string | null): Promise<AppSettings> {
    return this.updateSettings({ tinymceApiKey: apiKey })
  }
}

export default AppSettingsService