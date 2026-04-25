import adminApi from '../adminApi'

export const paiementsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/paiements', { params })
    return data
  },

  async valider(id) {
    const { data } = await adminApi.post(`/paiements/${id}/valider`)
    return data
  },

  async rembourser(id) {
    const { data } = await adminApi.post(`/paiements/${id}/rembourser`)
    return data
  },
}
