import api from './api'
import { USE_MOCKS, QUOTA_LIMITS } from '@/constants/config'
import { mockAtelier, mockClients, mockCommandes } from './mockData'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

export const quotaService = {
  async getUsage() {
    if (USE_MOCKS) {
      await delay()
      const niveau = mockAtelier.abonnement.niveau
      const limits = QUOTA_LIMITS[niveau]
      const now = new Date()
      const commandesCeMois = mockCommandes.filter(c => {
        const d = new Date(c.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length
      return {
        niveau,
        clients:        { utilise: mockClients.length,  limite: limits.clients },
        commandes_mois: { utilise: commandesCeMois,      limite: limits.commandes_par_mois },
      }
    }
    const { data } = await api.get('/quotas')
    return data
  },
}
