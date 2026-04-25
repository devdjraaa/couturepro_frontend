import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const pointsService = {
  // Retourne { solde_pts, seuil_conversion, bonus_actif, bonus_jours_restants, historique }
  async getSolde() {
    if (USE_MOCKS) {
      await delay()
      return {
        solde_pts:            mockAtelier.solde_pts,
        seuil_conversion:     100,
        bonus_actif:          false,
        bonus_jours_restants: 0,
        historique:           { data: mockAtelier.historique ?? [], total: 0 },
      }
    }
    const { data } = await api.get('/fidelite')
    return data
  },

  // Convertit le solde complet en 31 jours de bonus (pas de paramètre points)
  async convertir() {
    if (USE_MOCKS) {
      await delay()
      mockAtelier.solde_pts = 0
      return {
        message:               'Conversion réussie. Bonus de 31 jours activé.',
        bonus_actif:           true,
        bonus_jours_restants:  31,
      }
    }
    const { data } = await api.post('/fidelite/convertir')
    return data
  },
}
