import api from './api'

// Outils du plan Studio (PL-4 liste d'attente, PL-6 annonce de collection).
export const studioService = {
  // PL-4 — Liste d'attente clients
  async listeAttente() {
    const { data } = await api.get('/liste-attente')
    return data
  },
  async ajouterAttente(payload) {
    const { data } = await api.post('/liste-attente', payload)
    return data
  },
  async majAttente(id, payload) {
    const { data } = await api.put(`/liste-attente/${id}`, payload)
    return data
  },
  async retirerAttente(id) {
    await api.delete(`/liste-attente/${id}`)
  },

  // PL-6 — Annonce de collection
  async annoncerCollection(collectionId, payload) {
    const { data } = await api.post(`/collections/${collectionId}/annonce`, payload)
    return data
  },

  // PL-7 — Vidéos de présentation
  async videos() {
    const { data } = await api.get('/atelier-videos')
    return data
  },
  async ajouterVideo(payload) {
    const { data } = await api.post('/atelier-videos', payload)
    return data
  },
  async retirerVideo(id) {
    await api.delete(`/atelier-videos/${id}`)
  },
  // VID-2 : le quota vient du serveur (il dépend du plan et exclut les vidéos
  // refusées) — le compter côté client donnait un chiffre faux.
  async quotaVideos() {
    const { data } = await api.get('/atelier-videos/quota')
    return data
  },
}
