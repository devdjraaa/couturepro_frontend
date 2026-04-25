import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const abonnementService = {
  async getCurrent() {
    if (isMock()) {
      await delay()
      return mockAtelier.abonnement
    }
    const { data } = await api.get('/abonnement/current')
    return data
  },

  async getPlans() {
    if (isMock()) {
      await delay()
      return [
        { cle: 'standard_mensuel', label: 'Standard Mensuel', duree_jours: 31,  prix_xof: 3500,   description_courte: 'Idéal pour démarrer' },
        { cle: 'standard_annuel',  label: 'Standard Annuel',  duree_jours: 365, prix_xof: 35000,  description_courte: 'Économisez avec l\'annuel' },
        { cle: 'premium_mensuel',  label: 'Premium Mensuel',  duree_jours: 31,  prix_xof: 7500,   description_courte: 'Le plus populaire' },
        { cle: 'premium_annuel',   label: 'Premium Annuel',   duree_jours: 365, prix_xof: 75000,  description_courte: 'Premium avec sauvegarde' },
        { cle: 'magnat_mensuel',   label: 'Magnat Mensuel',   duree_jours: 31,  prix_xof: 15000,  description_courte: 'Pour les grands ateliers' },
        { cle: 'magnat_annuel',    label: 'Magnat Annuel',    duree_jours: 365, prix_xof: 150000, description_courte: 'Performance maximale' },
      ]
    }
    const { data } = await api.get('/abonnement/plans')
    return data
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
