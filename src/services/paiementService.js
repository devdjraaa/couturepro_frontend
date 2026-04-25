import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

const mockPaiements = [
  { id: 'p-001', commande_id: 'cmd-001', montant: 30000, mode_paiement: 'especes',      created_at: '2026-04-05T09:10:00Z' },
  { id: 'p-002', commande_id: 'cmd-005', montant: 35000, mode_paiement: 'mobile_money', created_at: '2026-04-15T16:05:00Z' },
]

export const paiementService = {
  async getAll({ commande_id } = {}) {
    if (isMock()) {
      await delay()
      let list = [...mockPaiements]
      if (commande_id) list = list.filter(p => p.commande_id === commande_id)
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    if (!commande_id) return []
    const { data } = await api.get(`/commandes/${commande_id}/paiements`)
    return data
  },

  async enregistrer(commandeId, payload) {
    if (isMock()) {
      await delay()
      const p = { id: 'p-' + Date.now(), commande_id: commandeId, ...payload, created_at: new Date().toISOString() }
      mockPaiements.push(p)
      return p
    }
    const { data } = await api.post(`/commandes/${commandeId}/paiements`, payload)
    return data
  },
}
