import adminApi from '../adminApi'

export const adminsService = {
  async getAll() {
    const { data } = await adminApi.get('/admins')
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/admins', payload)
    return data
  },

  async updatePermissions(id, payload) {
    const { data } = await adminApi.put(`/admins/${id}`, payload)
    return data
  },

  async revoke(id) {
    const { data } = await adminApi.delete(`/admins/${id}`)
    return data
  },
}
