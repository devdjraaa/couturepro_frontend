import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const devisService = {
  // Demande de devis publique (sans compte), depuis le profil vitrine.
  async submit(atelierId, payload) {
    if (isMock()) { await delay(); return { message: 'ok' } }
    const { data } = await api.post(`/vitrine/createurs/${atelierId}/devis`, payload)
    return data
  },

  // Demandes reçues par mon atelier (créateur connecté).
  async getMine() {
    if (isMock()) { await delay(); return [] }
    const { data } = await api.get('/devis')
    return data
  },

  // Marquer une demande comme traitée.
  async traiter(id) {
    if (isMock()) { await delay(); return {} }
    const { data } = await api.post(`/devis/${id}/traiter`)
    return data
  },
}
