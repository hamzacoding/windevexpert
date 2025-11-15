import AppSettingsService from '../src/lib/services/app-settings-service'

(async () => {
  const settings = await AppSettingsService.getSettings()
  console.log('Settings:', settings)
})();