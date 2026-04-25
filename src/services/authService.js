import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockAuth } from './mockData'
import { setToken, clearAll } from '@/utils/storage'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// Normalise la réponse de /auth/me vers { user, atelier }
function normalizeMe(data) {
  const { atelier_maitre, ...proprietaire } = data
  return {
    user:    { ...proprietaire, role: 'proprietaire' },
    atelier: atelier_maitre ?? null,
  }
}

export const authService = {
  async login({ telephone, password }) {
    if (USE_MOCKS) {
      await delay()
      if (password === 'password') {
        setToken(mockAuth.token)
        return mockAuth
      }
      throw { code: 'mot_de_passe_invalide' }
    }
    const { data: loginData } = await api.post('/auth/login', { telephone, password })
    setToken(loginData.token)
    // Le login ne retourne pas l'atelier — on appelle /auth/me pour compléter
    const { data: meData } = await api.get('/auth/me')
    return normalizeMe(meData)
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
    const { data } = await api.post('/auth/inscription', payload)
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
    const { data } = await api.post('/auth/verifier-otp', { telephone, code })
    setToken(data.token)
    return {
      user:    { ...data.proprietaire, role: 'proprietaire' },
      atelier: data.atelier ?? null,
    }
  },

  async resendOtp(telephone) {
    if (USE_MOCKS) { await delay(); return }
    // TODO: endpoint backend à implémenter
    await api.post('/auth/renvoyer-otp', { telephone })
  },

  async equipeLogin({ code_acces, password, device_id }) {
    if (USE_MOCKS) {
      await delay()
      if (password === 'password') {
        setToken(mockAuth.token)
        return mockAuth
      }
      throw { code: 'mot_de_passe_invalide' }
    }
    const { data } = await api.post('/auth/equipe/login', { code_acces, password, device_id })
    setToken(data.token)
    return {
      user:    { ...data.membre, role: data.membre.role },
      atelier: null, // récupéré via /auth/me si besoin
    }
  },

  async getMe() {
    if (USE_MOCKS) {
      await delay(200)
      return mockAuth
    }
    const { data } = await api.get('/auth/me')
    return normalizeMe(data)
  },
}
