import adminApi from '../adminApi'

export const auditAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/audit', { params })
    return data
  },
}
