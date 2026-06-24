import adminApi from '../adminApi'

export const signalementsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/signalements', { params })
    return data
  },

  async traiter(id) {
    const { data } = await adminApi.post(`/signalements/${id}/traiter`)
    return data
  },
}
