import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const pointsService = {
  // Retourne { solde_pts, seuil_conversion, bonus_actif, bonus_jours_restants, historique }
  async getSolde() {
    if (isMock()) {
      await delay()
      return {
        solde_pts:            mockAtelier.solde_pts,
        seuil_conversion:     10000,
        bonus_actif:          false,
        bonus_jours_restants: 0,
        historique:           mockAtelier.historique ?? [],
      }
    }
    const { data } = await api.get('/fidelite')
    // Laravel paginate() retourne { data: [], total:... } — on normalise en tableau
    const rawHistorique = data.historique
    const historique = Array.isArray(rawHistorique) ? rawHistorique : (rawHistorique?.data ?? [])
    // seuil_conversion = 0 quand aucun config → fallback 10 000 pts
    const seuil_conversion = data.seuil_conversion || 10000
    return { ...data, historique, seuil_conversion }
  },

  // Convertit le solde complet en 31 jours de bonus (pas de paramètre points)
  async convertir() {
    if (isMock()) {
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
