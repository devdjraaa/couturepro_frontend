import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const abonnementService = {
  async getCurrent() {
    if (USE_MOCKS) {
      await delay()
      return mockAtelier.abonnement
    }
    const { data } = await api.get('/abonnement')
    return data
  },

  async upgrade(niveau, periodicite = 'mensuel') {
    if (USE_MOCKS) {
      await delay(800)
      return { checkout_url: '#mock-payment', reference: 'REF-' + Date.now() }
    }
    const { data } = await api.post('/abonnement/upgrade', { niveau, periodicite })
    return data
  },

  async activateCode(code) {
    if (USE_MOCKS) {
      await delay()
      if (code === 'PROMO-2026') {
        mockAtelier.abonnement.niveau = 'starter'
        return mockAtelier.abonnement
      }
      throw { code: 'code_invalide' }
    }
    const { data } = await api.post('/abonnement/activate', { code })
    return data
  },

  async getHistory() {
    if (USE_MOCKS) {
      await delay()
      return [
        { id: 1, niveau: 'pro',     periodicite: 'mensuel', montant: 5000, statut: 'valide', created_at: '2026-04-01T10:00:00Z' },
        { id: 2, niveau: 'starter', periodicite: 'mensuel', montant: 2500, statut: 'valide', created_at: '2026-03-01T10:00:00Z' },
        { id: 3, niveau: 'gratuit', periodicite: null,       montant: 0,    statut: 'valide', created_at: '2025-01-15T08:00:00Z' },
      ]
    }
    const { data } = await api.get('/abonnement/historique')
    return data
  },
}
