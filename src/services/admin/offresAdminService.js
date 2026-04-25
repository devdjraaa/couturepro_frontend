import adminApi from '../adminApi'

export const offresAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/offres', { params })
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/offres', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await adminApi.put(`/offres/${id}`, payload)
    return data
  },

  async delete(id) {
    await adminApi.delete(`/offres/${id}`)
  },
}
