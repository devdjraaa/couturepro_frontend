import adminApi from '../adminApi'

export const transactionsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/transactions', { params })
    return data
  },

  async create(payload) {
    const { data } = await adminApi.post('/transactions', payload)
    return data
  },

  async cancel(id) {
    const { data } = await adminApi.delete(`/transactions/${id}`)
    return data
  },
}
