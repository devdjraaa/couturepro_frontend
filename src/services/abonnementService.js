import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const abonnementService = {
  // Retourne les infos d'abonnement embarquées dans l'atelier (via /auth/me)
  async getCurrent() {
    if (isMock()) {
      await delay()
      return mockAtelier.abonnement
    }
    // L'abonnement est retourné via /auth/me (atelier_maitre.abonnement)
    // Cette méthode est gardée pour un accès direct si besoin ultérieur
    const { data } = await api.get('/auth/me')
    return data.atelier_maitre?.abonnement ?? null
  },

  // Lance un paiement d'abonnement via FedaPay
  // payload: { niveau_cle: 'standard_mensuel', provider?: 'fedapay' }
  async initierPaiement(niveau_cle, provider = 'fedapay') {
    if (isMock()) {
      await delay(800)
      return { checkout_url: '#mock-payment', paiement_id: 'mock-' + Date.now() }
    }
    const { data } = await api.post('/paiements/initier', { niveau_cle, provider })
    return data
  },

  // Vérifie le statut d'un paiement d'abonnement
  async statusPaiement(paiementId) {
    if (isMock()) {
      await delay()
      return { paiement_id: paiementId, statut: 'valide' }
    }
    const { data } = await api.get(`/paiements/${paiementId}/status`)
    return data
  },

  // TODO: activation par code admin — endpoint backend à implémenter
  async activateCode(code) {
    if (isMock()) {
      await delay()
      if (code === 'PROMO-2026') {
        mockAtelier.abonnement.niveau_cle = 'standard_mensuel'
        return mockAtelier.abonnement
      }
      throw { code: 'code_invalide' }
    }
    const { data } = await api.post('/abonnement/activer-code', { code })
    return data
  },
}
