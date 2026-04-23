import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr'

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  // Accès hiérarchique : t('clients.titre'), t('auth.connexion.titre')
  // La clé manquante affiche la clé elle-même (utile en dev)
  saveMissing: false,
})

export default i18n
