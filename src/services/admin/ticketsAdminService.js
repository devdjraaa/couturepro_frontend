import adminApi from '../adminApi'

export const ticketsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/tickets', { params })
    return data
  },

  async getById(id) {
    const { data } = await adminApi.get(`/tickets/${id}`)
    return data
  },

  async assigner(id, assigned_to) {
    const { data } = await adminApi.post(`/tickets/${id}/assigner`, { assigned_to })
    return data
  },

  async repondre(id, payload) {
    const { data } = await adminApi.post(`/tickets/${id}/repondre`, payload)
    return data
  },

  async fermer(id) {
    const { data } = await adminApi.post(`/tickets/${id}/fermer`)
    return data
  },

  async rouvrir(id) {
    const { data } = await adminApi.post(`/tickets/${id}/rouvrir`)
    return data
  },
}
