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
  // VID-4 : deux entrées possibles — lien OU fichier. Le serveur accepte les
  // deux depuis le 19/07 (`required_without`), seul le champ manquait à l'écran.
  // Un fichier impose multipart ; un lien reste du JSON.
  async ajouterVideo({ titre, url, fichier }) {
    if (fichier) {
      const form = new FormData()
      if (titre) form.append('titre', titre)
      form.append('fichier', fichier)
      const { data } = await api.post('/atelier-videos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    }
    const { data } = await api.post('/atelier-videos', { titre, url })
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
