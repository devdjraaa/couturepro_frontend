import adminApi from '../adminApi'

export const plansAdminService = {
  async getAll() {
    const { data } = await adminApi.get('/plans')
    return data
  },

  async getById(id) {
    const { data } = await adminApi.get(`/plans/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/plans', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await adminApi.put(`/plans/${id}`, payload)
    return data
  },

  async toggle(id) {
    const { data } = await adminApi.post(`/plans/${id}/toggle`)
    return data
  },
}
