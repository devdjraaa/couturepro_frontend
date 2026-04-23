import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const mockHistorique = [
  { id: 1, type: 'gain',    source: 'commande',   montant:  65, description: 'Commande #10 — 65 000 XOF',      created_at: '2026-04-10T15:00:00Z' },
  { id: 2, type: 'gain',    source: 'commande',   montant:  42, description: 'Commande #3 — 38 000 XOF',       created_at: '2026-04-12T08:05:00Z' },
  { id: 3, type: 'gain',    source: 'fidelite',   montant:   5, description: 'Bonus fidélité mensuel',          created_at: '2026-04-01T00:00:00Z' },
  { id: 4, type: 'depense', source: 'conversion', montant: -30, description: "Conversion : 3 jours d'abonnement", created_at: '2026-03-15T10:00:00Z' },
  { id: 5, type: 'gain',    source: 'parrainage', montant:  50, description: "Parrainage d'un nouvel atelier",  created_at: '2026-02-20T09:00:00Z' },
]

export const pointsService = {
  async getSolde() {
    if (USE_MOCKS) {
      await delay()
      return {
        points: mockAtelier.points,
        valeur_jours: Math.floor(mockAtelier.points / 10),
      }
    }
    const { data } = await api.get('/points')
    return data
  },

  async getHistorique({ page = 1, per_page = 20 } = {}) {
    if (USE_MOCKS) {
      await delay()
      const sorted = [...mockHistorique].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return { data: sorted, total: sorted.length }
    }
    const { data } = await api.get('/points/historique', { params: { page, per_page } })
    return data
  },

  async convertir(points) {
    if (USE_MOCKS) {
      await delay()
      const jours = Math.floor(points / 10)
      mockAtelier.points = Math.max(0, mockAtelier.points - points)
      return { jours_ajoutes: jours, solde_restant: mockAtelier.points }
    }
    const { data } = await api.post('/points/convertir', { points })
    return data
  },
}
