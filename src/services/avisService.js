import api from './api'
import { isMock } from '@/services/mockFlag'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const avisService = {
  // Soumission publique (sans compte). P137 : photos optionnelles → multipart.
  async submit(atelierId, payload) {
    if (isMock()) { await delay(); return { message: 'ok' } }
    const photos = (payload.photos || []).filter((f) => f instanceof File)
    if (photos.length > 0) {
      const fd = new FormData()
      fd.append('auteur_nom', payload.auteur_nom)
      fd.append('note', String(payload.note))
      if (payload.texte) fd.append('texte', payload.texte)
      photos.forEach((f) => fd.append('photos[]', f))
      const { data } = await api.post(`/vitrine/createurs/${atelierId}/avis`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    }
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
