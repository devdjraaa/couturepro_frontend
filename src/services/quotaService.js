import { QUOTA_LIMITS } from '@/constants/config'
import { isMock } from '@/services/mockFlag'
import { mockAtelier, mockClients, mockCommandes } from './mockData'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

// Pas d'endpoint /quotas dans le backend — les limites sont enforced côté serveur (403)
// En mode réel, on retourne null : l'UI affiche les quotas uniquement si disponibles
export const quotaService = {
  async getUsage() {
    if (isMock()) {
      await delay()
      const niveau = mockAtelier.abonnement.niveau_cle ?? 'standard_mensuel'
      const limits = QUOTA_LIMITS[niveau] ?? QUOTA_LIMITS.gratuit
      const now = new Date()
      const commandesCeMois = mockCommandes.filter(c => {
        const d = new Date(c.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length
      return {
        niveau,
        clients:        { utilise: mockClients.filter(c => !c.is_archived).length, limite: limits.clients },
        commandes_mois: { utilise: commandesCeMois, limite: limits.commandes_par_mois },
      }
    }
    // TODO: endpoint backend /quotas à implémenter
    // Les limites sont enforced côté serveur (réponse 403 si quota atteint)
    return null
  },
}
