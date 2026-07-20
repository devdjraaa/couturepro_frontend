import adminApi from '../adminApi'

// Point 101 — modération des réalisations (back-office).
export const realisationsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/realisations', { params })
    return data // pagination Laravel
  },

  async compteurs() {
    const { data } = await adminApi.get('/realisations/compteurs')
    return data
  },

  async approuver(id) {
    const { data } = await adminApi.post(`/realisations/${id}/approuver`)
    return data.realisation
  },

  /**
   * PHOTO-3 — retouche légère d'une photo avant validation.
   * `path` désigne la photo D'ORIGINE visée : le serveur range la retouche à
   * côté sans jamais écraser l'original.
   */
  async retoucher(id, path, blob) {
    const form = new FormData()
    form.append('path', path)
    form.append('photo', blob, 'retouche.jpg')
    const { data } = await adminApi.post(`/realisations/${id}/retoucher`, form)
    return data.realisation
  },

  /**
   * Photo servie par l'API plutôt que depuis /storage : le canvas de retouche
   * a besoin d'une image de même origine (aucun en-tête CORS sur /storage), et
   * une réalisation en attente n'a pas à être lisible publiquement.
   * Renvoie une URL d'objet — à révoquer par l'appelant.
   */
  async fichierUrl(id, path) {
    const { data } = await adminApi.get(`/realisations/${id}/fichier`, {
      params: { path }, responseType: 'blob',
    })
    return URL.createObjectURL(data)
  },

  async refuser(id, motif_refus) {
    const { data } = await adminApi.post(`/realisations/${id}/refuser`, { motif_refus })
    return data.realisation
  },
}
