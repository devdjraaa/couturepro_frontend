import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockCommandes } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const mockPaiements = [
  { id: 1, commande_id: 1,  client_nom: 'Rokhaya Mbaye',    montant: 30000, type: 'avance', mode: 'especes',       created_at: '2026-04-05T09:10:00Z' },
  { id: 2, commande_id: 3,  client_nom: 'Mariama Bah',      montant: 38000, type: 'solde',  mode: 'mobile_money',  created_at: '2026-04-12T08:15:00Z' },
  { id: 3, commande_id: 5,  client_nom: 'Mariama Bah',      montant: 35000, type: 'solde',  mode: 'especes',       created_at: '2026-04-15T16:05:00Z' },
  { id: 4, commande_id: 11, client_nom: 'Aminata Coulibaly', montant: 12000, type: 'solde', mode: 'especes',       created_at: '2026-03-28T14:10:00Z' },
  { id: 5, commande_id: 10, client_nom: 'Rokhaya Mbaye',    montant: 42000, type: 'solde',  mode: 'mobile_money',  created_at: '2026-04-10T15:05:00Z' },
]

export const paiementService = {
  async getAll({ page = 1, per_page = 20 } = {}) {
    if (USE_MOCKS) {
      await delay()
      const sorted = [...mockPaiements].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return { data: sorted, total: sorted.length, page, per_page }
    }
    const { data } = await api.get('/paiements', { params: { page, per_page } })
    return data
  },

  async enregistrer(commandeId, payload) {
    if (USE_MOCKS) {
      await delay()
      const commande = mockCommandes.find(c => c.id === Number(commandeId))
      if (commande) commande.avance = Math.min(commande.montant, commande.avance + payload.montant)
      const newPaiement = {
        id: mockPaiements.length + 1,
        commande_id: Number(commandeId),
        ...payload,
        created_at: new Date().toISOString(),
      }
      mockPaiements.push(newPaiement)
      return newPaiement
    }
    const { data } = await api.post(`/commandes/${commandeId}/paiements`, payload)
    return data
  },
}
