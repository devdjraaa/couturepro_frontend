import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const avisService = {
  // Soumission publique (sans compte).
  async submit(atelierId, payload) {
    if (isMock()) { await delay(); return { message: 'ok' } }
    const { data } = await api.post(`/vitrine/createurs/${atelierId}/avis`, payload)
    return data
  },

  // Avis de mon atelier (créateur connecté).
  async getMine() {
    if (isMock()) { await delay(); return [] }
    const { data } = await api.get('/avis')
    return data
  },

  async moderate(id, statut) {
    if (isMock()) { await delay(); return {} }
    const { data } = await api.post(`/avis/${id}/moderation`, { statut })
    return data
  },

  // Signalement public d'un avis.
  async report(id) {
    if (isMock()) { await delay(); return {} }
    const { data } = await api.post(`/vitrine/avis/${id}/signaler`)
    return data
  },
}
