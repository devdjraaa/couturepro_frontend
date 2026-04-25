import api from './api'
import { setToken, clearAll } from '@/utils/storage'

function normalizeMe(data) {
  const { atelier_maitre, ...proprietaire } = data
  return {
    user:    { ...proprietaire, role: 'proprietaire' },
    atelier: atelier_maitre ?? null,
  }
}

export const authService = {
  async login({ telephone, password }) {
    const { data: loginData } = await api.post('/auth/login', { telephone, password })
    setToken(loginData.token)
    const { data: meData } = await api.get('/auth/me')
    return normalizeMe(meData)
  },

  async logout() {
    await api.post('/auth/logout')
    clearAll()
  },

  async register(payload) {
    const { data } = await api.post('/auth/inscription', payload)
    return data
  },

  async verifyOtp({ telephone, code }) {
    const { data } = await api.post('/auth/verifier-otp', { telephone, code })
    setToken(data.token)
    return {
      user:    { ...data.proprietaire, role: 'proprietaire' },
      atelier: data.atelier ?? null,
    }
  },

  async resendOtp(telephone) {
    await api.post('/auth/renvoyer-otp', { telephone })
  },

  async equipeLogin({ code_acces, password, device_id }) {
    const { data } = await api.post('/auth/equipe/login', { code_acces, password, device_id })
    setToken(data.token)
    return {
      user:    { ...data.membre, role: data.membre.role },
      atelier: null,
    }
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return normalizeMe(data)
  },
}
