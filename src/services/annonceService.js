import api from './api'

/**
 * ANN-1..9 — Annonces du créateur.
 *
 * Le socle serveur était complet depuis le 19/07 (quota, création, image, boost,
 * modération, diffusion vitrine) mais AUCUN écran ne le consommait : neuf points
 * du boss attendaient une interface devant une API déjà prête.
 *
 * Règles portées par le SERVEUR, jamais recalculées ici :
 *   · la date de fin découle de la durée en jours (inclusive : 1 jour = le jour même) ;
 *   · une seule annonce par jour et par atelier ;
 *   · les tarifs du Boost viennent de la configuration — l'écran les AFFICHE,
 *     il ne les décide pas.
 */
export const annonceService = {
  async liste() {
    const { data } = await api.get('/annonces')
    return data
  },

  async quota() {
    const { data } = await api.get('/annonces/quota')
    return data
  },

  async creer(payload) {
    const { data } = await api.post('/annonces', payload)
    return data.annonce
  },

  async modifier(id, payload) {
    const { data } = await api.put(`/annonces/${id}`, payload)
    return data.annonce
  },

  async envoyerImage(id, fichier) {
    const form = new FormData()
    form.append('image', fichier)
    const { data } = await api.post(`/annonces/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.annonce
  },

  async retirerImage(id) {
    const { data } = await api.delete(`/annonces/${id}/image`)
    return data.annonce
  },

  async supprimer(id) {
    await api.delete(`/annonces/${id}`)
  },

  /** Renvoie l'URL de paiement : le montant est fixé par le serveur. */
  async boost(id, { jours, date_debut, return_url }) {
    const { data } = await api.post(`/annonces/${id}/boost`, { jours, date_debut, return_url })
    return data
  },
}
