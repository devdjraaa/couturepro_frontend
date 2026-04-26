import adminApi from '../adminApi'
import { setAdminToken, clearAdminToken } from '@/utils/storage'

export const adminAuthService = {
  async login({ email, password }) {
    const { data } = await adminApi.post('/auth/login', { email, password })
    setAdminToken(data.token)
    return data.admin
  },

  async logout() {
    try { await adminApi.post('/auth/logout') } catch (_) { /* ignore */ }
    clearAdminToken()
  },

  async getMe() {
    const { data } = await adminApi.get('/auth/me')
    return data
  },

  async changePassword({ ancien, nouveau }) {
    const { data } = await adminApi.put('/auth/change-password', { ancien, nouveau })
    return data
  },
}
