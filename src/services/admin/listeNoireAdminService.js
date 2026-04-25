import adminApi from '../adminApi'

export const listeNoireAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/liste-noire', { params })
    return data
  },

  async add(payload) {
    const { data } = await adminApi.post('/liste-noire', payload)
    return data
  },

  async remove(id) {
    await adminApi.delete(`/liste-noire/${id}`)
  },
}
