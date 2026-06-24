import adminApi from '../adminApi'

export const banniereAdminService = {
  async get() {
    const { data } = await adminApi.get('/vitrine/banniere')
    return data
  },

  async update(payload) {
    const { data } = await adminApi.put('/vitrine/banniere', payload)
    return data
  },
}
