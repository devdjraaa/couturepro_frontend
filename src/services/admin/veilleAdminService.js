import adminApi from '../adminApi'

export const veilleAdminService = {
  async getConfig() {
    const { data } = await adminApi.get('/veille/config')
    return data
  },

  async updateConfig(payload) {
    const { data } = await adminApi.put('/veille/config', payload)
    return data
  },
}
