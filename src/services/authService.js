import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockAuth } from './mockData'
import { setToken, clearAll } from '@/utils/storage'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export const authService = {
  async login({ telephone, mot_de_passe }) {
    if (USE_MOCKS) {
      await delay()
      if (mot_de_passe === 'password') {
        setToken(mockAuth.token)
        return mockAuth
      }
      throw { code: 'mot_de_passe_invalide' }
    }
    const { data } = await api.post('/auth/login', { telephone, mot_de_passe })
    setToken(data.token)
    return data
  },

  async logout() {
    if (USE_MOCKS) {
      await delay(200)
      clearAll()
      return
    }
    await api.post('/auth/logout')
    clearAll()
  },

  async register(payload) {
    if (USE_MOCKS) {
      await delay()
      return { telephone: payload.telephone }
    }
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  async verifyOtp({ telephone, code }) {
    if (USE_MOCKS) {
      await delay()
      if (code === '123456') {
        setToken(mockAuth.token)
        return mockAuth
      }
      throw { code: 'otp_invalide' }
    }
    const { data } = await api.post('/auth/verify-otp', { telephone, code })
    setToken(data.token)
    return data
  },

  async resendOtp(telephone) {
    if (USE_MOCKS) { await delay(); return }
    await api.post('/auth/resend-otp', { telephone })
  },

  async activateCode(code) {
    if (USE_MOCKS) {
      await delay()
      if (code === 'PROMO-2026') return { niveau: 'starter', duree_jours: 30 }
      throw { code: 'code_invalide' }
    }
    const { data } = await api.post('/auth/activate', { code })
    return data
  },

  async getMe() {
    if (USE_MOCKS) {
      await delay(200)
      return mockAuth
    }
    const { data } = await api.get('/auth/me')
    return data
  },
}
