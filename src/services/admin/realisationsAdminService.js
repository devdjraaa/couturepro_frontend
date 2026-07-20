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

  async refuser(id, motif_refus) {
    const { data } = await adminApi.post(`/realisations/${id}/refuser`, { motif_refus })
    return data.realisation
  },
}
