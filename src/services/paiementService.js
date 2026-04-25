import { USE_MOCKS } from '@/constants/config'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// Les paiements de commandes (avance/solde) ne sont pas encore dans le backend API
// Le backend gère uniquement les paiements d'abonnement via /paiements/initier
// Voir abonnementService pour les paiements d'abonnement

const mockPaiements = [
  { id: 'p-001', commande_id: 'cmd-001', montant: 30000, type: 'avance', mode: 'especes',      created_at: '2026-04-05T09:10:00Z' },
  { id: 'p-002', commande_id: 'cmd-005', montant: 35000, type: 'solde',  mode: 'mobile_money', created_at: '2026-04-15T16:05:00Z' },
  { id: 'p-003', commande_id: 'cmd-010', montant: 42000, type: 'solde',  mode: 'mobile_money', created_at: '2026-04-10T15:05:00Z' },
]

export const paiementService = {
  async getAll({ page = 1, per_page = 20, commande_id } = {}) {
    if (USE_MOCKS) {
      await delay()
      let list = [...mockPaiements]
      if (commande_id) list = list.filter(p => p.commande_id === commande_id)
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return []
  },

  // Enregistre un paiement partiel sur une commande (mock seulement)
  async enregistrer(commandeId, payload) {
    if (USE_MOCKS) {
      await delay()
      const newPaiement = {
        id: 'p-' + Date.now(),
        commande_id: commandeId,
        ...payload,
        created_at: new Date().toISOString(),
      }
      mockPaiements.push(newPaiement)
      return newPaiement
    }
    // TODO: endpoint backend POST /commandes/{id}/paiements à implémenter
    throw { code: 'non_disponible', message: 'Enregistrement de paiement en cours de déploiement.' }
  },
}
