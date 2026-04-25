import { USE_MOCKS } from '@/constants/config'
import { mockNotifications } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// Pas d'endpoint /notifications dans l'API publique backend (TODO)
// En mode réel, les méthodes retournent des données vides sans erreur réseau
export const notificationService = {
  async getAll() {
    if (USE_MOCKS) {
      await delay()
      return [...mockNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return []
  },

  async countNonLues() {
    if (USE_MOCKS) {
      await delay(150)
      return mockNotifications.filter(n => !n.lu).length
    }
    return 0
  },

  async marquerLue(id) {
    if (USE_MOCKS) {
      await delay(150)
      const notif = mockNotifications.find(n => n.id === id || n.id === Number(id))
      if (notif) notif.lu = true
    }
  },

  async marquerToutesLues() {
    if (USE_MOCKS) {
      await delay()
      mockNotifications.forEach(n => { n.lu = true })
    }
  },
}
