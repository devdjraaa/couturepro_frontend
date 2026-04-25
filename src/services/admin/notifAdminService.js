import adminApi from '../adminApi'

export const notifAdminService = {
  async broadcast(payload) {
    const { data } = await adminApi.post('/notifications', payload)
    return data
  },
}
